const modelShop = require('../Models/Shop')
const asyncLab = require('async')
const { generateNumber } = require('../Static/Static_Function')
const modelAgentAdmin = require('../Models/AgentAdmin')

module.exports = {
  AddShop: (req, res, next) => {
    try {
      const { shop, adresse, idZone } = req.body
      if (!shop || !idZone) {
        return res.status(404).json('Veuillez renseigner les champs')
      }

      asyncLab.waterfall(
        [
          function (done) {
            modelShop
              .findOne({ shop })
              .then((result) => {
                if (result) {
                  return res.status(404).json('Le shop existe deja')
                } else {
                  done(null, true)
                }
              })
              .catch(function () {
                return res.status(401).json("Erreur d'enregistrement")
              })
          },
          function (value, done) {
            modelShop
              .create({
                shop,
                id: new Date(),
                adresse,
                idZone,
                idShop: generateNumber(9),
              })
              .then((result) => {
                done(result)
              })
              .catch(function () {
                return res.status(401).json("Erreur d'enregistrement")
              })
          },
        ],
        function (result) {
          if (result) {
            req.recherche = result._id
            next()
          } else {
            return res.status(401).json("Erreur d'enregistrement")
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  ReadShop: (req, res) => {
    const recherche = req.recherche
    let match = recherche ? { $match: { _id: recherche } } : { $match: {} }

    try {
      modelShop
        .aggregate([
          match,
          {
            $lookup: {
              from: 'zones',
              localField: 'idZone',
              foreignField: 'idZone',
              as: 'region',
            },
          },
          { $unwind: '$region' },
          {
            $lookup: {
              from: 'agentadmins',
              localField: 'tickets',
              foreignField: 'codeAgent',
              as: 'ticket',
            },
          },
        ])
        .then((response) => {
          if (response) {
            let data = recherche ? response[0] : response
            return res.status(200).json(data)
          }
        })
    } catch (error) {
      console.log(error)
    }
  },
  UpdateOneField: (req, res) => {
    try {
      const { id, data } = req.body
      if (!id || !data) {
        return res.status(404).json('Erreur')
      }
      modelShop
        .findByIdAndUpdate(id, data, { new: true })
        .then((response) => {
          if (response) {
            return res.status(200).json(response)
          } else {
            return res.status(404).json('Erreur')
          }
        })
        .catch(function () {
          return res.status(404).json('Erreur')
        })
    } catch (error) {
      console.log(error)
    }
  },
  AddResponsable: (req, res, next) => {
    try {
      const { idShop, codeAgent } = req.body
      if (!idShop || !codeAgent) {
        return res.status(404).json("Veuillez renseigner l'agent")
      }
      asyncLab.waterfall(
        [
          function (done) {
            modelAgentAdmin
              .findOne({ codeAgent, active: true })
              .then((agent) => {
                if (agent) {
                  done(null, agent)
                } else {
                  return res.status(404).json("L'agent est introuvable")
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (agent, done) {
            modelShop
              .findOneAndUpdate(
                { idShop },
                { $addToSet: { tickets: agent.codeAgent } },
                { new: true },
              )
              .then((result) => {
                done(result)
              })
              .catch(function (err) {
                console.log(err)
              })
          },
        ],
        function (result) {
          if (result) {
            req.recherche = result._id
            next()
          } else {
            return res.status(404).json('Erreur')
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
}
