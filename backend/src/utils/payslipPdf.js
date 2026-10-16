import PDFDocument from 'pdfkit'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December']

const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const streamPayslip = (payroll, res) => {
  const emp = payroll.employee
  const period = `${MONTHS[payroll.month - 1]} ${payroll.year}`
  const fileName = `payslip-${emp.employeeId}-${payroll.year}-${String(payroll.month).padStart(2, '0')}.pdf`

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)

  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  doc.pipe(res)

  // Header band
  doc.rect(0, 0, doc.page.width, 110).fill('#4f46e5')
  doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('EMS Technologies Pvt. Ltd.', 50, 35)
  doc.fontSize(12).font('Helvetica').text(`Payslip for ${period}`, 50, 68)

  // Employee details
  doc.fillColor('#111827')
  const top = 140
  const details = [
    ['Employee Name', emp.name],
    ['Employee ID', emp.employeeId],
    ['Department', emp.department?.name || '-'],
    ['Designation', emp.designation || '-'],
  ]
  const attendance = [
    ['Working Days', payroll.workingDays],
    ['Days Present', payroll.presentDays],
    ['Unpaid Leave Days', payroll.unpaidLeaveDays],
    ['Status', payroll.status === 'paid' ? 'Paid' : 'Generated'],
  ]
  details.forEach(([label, value], i) => {
    doc.fontSize(10).fillColor('#6b7280').text(label, 50, top + i * 20)
    doc.fillColor('#111827').text(String(value), 160, top + i * 20)
  })
  attendance.forEach(([label, value], i) => {
    doc.fontSize(10).fillColor('#6b7280').text(label, 320, top + i * 20)
    doc.fillColor('#111827').text(String(value), 440, top + i * 20)
  })

  // Earnings / deductions table
  const tableTop = 240
  const earnings = [
    ['Basic Salary', payroll.earnings.basic],
    ['House Rent Allowance', payroll.earnings.hra],
    ['Other Allowances', payroll.earnings.allowances],
  ]
  const deductions = [
    ['Provident Fund', payroll.deductions.pf],
    ['Professional Tax', payroll.deductions.professionalTax],
    ['Income Tax (TDS)', payroll.deductions.incomeTax],
    ['Unpaid Leave', payroll.deductions.unpaidLeave],
  ]

  doc.rect(50, tableTop, 495, 24).fill('#eef2ff')
  doc.fillColor('#3730a3').font('Helvetica-Bold').fontSize(10)
  doc.text('Earnings', 60, tableTop + 7)
  doc.text('Amount', 200, tableTop + 7, { width: 80, align: 'right' })
  doc.text('Deductions', 310, tableTop + 7)
  doc.text('Amount', 455, tableTop + 7, { width: 80, align: 'right' })

  doc.font('Helvetica').fillColor('#111827')
  const rows = Math.max(earnings.length, deductions.length)
  for (let i = 0; i < rows; i++) {
    const y = tableTop + 34 + i * 22
    if (earnings[i]) {
      doc.text(earnings[i][0], 60, y)
      doc.text(money(earnings[i][1]), 170, y, { width: 110, align: 'right' })
    }
    if (deductions[i]) {
      doc.text(deductions[i][0], 310, y)
      doc.text(money(deductions[i][1]), 425, y, { width: 110, align: 'right' })
    }
  }

  const totalsY = tableTop + 34 + rows * 22 + 6
  doc.moveTo(50, totalsY).lineTo(545, totalsY).strokeColor('#e5e7eb').stroke()
  doc.font('Helvetica-Bold')
  doc.text('Gross Earnings', 60, totalsY + 10)
  doc.text(money(payroll.earnings.gross), 170, totalsY + 10, { width: 110, align: 'right' })
  doc.text('Total Deductions', 310, totalsY + 10)
  doc.text(money(payroll.deductions.total), 425, totalsY + 10, { width: 110, align: 'right' })

  // Net pay
  const netY = totalsY + 45
  doc.rect(50, netY, 495, 50).fill('#4f46e5')
  doc.fillColor('#ffffff').fontSize(14).text('Net Salary', 65, netY + 18)
  doc.text(money(payroll.netSalary), 330, netY + 18, { width: 200, align: 'right' })

  doc.fillColor('#9ca3af').font('Helvetica').fontSize(9)
    .text('This is a computer-generated payslip and does not require a signature.', 50, netY + 80, { align: 'center', width: 495 })

  doc.end()
}
