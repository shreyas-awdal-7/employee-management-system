import { X } from 'lucide-react'
import { capitalize, initials } from '../utils/format'

export function Loader({ className = 'py-20' }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
    </div>
  )
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

const COLORS = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-600',
  violet: 'bg-violet-50 text-violet-600',
}

export function StatCard({ icon: Icon, label, value, hint, color = 'indigo' }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${COLORS[color]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="truncate text-2xl font-bold text-slate-900">{value}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  )
}

const BADGE_STYLES = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  present: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'half-day': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  absent: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  'on-leave': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  generated: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  admin: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  manager: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  employee: 'bg-slate-100 text-slate-700 ring-slate-500/20',
}

export function Badge({ value }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE_STYLES[value] || BADGE_STYLES.inactive}`}>
      {capitalize(value?.replace('-', ' '))}
    </span>
  )
}

const AVATAR_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500', 'bg-violet-500']

export function Avatar({ name, size = 'h-9 w-9 text-sm' }) {
  const color = AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${color} ${size}`}>
      {initials(name)}
    </div>
  )
}

export function Modal({ open, title, onClose, children, width = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={onClose}>
      <div
        className={`card max-h-[90vh] w-full overflow-y-auto ${width}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      {Icon && <Icon size={40} className="text-slate-300" />}
      <p className="mt-3 font-medium text-slate-600">{title}</p>
      {text && <p className="mt-1 text-sm text-slate-400">{text}</p>}
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="mb-6 inline-flex rounded-xl bg-slate-100 p-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            active === t.value ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
