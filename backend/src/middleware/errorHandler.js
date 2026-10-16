import { ApiError } from '../utils/ApiError.js'

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`))
}

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500
  let message = err.message || 'Something went wrong'
  let errors

  if (err.name === 'ValidationError') {
    status = 400
    message = 'Validation failed'
    errors = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]))
  } else if (err.name === 'CastError') {
    status = 400
    message = `Invalid ${err.path}`
  } else if (err.code === 11000) {
    status = 409
    const field = Object.keys(err.keyValue || {})[0] || 'Value'
    message = `${field} already exists`
  } else if (err.type === 'entity.parse.failed') {
    status = 400
    message = 'Invalid JSON body'
  }

  if (status === 500) {
    console.error(err)
    if (process.env.NODE_ENV === 'production') message = 'Something went wrong'
  }

  res.status(status).json({ message, errors })
}
