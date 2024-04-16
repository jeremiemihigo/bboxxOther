const modelDemande = require('../Models/Demande')
const _ = require('lodash')
const asyncLab = require('async')
const modelPeriode = require("../Models/Periode")

module.exports = {
  demandePourChaquePeriode: (req, res) => {
    try {
      modelDemande
        .aggregate([
          {
            $lookup: {
              from: 'reponses',
              localField: 'idDemande',
              foreignField: 'idDemande',
              as: 'reponse',
            },
          },
          { $unwind: '$reponse' },
          {
            $group: {
              _id: '$lot',
              total: { $sum: 1 },
            },
          },
          {
            $sort : {_id : -1}
          }
        ])
        .then((result) => {
          return res.status(200).json(result.reverse())
        })
    } catch (error) {
      console.log(error)
    }
  },
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
        
        function (periode, done) {
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
              (x) => x.reponse.length < 1 && x.feedback === "new"
            ),
            nConforme : reponse.filter(
              (x) =>  x.reponse.length < 1 && x.feedback === "chat" ,
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
