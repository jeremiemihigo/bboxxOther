const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    departement: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    idDepartement: { type: String, required: true, unique: true },
  },
  { timestamps: true },
)

schema.index({ idDepartement: 1 })
const model = mongoose.model('Departement', schema)
module.exports = model
