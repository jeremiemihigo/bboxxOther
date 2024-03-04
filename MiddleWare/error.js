const ErrorResponse = require('./errorResponse')

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  if (err.code === 11000) {
    const message = 'Error'
    error = new ErrorResponse(message, 200)
  }
  

  return res.status(error.statusCode || 404).json(error.message || 'Server Error')
}

module.exports = errorHandler
