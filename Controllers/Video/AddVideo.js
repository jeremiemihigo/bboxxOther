const { ObjectId } = require('mongodb')
const modelVideo = require('../../Models/Video/Video')
const asyncLab = require('async')

module.exports = {
  AddCategorie: (req, res) => {
    try {
      const { categorie, fin, createdBy } = req.body
      if (!categorie || !fin || !createdBy) {
        return res.status(404).json('Veuillez renseigner le titre')
      }
      asyncLab.waterfall(
        [
          function (done) {
            modelVideo
              .create({ categorie,createdBy, fin })
              .then((response) => {
                done(response)
              })
              .catch(function (err) {
                return res.status(404).json('Erreur ' + err)
              })
          },
        ],
        function (response) {
          if (response) {
            return res.status(200).json(response)
          } else {
            return res.status(404).json("Erreur d'enregistrement")
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  AddChild: (req, res) => {
    try {
      const { title, lien, _idCategorie, postBy } = req.body
      if (!title || !lien) {
        return res
          .status(404)
          .json('Veuillez renseigner le titre ainsi que le lien')
      }
      asyncLab.waterfall([
        function (done) {
          modelVideo
            .findOne({ 'child.lien': lien })
            .then((video) => {
              if (video) {
                return res.status(404).json('Le lien existe deja')
              } else {
                done(null, video)
              }
            })
            .catch(function (err) {
              console.log(err)
            })
        },
        function (result, done) {
          modelVideo.updateOne(
            {
              _id: new ObjectId(_idCategorie),
            },
            {
              $push: {
                child: {
                  title,
                  lien,
                  postBy,
                },
              },
            },
            {new : true}
          ).then(response=>{
            done(response)
          })
        },
      ], function(result){
        if(result){
          return res.status(200).json(result)
        }else{
          return res.status(404).json("Erreur")
        }
      })
    } catch (error) {
      console.log(error)
    }
  },
  DeleteChild : (req, res)=>{
    try {
      const { id, _idCategorie } = req.body
      if(!id || !_idCategorie){
        return res.status(404).json("Veuillez renseigner la video à supprimer")
      }
      modelVideo.findByIdAndUpdate(_idCategorie, {$pull:{
        child : {_id : new ObjectId(id)}
      }},{new : true}).then(deleted=>{
        
      })
    } catch (error) {
      
    }
  },
}
