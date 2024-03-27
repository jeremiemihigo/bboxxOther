const { ObjectId } = require('mongodb')
const modelAction = require('../Models/Actions')
const asyncLab = require('async')

module.exports = {
  AddAction: (req, res, next) => {
    try {
      const { idReponse, text, action } = req.body
      if (!idReponse) {
        return res.status(201).json('Erreur')
      }

      asyncLab.waterfall(
        [
          function (done) {
            modelAction
              .findOne({ idReponse })
              .then((response) => {
                if (response) {
                  return res
                    .status(201)
                    .json("Vous avez deja demandé l'action à cette demande")
                } else {
                  done(null, response)
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (actions, done) {
            modelAction
              .create({
                idReponse,
                text,
                action,
              })
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
            req.recherche = result._id
            next()
          } else {
            return res.status(201).json('Erreur')
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  ReadAction: (req, res) => {
    try {
      const recherche = req.recherche
      let match = recherche
        ? { $match: { _id: new ObjectId(recherche) } }
        : { $match: {} }

      modelAction.aggregate([
        match,
        {
          $lookup: {
            from: 'reponses',
            localField: 'idReponse',
            foreignField: '_id',
            as: 'reponse',
          },
        },
        { $unwind: '$reponse' },
        {
          $lookup : {
            from:"demandes",
            localField:"reponse.idDemande",
            foreignField:"idDemande",
            as :"demande"
          }
        },
        {
          $unwind:"$demande"
        },
       
        {
          $lookup : {
            from:"agents",
            localField:"demande.codeAgent",
            foreignField:"codeAgent",
            as:"agentTerrain"
          }
        },
        {
          $unwind:"$agentTerrain"
        },
      ]).then(result=>{
        if(result.length > 0){
          let data = recherche ? result[0] : result
          return res.status(200).json(data)
        }
      })
    } catch (error) {
      console.log(error)
    }
  },
}
