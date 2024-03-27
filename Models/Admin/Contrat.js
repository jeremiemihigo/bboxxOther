const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    codeContrat: { type: String, unique:true, required: true },
    codeAgent : {type:String, required:true},
    debut: { type: Date, required: true },
    fin: { type: String, required: true },
    soldeConge: { type: Number, required: true, min: 1 },
    active : {type:Boolean, required:true, default:false}
  },
  { timestamps: true }
);
schema.index({codeContrat : 1})
const model = mongoose.model("Contrat", schema);
module.exports = model;
