import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: { type: String, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    designation: { type: String, trim: true },
    dateOfJoining: { type: Date, default: Date.now },
    salary: {
      type: Number,
      required: [true, 'Monthly salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
)

employeeSchema.index({ name: 'text', email: 'text', designation: 'text' })

// EMP0001, EMP0002 ...
employeeSchema.pre('save', async function () {
  if (this.isNew && !this.employeeId) {
    const last = await this.constructor.findOne({}, { employeeId: 1 }).sort({ employeeId: -1 })
    const next = last?.employeeId ? Number(last.employeeId.replace('EMP', '')) + 1 : 1
    this.employeeId = `EMP${String(next).padStart(4, '0')}`
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10)
  }
})

employeeSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

employeeSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Employee', employeeSchema)
