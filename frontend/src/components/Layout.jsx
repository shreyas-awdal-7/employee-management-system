import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Building2, CalendarCheck, CalendarDays, LayoutDashboard, LogOut, Menu, UserCircle, Users, Wallet, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './ui'
import { capitalize } from '../utils/format'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
  { to: '/employees', label: 'Employees', icon: Users, roles: ['admin', 'manager'] },
  { to: '/departments', label: 'Departments', icon: Building2, roles: ['admin'] },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['admin', 'manager', 'employee'] },
  { to: '/leaves', label: 'Leaves', icon: CalendarDays, roles: ['admin', 'manager', 'employee'] },
  { to: '/payroll', label: 'Payroll', icon: Wallet, roles: ['admin', 'manager', 'employee'] },
  { to: '/profile', label: 'My Profile', icon: UserCircle, roles: ['admin', 'manager', 'employee'] },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const items = NAV.filter((n) => n.roles.includes(user.role))

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">E</div>
            <div>
              <p className="font-bold leading-tight text-white">EMS</p>
              <p className="text-xs text-slate-400">Employee Management</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{capitalize(user.role)}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="rounded-lg p-2 hover:bg-slate-800 hover:text-white">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 hover:bg-slate-100"><Menu size={22} /></button>
        <p className="font-bold text-indigo-600">EMS</p>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}
