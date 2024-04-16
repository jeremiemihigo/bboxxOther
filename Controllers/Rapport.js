const ModelReponse = require('../Models/Reponse')
const asyncLab = require('async')
const _ = require('lodash')
const modelPeriode = require('../Models/Periode')
const modelDemande = require("../Models/Demande")
const modelRapport = require("../Models/Rapport")

module.exports = {
  Rapport: (req, res) => {
    try {
      const { debut, fin, dataTosearch } = req.body

      if (!debut || !fin) {
        return res
          .status(200)
          .json({ error: true, message: 'Veuillez renseigner les dates' })
      }
      let match = dataTosearch
      ? 
      {dateSave: {
        $gte: new Date(debut),
        $lte: new Date(fin),
      },
      [dataTosearch.key]: dataTosearch.value,
    }

      : {dateSave: {
        $gte: new Date(debut),
        $lte: new Date(fin),
      }}
      asyncLab.waterfall([
        function (done) {
          modelRapport.find(match).lean().then((response) => {
            return res.status(200).json(response.reverse())
          })
        },
      ])
    } catch (error) {
      console.log(error)
    }
  },
  StatZone: (req, res) => {
    try {
      asyncLab.waterfall([
        function (done) {
          modelPeriode
            .findOne({})
            .then((periode) => {
              if (periode) {
                done(null, periode)
              } else {
                return res.status(200).json([])
              }
            })
            .catch(function (err) {
              console.log(err)
            })
        },
        function (periode, done) {
          ModelReponse.aggregate([
            {
              $lookup: {
                from: 'demandes',
                localField: 'idDemande',
                foreignField: 'idDemande',
                as: 'demande',
              },
            },
            { $unwind: '$demande' },
            { $match: { 'demande.lot': periode.periode } },
            {
              $lookup: {
                from: 'agents',
                localField: 'codeAgent',
                foreignField: 'codeAgent',
                as: 'agent',
              },
            },
            { $unwind: '$agent' },
            { $addFields: { fonction: '$agent.fonction' } },
            {
              $group: {
                _id: {
                  region: '$region',
                  shop: '$shop',
                  fonction: '$fonction',
                },
                total: { $sum: 1 },
              },
            },
          ])
            .then((response) => {
              if (response) {
                done(null, response)
              } else {
                return res.status(404).json('Resultat introuvable')
              }
            })
            .catch(function (err) {
              console.log(err)
            })
        },
        function (result, done) {
          try {
            let donner = []

            for (let i = 0; i < result.length; i++) {
              donner.push({
                region: result[i]._id.region,
                shop: result[i]._id.shop,
                fonction: result[i]._id.fonction,
                nbre: result[i].total,
              })
            }
            done(null, _.toArray(_.groupBy(donner, 'region')))
          } catch (error) {
            console.log(error)
          }
        },
        function (result, done) {
          try {
            let donner = []
            let shop = []
            let shops = []
            for (let i = 0; i < result.length; i++) {
              for (let y = 0; y < result[i].length; y++) {
                if (!shop.includes(result[i][y].shop)) {
                  shop.push(result[i][y].shop)
                  shops.push({
                    shop: result[i][y].shop,
                    agent: result[i].filter((x) => x.fonction === 'agent')[0]
                      ?.nbre,
                    tech: result[i].filter((x) => x.fonction === 'tech')[0]
                      ?.nbre,
                  })
                }
              }
              donner.push({ region: result[i][0].region, shop: shops })
              shop = []
              shops = []
            }
            return res.status(200).json(donner)
          } catch (error) {
            console.log(error)
          }
        },
      ])
    } catch (error) {
      console.log(error)
    }
  },

  
}