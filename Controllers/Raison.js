const modelRaison = require('../Models/Raison')
const modelAgent = require('../Models/Agent')
const asyncLab = require('async')
const modelDemande = require('../Models/Demande')
const { ObjectId } = require('mongodb')

module.exports = {
  AddRaison: (req, res) => {
    try {
      const { raison, codeAgent } = req.body
 console.log(req.body)
      if (!raison) {
        return res.status(404).json('Veuillez renseigner les champs')
      }
      asyncLab.waterfall(
        [
          function (done) {
            modelAgent
              .findOne({ codeAgent, active: true })
              .then((agent) => {
                if (agent) {
                  done(null, agent)
                } else {
                  done(false)
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (agent, done) {
            modelRaison
              .findOne({ raison : raison.toUpperCase(), })
              .then((raisons) => {
                console.log(raisons)
                if (raisons) {
                  return res.status(404).json(`${raisons} existe deja`)
                } else {
                  done(null, agent)
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (agent, done) {
            modelRaison
              .create({ raison : raison.toUpperCase(),savedBy : agent.codeAgent, id: new Date() })
              .then((save) => {
                done(save)
              })
              .catch(function (err) {
                console.log(err)
              })
          },
        ],
        function (result) {
          if (result) {
            return res.status(200).json(result)
          } else {
            return res.status(404).json('Erreur')
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  ReadRaison: (req, res) => {
    try {
      modelRaison
        .aggregate([
          {
            $lookup: {
              from: 'demandes',
              localField: 'raison',
              foreignField: 'raison',
              as: 'demande',
            },
          },
        ])
        .then((raison) => {
          if (raison) {
            return res.status(200).json(raison)
          } else {
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  UpdateRaison: (req, res) => {
    try {
      const { id, raison } = req.body
      if (!id || !raison) {
        return res.status(404).json('Veuillez renseigner les champs')
      }

      modelRaison
        .findByIdAndUpdate(id, { raison })
        .then((updated) => {
          if (updated) {
            return res.status(200).json(updated)
          } else {
            return res.status(404).json('Erreur')
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  DeleteRaison: (req, res) => {
    try {
      const { id } = req.body
      if (!id) {
        return res.status(404).json('Veuillez renseigner les champs')
      }
      asyncLab.waterfall(
        [
          function (done) {
            modelDemande
              .find({ _idRaison: new ObjectId(id) })
              .then((demandes) => {
                done(null, demandes)
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (demandes, done) {
            if (demandes.length > 0) {
              return res
                .status(404)
                .json(`y a des demandes enregistrées sur cette raison`)
            } else {
              modelRaison.findByIdAndRemove(id).then((result) => {
                done(result)
              })
            }
          },
        ],
        function (result) {
          if (result) {
            return res.status(200).json(id)
          } else {
            return res.status(404).json('Erreur de suppression')
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
}
