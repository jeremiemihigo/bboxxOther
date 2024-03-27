const ModelReponse = require('../Models/Reponse')
const asyncLab = require('async')
const _ = require('lodash')
const modelPeriode = require('../Models/Periode')

module.exports = {
  Rapport: (req, res) => {
    try {
      const { debut, fin } = req.body

      if (!debut || !fin) {
        return res
          .status(200)
          .json({ error: true, message: 'Veuillez renseigner les dates' })
      }
      let matches = {
        $match: {
          dateSave: {
            $gte: new Date(debut),
            $lte: new Date(fin),
          },
        },
      }
      let lookAgent = {
        $lookup: {
          from: 'agentadmins',
          localField: 'codeAgent',
          foreignField: 'codeAgent',
          as: 'agent',
        },
      }
      let lookDemande = {
        $lookup: {
          from: 'demandes',
          localField: 'idDemande',
          foreignField: 'idDemande',
          as: 'demande',
        },
      }

      let unwindDemande = { $unwind: '$demande' }
      let unwindDemandeur = { $unwind: '$demandeur' }
      let unwindagent = { $unwind: '$agent' }
      let lookDemandeur = {
        $lookup: {
          from: 'agents',
          localField: 'demande.codeAgent',
          foreignField: 'codeAgent',
          as: 'demandeur',
        },
      }

      let project = {
        $project: {
          codeclient: 1,
          codeCu: 1,
          clientStatut: 1,
          PayementStatut: 1,
          consExpDays: 1,
          'demandeur.nom': 1,
          'demandeur.codeAgent': 1,
          'demandeur.fonction': 1,
          'agent.nom': 1,
          'demande.typeImage': 1,
          'demande.createAt': 1,
          'demande.numero': 1,
          'demande.commune': 1,
          'demande.updatedAt': 1,
          createdAt: 1,
          updatedAt: 1,
          'demande.coordonnes': 1,
          'demande.statut': 1,
          'demande.sector': 1,
          'demande.lot': 1,
          'demande.cell': 1,
          'demande.reference': 1,
          'demande.sat': 1,
          'demande.createdAt': 1,
          'demande.raison': 1,
          nomClient: 1,
          action: 1,
          shop: 1,
          region: 1,
        },
      }
      let sort = {
        $sort: { createdAt: -1 },
      }
      let lookRegion = {
        $lookup: {
          from: 'zones',
          localField: 'idZone',
          foreignField: 'idZone',
          as: 'region',
        },
      }
      let lookShop = {
        $lookup: {
          from: 'shops',
          localField: 'idShop',
          foreignField: 'idShop',
          as: 'shop',
        },
      }
      let unwindShop = { $unwind: '$shop' }
      let unwindRegion = { $unwind: '$region' }

      let lookAction = {
        $lookup: {
          from: 'actions',
          localField: '_id',
          foreignField: 'idReponse',
          as: 'action',
        },
      }

      asyncLab.waterfall([
        function (done) {
          ModelReponse.aggregate([
            matches,
            lookDemande,
            unwindDemande,
            lookDemandeur,
            lookAgent,
            unwindDemandeur,
            unwindagent,
            lookRegion,
            lookShop,
            unwindShop,
            unwindRegion,
            lookAction,
            project,
            sort,
          ]).then((response) => {
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
