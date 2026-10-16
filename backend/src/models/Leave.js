import mongoose from 'mongoose'

const leaveSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: {
      type: String,
      enum: ['casual', 'sick', 'earned', 'unpaid'],
      required: [true, 'Leave type is required'],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    reason: { type: String, required: [true, 'Reason is required'], trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    reviewComment: { type: String, trim: true },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
)

leaveSchema.index({ employee: 1, startDate: 1 })

export default mongoose.model('Leave', leaveSchema)
