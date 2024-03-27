const mongoose = require('mongoose')
const modelDemande = require('./Demande')

const conversatn = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    code: { type: mongoose.Types.ObjectId, required: true },
    message: { type: String, required: true, trim:true },
    valide: { type: Boolean, required: true, default: false },
    codeAgent: { type: String, required: true },
  },
  { timestamps: true },
)
conversatn.index({ codeAgent : 1})
conversatn.pre('save', async function (next) {
  if(this.sender === "co"){
    modelDemande
    .findByIdAndUpdate(this.code, { $set: { feedback: 'chat' } }, { new: true })
    .then((result) => {
      console.log(result)
    })
    .catch(function (err) {
      console.log(err)
    })
  }
 

  next()
})
const model = mongoose.model('Conversation', conversatn)
module.exports = model
