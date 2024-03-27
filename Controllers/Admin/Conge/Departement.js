const modelDepartement = require('../../../Models/Admin/Departement')
const asyncLab = require('async')
const { generateNumber } = require('../../../Static/Static_Function')
const { ObjectId } = require('mongodb')

module.exports = {
  AddDepartement: (req, res) => {
    try {
      const { departement } = req.body
      if (!departement) {
        return res.status(404).json('Veuillez renseigner le département')
      }
      asyncLab.waterfall(
        [
          function (done) {
            modelDepartement
              .findOne({
                departement: departement.toUpperCase(),
              })
              .then((departmt) => {
                if (departmt) {
                  return res.status(404).json('Ce departement existe deja')
                } else {
                  done(null, true)
                }
              })
          },
          function (departmt, done) {
            modelDepartement
              .create({
                departement,
                codeDepartement: generateNumber(6),
              })
              .then((depar) => {
                done(depar)
              })
          },
        ],
        function (result) {
          if (result) {
            return res.status(200).json(result)
          } else {
            return res.status(404).json("Erreur d'enregistrement")
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  AddFonction: (req, res, next) => {
    try {
      const { codeDepartement, fonction } = req.body
      if (!fonction || !codeDepartement) {
        return res.status(404).json('Veuillez renseigner la fonction')
      }
      modelDepartement
        .findOneAndUpdate(
          { codeDepartement },
          {
            $addToSet: {
              fonction: {
                fonction,
                codeFonction: generateNumber(3),
              },
            },
          },
          {
            new: true,
          },
        )
        .then((result) => {
          if (result) {
            req.recherche = result._id
            next()
          } else {
            return res.status(404).json("Erreur d'enregistrement")
          }
        })
        .catch(function (er) {
          return res.status(404).json(err)
        })
    } catch (error) {}
  },
  ReadDepartement: (req, res) => {
    try {
      const recherche = req.recherche
      let match = recherche ? { _id: new ObjectId(recherche) } : {}
      modelDepartement
        .find(match)
        .then((result) => {
          if (result.length > 0) {
            let data = recherche ? result[0] : result
            return res.status(200).json(data)
          }
        })
        .catch(function (err) {
          return res.status(404).json('Erreur' + err)
        })
    } catch (error) {
      return res.status(404).json('Erreur' + error)
    }
  },
}
