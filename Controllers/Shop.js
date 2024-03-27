const modelShop = require('../Models/Shop')
const asyncLab = require('async')
const { generateNumber } = require('../Static/Static_Function')

module.exports = {
  AddShop: (req, res, next) => {
    try {
      const { shop, adresse, idZone } = req.body
      if (!shop || !idZone) {
        return res.status(404).json('Veuillez renseigner les champs')
      }

      asyncLab.waterfall(
        [
          function (done) {
            modelShop
              .findOne({ shop })
              .then((result) => {
                if (result) {
                  return res.status(404).json('Le shop existe deja')
                } else {
                  done(null, true)
                }
              })
              .catch(function () {
                return res.status(401).json("Erreur d'enregistrement")
              })
          },
          function (value, done) {
            modelShop
              .create({ shop, id: new Date(), adresse, idZone, idShop : generateNumber(9) })
              .then((result) => {
                done(result)
              })
              .catch(function () {
                return res.status(401).json("Erreur d'enregistrement")
              })
          },
        ],
        function (result) {
          if (result) {
            req.recherche = result._id
            next()
          } else {
            return res.status(401).json("Erreur d'enregistrement")
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  ReadShop: (req, res) => {
    const recherche = req.recherche
     let match = recherche ? {$match : {_id : recherche }} :{$match : { }}
     
    try {
      
      modelShop.aggregate([
        match,
        
        {
          $lookup: {
            from: 'zones',
            localField: 'idZone',
            foreignField: 'idZone',
            as: 'region',
          },
        },
        { $unwind: '$region' },
      ]).then(response=>{
        if(response){
          return recherche ? res.status(200).json(response[0]) : res.status(200).json(response) 
        }
      })
    } catch (error) {
      console.log(error)
    }
  },
  UpdateOneField : (req, res)=>{
    try {
      const {id, data} = req.body
      if(!id || !data){
        return res.status(404).json("Erreur")
      }
      modelShop.findByIdAndUpdate(id, data, {new : true}).then(response=>{
        if(response){
          return res.status(200).json(response)
        }else{
          return res.status(404).json("Erreur")
        }
      }).catch(function(){
        return res.status(404).json("Erreur")
      })
    } catch (error) {
      console.log(error)
    }
  }
}