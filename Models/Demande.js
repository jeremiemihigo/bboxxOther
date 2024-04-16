const mongoose = require('mongoose')

const coordonne = new mongoose.Schema({
  latitude: { type: String, required: false },
  longitude: { type: String, required: false },
  altitude: { type: String, required: false },
})
const double = new mongoose.Schema({
  codeAgent: { type: String, required: true },
  valeur: { type: String, required: true },
  _id : false
})

const schema = new mongoose.Schema(
  {
    valide: { type: Boolean, required: true, default: false },
    idDemande: { type: String, required: true, unique: true },
    commune: { type: String, required: true },
    numero: { type: String, required: false },
    idShop: { type: String, required: true },
    codeAgent: {
      type: String,
      required: [true, 'Le code agent est obligatoire'],
      ref: 'Agent',
    },
    codeZone: { type: String, required: true },
    typeImage: {
      type: String,
      default: 'photo',
      required: [true, "Veuillez renseigner le type d'image"],
    },
    coordonnes: { type: coordonne, required: false },
    statut: {
      type: String,
      required: [true, 'Le statut du client svp!'],
      enum: ['allumer', 'eteint'],
    },
    raison: { type: String, required: true },
    codeclient: { type: String, required: false },
    file: { type: String, required: [true, 'Envoies la capture svp !'] },
    sector: { type: String, required: true },
    cell: { type: String, required: true },
    reference: { type: String, required: true },
    sat: { type: String, required: true },
    lot: { type: String, required: true },
    feedback: {
      type: String,
      required: true,
      default: 'new',
      enum: ['new', 'chat'],
    },
    double: { type: double, required: false },
  },
  {
    timestamps: true,
  },
)
schema.index({ idDemande: 1 })
schema.index({ valide: 1 })
schema.index({ codeAgent: 1 })
const model = mongoose.model('Demande', schema)
module.exports = model
