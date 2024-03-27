const modelValidation = require('../../../Models/Admin/Validation')
const asyncLab = require('async')
const modelAgent = require('../../../Models/AgentAdmin')

module.exports = {
  Validations: (req, res, next) => {
    try {
      const { codeConge, codeContrat, codeAgent, data } = req.body

      asyncLab.waterfall([
        function (done) {
          modelAgent
            .findOne({ codeAgent, active: true })
            .then((agent) => {
              if (agent) {
                done(null, agent)
              } else {
                return res.status(201).json('Vos accès sont introuvables')
              }
            })
            .catch(function (err) {
              return res.status(201).json('Erreur ' + err)
            })
        },
        function (agent, done) {
          modelValidation.findOneAndUpdate(
            {
              codeConge,
            },
            { $set: data },
            { new: true },
          ).then(result=>{
            done(result)
          })
        },
      ], function(result){
        if(result){
          req.recherche = codeContrat
          next()
        }
      })
    } catch (error) {
      console.log(error)
    }
  },
}
