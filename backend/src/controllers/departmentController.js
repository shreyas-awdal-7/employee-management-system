import Department from '../models/Department.js'
import Employee from '../models/Employee.js'
import { ApiError } from '../utils/ApiError.js'

export const getDepartments = async (req, res) => {
  const [departments, counts] = await Promise.all([
    Department.find().populate('head', 'name employeeId designation').sort({ name: 1 }),
    Employee.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]),
  ])
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]))

  res.json(departments.map((d) => ({ ...d.toObject(), employeeCount: countMap[d._id.toString()] || 0 })))
}

export const createDepartment = async (req, res) => {
  const { name, description, head } = req.body
  const department = await Department.create({ name, description, head: head || undefined })
  res.status(201).json(department)
}

export const updateDepartment = async (req, res) => {
  const department = await Department.findById(req.params.id)
  if (!department) throw new ApiError(404, 'Department not found')

  const { name, description, head } = req.body
  if (name !== undefined) department.name = name
  if (description !== undefined) department.description = description
  if (head !== undefined) department.head = head || undefined
  await department.save()
  res.json(department)
}

export const deleteDepartment = async (req, res) => {
  const department = await Department.findById(req.params.id)
  if (!department) throw new ApiError(404, 'Department not found')

  const employeeCount = await Employee.countDocuments({ department: department._id })
  if (employeeCount > 0) {
    throw new ApiError(400, `Move or remove ${employeeCount} employee(s) before deleting this department`)
  }
  await department.deleteOne()
  res.json({ message: 'Department deleted' })
}
