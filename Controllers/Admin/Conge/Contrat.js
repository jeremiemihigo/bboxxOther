const modelContrat = require('../../../Models/Admin/Contrat')
const modelAgent = require('../../../Models/AgentAdmin')
const asyncLab = require('async')
const { generateNumber } = require('../../../Static/Static_Function')
const { ObjectId } = require('mongodb')

module.exports = {
  Contrat: (req, res, next) => {
    try {
      const { codeAgent, debut, fin, soldeConge } = req.body
      
      if (!codeAgent || !debut || !fin || !soldeConge) {
        return res.status(404).json('Veuillez renseigner les champs vides')
      }
      if (isNaN(parseInt(soldeConge)) || parseInt(soldeConge) < 1) {
        return res
          .status(404)
          .json('Le solde congé doit etre un chiffre superieur à 0')
      }
      const codeContrat = generateNumber(5)
      asyncLab.waterfall(
        [
          function (done) {
            modelAgent
              .findOne({
                codeAgent,
                active: true,
              })
              .then((agent) => {
                if (agent) {
                  done(null, agent)
                } else {
                  return res.status(404).json("L'agent est bloqué")
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (agent, done) {
            modelContrat
              .create({
                codeContrat,
                codeAgent: agent.codeAgent,
                debut,
                fin,
                soldeConge,
              })
              .then((contrat) => {
                done(contrat)
              })
              .catch(function (err) {
                return res.status(404).json('Erreur ' + err)
              })
          },
        ],
        function (contrat) {
          if (contrat) {
            req.recherche = contrat._id
            next()
          } else {
            return res.status(404).json("Erreur d'enregistrement")
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  ReadContrat: (req, res) => {
    try {
      const recherche = req.recherche
      let match = recherche
        ? { $match: { _id: new ObjectId(recherche) } }
        : { $match: {} }

      modelContrat.aggregate([
        match,
        {
          $lookup: {
            from: 'agentadmins',
            localField: 'codeAgent',
            foreignField: 'codeAgent',
            as: 'agent',
          },
        },
        {
          $unwind : "$agent"
        },
        {
          $lookup: {
            from: 'conges',
            localField: 'codeContrat',
            foreignField: 'codeContrat',
            as: 'conge',
          },
        },
        
      ]).then(agents=>{
        if(agents.length > 0){
          let data = recherche ? agents[0] : agents
          return res.status(200).json(data)
        }else{
          return res.status(200).json([])
        }
      })
    } catch (error) {}
  },
}
