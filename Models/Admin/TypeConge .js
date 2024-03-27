const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    type: { type: String, uppercase:true, unique:true, required: true },
    codeType: { type: String, required: true },
  },
  { timestamps: true }
);
schema.index({type:1})
schema.index({codeType:1})
const model = mongoose.model("TypeConge", schema)
module.exports = model