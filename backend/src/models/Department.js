import mongoose from 'mongoose'

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Department name is required'], unique: true, trim: true },
    description: { type: String, trim: true },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
)

export default mongoose.model('Department', departmentSchema)
