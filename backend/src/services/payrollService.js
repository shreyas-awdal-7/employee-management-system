import Employee from '../models/Employee.js'
import Attendance from '../models/Attendance.js'
import Leave from '../models/Leave.js'
import Payroll from '../models/Payroll.js'
import { countWorkingDays, dateKeyOf, monthRange } from '../utils/dates.js'
import { calculateSalary } from '../utils/payroll.js'

/**
 * Generates payroll for every active employee for the given month.
 * Already paid payslips are never touched; generated ones are only replaced when regenerate=true.
 */
export const generatePayroll = async (month, year, { regenerate = false } = {}) => {
  const { start, end } = monthRange(month, year)
  const workingDays = countWorkingDays(start, end)
  const employees = await Employee.find({ status: 'active', dateOfJoining: { $lte: end } })

  let created = 0
  let skipped = 0

  for (const emp of employees) {
    const existing = await Payroll.findOne({ employee: emp._id, month, year })
    if (existing && (!regenerate || existing.status === 'paid')) {
      skipped++
      continue
    }

    const unpaidLeaves = await Leave.find({
      employee: emp._id,
      leaveType: 'unpaid',
      status: 'approved',
      startDate: { $lte: end },
      endDate: { $gte: start },
    })
    const unpaidLeaveDays = unpaidLeaves.reduce((sum, leave) => {
      const from = leave.startDate > start ? leave.startDate : start
      const to = leave.endDate < end ? leave.endDate : end
      return sum + countWorkingDays(from, to)
    }, 0)

    const presentDays = await Attendance.countDocuments({
      employee: emp._id,
      date: { $gte: dateKeyOf(start), $lte: dateKeyOf(end) },
    })

    const salary = calculateSalary({ monthlySalary: emp.salary, workingDays, unpaidLeaveDays })

    await Payroll.findOneAndUpdate(
      { employee: emp._id, month, year },
      { workingDays, presentDays, unpaidLeaveDays, ...salary, status: 'generated' },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    )
    created++
  }

  return { created, skipped, workingDays, total: employees.length }
}
