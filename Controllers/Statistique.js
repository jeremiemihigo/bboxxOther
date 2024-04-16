const modelDemande = require('../Models/Demande')
const _ = require('lodash')
const asyncLab = require('async')
const modelPeriode = require("../Models/Periode")

module.exports = {
  readPeriodeGroup: (req, res) => {
    try {
      const { codeAgent } = req.user
      asyncLab.waterfall([
        function (done) {
          modelPeriode.findOne({}).lean().then(periode=>{
            if(periode){
              done(null, periode)
            }
          }).catch(function(err){console.log(err)})
        },
        function(periode, done){
          modelDemande
          .aggregate([{ $group: { _id: '$lot' } }])
          .then((response) => {
            if (response) {
              let table = []
              for (let i = 0; i < response.length; i++) {
                
                table.push(response[i]._id)
              }
              done(null, periode, table)
            }
          })
        },
        function (periode, lot, done) {
          modelDemande
            .aggregate([
              {
                $match: {
                  codeAgent,
                  lot : periode.periode
                },
              },
              {
                $lookup: {
                  from: 'rapports',
                  localField: 'idDemande',
                  foreignField: 'idDemande',
                  as: 'reponse',
                },
              },
              {
                $lookup: {
                  from: 'conversations',
                  localField: '_id',
                  foreignField: 'code',
                  as: 'conversation',
                },
              },

              
            ])
            .then((response) => {
              done(null,periode, response)
            })
        },
        function (periode, reponse, done) {
          let table = []
          table.push({
            _id : periode.periode,
            attente : reponse.filter(
              (x) => x.reponse.length < 1 && x.conversation.length === 0,
            ),
            nConforme : reponse.filter(
              (x) =>  x.reponse.length === 0 && x.conversation.length > 0 ,
            ),
            valide :reponse.filter(
              (x) => x.reponse.length > 0,
            ),
            allData :reponse
            
          })
          res.status(200).json(table)
        },
      ])
    } catch (error) {
      console.log(error)
    }
  },

  chercherUneDemande : (req, res)=>{
    try {
      const { id } =req.params
      if(!id){
        return res.status(201).json("Le code de la visite est obligatoire")
      }
      asyncLab.waterfall([
       
        function(done){
          modelDemande.aggregate([
            {$match : { idDemande : id}},
            {
              $lookup : {
                from :"agents",
                localField:"codeAgent",
                foreignField:"codeAgent",
                as :"agent"
              }
            },
            {$unwind : "$agent"},
            {
              $lookup : {
                from :"rapports",
                localField:"idDemande",
                foreignField:"idDemande",
                as :"reponse"
              }
            },
            {
              $lookup : {
                from :"conversations",
                localField:"_id",
                foreignField:"code",
                as :"messages"
              }
            },
          ]).then(response=>{
           
              done(response)
           
            
          })
        },
       
      ], function(result){
        if(result){
          return res.status(200).json(result)
        }else{
          return res.status(201).json("Code incorrect")
        }
      })
    } catch (error) {
      console.log(error)
    }
  },
  // searchPaquet : (req, res)=>{
  //   try {
  //     modelDemande
  //     .aggregate([{ $group: { _id: '$lot' } }]).then(response=>{
  //       if(response.length >0){
  //         return res.status(200).json(response)
  //       }
  //     }).catch(function(err){console.log(err)})
  //   } catch (error) {
      
  //   }
  // }
}
