const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    codeContrat: { type: String, required: true },
    codeInfo: { type: String, required: true },
    typeConge: { type: String, required: true },
    debut: { type: Date, required: true },
    fin: { type: Date, required: true },
    codeConge : {type:String, required:true, unique:true}
  },
  { timestamps: true },
)
schema.index({ codeContrat: 1 })
const model = mongoose.model('Conge', schema)
module.exports = model
