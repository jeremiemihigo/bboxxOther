const asyncLab = require('async')
const modelReclamation = require('../Models/Reclamation')
const modelPeriode = require('../Models/Periode')
const modelDemande = require('../Models/Demande')
const { ObjectId } = require('mongodb')

module.exports = {
  Reclamation: (req, res, next) => {
    try {
      const { _id, message, sender, codeAgent } = req.body
      if (!_id || !message || !sender || !codeAgent) {
        return res.status(201).json('Error')
      }
      asyncLab.waterfall(
        [
          function (done) {
            if (sender === 'agent') {
              modelReclamation
                .find({ code: new ObjectId(_id) })
                .then((response) => {
                  if (response.length > 0) {
                    done(null, true)
                  } else {
                    return res
                      .status(201)
                      .json(
                        'Veuillez patienter! votre demande est en cours de traitement',
                      )
                  }
                })
                .catch(function (errr) {
                  if (errr) {
                    return res.status(201).json('Try again')
                  }
                })
            } else {
              done(null, true)
            }
          },
          function (rep, done) {
            modelReclamation
              .create({
                message,
                codeAgent,
                sender,
                code: new ObjectId(_id),
              })
              .then((response) => {
                if (response) {
                  done(response)
                }
              })
              .catch(function (errr) {
                if (errr) {
                  return res.status(201).json('Try again')
                }
              })
          },
          function (reclamation, done) {
            modelReclamation
              .find({ code: reclamation.code })
              .then((recl) => {
                done(recl)
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
            return res.status(200).json([])
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  ReadMessage: (req, res) => {
    try {
      const recherche = req.recherche
      const { codeAgent } = req.params
      let match = recherche
        ? { $match: { _id: recherche } }
        : { $match: { codeAgent } }

      modelReclamation
        .aggregate([
          match,
          {
            $lookup: {
              from: 'demandes',
              localField: 'code',
              foreignField: '_id',
              as: 'demandeId',
            },
          },
          {
            $lookup: {
              from: 'reponses',
              localField: 'code',
              foreignField: '_id',
              as: 'reponseId',
            },
          },
        ])
        .then((response) => {
          return res.status(200).json(response)
        })
    } catch (error) {
      console.log(error)
    }
  },
  DeleteReclamation: (req, res) => {
    try {
      const { id } = req.params
      modelReclamation
        .findByIdAndRemove(id)
        .then((response) => {
          if (response) {
            return res.status(200).json(id)
          } else {
            return res.status(201).json('')
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  demandeIncorrect: (req, res) => {
    try {
      asyncLab.waterfall(
        [
          function (done) {
            modelPeriode
              .findOne({})
              .then((response) => {
                if (response) {
                  done(null, response)
                } else {
                  return res.status(201).json('Erreur')
                }
              })
              .catch(function (err) {
                return res.status(201).json('Erreur ' + err)
              })
          },
          function (periode, done) {
            modelDemande
              .aggregate([
                {
                  $match: {
                    lot: periode.periode,
                    valide: false,
                    feedback: 'chat',
                  },
                },
                {
                  $lookup: {
                    from: 'conversations',
                    localField: '_id',
                    foreignField: 'code',
                    as: 'conversation',
                  },
                },
                {
                  $lookup: {
                    from: 'agents',
                    localField: 'codeAgent',
                    foreignField: 'codeAgent',
                    as: 'agent',
                  },
                },
                {
                  $unwind: '$agent',
                },
                {
                  $lookup: {
                    from: 'shops',
                    localField: 'agent.idShop',
                    foreignField: 'idShop',
                    as: 'shopAgent',
                  },
                },
                {
                  $unwind: '$shopAgent',
                },
              ])
              .then((result) => {
                done(result)
              })
          },
        ],
        function (result) {
          try {
            if (result.length > 0) {
              return res.status(200).json(result.reverse())
            } else {
              return res.status(201).json('Erreur')
            }
          } catch (error) {}
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
}
