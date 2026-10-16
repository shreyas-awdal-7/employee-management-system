import Attendance from '../models/Attendance.js'
import Employee from '../models/Employee.js'
import Leave from '../models/Leave.js'
import { ApiError } from '../utils/ApiError.js'
import { currentMonthYear, dateKeyOf, monthRange, parseDateKey, toDateKey } from '../utils/dates.js'

const HALF_DAY_HOURS = 4

export const checkIn = async (req, res) => {
  const date = toDateKey()
  const existing = await Attendance.findOne({ employee: req.user._id, date })
  if (existing) throw new ApiError(400, 'You have already checked in today')

  const record = await Attendance.create({ employee: req.user._id, date, checkIn: new Date() })
  res.status(201).json(record)
}

export const checkOut = async (req, res) => {
  const record = await Attendance.findOne({ employee: req.user._id, date: toDateKey() })
  if (!record) throw new ApiError(400, 'Please check in first')
  if (record.checkOut) throw new ApiError(400, 'You have already checked out today')

  record.checkOut = new Date()
  record.workHours = Math.round(((record.checkOut - record.checkIn) / 36e5) * 100) / 100
  record.status = record.workHours < HALF_DAY_HOURS ? 'half-day' : 'present'
  await record.save()
  res.json(record)
}

export const getMyAttendance = async (req, res) => {
  const now = currentMonthYear()
  const month = Number(req.query.month) || now.month
  const year = Number(req.query.year) || now.year
  const { start, end } = monthRange(month, year)

  const [records, today] = await Promise.all([
    Attendance.find({
      employee: req.user._id,
      date: { $gte: dateKeyOf(start), $lte: dateKeyOf(end) },
    }).sort({ date: -1 }),
    Attendance.findOne({ employee: req.user._id, date: toDateKey() }),
  ])

  const summary = {
    present: records.filter((r) => r.status === 'present').length,
    halfDay: records.filter((r) => r.status === 'half-day').length,
    totalHours: Math.round(records.reduce((s, r) => s + (r.workHours || 0), 0) * 100) / 100,
  }

  res.json({ month, year, today, records, summary })
}

// Admin/Manager: ek din ki poori team ki attendance (present, half-day, on leave, absent)
export const getDailyAttendance = async (req, res) => {
  const date = req.query.date || toDateKey()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ApiError(400, 'Date must be YYYY-MM-DD')

  const employeeFilter = { status: 'active' }
  if (req.user.role === 'manager') employeeFilter.department = req.user.department?._id

  const employees = await Employee.find(employeeFilter).populate('department', 'name').sort({ name: 1 })
  const ids = employees.map((e) => e._id)
  const day = parseDateKey(date)

  const [records, leaves] = await Promise.all([
    Attendance.find({ employee: { $in: ids }, date }),
    Leave.find({ employee: { $in: ids }, status: 'approved', startDate: { $lte: day }, endDate: { $gte: day } }),
  ])
  const recordMap = new Map(records.map((r) => [r.employee.toString(), r]))
  const leaveMap = new Map(leaves.map((l) => [l.employee.toString(), l]))

  const rows = employees.map((emp) => {
    const record = recordMap.get(emp._id.toString())
    const leave = leaveMap.get(emp._id.toString())
    return {
      employee: { _id: emp._id, name: emp.name, employeeId: emp.employeeId, designation: emp.designation, department: emp.department },
      status: record ? record.status : leave ? 'on-leave' : 'absent',
      checkIn: record?.checkIn,
      checkOut: record?.checkOut,
      workHours: record?.workHours || 0,
      leaveType: leave?.leaveType,
    }
  })

  const summary = rows.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {})
  res.json({ date, rows, summary })
}
