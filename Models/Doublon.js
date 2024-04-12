const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    codeclient: { type: String, required: true },
    precedent: { type: String, required: false }, //visite
    present: { type: String, required: false }, //visite
    datePresent: { type: String, required: false },
  },
  { timestamps: true },
)

const model = mongoose.model('Doublon', schema)
module.exports = model
