const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, uppercase: true },
  id: { type: String, required: true, unique: true },
  departement: { type: String, required: true },
})
schema.index({ id: 1 })
schema.index({ departement: 1 })

const model = mongoose.model('Permission', schema)
module.exports = model
