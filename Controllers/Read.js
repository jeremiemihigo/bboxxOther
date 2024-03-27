const jwt = require('jsonwebtoken')
const ModelAgent = require('../Models/Agent')
const ModelAgentAdmin = require('../Models/AgentAdmin')
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

    ModelAgent.aggregate([
      { $match: { _id: new ObjectId(decoded.id) } },
      {
        $lookup: {
          from: 'zones',
          localField: 'codeZone',
          foreignField: 'idZone',
          as: 'region',
        },
      },
      {
        $lookup: {
          from: 'shops',
          localField: 'idShop',
          foreignField: 'idShop',
          as: 'shop',
        },
      },
      { $unwind: '$region' },
      { $unwind: '$shop' },
    ])
      .then((login) => {
        if (login) {
          return res.status(200).json(login[0])
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
      return res.status(404).json('token expired')
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded) {
      return res.status(404).json('token expired')
    }

    ModelAgentAdmin.findOne(
      { _id: new ObjectId(decoded.id), active: true },
      { password: 0 },
    )
      .then((response) => {
        if (response) {
          return res.status(200).json(response)
        } else {
          return res.status(404).json('token expired')
        }
      })
      .catch(function (err) {
        return res.status(404).json('token expired')
      })
  } catch (error) {}
}
