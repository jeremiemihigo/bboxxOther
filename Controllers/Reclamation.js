const asyncLab = require('async')
const modelReclamation = require('../Models/Reclamation')
const { ObjectId } = require('mongodb')

module.exports = {
  Reclamation: (req, res, next) => {
    try {
      const { _id, message, sender, codeAgent } = req.body
      if (!_id || !message || !sender || !codeAgent) {
        return res.status(201).json('Error')
      }
      asyncLab.waterfall(
        [
          function (done) {
            modelReclamation
              .create({
                message,codeAgent,
                sender,
                code : new ObjectId(_id),
              })
              .then((response) => {
                if (response) {
                  done(response)
                }
              })
              .catch(function (errr) {
                if (errr) {
                  return res.status(201).json('Try again')
                }
              })
          },
          function(reclamation, done){
            modelReclamation.find({ code : reclamation.code}).then(recl=>{
              done(recl)
            }).catch(function(err){console.log(err)})
          }
          
        ],
        function (result) {
          if(result){
            req.recherche = result._id
            next()
          }else{
            return res.status(200).json([])
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  ReadMessage: (req, res) => {
    try {
    const recherche = req.recherche
     const { codeAgent } = req.params
     let match = recherche ? {$match : {_id : recherche }} :{$match : {codeAgent }}

      modelReclamation
        .aggregate([
          match,
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
        .then((response) => {
          return res.status(200).json(response)
        })
    } catch (error) {
      console.log(error)
    }
  },
  DeleteReclamation: (req, res) => {
    try {
      const { id } = req.params
      modelReclamation
        .findByIdAndRemove(id)
        .then((response) => {
          if (response) {
            return res.status(200).json(id)
          }else{
            return res.status(201).json("")
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  
}
