const mongoose = require('mongoose')

const Validates = new mongoose.Schema(
  {
    message: { type: String, required: true },
    codeAgent: { type: String, required: true },
  },
  { timestamps: true },
)
const schema = new mongoose.Schema(
  {
    codeConge: { type: String, required: true },
    valideSuperviseur: { type: Validates, required: false },
    valideRH: { type: Validates, required: false },
    accorder : {type:Boolean, required:false}
    //Quand le congé sera fini l'option accorder changera à false
  },
  { timestamps: true },
)
schema.index({ codeConge: 1 })
schema.index({ valideSuperviseur: 1 })
schema.index({ valideRH: 1 })
const model = mongoose.model('ValidationConge', schema)
module.exports = model
