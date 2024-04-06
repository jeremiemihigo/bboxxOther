const mongoose = require('mongoose')

const modelJoignable = new mongoose.Schema(
  {
    calledBy: { type: String, required: true },
    feedback: {
      type: String,
      required: true,
      enum: ['joignable', 'injoignable'],
    },
    commentaire : {type:String, required:false}
  },
  { timestamps: true },
)
const modelConfirmation = new mongoose.Schema(
  {
    calledBy: { type: String, required: true },
    feedback: {
      type: String,
      required: true,
      enum: ['attente', 'confirmer', 'nConfirmer'],
    },
    commentaire : {type:String, required:false}
  },
  { timestamps: true },
)

const schema = new mongoose.Schema({
  //Pour le shop manager
  id: { type: String, required: true },
  codeclient: { type: String, required: true },
  commentaire: { type: String, required: false },
  contact: { type: String, required: true },
  createdBy: { type: String, required: true },
  //Pour le call center
  joignabilite: {
    type: [modelJoignable],
    required: false,
  },
  confirmationPlainte: {
    type: [modelConfirmation],
    required: false,
  },
})
schema.index({ codeclient: 1 })
schema.index({ id: 1 })
const model = mongoose.model('DemandeCreationTicket', schema)
module.exports = model
