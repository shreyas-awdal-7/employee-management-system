import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarCheck, ShieldCheck, Users, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'

const DEMO = [
  { role: 'Admin', email: 'admin@ems.com', password: 'admin123' },
  { role: 'Manager', email: 'manager@ems.com', password: 'manager123' },
  { role: 'Employee', email: 'employee@ems.com', password: 'employee123' },
]

const FEATURES = [
  { icon: Users, text: 'Employee & department management' },
  { icon: CalendarCheck, text: 'Attendance and leave workflows' },
  { icon: Wallet, text: 'Automated payroll with PDF payslips' },
  { icon: ShieldCheck, text: 'Role-based access for every team' },
]

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const u = await login(form.email, form.password)
      toast.success(`Welcome, ${u.name.split(' ')[0]}!`)
      navigate('/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-xl font-bold">E</div>
          <span className="text-xl font-bold">EMS</span>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-extrabold leading-tight">Manage your people,<br />not paperwork.</h1>
          <p className="mt-4 max-w-md text-indigo-100">
            One place for employees, attendance, leaves and payroll.
          </p>
          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15"><Icon size={18} /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-indigo-200">© {new Date().getFullYear()} EMS Technologies</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">E</div>
            <span className="text-xl font-bold">EMS</span>
          </div>
          <Link to="/" className="mb-6 inline-block text-sm text-slate-500 hover:text-indigo-600">← Back to home</Link>
          <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Welcome back! Please enter your details.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email" required className="input py-2.5" placeholder="you@company.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password" required className="input py-2.5" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Demo accounts</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => setForm({ email: d.email, password: d.password })}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600"
                >
                  {d.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
