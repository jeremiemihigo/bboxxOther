const modelTypeConge = require("../../../Models/Admin/TypeConge ")
const asyncLab = require("async")
const { generateNumber } = require("../../../Static/Static_Function")

module.exports = {
 AddTypeConge : (req, res)=>{
  try {
    const {type} = req.body
    if(!type){
      return res.status(404).json("Veuillez renseigner au moins un type de congé")
    }
    asyncLab.waterfall([
      function(done){
        modelTypeConge.findOne({type : type.toUpperCase()}).then(response=>{
          if(response){
            return res.status(404).json(""+type+" existe deja")
          }else{
            done(null, false)
          }
        }).catch(function(err){
          return res.status(404).json("Erreur "+err)
        })
      },
      function(conge, done){
        modelTypeConge.create({
          type, codeType : generateNumber(2)
        }).then(result=>{
          if(result){
            
          }
        })
      }
    ])
  } catch (error) {
    console.log(error)
  }
 }
}