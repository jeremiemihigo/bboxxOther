const mongoose = require("mongoose");
const modelDemande = require("./Demande");

const schema = new mongoose.Schema(
  {
    codeclient: { type: String, required: true }, //BDRC
    codeCu: { type: String, required: true },
    clientStatut: { type: String, required: true },
    PayementStatut: { type: String, required: true },
    consExpDays: { type: Number, required: true },
    idDemande: { type: String, required: true, unique: true },
    dateSave: { type: Date, required: true },
    codeAgent: { type: String, required: true },
    nomClient: { type: String, required: true },
    action: { type: String, required: false },
    region: { type: String, required: true, default: "" },
    shop: { type: String, required: true, default: "" },
  },
  { timestamps: true }
);
schema.index({ codeclient : 1})
schema.index({ idDemande : 1})
schema.post("save", function (doc, next) {
  next();
  modelDemande
    .findOneAndUpdate({ idDemande: doc.idDemande }, { $set: { valide: true } })
    .then((response) => {})
    .catch(function (err) {});
});
const model = mongoose.model("Reponse", schema);
module.exports = model;
