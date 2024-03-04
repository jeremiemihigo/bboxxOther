const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  raison : {type:String, required:true},
  id : {type:Number, required:true},
  savedBy : {type:String, required:true}
}, {timestamps : true})

schema.index({raison : 1})
const model = mongoose.model("Raison", schema)
module.exports = model