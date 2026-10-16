import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD (India time)
    checkIn: { type: Date, required: true },
    checkOut: { type: Date },
    workHours: { type: Number, default: 0 },
    status: { type: String, enum: ['present', 'half-day'], default: 'present' },
  },
  { timestamps: true }
)

// One record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true })

export default mongoose.model('Attendance', attendanceSchema)
