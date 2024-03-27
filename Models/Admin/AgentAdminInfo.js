const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    codeInfo: { type: String, required: true },
    codeDepartement: { type: String, required: true },
    codeFonction: { type: String, required: true },
    superviseurDirect: { type: String, required: false },
    codeContrat: { type: String, required: true },
  },
  { timestamps: true },
)
schema.index({ codeContrat: 1 })
schema.index({ codeInfo: 1 })
schema.index({ codeAgent: 1 })
const model = mongoose.model('AgentAdminInfo', schema)
module.exports = model
