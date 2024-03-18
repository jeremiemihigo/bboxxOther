const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    id: { type: Date, required: true },
    shop: { type: String, required: true },
    adresse: { type: String, required: false },
    idZone: { type: String, required: true },
  },
  { timestamps: true },
)
schema.index({ shop: 1 })
schema.index({ shopManager: 1 })

const model = mongoose.model('Shop', schema)
module.exports = model
