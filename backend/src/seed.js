// Demo data: npm run seed  (existing EMS data delete ho jayega)
import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import Employee from './models/Employee.js'
import Department from './models/Department.js'
import Attendance from './models/Attendance.js'
import Leave from './models/Leave.js'
import Payroll from './models/Payroll.js'
import { generatePayroll } from './services/payrollService.js'
import { currentMonthYear, dateKeyOf, isWeekend, parseDateKey, toDateKey } from './utils/dates.js'

const departmentsData = [
  { name: 'Engineering', description: 'Builds and maintains our products' },
  { name: 'Human Resources', description: 'Hiring, culture and employee welfare' },
  { name: 'Finance', description: 'Accounts, payroll and budgeting' },
  { name: 'Sales', description: 'Customer acquisition and partnerships' },
  { name: 'Marketing', description: 'Brand, content and campaigns' },
]

const employeesData = [
  { name: 'Shreyas Awdhal', email: 'admin@ems.com', password: 'admin123', role: 'admin', dept: 'Human Resources', designation: 'HR Director', salary: 150000, gender: 'male' },
  { name: 'Priya Sharma', email: 'manager@ems.com', password: 'manager123', role: 'manager', dept: 'Engineering', designation: 'Engineering Manager', salary: 180000, gender: 'female' },
  { name: 'Rahul Verma', email: 'employee@ems.com', password: 'employee123', role: 'employee', dept: 'Engineering', designation: 'Software Engineer', salary: 75000, gender: 'male' },
  { name: 'Amit Patel', email: 'amit.patel@ems.com', role: 'employee', dept: 'Engineering', designation: 'Senior Software Engineer', salary: 110000, gender: 'male' },
  { name: 'Sneha Kulkarni', email: 'sneha.k@ems.com', role: 'employee', dept: 'Engineering', designation: 'QA Engineer', salary: 60000, gender: 'female' },
  { name: 'Vikram Singh', email: 'vikram.singh@ems.com', role: 'manager', dept: 'Sales', designation: 'Sales Manager', salary: 120000, gender: 'male' },
  { name: 'Neha Gupta', email: 'neha.gupta@ems.com', role: 'employee', dept: 'Sales', designation: 'Sales Executive', salary: 45000, gender: 'female' },
  { name: 'Arjun Nair', email: 'arjun.nair@ems.com', role: 'employee', dept: 'Finance', designation: 'Accountant', salary: 55000, gender: 'male' },
  { name: 'Kavya Reddy', email: 'kavya.reddy@ems.com', role: 'employee', dept: 'Marketing', designation: 'Content Strategist', salary: 50000, gender: 'female' },
  { name: 'Rohan Joshi', email: 'rohan.joshi@ems.com', role: 'employee', dept: 'Marketing', designation: 'Digital Marketing Executive', salary: 40000, gender: 'male' },
  { name: 'Pooja Desai', email: 'pooja.desai@ems.com', role: 'employee', dept: 'Human Resources', designation: 'HR Executive', salary: 42000, gender: 'female' },
  { name: 'Karan Malhotra', email: 'karan.m@ems.com', role: 'employee', dept: 'Engineering', designation: 'DevOps Engineer', salary: 95000, gender: 'male' },
]

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// IST time on a given day -> UTC Date
const istTime = (dateKey, hour, minute) => {
  const d = parseDateKey(dateKey)
  d.setUTCHours(hour, minute)
  return new Date(d.getTime() - 330 * 60 * 1000)
}

const addDays = (dateKey, n) => {
  const d = parseDateKey(dateKey)
  d.setUTCDate(d.getUTCDate() + n)
  return d
}

const nextWeekday = (dateKey, offset) => {
  let d = addDays(dateKey, offset)
  while (isWeekend(d)) d.setUTCDate(d.getUTCDate() + 1)
  return d
}

