const modelDemande = require('../Models/Demande')
const _ = require('lodash')
const asyncLab = require('async')
const { ObjectId } = require('mongodb')
const modelPeriode = require("../Models/Periode")
const modelConversation = require("../Models/Reclamation")

module.exports = {
  readPeriodeGroup: (req, res) => {
    try {
      const { codeAgent } = req.user
      asyncLab.waterfall([
        function (done) {
          modelPeriode.findOne({}).then(periode=>{
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
                  lot: {
                    $in: lot,
                  },
                },
              },
              {
                $lookup: {
                  from: 'reponses',
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
              done(null, periode, lot, response)
            })
        },
        function (periode, lot, reponse, done) {
          let table = []
          for (let i = 0; i < lot.length; i++) {
            if(lot[i] === periode.periode){
              table.push({
                _id: lot[i],
                active : lot[i] === periode.periode ? true : false,
                attente : reponse.filter(
                  (x) => x.lot === lot[i] && x.reponse.length < 1 && x.conversation.length < 1,
                ),
  
                nConforme : reponse.filter(
                  (x) => x.lot === lot[i] && x.reponse.length === 0 && x.conversation.length > 0 ,
                ),
                valide :reponse.filter(
                  (x) => x.lot === lot[i] && x.reponse.length > 0,
                ),
                allData :reponse.filter(
                  (x) => x.lot === lot[i]
                ),
                
              })
            }
            
          }
          res.status(200).json(table)
        },
      ])
    } catch (error) {
      console.log(error)
    }
  },
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
  chercherUneDemande : (req, res)=>{
    try {
      const { id } =req.params
      if(!id){
        return res.status(201).json("Le code de la visite est obligatoire")
      }
      asyncLab.waterfall([
        function(done){
          modelDemande.findOne({idDemande : id}).then(demande=>{
            if(demande){
              done(null, demande)
            }else{
              return res.status(201).json("Code incorrect")
            }
          }).catch(function(err){console.log(err)})
        },
        function(demande, done){
          modelDemande.aggregate([
            {$match : { _id : new ObjectId(demande._id)}},
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
                from :"reponses",
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
            if(response.length > 0 && response[0].reponse.length > 0){
              done(null, response)
            }else{
              done({demande : response, reponse : []})
            }
            
          })
        },
        function(demande, done){
          modelConversation.find({ code : new ObjectId(demande[0].reponse[0]._id)}).then(result=>{
            if(result.length > 0){
              done({demande, reponse : result})
            }else{
              done({demande, reponse : []})
            }
          })
        }
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
  searchPaquet : (req, res)=>{
    try {
      modelDemande
      .aggregate([{ $group: { _id: '$lot' } }]).then(response=>{
        if(response.length >0){
          return res.status(200).json(response)
        }
      }).catch(function(err){console.log(err)})
    } catch (error) {
      
    }
  }
}
