const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    idPlainte: { type: String, required: true, unique:true },
    savedBy: { type: String, required: true },
  },
  { timestamps: true },
)
schema.index({ idPlainte: 1 })
const model = mongoose.model('Plainte', schema)
module.exports = model
