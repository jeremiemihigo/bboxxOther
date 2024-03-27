const { ObjectId } = require('mongodb')
const modelAgent = require('../Models/Agent')
const { isEmpty } = require('../Static/Static_Function')
const asyncLab = require('async')

module.exports = {
  AddAgent: (req, res, next) => {
    try {
      const { nom, codeAgent, fonction, telephone, idZone, idShop } = req.body

      if (
        isEmpty(nom) ||
        isEmpty(codeAgent) ||
        isEmpty(fonction) ||
        isEmpty(idZone) ||
        isEmpty(idShop)
      ) {
        return res.status(400).json('Veuillez renseigner les champs')
      }
      asyncLab.waterfall(
        [
          function (done) {
            modelAgent
              .findOne({ codeAgent: codeAgent.trim() })
              .then((agent) => {
                if (agent) {
                  return res.status(400).json("L'agent existe déjà")
                } else {
                  done(null, false)
                }
              })
              .catch(function (err) {
                return res.status(400).json('Erreur')
              })
          },
          function (agent, done) {
            if (!agent) {
              modelAgent
                .create({
                  nom,
                  password: 1234,
                  codeAgent,
                  codeZone: idZone,
                  fonction,
                  idShop,
                  telephone,
                  id: new Date(),
                })
                .then((response) => {
                  if (response) {
                    done(response)
                  } else {
                    return res.status(400).json("Erreur d'enregistrement")
                  }
                })
                .catch(function (err) {
                  return res.status(400).json('Erreur')
                })
            } else {
              return res.status(400).json("L'agent existe déjà")
            }
          },
        ],
        function (result) {
          if (result) {
            req.recherche = result._id
            next()
          } else {
            return res.status(400).json('Erreur')
          }
        },
      )
    } catch (error) {
      return res.status(400).json("Erreur d'enregistrement")
    }
  },
  ReadAgent: (req, res) => {
    const recherche = req.recherche
    let match = recherche
      ? { $match: { _id: new ObjectId(recherche) } }
      : { $match: {} }
    try {
      modelAgent
        .aggregate([
          match,
          {
            $lookup: {
              from: 'zones',
              localField: 'codeZone',
              foreignField: 'idZone',
              as: 'region',
            },
          },
          {
            $lookup: {
              from: 'shops',
              localField: 'idShop',
              foreignField: 'idShop',
              as: 'shop',
            },
          },
          {
            $unwind: '$shop',
          },
          {
            $unwind: '$region',
          },
          {
            $sort: { nom: 1 },
          },
        ])
        .then((response) => {
          return recherche
            ? res.status(200).json(response[0])
            : res.status(200).json(response.reverse())
        })
    } catch (error) {
      console.log(error)
    }
  },
  BloquerAgent: (req, res, next) => {
    try {
      const { id, value } = req.body
      modelAgent
        .findByIdAndUpdate(id, { active: value }, { new: true })
        .then((result) => {
          if (result) {
            req.recherche = id
            next()
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  UpdateAgent: (req, res, next) => {
    try {
      const {
        _id,
        nom,
        codeAgent,
        fonction,
        telephone,
        shop,
        region,
      } = req.body.values

      asyncLab.waterfall(
        [
          function (done) {
            modelAgent
              .findByIdAndUpdate(
                _id,
                {
                  $set: {
                    nom,
                    codeAgent,
                    fonction,
                    idShop: shop.idShop,
                    telephone,
                    codeZone: region.idZone,
                  },
                },
                { new: true },
              )
              .then((response) => {
                if (response) {
                  done(response)
                } else {
                  return res.status(400).json('Erreur')
                }
              })
              .catch(function (err) {
                return res.status(400).json('Error')
              })
          },
        ],
        function (result) {
          req.recherche = result._id
          next()
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  InsertManyAgent: (req, res) => {
    try {
      const { data } = req.body
      modelAgent
        .insertMany(data)
        .then((response) => {
          if (response) {
            return res.status(200).json(true)
          } else {
            return res.status(200).json(false)
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
}
