import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  Building2, CalendarClock, CalendarDays, CalendarX, Clock, LogIn, LogOut, UserCheck, Users, Wallet,
} from 'lucide-react'
import api, { getErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Avatar, Badge, Loader, PageHeader, StatCard } from '../components/ui'
import { formatCurrency, formatDay, formatTime, MONTHS } from '../utils/format'

const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6']

function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/dashboard/stats').then((r) => setStats(r.data)).catch((e) => toast.error(getErrorMessage(e)))
  }, [])

  if (!stats) return <Loader />

  const trend = stats.attendanceTrend.map((t) => ({
    ...t,
    day: new Date(`${t.date}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' }),
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Employees" value={stats.totalEmployees} hint={`${stats.activeEmployees} active`} />
        <StatCard icon={UserCheck} label="Present Today" value={stats.presentToday} hint={`${stats.absentToday} not checked in`} color="emerald" />
        <StatCard icon={CalendarX} label="On Leave Today" value={stats.onLeaveToday} hint={`${stats.pendingLeaves} pending requests`} color="amber" />
        <StatCard icon={Wallet} label="Payroll This Month" value={formatCurrency(stats.payrollThisMonth)} hint={`${stats.payrollCount} payslips · ${stats.departments} departments`} color="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold">Attendance – last 7 days</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: '#eef2ff' }} />
                <Bar dataKey="present" name="Present" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold">Employees by department</h3>
          <div className="mt-2 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.deptDistribution} dataKey="count" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {stats.deptDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {stats.deptDistribution.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {d.name}
                </span>
                <span className="font-medium">{d.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-semibold">Recent leave requests</h3>
          <Link to="/leaves" className="text-sm font-medium text-indigo-600 hover:underline">View all</Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {stats.recentLeaves.map((l) => (
            <li key={l._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-3">
                <Avatar name={l.employee?.name} />
                <div>
                  <p className="text-sm font-medium">{l.employee?.name}</p>
                  <p className="text-xs text-slate-500">
                    {l.leaveType} leave · {formatDay(l.startDate)} – {formatDay(l.endDate)} · {l.days} day(s)
                  </p>
                </div>
              </div>
              <Badge value={l.status} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function EmployeeDashboard() {
  const [stats, setStats] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => api.get('/dashboard/me').then((r) => setStats(r.data)).catch((e) => toast.error(getErrorMessage(e)))

  useEffect(() => {
    load()
  }, [])

  const punch = async (type) => {
    setBusy(true)
    try {
      await api.post(`/attendance/${type}`)
      toast.success(type === 'check-in' ? 'Checked in. Have a great day!' : 'Checked out. See you tomorrow!')
      load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  if (!stats) return <Loader />

  const { today, balance, latestPayslip, upcomingLeave } = stats
  const leaveLeft = Object.values(balance).reduce((s, b) => s + b.remaining, 0)

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
        <div>
          <p className="text-sm text-indigo-100">Today's attendance</p>
          <p className="mt-1 text-xl font-semibold">
            {!today ? 'You have not checked in yet' : today.checkOut ? `Done for today · ${today.workHours} hrs` : `Checked in at ${formatTime(today.checkIn)}`}
          </p>
          {today && (
            <p className="mt-1 text-sm text-indigo-100">
              In: {formatTime(today.checkIn)} · Out: {formatTime(today.checkOut)}
            </p>
          )}
        </div>
        {!today ? (
          <button disabled={busy} onClick={() => punch('check-in')} className="btn bg-white text-indigo-700 hover:bg-indigo-50">
            <LogIn size={18} /> Check in
          </button>
        ) : !today.checkOut ? (
          <button disabled={busy} onClick={() => punch('check-out')} className="btn bg-white text-indigo-700 hover:bg-indigo-50">
            <LogOut size={18} /> Check out
          </button>
        ) : (
          <Badge value={today.status} />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock} label="Days present (this month)" value={stats.presentThisMonth} color="emerald" />
        <StatCard icon={CalendarDays} label="Leave balance" value={`${leaveLeft} days`} hint={`${stats.pendingLeaves} pending request(s)`} color="amber" />
        <StatCard
          icon={Wallet} label="Last net salary" color="violet"
          value={latestPayslip ? formatCurrency(latestPayslip.netSalary) : '—'}
          hint={latestPayslip ? `${MONTHS[latestPayslip.month - 1]} ${latestPayslip.year}` : 'No payslip yet'}
        />
        <StatCard
          icon={CalendarClock} label="Upcoming leave" color="sky"
          value={upcomingLeave ? formatDay(upcomingLeave.startDate) : 'None'}
          hint={upcomingLeave ? `${upcomingLeave.leaveType} · ${upcomingLeave.days} day(s)` : 'Plan a break!'}
        />
      </div>

      <div className="card p-5">
        <h3 className="font-semibold">Leave balance ({new Date().getFullYear()})</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {Object.entries(balance).map(([type, b]) => (
            <div key={type}>
              <div className="flex justify-between text-sm">
                <span className="font-medium capitalize">{type}</span>
                <span className="text-slate-500">{b.remaining} / {b.quota} left</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(b.remaining / b.quota) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/leaves" className="card flex items-center gap-3 p-5 hover:border-indigo-300"><CalendarDays className="text-indigo-600" /> Apply for leave</Link>
        <Link to="/attendance" className="card flex items-center gap-3 p-5 hover:border-indigo-300"><Clock className="text-indigo-600" /> View attendance</Link>
        <Link to="/payroll" className="card flex items-center gap-3 p-5 hover:border-indigo-300"><Building2 className="text-indigo-600" /> Download payslips</Link>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user.name.split(' ')[0]} 👋`}
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      />
      {user.role === 'employee' ? <EmployeeDashboard /> : <AdminDashboard />}
    </>
  )
}
