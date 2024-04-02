const { ObjectId } = require('mongodb')
const ModelAgent = require('../Models/Agent')
const jwt = require('jsonwebtoken')
const asyncLab = require('async')
const bcrypt = require('bcrypt')
const ModelAgentAdmin = require("../Models/AgentAdmin")

exports.login = async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(201).json('Veuillez renseigner les champs')
  }
  try {
    //const user = await Model_User.aggregate([ look])
    const user = await ModelAgent.findOne({
      codeAgent: username.toUpperCase(),
      active: true,
    }).select('+password')

    if (!user) {
      return res.status(201).json('Accès non autorisée')
    }

    const isMatch = await user.matchPasswords(password)

    if (!isMatch) {
      return res.status(201).json('Accès non autorisée')
    }
    sendToken(user, 200, res)
  } catch (error) {
    res.status(404).json({ success: false, error: error.message })
  }
}

exports.resetPassword = (req, res, next) => {
  try {
    const { id } = req.body
    asyncLab.waterfall(
      [
        function (done) {
          ModelAgent.findById(id).then((response) => {
            if (response) {
              done(null, response)
            } else {
              return res.status(201).json('Agent introuvable')
            }
          })
        },

        function (agent, done) {
          bcrypt.hash('1234', 10, function (err, bcrypePassword) {
            ModelAgent.findOneAndUpdate(
              { codeAgent: agent.codeAgent },
              { $set: { password: bcrypePassword, first: true } },
              { new: true },
            )
              .then((response) => {
                done(response)
              })
              .catch(function (err) {
                console.log(err)
              })
          })
        },
      ],
      function (response) {
        if (response) {
          req.recherche = id
          next()
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}
exports.UpdatePassword = async (req, res) => {
  try {
    const { codeAgent, ancien, nouvelle } = req.body
    if (!codeAgent || !ancien || !nouvelle) {
      return res.status(201).json('Veuillez renseigner les champs')
    }

    const user = await ModelAgent.findOne({
      codeAgent: codeAgent,
      active: true,
    }).select('+password')

    if (!user) {
      return res.status(201).json('Accès non autorisée')
    }

    const isMatch = await user.matchPasswords(ancien)

    asyncLab.waterfall(
      [
        function (done) {
          if (isMatch) {
            bcrypt.hash(nouvelle, 10, function (err, bcrypePassword) {
              ModelAgent.findOneAndUpdate(
                { codeAgent },
                { $set: { password: bcrypePassword, first: false } },
                { new: true },
              )
                .then((response) => {
                  done(response)
                })
                .catch(function (err) {
                  console.log(err)
                })
            })
          } else {
            return res.status(201).json('Identification incorrect')
          }
        },
      ],
      function (response) {
        if (response._id) {
          return res.status(200).json(nouvelle)
        } else {
          return res.satus(201).json(response)
        }
      },
    )
  } catch (error) {
    return res.status(201).json('Identification incorrect')
  }
},
exports.UpdatePasswordAdmin = async (req, res) => {
  try {
    const { codeAgent, ancien, nouvelle } = req.body
    if (!codeAgent || !ancien || !nouvelle) {
      return res.status(201).json('Veuillez renseigner les champs')
    }

    const user = await ModelAgentAdmin.findOne({
      codeAgent: codeAgent,
      active: true,
    }).select('+password')

    if (!user) {
      return res.status(201).json('Accès non autorisée')
    }

    const isMatch = await user.matchPasswords(ancien)

    asyncLab.waterfall(
      [
        function (done) {
          if (isMatch) {
            bcrypt.hash(nouvelle, 10, function (err, bcrypePassword) {
              ModelAgentAdmin.findOneAndUpdate(
                { codeAgent },
                { $set: { password: bcrypePassword, first: false } },
                { new: true },
              )
                .then((response) => {
                  done(response)
                })
                .catch(function (err) {
                  console.log(err)
                })
            })
          } else {
            return res.status(201).json('Identification incorrect')
          }
        },
      ],
      function (response) {
        if (response._id) {
          return res.status(200).json(nouvelle)
        } else {
          return res.satus(201).json(response)
        }
      },
    )
  } catch (error) {
    return res.status(201).json('Identification incorrect')
  }
},

exports.LoginAgentAdmin = async (req, res)=>{
  const { username, password } = req.body
  
  if (!username || !password) {
    return res.status(201).json('Veuillez renseigner les champs')
  }
  try {
    //const user = await Model_User.aggregate([ look])
    const user = await ModelAgentAdmin.findOne({
      codeAgent: username,
      active: true,
    }).select('+password')


    if (!user) {
      return res.status(201).json('Accès non autorisée')
    }

    const isMatch = await user.matchPasswords(password)

    if (!isMatch) {
      return res.status(201).json('Accès non autorisée')
    }
    const token = user.getSignedToken()
    return res.status(200).json({token})
  } catch (error) {
    res.status(404).json({ success: false, error: error.message })
  }
}
const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken()
  return res.status(statusCode).json({
    token,
    codeAgent: user.codeAgent,
    codeZone: user.codeZone,
    nom: user.nom,
    first: user.first,
    shop : user.idShop
  })
}
