import mongoose from 'mongoose'

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    workingDays: { type: Number, required: true },
    presentDays: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    earnings: {
      basic: Number,
      hra: Number,
      allowances: Number,
      gross: Number,
    },
    deductions: {
      pf: Number,
      professionalTax: Number,
      incomeTax: Number,
      unpaidLeave: Number,
      total: Number,
    },
    netSalary: { type: Number, required: true },
    status: { type: String, enum: ['generated', 'paid'], default: 'generated' },
    paidAt: { type: Date },
  },
  { timestamps: true }
)

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true })

export default mongoose.model('Payroll', payrollSchema)
