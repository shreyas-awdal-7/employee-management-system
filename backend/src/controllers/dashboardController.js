import Employee from '../models/Employee.js'
import Department from '../models/Department.js'
import Attendance from '../models/Attendance.js'
import Leave from '../models/Leave.js'
import Payroll from '../models/Payroll.js'
import { getLeaveBalance } from './leaveController.js'
import { currentMonthYear, dateKeyOf, monthRange, parseDateKey, toDateKey } from '../utils/dates.js'

// Admin / Manager dashboard
export const getStats = async (req, res) => {
  const todayKey = toDateKey()
  const today = parseDateKey(todayKey)
  const { month, year } = currentMonthYear()

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - (6 - i))
    return dateKeyOf(d)
  })

  const [
    totalEmployees, activeEmployees, departments, presentToday, onLeaveToday,
    pendingLeaves, deptDistribution, attendanceTrend, recentLeaves, payrollThisMonth,
  ] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({ status: 'active' }),
    Department.countDocuments(),
    Attendance.countDocuments({ date: todayKey }),
    Leave.countDocuments({ status: 'approved', startDate: { $lte: today }, endDate: { $gte: today } }),
    Leave.countDocuments({ status: 'pending' }),
    Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $project: { _id: 0, name: { $ifNull: [{ $arrayElemAt: ['$dept.name', 0] }, 'Unassigned'] }, count: 1 } },
      { $sort: { count: -1 } },
    ]),
    Attendance.aggregate([
      { $match: { date: { $in: last7 } } },
      { $group: { _id: '$date', present: { $sum: 1 } } },
    ]),
    Leave.find().populate('employee', 'name employeeId').sort({ createdAt: -1 }).limit(5),
    Payroll.aggregate([
      { $match: { month, year } },
      { $group: { _id: null, total: { $sum: '$netSalary' }, count: { $sum: 1 } } },
    ]),
  ])

  const trendMap = Object.fromEntries(attendanceTrend.map((t) => [t._id, t.present]))

  res.json({
    totalEmployees,
    activeEmployees,
    departments,
    presentToday,
    onLeaveToday,
    absentToday: Math.max(0, activeEmployees - presentToday - onLeaveToday),
    pendingLeaves,
    payrollThisMonth: payrollThisMonth[0]?.total || 0,
    payrollCount: payrollThisMonth[0]?.count || 0,
    deptDistribution,
    attendanceTrend: last7.map((date) => ({ date, present: trendMap[date] || 0 })),
    recentLeaves,
  })
}

// Har employee ka personal dashboard
export const getMyStats = async (req, res) => {
  const { month, year } = currentMonthYear()
  const { start, end } = monthRange(month, year)

  const [today, presentThisMonth, balance, pendingLeaves, latestPayslip, upcomingLeave] = await Promise.all([
    Attendance.findOne({ employee: req.user._id, date: toDateKey() }),
    Attendance.countDocuments({ employee: req.user._id, date: { $gte: dateKeyOf(start), $lte: dateKeyOf(end) } }),
    getLeaveBalance(req.user._id, year),
    Leave.countDocuments({ employee: req.user._id, status: 'pending' }),
    Payroll.findOne({ employee: req.user._id }).sort({ year: -1, month: -1 }),
    Leave.findOne({ employee: req.user._id, status: 'approved', endDate: { $gte: parseDateKey(toDateKey()) } }).sort({ startDate: 1 }),
  ])

  res.json({ today, presentThisMonth, balance, pendingLeaves, latestPayslip, upcomingLeave })
}
