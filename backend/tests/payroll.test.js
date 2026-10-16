import { calculateSalary } from '../src/utils/payroll.js'

describe('calculateSalary', () => {
  test('splits gross into basic, HRA and allowances', () => {
    const { earnings } = calculateSalary({ monthlySalary: 100000, workingDays: 22 })
    expect(earnings).toEqual({ basic: 50000, hra: 20000, allowances: 30000, gross: 100000 })
  })

  test('applies PF, professional tax and income tax', () => {
    const { deductions, netSalary } = calculateSalary({ monthlySalary: 100000, workingDays: 22 })
    expect(deductions.pf).toBe(6000)
    expect(deductions.professionalTax).toBe(200)
    expect(deductions.incomeTax).toBe(5000) // annual 12L > 7L
    expect(deductions.unpaidLeave).toBe(0)
    expect(netSalary).toBe(100000 - 6000 - 200 - 5000)
  })

  test('no income tax and no professional tax for low salary', () => {
    const { deductions } = calculateSalary({ monthlySalary: 15000, workingDays: 22 })
    expect(deductions.incomeTax).toBe(0)
    expect(deductions.professionalTax).toBe(0)
  })

  test('deducts pro-rata salary for unpaid leave days', () => {
    const { deductions } = calculateSalary({ monthlySalary: 44000, workingDays: 22, unpaidLeaveDays: 2 })
    expect(deductions.unpaidLeave).toBe(4000)
  })

  test('net salary never goes negative', () => {
    const { netSalary } = calculateSalary({ monthlySalary: 30000, workingDays: 20, unpaidLeaveDays: 25 })
    expect(netSalary).toBe(0)
  })
})
