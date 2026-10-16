import Employee from '../models/Employee.js'
import Attendance from '../models/Attendance.js'
import Leave from '../models/Leave.js'
import Payroll from '../models/Payroll.js'
import Department from '../models/Department.js'
import { ApiError } from '../utils/ApiError.js'

const EDITABLE_FIELDS = ['name', 'email', 'role', 'phone', 'gender', 'address', 'department',
  'designation', 'dateOfJoining', 'salary', 'status']

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const pick = (body, fields) =>
  Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f] === '' ? undefined : body[f]]))

const sameDepartment = (a, b) => a?._id?.toString() === (b?._id ?? b)?.toString()

export const getEmployees = async (req, res) => {
  const { q, department, role, status } = req.query
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10))

  const filter = {}
  // Manager sirf apne department ke employees dekh sakta hai
  if (req.user.role === 'manager') filter.department = req.user.department?._id
  else if (department) filter.department = department
  if (role) filter.role = role
  if (status) filter.status = status
  if (q) {
    const regex = new RegExp(escapeRegex(q.trim()), 'i')
    filter.$or = [{ name: regex }, { email: regex }, { employeeId: regex }, { designation: regex }]
  }

  const [data, total] = await Promise.all([
    Employee.find(filter)
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Employee.countDocuments(filter),
  ])

  res.json({ data, page, limit, total, pages: Math.ceil(total / limit) || 1 })
}

export const getEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id).populate('department', 'name')
  if (!employee) throw new ApiError(404, 'Employee not found')

  const isSelf = employee._id.equals(req.user._id)
  const isManagerOfDept = req.user.role === 'manager' && sameDepartment(req.user.department, employee.department)
  if (req.user.role !== 'admin' && !isSelf && !isManagerOfDept) {
    throw new ApiError(403, 'You do not have permission to view this employee')
  }

  res.json(employee)
}

export const createEmployee = async (req, res) => {
  const data = pick(req.body, EDITABLE_FIELDS)
  if (!req.body.password) throw new ApiError(400, 'Password is required')
  if (data.department && !(await Department.exists({ _id: data.department }))) {
    throw new ApiError(400, 'Department not found')
  }

  const employee = await Employee.create({ ...data, password: req.body.password })
  await employee.populate('department', 'name')
  res.status(201).json(employee)
}

export const updateEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id)
  if (!employee) throw new ApiError(404, 'Employee not found')

  const data = pick(req.body, EDITABLE_FIELDS)
  if (employee._id.equals(req.user._id) && (data.role && data.role !== 'admin' || data.status === 'inactive')) {
    throw new ApiError(400, 'You cannot remove your own admin access')
  }
  if (data.department && !(await Department.exists({ _id: data.department }))) {
    throw new ApiError(400, 'Department not found')
  }

  employee.set(data)
  if (req.body.password) employee.password = req.body.password
  await employee.save()
  await employee.populate('department', 'name')
  res.json(employee)
}

export const deleteEmployee = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot delete your own account')
  }
  const employee = await Employee.findById(req.params.id)
  if (!employee) throw new ApiError(404, 'Employee not found')

  await Promise.all([
    Attendance.deleteMany({ employee: employee._id }),
    Leave.deleteMany({ employee: employee._id }),
    Payroll.deleteMany({ employee: employee._id }),
    Department.updateMany({ head: employee._id }, { $unset: { head: 1 } }),
  ])
  await employee.deleteOne()
  res.json({ message: 'Employee deleted' })
}

// Employee apni basic details khud update kar sakta hai
export const updateMe = async (req, res) => {
  const data = pick(req.body, ['phone', 'address', 'gender'])
  req.user.set(data)
  await req.user.save()
  res.json(req.user)
}
