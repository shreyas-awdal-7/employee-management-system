import Employee from '../models/Employee.js'
import { signToken } from '../middleware/auth.js'
import { ApiError } from '../utils/ApiError.js'

export const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) throw new ApiError(400, 'Email and password are required')

  const user = await Employee.findOne({ email: email.toLowerCase().trim() })
    .select('+password')
    .populate('department', 'name')

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password')
  }
  if (user.status !== 'active') throw new ApiError(403, 'Your account is inactive. Contact HR.')

  res.json({ token: signToken(user), user })
}

export const getMe = async (req, res) => {
  res.json(req.user)
}

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) throw new ApiError(400, 'Both passwords are required')
  if (newPassword.length < 6) throw new ApiError(400, 'New password must be at least 6 characters')

  const user = await Employee.findById(req.user._id).select('+password')
  if (!(await user.matchPassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect')
  }

  user.password = newPassword
  await user.save()
  res.json({ message: 'Password updated successfully' })
}
