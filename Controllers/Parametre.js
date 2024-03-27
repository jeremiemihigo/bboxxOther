const modelParametre = require('../Models/Parametre')
const modelPeriode = require('../Models/Periode')
const asyncLab = require('async')

module.exports = {
  Parametre: (req, res) => {
    const { data } = req.body
    try {
      modelParametre
        .insertMany(data)
        .then((response) => {
          if (response) {
            return res.status(200).json('Enregistrement effectuer')
          } else {
            return res.status(200).json("Erreur d'enregistrement")
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  ReadParametre: (req, res) => {
    try {
      modelParametre
        .find({})
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
  PeriodeDemande: (req, res, next) => {
    next()
    if (new Date().getDate() >= 1 && new Date().getDate() <= 3) {
      const toDay = new Date()
      const periode = `${
        toDay.getMonth() + 1 < 10
          ? '0' + (toDay.getMonth() + 1)
          : toDay.getMonth() + 1
      }-${toDay.getFullYear()}`
      modelPeriode.updateOne({ $set: { periode } }).then((result) => {})
    }
  },
  ReadPeriodeActive: (req, res) => {
    try {
      modelPeriode
        .findOne({})
        .then((response) => {
          if (response) {
            return res.status(200).json(response)
          } else {
            return res.status(200).json([])
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  deleteParams: (req, res) => {
    try {
      try {
        modelParametre.deleteMany().then((response) => {
          return res.status(200).json(response)
        })
      } catch (e) {
        print(e)
      }
    } catch (error) {
      console.log(error)
    }
  },
  rechercheClient : (req, res)=>{
    try {
      const {codeclient} = req.params
      if(codeclient !== ""){
        modelParametre.aggregate([
          {$match : {customer : codeclient.toUpperCase()}},
          {
            $lookup : {
              from:"zones",
              localField:"region",
              foreignField:"idZone",
              as:"region"
            }
          },
          {
            $unwind:"$region"
          },
          {
            $lookup : {
              from:"shops",
              localField:"shop",
              foreignField:"idShop",
              as:"shop"
            }
          },
          {
            $unwind:"$shop"
          }
        ])
      .then(response=>{
          if(response.length > 0){
            return res.status(200).json(response[0])
          }else{
            return res.status(201).json([])
          }
        }).catch(function(err){console.log(err)})
      }else{
        return res.status(201).json([])
      }
    } catch (error) {
      
    }
  }
}
