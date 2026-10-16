import Leave from '../models/Leave.js'
import Employee from '../models/Employee.js'
import { ApiError } from '../utils/ApiError.js'
import { countWorkingDays, parseDateKey, toDateKey } from '../utils/dates.js'
import { LEAVE_QUOTA } from '../utils/payroll.js'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const getLeaveBalance = async (employeeId, year) => {
  const used = await Leave.aggregate([
    {
      $match: {
        employee: employeeId,
        status: { $in: ['approved', 'pending'] },
        startDate: { $gte: new Date(Date.UTC(year, 0, 1)), $lte: new Date(Date.UTC(year, 11, 31)) },
      },
    },
    { $group: { _id: { type: '$leaveType', status: '$status' }, days: { $sum: '$days' } } },
  ])

  return Object.fromEntries(
    Object.entries(LEAVE_QUOTA).map(([type, quota]) => {
      const approved = used.find((u) => u._id.type === type && u._id.status === 'approved')?.days || 0
      const pending = used.find((u) => u._id.type === type && u._id.status === 'pending')?.days || 0
      return [type, { quota, used: approved, pending, remaining: quota - approved - pending }]
    })
  )
}

export const applyLeave = async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body
  if (!leaveType || !startDate || !endDate || !reason?.trim()) {
    throw new ApiError(400, 'Leave type, dates and reason are required')
  }
  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) throw new ApiError(400, 'Dates must be YYYY-MM-DD')
  if (startDate > endDate) throw new ApiError(400, 'End date cannot be before start date')
  if (startDate < toDateKey()) throw new ApiError(400, 'Leave cannot start in the past')

  const start = parseDateKey(startDate)
  const end = parseDateKey(endDate)
  const days = countWorkingDays(start, end)
  if (days === 0) throw new ApiError(400, 'Selected dates fall on a weekend')

  const overlap = await Leave.exists({
    employee: req.user._id,
    status: { $in: ['pending', 'approved'] },
    startDate: { $lte: end },
    endDate: { $gte: start },
  })
  if (overlap) throw new ApiError(400, 'You already have a leave request for these dates')

  if (leaveType !== 'unpaid') {
    const balance = await getLeaveBalance(req.user._id, start.getUTCFullYear())
    if (!balance[leaveType]) throw new ApiError(400, 'Invalid leave type')
    if (balance[leaveType].remaining < days) {
      throw new ApiError(400, `Only ${balance[leaveType].remaining} ${leaveType} leave day(s) left`)
    }
  }

  const leave = await Leave.create({ employee: req.user._id, leaveType, startDate: start, endDate: end, days, reason })
  res.status(201).json(leave)
}

export const getMyLeaves = async (req, res) => {
  const year = Number(req.query.year) || Number(toDateKey().slice(0, 4))
  const [leaves, balance] = await Promise.all([
    Leave.find({ employee: req.user._id }).populate('reviewedBy', 'name').sort({ createdAt: -1 }),
    getLeaveBalance(req.user._id, year),
  ])
  res.json({ leaves, balance })
}

// Admin: sab requests. Manager: apne department ki (khud ki nahi).
export const getLeaves = async (req, res) => {
  const filter = {}
  if (req.query.status) filter.status = req.query.status

  if (req.user.role === 'manager') {
    const team = await Employee.find({ department: req.user.department?._id, _id: { $ne: req.user._id } }, '_id')
    filter.employee = { $in: team.map((e) => e._id) }
  }

  const leaves = await Leave.find(filter)
    .populate({ path: 'employee', select: 'name employeeId designation department', populate: { path: 'department', select: 'name' } })
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 })
  res.json(leaves)
}

export const reviewLeave = async (req, res) => {
  const { status, comment } = req.body
  if (!['approved', 'rejected'].includes(status)) throw new ApiError(400, 'Status must be approved or rejected')

  const leave = await Leave.findById(req.params.id).populate('employee', 'department')
  if (!leave) throw new ApiError(404, 'Leave request not found')
  if (leave.status !== 'pending') throw new ApiError(400, `Leave is already ${leave.status}`)
  if (leave.employee._id.equals(req.user._id)) throw new ApiError(403, 'You cannot review your own leave')

  if (req.user.role === 'manager' &&
    leave.employee.department?.toString() !== req.user.department?._id?.toString()) {
    throw new ApiError(403, 'You can only review leaves of your department')
  }

  leave.status = status
  leave.reviewComment = comment
  leave.reviewedBy = req.user._id
  leave.reviewedAt = new Date()
  await leave.save()
  res.json(leave)
}

export const cancelLeave = async (req, res) => {
  const leave = await Leave.findOne({ _id: req.params.id, employee: req.user._id })
  if (!leave) throw new ApiError(404, 'Leave request not found')
  if (leave.status !== 'pending') throw new ApiError(400, 'Only pending leaves can be cancelled')

  leave.status = 'cancelled'
  await leave.save()
  res.json(leave)
}
