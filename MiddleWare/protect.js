const jwt = require('jsonwebtoken')
const Model_Agent = require('../Models/Agent')
const ModelAgentAdmin = require('../Models/AgentAdmin')
const asyncLab = require('async')

module.exports = {
  protect: async (req, res, next) => {
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(404).json('token expired')
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (!decoded?.id) {
        return res.status(404).json('token expired')
      }

      asyncLab.waterfall([
        function (done) {
          ModelAgentAdmin.findById(decoded.id)
            .then((user) => {
              if (user) {
                req.user = user
                next()
              } else {
                done(null, user)
              }
            })
            .catch(function (err) {
              console.log(err)
            })
        },
        function (user, done) {
          Model_Agent.findById(decoded.id)
            .then((response) => {
              if (response) {
                req.user = response
                next()
              } else {
                return res.status(404).json('token expired')
              }
            })
            .catch(function (err) {
              console.log(err)
            })
        },
      ])
    } catch (error) {
      return res.status(404).json('token expired')
    }
  },
}
