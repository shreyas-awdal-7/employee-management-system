import { Link } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Building2, CalendarCheck, CalendarDays, CheckCircle2, Clock, FileText,
  ShieldCheck, UserCheck, Users, Wallet,
} from 'lucide-react'

const FEATURES = [
  { icon: Users, title: 'Employee directory', text: 'Add, edit and search employees with auto-generated IDs, departments and roles.' },
  { icon: CalendarCheck, title: 'Attendance tracking', text: 'One-click check-in/out with automatic work hours and half-day detection.' },
  { icon: CalendarDays, title: 'Leave management', text: 'Leave balances, weekend-aware day counts and manager approvals.' },
  { icon: Wallet, title: 'Automated payroll', text: 'Monthly salary with PF, tax and unpaid-leave deductions in one click.' },
  { icon: FileText, title: 'PDF payslips', text: 'Professional payslips generated on the fly and downloadable anytime.' },
  { icon: BarChart3, title: 'Live dashboards', text: 'Attendance trends, department split and pending approvals at a glance.' },
]

const ROLES = [
  {
    role: 'Admin',
    color: 'from-violet-500 to-indigo-600',
    points: ['Manage employees & departments', 'Run payroll and mark salaries paid', 'Approve any leave request', 'Company-wide reports'],
  },
  {
    role: 'Manager',
    color: 'from-indigo-500 to-sky-500',
    points: ['View own department team', 'Daily team attendance', 'Approve or reject team leaves', 'Company dashboard'],
  },
  {
    role: 'Employee',
    color: 'from-emerald-500 to-teal-500',
    points: ['Check in and check out', 'Apply for leave, track balance', 'Download monthly payslips', 'Update profile & password'],
  },
]

const STACK = ['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Tailwind CSS', 'Recharts', 'PDFKit']

function DashboardPreview() {
  const bars = [62, 80, 74, 92, 86, 70, 88]
  return (
    <div className="relative rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur">
      <div className="overflow-hidden rounded-xl bg-white text-slate-800">
        <div className="flex">
          <div className="hidden w-36 shrink-0 space-y-2 bg-slate-900 p-3 sm:block">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">E</div>
              <span className="text-xs font-bold text-white">EMS</span>
            </div>
            {['Dashboard', 'Employees', 'Attendance', 'Leaves', 'Payroll'].map((item, i) => (
              <div key={item} className={`rounded-md px-2 py-1.5 text-[11px] ${i === 0 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>{item}</div>
            ))}
          </div>
          <div className="flex-1 space-y-3 p-4">
            <p className="text-sm font-semibold">Good morning, Shreyas 👋</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Users, label: 'Employees', value: '128', c: 'bg-indigo-50 text-indigo-600' },
                { icon: UserCheck, label: 'Present', value: '117', c: 'bg-emerald-50 text-emerald-600' },
                { icon: Clock, label: 'On leave', value: '6', c: 'bg-amber-50 text-amber-600' },
              ].map(({ icon: Icon, label, value, c }) => (
                <div key={label} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-md ${c}`}><Icon size={14} /></div>
                  <div>
                    <p className="text-[10px] text-slate-500">{label}</p>
                    <p className="text-sm font-bold">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-[11px] font-medium text-slate-500">Attendance – last 7 days</p>
              <div className="mt-2 flex h-24 items-end gap-2">
                {bars.map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-indigo-500" style={{ height: `${h}%`, opacity: 0.55 + i * 0.06 }} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 p-2 text-[11px]">
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">RV</span>
                Rahul Verma · Casual leave · 2 days
              </span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="absolute inset-x-0 top-0 z-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 font-bold">E</div>
            <span className="text-lg font-bold">EMS</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-indigo-100 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#roles" className="hover:text-white">Roles</a>
            <a href="#stack" className="hover:text-white">Tech stack</a>
          </div>
          <Link to="/login" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow hover:bg-indigo-50">
            Sign in
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 pb-24 pt-32 text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-violet-400/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <ShieldCheck size={14} /> Role-based HR platform
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Manage your people,<br />
              <span className="text-amber-300">not paperwork.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-indigo-100">
              Employees, attendance, leaves and payroll in one place, with separate views for Admins, Managers and Employees.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50">
                Try live demo <ArrowRight size={18} />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-semibold hover:bg-white/10">
                Explore features
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-indigo-100">
              {['Demo accounts for every role', 'PDF payslips', 'Real-time dashboards'].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-300" /> {t}</span>
              ))}
            </div>
          </div>
          <DashboardPreview />
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 text-center md:grid-cols-4">
          {[
            ['3', 'User roles'],
            ['6', 'Core modules'],
            ['30', 'REST API endpoints'],
            ['1-click', 'Monthly payroll'],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-indigo-600">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Features</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Everything HR needs, nothing it doesn't</h2>
            <p className="mt-3 text-slate-500">From the first day of joining to the monthly payslip.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={22} /></div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Role-based access</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">The right view for everyone</h2>
            <p className="mt-3 text-slate-500">Each role sees only what it needs. Try them all with the demo accounts.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {ROLES.map(({ role, color, points }) => (
              <div key={role} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className={`bg-gradient-to-r ${color} px-6 py-5 text-white`}>
                  <p className="text-sm opacity-90">Sign in as</p>
                  <p className="text-2xl font-bold">{role}</p>
                </div>
                <ul className="space-y-3 p-6">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section id="stack" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Built with</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {STACK.map((s) => (
              <span key={s} className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-14 text-center text-white shadow-xl">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <Building2 className="mx-auto" size={36} />
            <h2 className="mt-4 text-3xl font-bold">See it in action</h2>
            <p className="mx-auto mt-2 max-w-xl text-indigo-100">Log in with a demo Admin, Manager or Employee account and explore every module.</p>
            <Link to="/login" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50">
              Open the demo <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} EMS · Built by Shreyas Awdhal ·{' '}
        <a href="https://github.com/shreyas-awdal-7/employee-management-system" className="font-medium text-indigo-600 hover:underline">GitHub</a>
      </footer>
    </div>
  )
}
