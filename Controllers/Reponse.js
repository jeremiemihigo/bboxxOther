const ModelReponse = require('../Models/Reponse')
const asyncLab = require('async')
const ModelDemande = require('../Models/Demande')
const ModelAgentAdmin = require('../Models/AgentAdmin')
const _ = require('lodash')
const ModelPeriode = require('../Models/Periode')
const dayjs = require('dayjs')
const Reclamation = require('../Models/Reclamation')
const modelRapport = require("../Models/Rapport")

module.exports = {
  reponse: (req, res, next) => {
    try {
      console.log(req.body)
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
        fonctionAgent,codeAgentDemandeur, _idDemande, nomAgentSave
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
            //agent = co
            ModelPeriode.findOne({})
              .limit(1)
              .then((response) => {
                if (response) {
                  done(null, response)
                } else {
                  done('Aucune période en cours')
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (periode, done) {
            modelRapport.find({"demande.lot":periode.periode, codeclient:codeClient.trim()}).lean()
            .then((result) => {
              if (result.length > 0) {
                const doublon = result.filter(
                  (x) => x.demandeur.fonction === fonctionAgent,
                )
                if (doublon.length > 0) {
                  if (
                    doublon[0].demandeur.codeAgent === codeAgentDemandeur
                  ) {
                    let double = {
                      idDemande: idDemande,
                      doublon : doublon[0].idDemande,
                      agentCo: codeAgent,
                    }
                    req.recherche = double
                    next()
                  } else {
                    let double = {
                      codeclient: doublon[0].codeclient,
                      precedent: doublon[0].idDemande,
                      present: idDemande,
                      agentCo: codeAgent,
                      message: `visite effectuée le ${dayjs(
                        doublon[0]?.demande.createdAt,
                      ).format('DD/MM/YYYY')} par ${
                        doublon[0].demandeur.nom
                      } code : ${doublon[0].demandeur.codeAgent}`,
                      _idDemande,
                    }
                    req.recherche = double
                    next()
                  }
                } else {
                  done(null, periode)
                }
              } else {
                done(null, periode)
              }
            })
          },
          function(periode, done){
            ModelDemande.aggregate([
              {$match : {idDemande}},
              {
                $lookup:{
                  from:"agents",
                  localField:"codeAgent",
                  foreignField:"codeAgent",
                  as:"agent"
                }
              },
              {
                $unwind:"$agent"
              }
            ]).then(result=>{
              if(result.length > 0){
                done(null,  result[0])
              }
            })
          },  

          function (demande, done) {
          
            modelRapport.create({
              idDemande: demande.idDemande,
              codeclient: codeClient,
              idShop,
              idZone,
              codeCu,
              clientStatut,
              PayementStatut,
              consExpDays,
              nomClient,// La periode
              codeAgent: codeAgent,
              dateSave: dates.split('T')[0],

              agentSave :{nom : nomAgentSave },
              demandeur : {
                nom : demande.agent.nom,
                codeAgent : demande.agent.codeAgent,
                fonction : demande.agent.fonction
              },
              coordonnee:{
                longitude : demande.coordonnes.longitude,
                latitude : demande.coordonnes.latitude,
                altitude : demande.coordonnes.altitude,
              },
              
              demande : {
                typeImage : demande.typeImage,
                createdAt : demande.createdAt,
                numero : demande.numero,
                commune : demande.commune,
                updatedAt : demande.updatedAt,
                createdAt : demande.createdAt,
                statut : demande.statut,
                sector : demande.sector,
                lot:demande.lot,
                cell : demande.cell,
                reference : demande.reference,
                sat : demande.sat,
                raison : demande.raison
              }
            })
              .then((response) => {
                if (response) {
                  done(null, demande)
                } else {
                  done("Erreur d'enregistrement")
                }
              })
              .catch(function (err) {
                console.log(err)
                done('Erreur 2')
              })
          },
          function (demande, done) {
            try {
              Reclamation.deleteMany({ code: demande._id })
                .then((deleted) => {
                  done(demande)
                })
                .catch(function (err) {})
            } catch (error) {}
          },
        ],
        function (result) {
          if (result.idDemande) {
            return res.status(200).json(result.idDemande)
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
      modelRapport.find({codeclient : id}).lean()
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

      modelRapport.findByIdAndUpdate(idReponse, data, { new: true }).then(
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
  reponseFetchAll: (req, res, next) => {
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
      } = req.recherche
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
              if (result.length > 0) {
                const doublon = result.filter(
                  (x) => x.agent.fonction === demande[0].agent.fonction,
                )
                if (doublon.length > 0) {
                  if (
                    doublon[0].demande.codeAgent === demande[0].agent.codeAgent
                  ) {
                    let double = {
                      idDemande: demande[0].idDemande,
                      doublon : doublon[0].demande.idDemande,
                      agentCo: codeAgent,
                    }
                    req.recherche = double
                    next()
                  } else {
                    let double = {
                      codeclient: doublon[0].codeclient,
                      precedent: doublon[0].demande.idDemande,
                      present: demande[0].idDemande,
                      agentCo: codeAgent,
                      message: `visite effectuée par ${dayjs(
                        doublon[0]?.demande.createdAt,
                      ).format('DD/MM/YYYY')} par ${
                        doublon[0].agent.nom
                      } code : ${doublon[0].agent.codeAgent}`,
                      _idDemande: demande[0]._id,
                    }
                    req.recherche = double
                    next()
                  }
                } else {
                  done(null, periode, demande, agent)
                }
              } else {
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
              codeCu,
              clientStatut,
              PayementStatut,
              consExpDays,
              nomClient,
              text: periode.periode, // La periode
              codeAgent: agent.codeAgent,
              dateSave: dates.split('T')[0],

              agentSave :{nom : agent.nom },
              demandeur : {
                nom : demande[0].agent.nom,
                codeAgent : demande[0].agent.codeAgent,
                fonction : demande[0].agent.fonction
              },
              coordonnee:{
                longitude : demande[0].coordonnes.longitude,
                latitude : demande[0].coordonnes.latitude,
                altitude : demande[0].coordonnes.altitude,
              },
              
              demande : {
                typeImage : demande[0].typeImage,
                createdAt : demande[0].createdAt,
                numero : demande[0].numero,
                commune : demande[0].commune,
                updatedAt : demande[0].updatedAt,
                createdAt : demande[0].createdAt,
                statut : demande[0].statut,
                sector : demande[0].sector,
                lot:demande[0].lot,
                cell : demande[0].cell,
                reference : demande[0].reference,
                sat : demande[0].sat,
                raison : demande[0].raison
              }
            })
              .then((response) => {
                if (response) {
                  done(demande)
                } else {
                  done("Erreur d'enregistrement")
                }
              })
              .catch(function (err) {
                done('Erreur 2')
              })
          },
         
        ],
        function (result) {
          if (result.idDemande) {
            return res.status(200).json(result.idDemande)
          } else {
            return res.status(400).json(result)
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  reponseChangeStatus: (req, res, next) => {
    try {
      
      // const {} = req.user
    
      const dates = new Date().toISOString()

      asyncLab.waterfall(
        [
          function (done) {
            ModelDemande.aggregate([
              { $match: { valide : true } },
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
                  from: 'reponses',
                  localField: 'idDemande',
                  foreignField: 'idDemande',
                  as: 'reponse',
                },
              },
              {
                $unwind: '$reponse',
              },
              {
                $lookup: {
                  from: 'agentadmins',
                  localField: 'reponse.codeAgent',
                  foreignField: 'codeAgent',
                  as: 'agentadmin',
                },
              },
              {
                $unwind: '$agentadmin',
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
            for(let i=0; i<demande.length;i++){
              modelRapport.create({
                idDemande: demande[i].idDemande,
                codeclient: demande[i].reponse.codeclient,
                idShop : demande[i].idShop,
                idZone : demande[i].codeZone,
                codeCu : demande[i].reponse.codeCu,
                clientStatut :demande[i].reponse.clientStatut,
                PayementStatut : demande[i].reponse.PayementStatut,
                consExpDays : demande[i].reponse.consExpDays,
                nomClient : demande[i].reponse.nomClient,
                text: demande[i].lot, // La periode
                codeAgent: demande[i].reponse.codeAgent,
                dateSave: demande[i].reponse.dateSave,
                createdAt : demande[i].reponse.createdAt,
                updatedAt : demande[i].reponse.updatedAt,

                agentSave :{nom : demande[i].agentadmin.nom },
                demandeur : {
                  nom : demande[i].agent.nom,
                  codeAgent : demande[i].agent.codeAgent,
                  fonction : demande[i].agent.fonction
                },
                coordonnee:{
                  longitude : demande[i].coordonnes.longitude,
                  latitude : demande[i].coordonnes.latitude,
                  altitude : demande[i].coordonnes.altitude,
                },
                
                demande : {
                  typeImage : demande[i].typeImage,
                  createdAt : demande[i].createdAt,
                  numero : demande[i].numero,
                  commune :demande[i].commune,
                  updatedAt : demande[i].updatedAt,
                  createdAt : demande[i].createdAt,
                  statut : demande[i].statut,
                  sector : demande[i].sector,
                  lot:demande[i].lot,
                  cell : demande[i].cell,
                  reference : demande[i].reference,
                  sat : demande[i].sat,
                  raison : demande[i].raison
                }
              })
                .then((response) => {
                 console.log(response)
                })
                .catch(function (err) {
                  console.log(err)
                })
            }
          
          },
          
        ],
        function (result) {
         console.log(result)
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
}
