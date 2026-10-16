import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import authRoutes from './routes/authRoutes.js'
import employeeRoutes from './routes/employeeRoutes.js'
import departmentRoutes from './routes/departmentRoutes.js'
import attendanceRoutes from './routes/attendanceRoutes.js'
import leaveRoutes from './routes/leaveRoutes.js'
import payrollRoutes from './routes/payrollRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(helmet())
app.use(cors({ origin: allowedOrigins, credentials: true, exposedHeaders: ['Content-Disposition'] }))
app.use(express.json({ limit: '1mb' }))
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/leaves', leaveRoutes)
app.use('/api/payroll', payrollRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
