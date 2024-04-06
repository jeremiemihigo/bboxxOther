const mongoose = require('mongoose')

const valida = new mongoose.Schema(
  {
    callBy: { type: String, required: true },
    feedback: {
      type: String,
      required: true,
      enum: [
        'resolved awaiting confirmation',
        'resolved',
        'injoignable',
        'not resolved',
      ],
    },
    commentaire: { type: String, required: true },
  },
  { timestamps: true },
)

const schema = new mongoose.Schema(
  {
    idTicket: { type: String, required: true },
    codeTech: { type: String, required: true },
    actionSynchro: { type: String, required: true },
    validation: {
      type: [valida],
      required: true,
    },
  },
  { timestamps: true },
)
const model = mongoose.model('Action', schema)
module.exports = model
