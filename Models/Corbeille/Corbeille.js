const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  codeAgent : { type:String, required:true},
  doBy : {type:String, required:true},
  operation : {type:String, required:true}
})
const model = mongoose.model("Corbeille", schema)
module.exports = model