export const LEAVE_QUOTA = { casual: 12, sick: 10, earned: 15 }

const round = (n) => Math.round(n * 100) / 100

/**
 * Monthly salary breakup (India style, simplified):
 * Basic 50%, HRA 20%, Allowances 30% of gross.
 * Deductions: PF 12% of basic, professional tax Rs.200 (gross > 15k),
 * income tax 5% if annual gross > 7L, and pro-rata cut for unpaid leave days.
 */
export const calculateSalary = ({ monthlySalary, workingDays, unpaidLeaveDays = 0 }) => {
  const gross = round(monthlySalary)
  const basic = round(gross * 0.5)
  const hra = round(gross * 0.2)
  const allowances = round(gross - basic - hra)

  const pf = round(basic * 0.12)
  const professionalTax = gross > 15000 ? 200 : 0
  const incomeTax = gross * 12 > 700000 ? round(gross * 0.05) : 0
  const unpaidDays = Math.min(unpaidLeaveDays, workingDays)
  const unpaidLeave = workingDays > 0 ? round((gross / workingDays) * unpaidDays) : 0
  const total = round(pf + professionalTax + incomeTax + unpaidLeave)

  return {
    earnings: { basic, hra, allowances, gross },
    deductions: { pf, professionalTax, incomeTax, unpaidLeave, total },
    netSalary: Math.max(0, round(gross - total)),
  }
}
