const jwt = require('jsonwebtoken')
const ModelAgent = require('../Models/Agent')
const ModelAgentAdmin = require("../Models/AgentAdmin")
const { ObjectId } = require('mongodb')


exports.ReadUser = async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (!token) {
    return res.status(404).json('jwt expired')
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    ModelAgent.findById(decoded.id, {password:0})
    .then((login) => {
     if(login){
      return res.status(200).json(login)
     }
    })
    .catch(function (error) {
      console.log(error)
    })
  } catch (error) {
    return res.status(400).json(error.message)
  }
}
exports.readUserAdmin = (req, res) => {
  try {
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (token === 'null') {
      return res.status(404).json('jwt expired')
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
  

    ModelAgentAdmin.findOne(
      { _id: new ObjectId(decoded.id), active: true },
      { password: 0 },
    )
      .then((response) => {
        console.log(response)
        if (response) {
          return res.status(200).json(response)
        } else {
          return res.status(404).json('jwt expired')
        }
      })
      .catch(function (err) {
        console.log(err)
      })
  } catch (error) {}
}
