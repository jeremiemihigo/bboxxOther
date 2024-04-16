const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const schema = new mongoose.Schema(
  {
    nom: { type: String, required: true, unique:true, trim:true },
    codeAgent: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, default: 1234 },
    active: { type: Boolean, required: true, default: true },
    id: { type: Date, required: true, unique:true },
    first : {type:Boolean, required:true, default : true},
    taches : {type:Array, required:false},
    departement : {type:String, required:true}
  },
  { timestamps: true }
);
schema.index({codeAgent : 1, active : 1})
schema.index({password : 1, codeAgent:1})

schema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

schema.methods.matchPasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

schema.methods.getSignedToken = function () {
  return jwt.sign(
    { id: this._id},
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

const model = mongoose.model("AgentAdmin", schema)
module.exports = model