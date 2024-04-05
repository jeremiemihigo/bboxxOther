const mongoose = require('mongoose')

const children = new mongoose.Schema({
  title: { type: String, required: true },
  lien: { type: String, required: true },
  postBy: { type: String, required: true },
  aime: { type: Array, required: true, default: 0 },
  vues: { type: Array, required: true, default: 0 },
})
const schema = new mongoose.Schema({
  categorie: { type: String, required: true },
  fin: { type: Date, required: true },
  createdBy:{type:String, required:true},
  child: { type: [children], required: false },
})

const model = mongoose.model('Video', schema)
module.exports = model
