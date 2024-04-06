const mongoose = require('mongoose')

const modelStatut = new mongoose.Schema(
  {
    statut: {
      type: String,
      required: true,
      default: 'open technician visit',
      enum: ['resolved', 'open technician visit', 'not resolved'],
    },
    commentaire: { type: String, required: false },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
)

const schema = new mongoose.Schema(
  {
    idTicket: { type: String, required: true },
    idTypeDemandeTicket: { type: String, required: false },
    // Si le ticket a été crée au call center cette propriete sera "call center" sinon 
    //cette propriété prendra l'id DemandeCreation
    statut: {
      type: [modelStatut],
      required: true,
    },
    idPlainte: { type: String, required: true },
    createdBy: { type: String, required: true },
    delai: {
      type: String,
      required: true,
      default: 'delai',
      enum: ['hors delai', 'delai'],
    },
  },
  { timestamps: true },
)
schema.index({ idTypeDemandeTicket: 1 })
schema.index({ idPlainte: 1 })
schema.index({ delai: 1 })
schema.index({ idTicket: 1 })
const model = mongoose.model('Ticket', schema)
module.exports = model
