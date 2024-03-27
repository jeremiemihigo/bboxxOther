const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, uppercase:true },
    codeAgent: { type: String, required: true, unique: true, trim: true, uppercase: true },
    codeZone: { type: String, required: true },
    fonction: {
      type: String,
      required: true,
      enum: ["tech", "agent"],
    },
    password: { type: String, required: true, default: 1234 },
    idShop: { type: String, required: true },
    telephone: { type: String, required: false },
    active: { type: Boolean, required: true, default: true },
    id: { type: String, required: true, unique:true },
    first : {type:Boolean, required:true, default : true}
  },
  { timestamps: true }
);
UserSchema.index({codeAgent : 1, password:1})
UserSchema.index({codeAgent : 1, active : 1})
UserSchema.index({codeAgent : 1, active :1, codeZone:1})

UserSchema.pre("insertMany", async function (next, docs) {
  if (Array.isArray(docs) && docs.length) {
      const hashedUsers = docs.map(async (user) => {
          return await new Promise((resolve, reject) => {
              bcrypt.genSalt(10).then((salt) => {
                  let password = user.password.toString()
                  bcrypt.hash(password, salt).then(hash => {
                      user.password = hash
                      resolve(user)
                  }).catch(e => {
                      reject(e)
                  })
              }).catch((e) => {
                  reject(e)
              })
          })
      })
      docs = await Promise.all(hashedUsers)
      next()
  } else {
      return next(new Error("User list should not be empty")) // lookup early return pattern
  }
})

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})


UserSchema.methods.matchPasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getSignedToken = function () {
  return jwt.sign(
    { id: this._id, fonction: this.fonction, codeAgent: this.codeAgent },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

const model = mongoose.model("Agent", UserSchema);
module.exports = model;
