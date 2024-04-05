const jwt = require('jsonwebtoken')
const Model_Agent = require('../Models/Agent')

module.exports = {
  protectTech: async (req, res, next) => {
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(201).json('token expired')
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (!decoded?.id) {
        return res.status(201).json('token expired')
      }
      Model_Agent.findById(decoded.id)
      .then((response) => {
        if (response) {
          req.user = response
          next()
        } else {
          return res.status(201).json('token expired')
        }
      })
      .catch(function (err) {
        console.log(err)
      })

    } catch (error) {
      return res.status(201).json('token expired')
    }
  },
}
