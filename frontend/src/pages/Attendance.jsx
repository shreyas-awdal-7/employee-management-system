import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CalendarCheck, Clock, LogIn, LogOut, Timer } from 'lucide-react'
import api, { getErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Avatar, Badge, EmptyState, Loader, PageHeader, StatCard, Tabs } from '../components/ui'
import { formatTime, MONTHS, todayKey } from '../utils/format'

function MyAttendance() {
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () =>
    api.get('/attendance/me', { params: period }).then((r) => setData(r.data)).catch((e) => toast.error(getErrorMessage(e)))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  const punch = async (type) => {
    setBusy(true)
    try {
      await api.post(`/attendance/${type}`)
      toast.success(type === 'check-in' ? 'Checked in!' : 'Checked out!')
      load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  if (!data) return <Loader />
  const { today, records, summary } = data

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Clock /></div>
          <div>
            <p className="text-sm text-slate-500">Today · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
            <p className="font-semibold">
              In: {formatTime(today?.checkIn)} &nbsp;·&nbsp; Out: {formatTime(today?.checkOut)}
              {today?.checkOut && <span className="ml-2 text-sm font-normal text-slate-500">({today.workHours} hrs)</span>}
            </p>
          </div>
        </div>
        {!today ? (
          <button disabled={busy} onClick={() => punch('check-in')} className="btn-primary"><LogIn size={18} /> Check in</button>
        ) : !today.checkOut ? (
          <button disabled={busy} onClick={() => punch('check-out')} className="btn-danger"><LogOut size={18} /> Check out</button>
        ) : (
          <Badge value={today.status} />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarCheck} label="Full days" value={summary.present} color="emerald" />
        <StatCard icon={Clock} label="Half days" value={summary.halfDay} color="amber" />
        <StatCard icon={Timer} label="Total hours" value={summary.totalHours} color="violet" />
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <h3 className="font-semibold">Attendance history</h3>
          <div className="flex gap-2">
            <select className="input w-auto" value={period.month} onChange={(e) => setPeriod({ ...period, month: Number(e.target.value) })}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select className="input w-auto" value={period.year} onChange={(e) => setPeriod({ ...period, year: Number(e.target.value) })}>
              {[0, 1, 2].map((n) => <option key={n} value={now.getFullYear() - n}>{now.getFullYear() - n}</option>)}
            </select>
          </div>
        </div>
        {records.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No attendance records" text="Records will show here once you check in" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Date</th>
                  <th className="table-th">Check in</th>
                  <th className="table-th">Check out</th>
                  <th className="table-th">Hours</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r._id}>
                    <td className="table-td font-medium">
                      {new Date(`${r.date}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })}
                    </td>
                    <td className="table-td">{formatTime(r.checkIn)}</td>
                    <td className="table-td">{formatTime(r.checkOut)}</td>
                    <td className="table-td">{r.workHours || '—'}</td>
                    <td className="table-td"><Badge value={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function TeamAttendance() {
  const [date, setDate] = useState(todayKey())
  const [data, setData] = useState(null)

  useEffect(() => {
    setData(null)
    api.get('/attendance', { params: { date } }).then((r) => setData(r.data)).catch((e) => toast.error(getErrorMessage(e)))
  }, [date])

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex flex-wrap gap-2 text-sm">
          {data && ['present', 'half-day', 'on-leave', 'absent'].map((s) => (
            <span key={s} className="flex items-center gap-1.5"><Badge value={s} /> {data.summary[s] || 0}</span>
          ))}
        </div>
        <input type="date" className="input w-auto" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} />
      </div>
      {!data ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">Employee</th>
                <th className="table-th">Department</th>
                <th className="table-th">Check in</th>
                <th className="table-th">Check out</th>
                <th className="table-th">Hours</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rows.map((r) => (
                <tr key={r.employee._id}>
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.employee.name} size="h-8 w-8 text-xs" />
                      <div>
                        <p className="font-medium">{r.employee.name}</p>
                        <p className="text-xs text-slate-500">{r.employee.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">{r.employee.department?.name || '—'}</td>
                  <td className="table-td">{formatTime(r.checkIn)}</td>
                  <td className="table-td">{formatTime(r.checkOut)}</td>
                  <td className="table-td">{r.workHours || '—'}</td>
                  <td className="table-td">
                    <Badge value={r.status} />
                    {r.leaveType && <span className="ml-1 text-xs capitalize text-slate-500">({r.leaveType})</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Attendance() {
  const { hasRole } = useAuth()
  const canViewTeam = hasRole('admin', 'manager')
  const [tab, setTab] = useState(canViewTeam ? 'team' : 'mine')

  return (
    <>
      <PageHeader title="Attendance" subtitle="Daily check-in / check-out and attendance history" />
      {canViewTeam && (
        <Tabs tabs={[{ value: 'team', label: 'Team attendance' }, { value: 'mine', label: 'My attendance' }]} active={tab} onChange={setTab} />
      )}
      {tab === 'team' && canViewTeam ? <TeamAttendance /> : <MyAttendance />}
    </>
  )
}
