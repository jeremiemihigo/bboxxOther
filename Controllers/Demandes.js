const modelDemande = require('../Models/Demande')
const ModelPeriode = require('../Models/Periode')
const modelReponse = require('../Models/Reponse')
const modelAgentAdmin = require('../Models/Agent')
const asyncLab = require('async')
const { generateNumber } = require('../Static/Static_Function')
const modelReclamation = require('../Models/Reclamation')
const { ObjectId } = require('mongodb')

module.exports = {
  demande: (req, res) => {
    try {
      //   const { codeAgent, codeZone,} = req.user
      const {
        codeclient,
        typeImage,
        codeAgent,
        codeZone,
        commune,
        numero,
        latitude, // si la photo est prise dans l'appli ce champs est obligatoire sinon il n'est pas obligatoire
        altitude, // si la photo est prise dans l'appli ce champs est obligatoire sinon il n'est pas obligatoire
        longitude, // si la photo est prise dans l'appli ce champs est obligatoire sinon il n'est pas obligatoire
        statut,
        raison,
        // N'oublies pas de supprimer la propriété "adresse" car elle n'existe plus,
        sector, //placeholder = Sector/constituency
        cell, //placeholder = Cell/Ward
        reference, //placeholder = Reference
        sat, //placeholder = SAT
      } = req.body
      const { filename } = req.file
      let annee = new Date().getFullYear().toString()

      const idDemande = `${annee.substr(
        2,
        3,
      )}${new Date().getMonth()}${generateNumber(5)}`
      if (
        !codeAgent ||
        !codeZone ||
        !statut ||
        !commune ||
        !sector ||
        !cell ||
        !reference ||
        !sat
      ) {
        return res.status(201).json('Veuillez renseigner les champs')
      }
      if (statut === 'eteint' && raison === 'undefined') {
        return res
          .status(201)
          .json('Veuillez renseigner la raison de non payement')
      }
      asyncLab.waterfall(
        [
          function (done) {
            modelAgentAdmin
              .findOne({ codeAgent, active: true })
              .then((agentFound) => {
                if (agentFound) {
                  done(null, agentFound)
                } else {
                  return res.status(201).json('Agent introuvable')
                }
              })
              .catch(function (err) {
                return res.status(201).json('Erreur')
              })
          },

          function (agent, done) {
            modelDemande
              .findOne({ idDemande })
              .then((response) => {
                if (response) {
                  return res.status(201).json('Veuillez relancer la demande')
                } else {
                  done(null, agent)
                }
              })
              .catch(function (err) {
                return res.status(201).json('Erreur')
              })
          },
          function (agent, done) {
            ModelPeriode.findOne({})
              .limit(1)
              .then((response) => {
                if (response) {
                  done(null, agent, response)
                } else {
                  return res.status(201).json('Aucune période en cours')
                }
              })
              .catch(function (err) {
                return res.status(201).json('Erreur')
              })
          },

          function (agent, periode, done) {
            modelDemande
              .create({
                codeAgent: agent.codeAgent,
                codeZone,
                typeImage,
                coordonnes: { latitude, altitude, longitude },
                statut,
                raison : raison === "undefined" ?"" : raison,
                codeclient,
                lot: periode.periode,
                idDemande,
                sector,
                cell,
                reference,
                sat,
                file: filename,
                commune,
                numero,
              })
              .then((demande) => {
                console.log(demande)
                if (demande) {
                  done(demande)
                } else {
                  return res
                    .status(201)
                    .json("Erreur d'enregistrement de la demande")
                }
              })
              .catch(function (err) {
                if (err.message) {
                  return res.status(201).json('' + err.message)
                } else {
                  return res.status(201).json('Erreur')
                }
              })
          },
        ],
        function (demande) {
          return res.status(200).json(demande)
        },
      )
    } catch (error) {
      console.log(error)
      return res.status(201).json('Erreur')
    }
  },
  DemandeAttente: (req, res) => {
    try {
      const { id, valide } = req.params
      let value = valide === '1' ? true : false

      modelDemande
        .aggregate([
          { $match: { codeAgent: id, valide: value } },
          {
            $lookup: {
              from: 'agents',
              localField: 'codeAgent',
              foreignField: 'codeAgent',
              as: 'agent',
            },
          },
          {
            $lookup: {
              from: 'zones',
              localField: 'codeZone',
              foreignField: 'idZone',
              as: 'zone',
            },
          },
          { $unwind: '$agent' },
          { $unwind: '$zone' },
        ])
        .then((response) => {
          return res.status(200).json(response)
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  ToutesDemande: (req, res) => {
    try {
      asyncLab.waterfall([
        function (done) {
          ModelPeriode.findOne({})
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
          modelDemande
            .aggregate([
              { $match: { lot: periode.periode } },
              {
                $lookup: {
                  from: 'agents',
                  localField: 'codeAgent',
                  foreignField: 'codeAgent',
                  as: 'agent',
                },
              },

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
              { $unwind: '$agent' },
              { $unwind: '$zone' },
            ])
            .then((response) => {
              return res.status(200).json(response)
            })
            .catch(function (err) {
              console.log(err)
            })
        },
      ])
    } catch (error) {
      console.log(error)
    }
  },
  ToutesDemandeAgent: (req, res) => {
    try {
      const { id } = req.params
      modelDemande
        .aggregate([
          { $match: { codeAgent: id } },
          {
            $lookup: {
              from: 'reponses',
              localField: 'idDemande',
              foreignField: 'idDemande',
              as: 'reponse',
            },
          },
          {
            $lookup: {
              from: 'reclamation',
              localField: 'idDemande',
              foreignField: 'idDemande',
              as: 'conversation',
            },
          },
        ])
        .then((response) => {
          return res.status(200).json(response)
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  lectureDemandeBd: (req, res) => {
    try {
      const { body } = req
      let match = {
        $match: body,
      }
      modelDemande
        .aggregate([
          match,
          {
            $lookup: {
              from: 'reponses',
              localField: 'idDemande',
              foreignField: 'idDemande',
              as: 'reponse',
            },
          },
          {
            $lookup: {
              from: 'conversations',
              localField: 'idDemande',
              foreignField: 'idDemande',
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
            $lookup: {
              from: 'zones',
              localField: 'codeZone',
              foreignField: 'idZone',
              as: 'zone',
            },
          },
          {
            $unwind: '$agent',
          },
          {
            $unwind: '$zone',
          },
        ])
        .then((response) => {
          if (response) {
            return res.status(200).json(response.reverse())
          }
        })
    } catch (error) {
      console.log(error)
    }
  },
  lectureDemandeMobile: (req, res) => {
    try {
      const { lot, codeAgent } = req.params
      let match = {
        $match: { lot, codeAgent },
      }
      modelDemande
        .aggregate([
          match,
          {
            $lookup: {
              from: 'reponses',
              localField: 'idDemande',
              foreignField: 'idDemande',
              as: 'reponse',
            },
          },
          {
            $lookup: {
              from: 'conversations',
              localField: 'idDemande',
              foreignField: 'idDemande',
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
        ])
        .then((response) => {
          if (response) {
            return res.status(200).json(response.reverse())
          }
        })
    } catch (error) {
      console.log(error)
    }
  },
  ToutesDemandeAttente: (req, res) => {
    try {
      asyncLab.waterfall([
        function (done) {
          ModelPeriode.findOne({})
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
          modelDemande
            .aggregate([
              {
                $match: {
                  valide: false,
                  lot: periode.periode,
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
               { $unwind: '$agent' },
               { $unwind: '$zone' },
              {
                $lookup: {
                  from: 'conversations',
                  localField: '_id',
                  foreignField: 'code',
                  as: 'conversation',
                },
              },
            ])
            .then((response) => {
              if (response) {
                done(null, response)
              }
            })
            .catch(function (err) {
              console.log(err)
            })
        },
        function (response, done) {
          modelReclamation
            .aggregate([
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
            .then((reclamation) => {
              return res.status(200).json({
                reclamation: reclamation.reverse(),
                response: response.reverse(),
              })
            })
        },
      ])
    } catch (error) {
      console.log(error)
    }
  },
  deleteDemande: (req, res) => {
    try {
      const { id } = req.params
      asyncLab.waterfall(
        [
          function (done) {
            modelDemande.findById(id).then((response) => {
              if (response) {
                done(null, response)
              } else {
                return res.status(201).json('reponse introuvable')
              }
            })
          },
          function (demande, done) {
            modelDemande.findByIdAndRemove(demande._id).then((response) => {
              if (response) {
                done(null, demande)
              } else {
                done('Erreur')
              }
            })
          },
          function (demande, done) {
            modelReponse
              .findOne({ idDemande: demande.idDemande })
              .then((reponse) => {
                if (reponse) {
                  done(demande)
                } else {
                  return res.status(200).json(id)
                }
              })
          },
          function (demande, done) {
            modelReponse
              .findOneAndRemove({ idDemande: demande.idDemande })
              .then((response) => {
                done(response)
              })
          },
        ],
        function (result) {
          if (result) {
            return res.status(200).json(id)
          } else {
            return res.status(201).json('Erreur')
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  updateDemandeAgent: (req, res) => {
    try {
      const {
        codeclient,
        commune,
        numero,
        latitude, // si la photo est prise dans l'appli ce champs est obligatoire sinon il n'est pas obligatoire
        altitude, // si la photo est prise dans l'appli ce champs est obligatoire sinon il n'est pas obligatoire
        longitude, // si la photo est prise dans l'appli ce champs est obligatoire sinon il n'est pas obligatoire
        statut,
        raison,
        // N'oublies pas de supprimer la propriété "adresse" car elle n'existe plus,
        sector, //placeholder = Sector/constituency
        cell, //placeholder = Cell/Ward
        reference, //placeholder = Reference
        sat,
        id, //placeholder = SAT
      } = req.body

      asyncLab.waterfall([
        function(done){
          modelDemande.findOne({_id : new ObjectId(id), valide : false}).then(demande=>{
            if(demande){
              done(null, demande)
            }else{
              return res.status(201).json("Erreur")
            }
          }).catch(function (err) {
            return res.status(201).json('Erreur')
          })
        },
        function (demande, done) {
          if (req.file) {
            const { filename } = req.file
            modelDemande
              .findByIdAndUpdate(id, {
                coordonnes: { latitude, altitude, longitude },
                statut,
                raison,
                codeclient,
                sector,
                cell,
                reference,
                sat,
                file: filename,
                commune,
                numero,
              }, {new : true})
              .then((response) => {
                done(response)
              })
              .catch(function (err) {
                return res.status(201).json('Erreur')
              })
          } else {
            modelDemande
              .findByIdAndUpdate(id, {
                coordonnes: { latitude, altitude, longitude },
                statut,
                raison,
                codeclient,
                sector,
                cell,
                reference,
                sat,
                commune,
                numero,
              }, {new : true})
              .then((response) => {
                done(response)
              })
              .catch(function (err) {
                return res.status(201).json('Erreur')
              })
          }
        },
      ], function(result){
        if(result){
          return res.status(200).json(result)
        }else{
          return res.status(201).json('Erreur')
        }
      })

      // const { filename } = req.file
    } catch (error) {
      console.log(error)
    }
  },
}
