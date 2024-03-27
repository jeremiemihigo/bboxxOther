const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  idReponse: { type: mongoose.Types.ObjectId, required: true },
  action: { type: String, required: false },
  text : {type:String, required:false}
});
schema.index({ idReponse: 1 });
const model = mongoose.model("action", schema);
module.exports = model;
