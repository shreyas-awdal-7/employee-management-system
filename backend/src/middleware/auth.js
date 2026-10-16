import jwt from 'jsonwebtoken'
import Employee from '../models/Employee.js'
import { ApiError } from '../utils/ApiError.js'

export const protect = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized, please login')
  }

  let decoded
  try {
    decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
  } catch {
    throw new ApiError(401, 'Session expired, please login again')
  }

  const user = await Employee.findById(decoded.id).populate('department', 'name')
  if (!user || user.status !== 'active') {
    throw new ApiError(401, 'Account not found or inactive')
  }

  req.user = user
  next()
}

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action')
  }
  next()
}

export const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  })
