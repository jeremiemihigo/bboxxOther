const modelDemandeCreation = require('../../Models/Ticket/DemandeCreation')
const asyncLab = require('async')

module.exports = {
  DemandeCreation: (req, res) => {
    try {
      const { codeAgent } = req.user
      const { codeclient, contact, commentaire } = req.body

      asyncLab.waterfall([
        function (done) {
          modelDemandeCreation
            .create({
              codeclient,
              commentaire,
              contact,
              createdBy: codeAgent,
            })
            .then((demande) => {
              done(demande)
            })
            .catch(function (err) {
              console.log(err)
            })
        },
      ], function(demande){
        if (demande) {
          return res.status(200).json(demande)
        } else {
          return res.status(404).json('Erreur de creation')
        }
      })
    } catch (error) {
      console.log(error)
    }
  },
}
