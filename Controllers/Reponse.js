const ModelReponse = require('../Models/Reponse')
const asyncLab = require('async')
const ModelDemande = require('../Models/Demande')
const ModelAgentAdmin = require('../Models/AgentAdmin')
const _ = require('lodash')
const ModelPeriode = require('../Models/Periode')
const { dateActuelle } = require('../Static/Static_Function')
const modelAction = require('../Models/Actions')

module.exports = {
  reponse: (req, res) => {
    try {
      const {
        idDemande,
        codeClient,
        codeCu,
        clientStatut,
        PayementStatut,
        consExpDays,
        nomClient,
        idZone,
        codeAgent,
        idShop,
      } = req.body
      // const {} = req.user
      if (
        !idDemande ||
        !codeAgent ||
        !codeClient ||
        !clientStatut ||
        !PayementStatut ||
        !consExpDays ||
        !nomClient ||
        !idShop ||
        !idZone
      ) {
        return res.status(400).json('Veuillez renseigner les champs')
      }
      const dates = new Date().toISOString()

      asyncLab.waterfall(
        [
          function (done) {
            ModelDemande.aggregate([
              { $match: { idDemande } },
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
            ])
              .then((response) => {
                if (response) {
                  done(null, response)
                } else {
                  done('Demande introuvable ')
                }
              })
              .catch(function (err) {
                done('Erreur 1')
              })
          },
          function (demande, done) {
            ModelAgentAdmin.findOne({ codeAgent: codeAgent })
              .then((agent) => {
                if (agent) {
                  done(null, demande, agent)
                } else {
                  done('Agent introuvable')
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },

          function (demande, agent, done) {
            //agent = co
            ModelPeriode.findOne({})
              .limit(1)
              .then((response) => {
                if (response) {
                  done(null, response, demande, agent)
                } else {
                  done('Aucune période en cours')
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (periode, demande, agent, done) {
            ModelReponse.aggregate([
              {
                $lookup: {
                  from: 'demandes',
                  localField: 'idDemande',
                  foreignField: 'idDemande',
                  as: 'demande',
                },
              },
              {
                $unwind: '$demande',
              },
              {
                $lookup: {
                  from: 'agents',
                  localField: 'demande.codeAgent',
                  foreignField: 'codeAgent',
                  as: 'agent',
                },
              },
              {
                $unwind: '$agent',
              },
              {
                $match: {
                  codeclient: codeClient.toUpperCase(),
                  'demande.lot': periode.periode,
                },
              },
            ]).then((result) => {
              if(result.length > 0){
                const doublon = result.filter(x=>x.agent.fonction === demande[0].agent.fonction)
                if(doublon.length > 0){
                  done(`Ce client a été visiter le ${dateActuelle(
                    doublon[0]?.demande.createdAt,
                  )} par ${doublon[0].agent.nom} code : ${doublon[0].agent.codeAgent}`)
                }else{
                  done(null, periode, demande, agent)
                }
              }
               else {
                done(null, periode, demande, agent)
              }
            })
          },

          function (periode, demande, agent, done) {
            ModelReponse.create({
              idDemande: demande[0].idDemande,
              codeclient: codeClient,
              idShop,
              idZone,
              idShop,
              idZone,
              codeCu,
              clientStatut,
              PayementStatut,
              consExpDays,
              nomClient,
              text: periode.periode, // La periode
              codeAgent: agent.codeAgent,
              dateSave: dates.split('T')[0],
            })
              .then((response) => {
                if (response) {
                  done(null, response)
                } else {
                  done("Erreur d'enregistrement")
                }
              })
              .catch(function (err) {
                console.log(err)
                done('Erreur 2')
              })
          },
          function (reponse, done) {
            const table = ['defaulted', 'expired']
            if (table.includes(reponse.PayementStatut)) {
              modelAction
                .create({
                  idReponse: reponse._id,
                  action : "undefined"
                })
                .then((actions) => {
                  if (actions) {
                    done(reponse)
                  }
                })
            }else{
              done(reponse)
            }
          },
        ],
        function (result) {
          if (result.idDemande) {
            ModelDemande.aggregate([
              { $match: { idDemande: result.idDemande } },
              {
                $lookup: {
                  from: 'zones',
                  localField: 'codeZone',
                  foreignField: 'idZone',
                  as: 'zone',
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
              { $unwind: '$reponse' },
              {
                $lookup: {
                  from: 'agentadmins',
                  localField: 'reponse.codeAgent',
                  foreignField: 'codeAgent',
                  as: 'agent',
                },
              },
              { $unwind: '$agent' },
              { $unwind: '$zone' },
            ])
              .then((response) => {
                if (response) {
                  return res.status(200).json(response[0])
                } else {
                  return res.status(400).json('Erreur 4')
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          } else {
            return res.status(400).json(result)
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  OneReponse: (req, res) => {
    try {
      const { id } = req.params
      ModelReponse.aggregate([
        { $match: { codeclient: id } },
        {
          $lookup: {
            from: 'demandes',
            localField: 'idDemande',
            foreignField: 'idDemande',
            as: 'demande',
          },
        },
        {
          $lookup: {
            from: 'zones',
            localField: 'idZone',
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
        { $unwind: '$demande' },
        { $unwind: '$region' },
        { $unwind: '$shop' },
        {
          $lookup: {
            from: 'agentadmins',
            localField: 'codeAgent',
            foreignField: 'codeAgent',
            as: 'co',
          },
        },
        {
          $lookup: {
            from: 'agents',
            localField: 'demande.codeAgent',
            foreignField: 'codeAgent',
            as: 'agent',
          },
        },
        { $unwind: '$agent' },
        { $unwind: '$co' },
      ])
        .then((response) => {
          if (response.length > 0) {
            return res.status(200).json(response)
          } else {
            return res.status(200).json([])
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  updateReponse: (req, res) => {
    try {
      const { idReponse, data } = req.body

      ModelReponse.findByIdAndUpdate(idReponse, data, { new: true }).then(
        (response) => {
          return res
            .status(200)
            .json('Modification effectuée id ' + response._id)
        },
      )
    } catch (error) {}
  },
  //A demolir
  ReponseDemandeLot: (req, res) => {
    try {
      asyncLab.waterfall(
        [
          function (done) {
            ModelPeriode.findOne({})
              .then((response) => {
                if (response) {
                  done(null, response)
                } else {
                  done([])
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (periode, done) {
            ModelDemande.aggregate([
              { $match: { lot: periode.periode } },
              {
                $lookup: {
                  from: 'reponses',
                  localField: 'idDemande',
                  foreignField: 'idDemande',
                  as: 'reponse',
                },
              },
            ])
              .then((reponse) => {
                if (reponse.length > 0) {
                  done(reponse)
                } else {
                  done([])
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
        ],
        function (result) {
          try {
            if (result) {
              let donner = result.filter((x) => x.reponse.length > 0)
              return res.status(200).json(donner)
            } else {
              return res.status(201).json([])
            }
          } catch (error) {
            console.log(error)
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
}
