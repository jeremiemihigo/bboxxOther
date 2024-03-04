const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  codeAgent : { type:String, required:true},
  doBy : {type:String, required:true},
  operation : {type:String, required:true, enum : ["ajouter","modifier"]}
})
const model = mongoose.model("RegionCorbeille", schema)
module.exports = model