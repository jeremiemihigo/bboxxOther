const mongoose = require('mongoose')

const schemaFonction = new mongoose.Schema({
  fonction: { type: String, required: true },
  codeFonction: { type: String, unique:true, required: true },
})
const schema = new mongoose.Schema(
  {
    departement: { type: String, uppercase:true, required: true, trim: true },
    codeDepartement: { type: String, required: true },
    fonction: { type: [schemaFonction], required: false },
  },
  { timestamps: true },
)
schema.index({ codeDepartement: 1 })
const model = mongoose.model('departement', schema)
module.exports = model
