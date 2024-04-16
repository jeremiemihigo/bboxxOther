const modelRaison = require('../Models/Raison')
const modelAgent = require('../Models/AgentAdmin')
const asyncLab = require('async')
const modelDemande = require('../Models/Demande')

module.exports = {
  AddRaison: (req, res) => {
    try {
      const { raison, codeAgent } = req.body
 
      if (!raison) {
        return res.status(404).json('Veuillez renseigner les champs')
      }
      asyncLab.waterfall(
        [
          function (done) {
            modelAgent
              .findOne({ codeAgent, active: true })
              .then((agent) => {
                if (agent) {
                  done(null, agent)
                } else {
                  done(false)
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (agent, done) {
            modelRaison
              .findOne({ raison : raison.toUpperCase(), })
              .then((raisons) => {
                if (raisons) {
                  return res.status(404).json(`${raisons} existe deja`)
                } else {
                  done(null, agent)
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (agent, done) {
            modelRaison
              .create({ raison : raison.toUpperCase(),savedBy : agent.codeAgent, id: new Date() })
              .then((save) => {
                done(save)
              })
              .catch(function (err) {
                console.log(err)
              })
          },
        ],
        function (result) {
          if (result) {
            return res.status(200).json(result)
          } else {
            return res.status(404).json('Erreur')
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  ReadRaison: (req, res) => {
    try {
      modelRaison
        .aggregate([
          {
            $lookup: {
              from: 'demandes',
              localField: 'raison',
              foreignField: 'raison',
              as: 'demande',
            },
          },
        ])
        .then((raison) => {
          if (raison) {
            return res.status(200).json(raison)
          } else {
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  UpdateRaison: (req, res) => {
    try {
      const { id, raison } = req.body
      if (!id || !raison) {
        return res.status(404).json('Veuillez renseigner les champs')
      }

      modelRaison
        .findByIdAndUpdate(id, { raison })
        .then((updated) => {
          if (updated) {
            return res.status(200).json(updated)
          } else {
            return res.status(404).json('Erreur')
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },

  Ajuster : (req, res)=>{
    try {
      const {  table, value } = req.body
      //dates doit etre soit true les dates ne doivent pas etre vide ou false
     
      if(table && table.length < 1){
        return res.status(201).json("Veuillez selectionner au moins un feedback")
      }
      if(value === ""){
        return res.status(201).json("Veuillez renseigner le feedback a considéré")
      }
  
      modelDemande.updateMany({
        raison : {$in : table}
      }, { $set: { "raison" : value } }, {new : true}).then(response=>{
        return res.status(200).json(response)
      }).catch(function(err){
        console.log(err)
      })
    
    } catch (error) {
      console.log(error)
    }
  }
}
