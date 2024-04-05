const { ObjectId } = require('mongodb')
const modelReponse = require('../Models/Reponse')
const asyncLab = require('async')

module.exports = {
  AddAction: (req, res) => {
    try {
      const { idReponse, text } = req.body
     
      if (!idReponse || !text) {
        return res.status(201).json('Erreur')
      }

      asyncLab.waterfall(
        [
          function (done) {
            modelReponse
              .findOne({ _id : new ObjectId(idReponse) })
              .then((response) => {
                if (response) {
                  done(null, response)
                } else {
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (reponse, done) {
            modelReponse
              .findByIdAndUpdate(
                reponse._id,
                { $set: { action: text } },
                { new: true },
              )
              .then((actionCreate) => {
                done(actionCreate)
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
            return res.status(201).json('Erreur')
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
}
