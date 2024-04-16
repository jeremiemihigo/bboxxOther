const { ObjectId } = require('mongodb')
const modelDoublon = require('../Models/Doublon')
const modelConversation = require('../Models/Reclamation')
const asyncLab = require('async')
const modelDemande = require('../Models/Demande')
const modelPeriode = require('../Models/Periode')

module.exports = {
  Doublon: (req, res) => {
    try {
      if (!req.recherche.present) {
        const { idDemande, agentCo, doublon } = req.recherche
        modelDemande
          .findOneAndUpdate(
            { idDemande },
            { $set: { double: { codeAgent: agentCo, valeur: doublon }, feedback:"chat" } },
            { new: true },
          )
          .then((response) => {
            if (response) {
              return res.status(200).json(idDemande)
            }
          })
          .catch(function (err) {
            console.log(err)
          })
      } else {
        const {
          codeclient,
          precedent,
          present,
          agentCo,
          message,
          _idDemande,
        } = req.recherche
        asyncLab.waterfall(
          [
            function (done) {
              modelDoublon
                .create({
                  codeclient,
                  precedent,
                  present,
                })
                .then((response) => {
                  if (response) {
                    done(null, response)
                  }
                })
                .catch(function (err) {
                  console.log(err)
                })
            },
            function (result, done) {
              modelConversation
                .create({
                  message: message,
                  codeAgent: agentCo,
                  sender: 'co',
                  code: new ObjectId(_idDemande),
                })
                .then((response) => {
                  if (response) {
                    done(response)
                  }
                })
            },
          ],
          function (response) {
            if (response) {
              return res.status(200).json(present)
            } else {
            }
          },
        )
      }
    } catch (error) {
      console.log(error)
    }
  },
  ReadDoublon: (req, res) => {
    try {
      modelDoublon
        .aggregate([
          {
            $lookup: {
              from: 'demandes',
              localField: 'precedent',
              foreignField: 'idDemande',
              as: 'precedent',
            },
          },
          { $unwind: '$precedent' },
          {
            $lookup: {
              from: 'demandes',
              localField: 'present',
              foreignField: 'idDemande',
              as: 'presents',
            },
          },
          { $unwind: '$presents' },
          //Look agent précédent
          {
            $lookup: {
              from: 'agents',
              localField: 'precedent.codeAgent',
              foreignField: 'codeAgent',
              as: 'agentPrecedent',
            },
          },
          { $unwind: '$agentPrecedent' },
          //Look agent present
          {
            $lookup: {
              from: 'agents',
              localField: 'presents.codeAgent',
              foreignField: 'codeAgent',
              as: 'agentPresent',
            },
          },
          {
            $unwind: '$agentPresent',
          },
          {
            $lookup: {
              from: 'conversations',
              localField: 'presents._id',
              foreignField: 'code',
              as: 'conversation',
            },
          },
          {
            $lookup: {
              from: 'shops',
              localField: 'agentPrecedent.idShop',
              foreignField: 'idShop',
              as: 'PrecedentShop',
            },
          },
          { $unwind: '$PrecedentShop' },
          {
            $lookup: {
              from: 'shops',
              localField: 'agentPresent.idShop',
              foreignField: 'idShop',
              as: 'PresentShop',
            },
          },
          { $unwind: '$PresentShop' },
          {
            $project: {
              codeclient: 1,
              'precedent.file': 1,
              'precedent.createdAt': 1,
              'precedent.sat': 1,
              'precedent.cell': 1,
              'precedent.sector': 1,
              'precedent.reference': 1,
              'precedent.idDemande': 1,
              'precedent.statut': 1,
              'precedent.raison': 1,
              'presents.file': 1,
              'presens.createdAt': 1,
              'presents.statut': 1,
              'presents.sat': 1,
              'presents.cell': 1,
              'presents.sector': 1,
              'presents.reference': 1,
              'presents.idDemande': 1,
              'presents.statut': 1,
              'agentPrecedent.nom': 1,
              'agentPrecedent.codeAgent': 1,
              'PrecedentShop.shop': 1,
              'agentPresent.nom': 1,
              'agentPresent.codeAgent': 1,
              'PresentShop.shop': 1,
              conversation: 1,
            },
          },
        ])
        .then((response) => {
          if (response.length > 0) {
            return res.status(200).json(response.reverse())
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  NonConformes: (req, res) => {
    try {
      const { dataTosearch } = req.body

      asyncLab.waterfall(
        [
          function (done) {
            modelPeriode
              .findOne({})
              .lean()
              .then((result) => {
                if (result) {
                  done(null, result)
                } else {
                  return res.status(201).json('Aucune période active')
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (periode, done) {
            let match = dataTosearch
              ? {
                  $match: {
                    lot: periode.periode,
                    valide: false,
                    feedback: 'chat',
                    double: { $exists: false },
                    [dataTosearch.key]: dataTosearch.value,
                  },
                }
              : {
                  $match: {
                    lot: periode.periode,
                    valide: false,
                    feedback: 'chat',
                    double: { $exists: 0 },
                  },
                }
            modelDemande
              .aggregate(
                [
                  match,
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
                  { $unwind: '$agent' },

                  {
                    $lookup: {
                      from: 'shops',
                      localField: 'idShop',
                      foreignField: 'idShop',
                      as: 'shop',
                    },
                  },
                  { $unwind: '$shop' },
                  {
                    $project: {
                      codeAgent: 1,
                      sector: 1,
                      cell: 1,
                      sat: 1,
                      idDemande: 1,
                      file: 1,
                      commune: 1,
                      'shop.shop': 1,
                      'agent.nom': 1,
                      conversation: 1,
                      createdAt: 1,
                    },
                  },
                ],
                { allowDiskUse: true },
              )
              .then((response) => {
                done(response)
              })
              .catch(function (err) {
                console.log(err)
              })
          },
        ],
        function (response) {
          if (response.length > 0) {
            return res.status(200).json(response.reverse())
          } else {
            return res.status(200).json([])
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
}