const run = async () => {
  await connectDB()
  await Promise.all([Employee, Department, Attendance, Leave, Payroll].map((m) => m.deleteMany({})))
  console.log('Cleared old data')

  const departments = await Department.insertMany(departmentsData)
  const deptByName = Object.fromEntries(departments.map((d) => [d.name, d]))

  const today = toDateKey()
  const employees = []
  for (const [i, e] of employeesData.entries()) {
    const joined = addDays(today, -rand(120, 900))
    // create() one by one so pre-save hooks run (employeeId + password hash)
    employees.push(await Employee.create({
      name: e.name,
      email: e.email,
      password: e.password || 'employee123',
      role: e.role,
      department: deptByName[e.dept]._id,
      designation: e.designation,
      salary: e.salary,
      gender: e.gender,
      phone: `98${String(20000000 + i * 7654321).slice(0, 8)}`,
      address: ['Pune', 'Mumbai', 'Bangalore', 'Hyderabad'][i % 4] + ', India',
      dateOfJoining: joined,
    }))
  }
  console.log(`Created ${employees.length} employees`)

  // Department heads
  const heads = { Engineering: 'manager@ems.com', 'Human Resources': 'admin@ems.com', Sales: 'vikram.singh@ems.com' }
  for (const [deptName, email] of Object.entries(heads)) {
    await Department.updateOne({ _id: deptByName[deptName]._id }, { head: employees.find((e) => e.email === email)._id })
  }

  const byEmail = (email) => employees.find((e) => e.email === email)
  const rahul = byEmail('employee@ems.com')
  const sneha = byEmail('sneha.k@ems.com')
  const amit = byEmail('amit.patel@ems.com')
  const neha = byEmail('neha.gupta@ems.com')
  const kavya = byEmail('kavya.reddy@ems.com')

  // Leaves
  const leaves = [
    { employee: rahul._id, leaveType: 'sick', start: -20, days: 1, reason: 'Fever and doctor visit', status: 'approved' },
    { employee: rahul._id, leaveType: 'casual', start: 9, days: 2, reason: 'Family function in hometown', status: 'pending' },
    { employee: sneha._id, leaveType: 'casual', start: 0, days: 1, reason: 'Personal work', status: 'approved' },
    { employee: amit._id, leaveType: 'earned', start: 14, days: 3, reason: 'Vacation with family', status: 'pending' },
    { employee: neha._id, leaveType: 'unpaid', start: -35, days: 2, reason: 'Extended personal travel', status: 'approved' },
    { employee: kavya._id, leaveType: 'sick', start: 3, days: 1, reason: 'Dental appointment', status: 'pending' },
  ]
  const manager = byEmail('manager@ems.com')
  for (const l of leaves) {
    const start = l.start === 0 ? parseDateKey(today) : nextWeekday(today, l.start)
    let end = new Date(start)
    let counted = 1
    while (counted < l.days) {
      end.setUTCDate(end.getUTCDate() + 1)
      if (!isWeekend(end)) counted++
    }
    await Leave.create({
      employee: l.employee, leaveType: l.leaveType, startDate: start, endDate: end, days: l.days,
      reason: l.reason, status: l.status,
      ...(l.status === 'approved' && { reviewedBy: manager._id, reviewedAt: new Date(), reviewComment: 'Approved' }),
    })
  }
  console.log(`Created ${leaves.length} leave requests`)

  // Attendance: last ~45 days, ~90% presence. Today: most people, but not Rahul (so demo can check in).
  const onLeaveToday = new Set([sneha._id.toString()])
  const records = []
  for (let offset = -45; offset <= 0; offset++) {
    const day = addDays(today, offset)
    if (isWeekend(day)) continue
    const key = dateKeyOf(day)
    for (const emp of employees) {
      if (offset === 0 && (emp._id.equals(rahul._id) || onLeaveToday.has(emp._id.toString()) || Math.random() < 0.25)) continue
      if (offset < 0 && Math.random() < 0.08) continue

      const checkIn = istTime(key, 9, rand(0, 45))
      const halfDay = Math.random() < 0.05
      const checkOut = offset === 0 ? undefined : istTime(key, halfDay ? 13 : rand(17, 19), rand(0, 59))
      const workHours = checkOut ? Math.round(((checkOut - checkIn) / 36e5) * 100) / 100 : 0
      records.push({
        employee: emp._id, date: key, checkIn, checkOut, workHours,
        status: checkOut && workHours < 4 ? 'half-day' : 'present',
      })
    }
  }
  await Attendance.insertMany(records)
  console.log(`Created ${records.length} attendance records`)

  // Payroll for last 2 months; older one marked paid
  const { month, year } = currentMonthYear()
  const prev = (m, y, n) => {
    const d = new Date(Date.UTC(y, m - 1 - n, 1))
    return { month: d.getUTCMonth() + 1, year: d.getUTCFullYear() }
  }
  const twoAgo = prev(month, year, 2)
  const oneAgo = prev(month, year, 1)
  await generatePayroll(twoAgo.month, twoAgo.year)
  await Payroll.updateMany({ month: twoAgo.month, year: twoAgo.year }, { status: 'paid', paidAt: new Date() })
  await generatePayroll(oneAgo.month, oneAgo.year)
  console.log('Generated payroll for last 2 months')

  console.log('\nDemo logins:')
  console.log('  Admin    -> admin@ems.com / admin123')
  console.log('  Manager  -> manager@ems.com / manager123')
  console.log('  Employee -> employee@ems.com / employee123')

  await mongoose.disconnect()
}

run().catch(async (err) => {
  console.error(err)
  await mongoose.disconnect()
  process.exit(1)
})
