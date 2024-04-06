const modelPlainte = require('../../Models/Ticket/Plainte')
const asyncLab = require('async')
const { generateString } = require('../../Static/Static_Function')
const { ObjectId } = require('mongodb')

module.exports = {
  AddPlainte: (req, res, next) => {
    try {
      const { codeAgent } = req.user
      const { title } = req.body
      const idPlainte = generateString(10)

      asyncLab.waterfall(
        [
          function (done) {
            modelPlainte
              .create({
                title,
                idPlainte,
                savedBy: codeAgent,
              })
              .then((plainte) => {
                done(plainte)
              })
              .catch(function (err) {
                return res.status(404).json('Erreur ' + err)
              })
          },
        ],
        function (plainte) {
          if (plainte) {
            req.recherche = plainte._id
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

  ReadPlainte: (req, res) => {
    try {
      const recherche = req.recherche
      let match = recherche
        ? { $match: { _id: new ObjectId(recherche) } }
        : { $match: {} }

      modelPlainte
        .aggregate([
          match,
          {
            $lookup: {
              from: 'agentadmins',
              localField: 'createdBy',
              foreignField: 'codeAgent',
              as: 'agent',
            },
          },
          {
            $unwind: '$agent',
          },
        ])
        .then((result) => {
          if (result.length > 0) {
            return recherche
              ? res.status(200).json(result[0])
              : res.status(200).json(result.reverse())
          } else {
            return res.status(200).json([])
          }
        })
    } catch (error) {
      console.log(error)
    }
  },
}
