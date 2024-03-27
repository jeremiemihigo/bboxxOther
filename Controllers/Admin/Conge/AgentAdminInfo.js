const modelAgentAdminInfo = require('../../../Models/Admin/AgentAdminInfo')
const asyncLab = require('async')
const modelContrat = require('../../../Models/Admin/Contrat')
const { generateNumber } = require('../../../Static/Static_Function')
const { ObjectId } = require('mongodb')

module.exports = {
  AgentAdminInfo: (req, res, next) => {
    try {
      const {
        codeDepartement,
        codeFonction,
        superviseurDirect,
        codeContrat,
      } = req.body
      if (
        !codeDepartement ||
        !codeFonction ||
        !superviseurDirect ||
        !codeContrat
      ) {
        return res.status(404).json('Veuillez renseigner les champs vides')
      }
      asyncLab.waterfall([
       
        function (done) {
          modelContrat
            .findOne({ codeContrat, active: true })
            .then((contrat) => {
              if (contrat) {
                done(null, contrat)
              } else {
                return res.status(404).json('Contrat introuvable')
              }
            })
            .catch(function (err) {
              return res.status(404).json('Erreur ' + err)
            })
        },
        function (contrat, done) {
          modelAgentAdminInfo
            .create({
              codeInfo: generateNumber(7),
              codeDepartement,
              codeFonction,
              superviseurDirect,
              codeContrat: contrat.codeContrat,
            })
            .then((adminInfo) => {
              done(adminInfo)
            })
            .catch(function (err) {
              return res.status(404).json('Erreur ' + err)
            })
        },
      ], function(result){
        if (result) {
          req.recherche = result._id
          next()
        } else {
          return res.status(404).json('Error')
        }
      })
    } catch (error) {
      console.log(error)
    }
  },
  ReadAdminInfo: (req, res) => {
    try {
      const recherche = req.recherche
      let match = recherche
        ? { $match: { _id: new ObjectId(recherche) } }
        : { $match: {} }
      modelAgentAdminInfo
        .aggregate([
          match,
          
          {
            $lookup: {
              from: 'agentAdmins',
              localField: 'superviseurDirect',
              foreignField: 'codeAgent',
              as: 'superviseur',
            },
          },
          {
            $lookup: {
              from: 'departements',
              localField: 'codeDepartement',
              foreignField: 'codeDepartement',
              as: 'departement',
            },
          },
          {
            $unwind: '$departement',
          },
          {
            $lookup: {
              from: 'contrats',
              localField: 'codeContrat',
              foreignField: 'codeContrat',
              as: 'contrat',
            },
          },
          {
            $unwind: '$contrat',
          },
          {
            $lookup: {
              from: 'agentAdmins',
              localField: 'contrat.codeAgent',
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
            let data = recherche ? result[0] : result
            return res.status(200).json(data)
          }
        })
        .catch(function (err) {
          return res.status(404).json('Erreur ' + err)
        })
    } catch (error) {
      console.log(error)
    }
  },
}
