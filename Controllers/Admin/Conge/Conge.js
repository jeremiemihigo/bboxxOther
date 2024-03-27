const modelConge = require('../../../Models/Admin/Conge')
const modelContrat = require('../../../Models/Admin/Contrat')
const asyncLab = require('async')

const Difference = (debut, fin) => {
  return (new Date(fin).getTime() - new Date(debut).getTime()) / 86400000
}
module.exports = {
  AddConge: (req, res, next) => {
    try {
      const { codeContrat, codeInfo, typeConge, debut, fin } = req.body
      if (!codeContrat || !codeInfo || !typeConge || !debut || !fin) {
        return res.status(404).json('Veuillez renseigner les champs vides')
      }

      asyncLab.waterfall(
        [
          function (done) {
            modelContrat
              .findOne({
                codeContrat,
                active: true,
              })
              .then((contrat) => {
                if (contrat) {
                  done(null, contrat)
                } else {
                  return res.status(404).json('Contrat introuvable')
                }
              })
              .catch(function (err) {
                return res.status(404).json('Erreur ' + err)
              })
          },
          function(contrat, done){
            modelContrat.aggregate([
              {$match : {codeContrat }},
              {
                $lookup : {
                  from:"conges",
                  localField:"codeContrat",
                  foreignField:"codeContrat",
                  as :"conges"
                }
              },
              {
                $unwind:"$conges"
              },
              {
                $lookup : {
                  from:"validationConges",
                  localField:"conges.codeConge",
                  foreignField:"codeConge",
                  as :"validation"
                }
              },
              {
                $unwind:"$validation"
              },
              {
                $match : { "validation.accorder" : true}
              }
            ]).then(detection=>{
              if(detection){
                return res.status(201).json("Un autre congé est en cours")
              }else{
                done(null, contrat)
              }
            })
          },
          function (contrat, done) {
            modelConge
              .find({ codeContrat: contrat.codeContrat })
              .then((conge) => {
                if (conge.length > 0) {
                  let deja = 0
                  for (let i = 0; i < conge.length; i++) {
                    deja = deja + Difference(conge[i].debut, conge[i].fin)
                  }
                  if (
                    Difference(debut, fin) + parseInt(deja) >=
                    contrat.soldeConge
                  ) {
                    return res
                      .status(404)
                      .json(
                        'Vous pouvez vérifier si les jours que vous demander ne sont pas superieur au solde restant',
                      )
                  } else {
                    done(null, contrat, deja)
                  }
                } else {
                  done(null, contrat, 0)
                }
              })
              .catch(function (err) {
                return res.status(404).json('Erreur ' + err)
              })
          },
          function (contrat, deja) {
            if (parseInt(deja) === contrat.soldeConge) {
              return res
                .status(404)
                .json(
                  `"Vous avez epuisé vos ${contrat.soldeConge} jours de congé"`,
                )
            } else {
              done(null, contrat)
            }
          },
         
          function (contrat, done) {
            modelConge
              .create({
                codeContrat: contrat.codeContrat,
                codeInfo,
                typeConge,
                debut,
                fin,
              })
              .then((congeCreate) => {
                done(congeCreate)
              })
          },
        ],
        function (result) {
          if (result) {
            req.recherche = result.codeContrat
            next()
          } else {
            return res.status(404).json("Erreur d'enregistrement")
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  ReadConge: (req, res) => {
    try {
      let recherche = req.recherche
      let match = recherche
        ? { $match: { codeContrat: recherche } }
        : { $match: {} }
      modelConge
        .aggregate([
          match,
          {
            $lookup: {
              from: 'contrats',
              localField: 'codeContrat',
              foreignField: 'codeContrat',
              as: 'contrat',
            },
          },
          {
            $unwind: '$contrat',
          },
          {
            $lookup: {
              from: 'agentAdminInfos',
              localField: 'codeInfo',
              foreignField: 'codeInfo',
              as: 'infoAgent',
            },
          },
          {
            $unwind: '$infoAgent',
          },
          {
            $lookup: {
              from: 'agentAdminInfos',
              localField: 'typeConge',
              foreignField: 'codeType',
              as: 'type',
            },
          },
          {
            $unwind: '$type',
          },
        ])
        .then((result) => {
          if (result.length > 0) {
            let data = recherche ? result[0] : result
            return res.status(200).json(data)
          }
        })
    } catch (error) {
      return res.status(404).json('Erreur ' + error)
    }
  },
}
