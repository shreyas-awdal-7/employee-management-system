import Payroll from '../models/Payroll.js'
import { generatePayroll } from '../services/payrollService.js'
import { ApiError } from '../utils/ApiError.js'
import { currentMonthYear } from '../utils/dates.js'
import { streamPayslip } from '../utils/payslipPdf.js'

const employeePopulate = {
  path: 'employee',
  select: 'name employeeId designation department',
  populate: { path: 'department', select: 'name' },
}

export const runPayroll = async (req, res) => {
  const month = Number(req.body.month)
  const year = Number(req.body.year)
  if (!month || month < 1 || month > 12 || !year) throw new ApiError(400, 'Valid month and year are required')

  const now = currentMonthYear()
  if (year > now.year || (year === now.year && month > now.month)) {
    throw new ApiError(400, 'Cannot generate payroll for a future month')
  }

  const result = await generatePayroll(month, year, { regenerate: Boolean(req.body.regenerate) })
  res.json({ message: `Payroll generated for ${result.created} employee(s), ${result.skipped} skipped`, ...result })
}

export const getPayrolls = async (req, res) => {
  const now = currentMonthYear()
  const month = Number(req.query.month) || now.month
  const year = Number(req.query.year) || now.year

  const payrolls = await Payroll.find({ month, year }).populate(employeePopulate).sort({ createdAt: 1 })
  const summary = {
    count: payrolls.length,
    totalGross: payrolls.reduce((s, p) => s + p.earnings.gross, 0),
    totalDeductions: payrolls.reduce((s, p) => s + p.deductions.total, 0),
    totalNet: payrolls.reduce((s, p) => s + p.netSalary, 0),
    paid: payrolls.filter((p) => p.status === 'paid').length,
  }
  res.json({ month, year, payrolls, summary })
}

export const getMyPayslips = async (req, res) => {
  const payslips = await Payroll.find({ employee: req.user._id }).sort({ year: -1, month: -1 })
  res.json(payslips)
}

export const markPaid = async (req, res) => {
  const payroll = await Payroll.findById(req.params.id)
  if (!payroll) throw new ApiError(404, 'Payroll record not found')
  if (payroll.status === 'paid') throw new ApiError(400, 'Already marked as paid')

  payroll.status = 'paid'
  payroll.paidAt = new Date()
  await payroll.save()
  res.json(payroll)
}

export const downloadPayslip = async (req, res) => {
  const payroll = await Payroll.findById(req.params.id).populate(employeePopulate)
  if (!payroll) throw new ApiError(404, 'Payslip not found')

  const isOwner = payroll.employee._id.equals(req.user._id)
  if (req.user.role !== 'admin' && !isOwner) throw new ApiError(403, 'You cannot download this payslip')

  streamPayslip(payroll, res)
}
