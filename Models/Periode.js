const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    periode: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);
const model = mongoose.model("periode", schema);
module.exports = model;