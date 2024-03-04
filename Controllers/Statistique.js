const modelDemande = require('../Models/Demande')
const _ = require('lodash')
const asyncLab = require('async')

module.exports = {
  readPeriodeGroup: (req, res) => {
    try {
      const { codeAgent } = req.params
      asyncLab.waterfall([
        function (done) {
          modelDemande
            .aggregate([{ $group: { _id: '$lot' } }])
            .then((response) => {
              if (response) {
                let table = []
                for (let i = 0; i < response.length; i++) {
                  table.push(response[i]._id)
                }
                done(null, table)
              }
            })
        },
        function (lot, done) {
          modelDemande
            .aggregate([
              {
                $match: {
                  codeAgent,
                  codeAgent,
                  lot: {
                    $in: lot,
                  },
                },
              },
              {
                $lookup: {
                  from: 'reponses',
                  localField: 'idDemande',
                  foreignField: 'idDemande',
                  as: 'reponse',
                },
              },
            ])
            .then((response) => {
              done(null, lot, response)
            })
        },
        function (lot, reponse, done) {
          let table = []
          for (let i = 0; i < lot.length; i++) {
            table.push({
              _id: lot[i],
              demande: reponse.filter((x) => x.lot === lot[i]).length,
              reponse: reponse.filter(
                (x) => x.lot === lot[i] && x.reponse.length > 0,
              ).length,
            })
          }
          res.status(200).json(table)
        },
      ])
    } catch (error) {
      console.log(error)
    }
  },
  demandePourChaquePeriode: (req, res) => {
    try {
      modelDemande
        .aggregate([
          {
            $lookup: {
              from: 'reponses',
              localField: 'idDemande',
              foreignField: 'idDemande',
              as: 'reponse',
            },
          },
          { $unwind: '$reponse' },
          {
            $group: {
              _id: '$lot',
              total: { $sum: 1 },
            },
          },
          {
            $sort : {_id : -1}
          }
        ])
        .then((result) => {
          return res.status(200).json(result)
        })
    } catch (error) {
      console.log(error)
    }
  },
}
