const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    id: { type: Date, required: true },
    shop: { type: String, required: true, trim:true, unique:true },
    adresse: { type: String, required: false, trim: true },
    idZone: { type: String, required: true },
    idShop : {type:String, required:true, unique:true},
    tickets : {type:Array, required:false}
  },
  { timestamps: true },
)
schema.index({ shop: 1 })
schema.index({ shopManager: 1 })

const model = mongoose.model('Shop', schema)
module.exports = model
