import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Check, CalendarDays, Plus, X } from 'lucide-react'
import api, { getErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Avatar, Badge, EmptyState, Loader, Modal, PageHeader, Tabs } from '../components/ui'
import { formatDate, formatDay, todayKey } from '../utils/format'

const emptyForm = { leaveType: 'casual', startDate: '', endDate: '', reason: '' }

function MyLeaves() {
  const [data, setData] = useState(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => api.get('/leaves/me').then((r) => setData(r.data)).catch((e) => toast.error(getErrorMessage(e)))

  useEffect(() => {
    load()
  }, [])

  const apply = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/leaves', form)
      toast.success('Leave request submitted')
      setOpen(false)
      setForm(emptyForm)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const cancel = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return
    try {
      await api.patch(`/leaves/${id}/cancel`)
      toast.success('Leave cancelled')
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (!data) return <Loader />

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(data.balance).map(([type, b]) => (
          <div key={type} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="font-medium capitalize">{type} leave</p>
              <span className="text-xs text-slate-400">{b.quota} / year</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-indigo-600">{b.remaining}<span className="ml-1 text-sm font-normal text-slate-500">days left</span></p>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(b.remaining / b.quota) * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{b.used} used · {b.pending} pending</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="font-semibold">My leave requests</h3>
          <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={18} /> Apply leave</button>
        </div>
        {data.leaves.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No leave requests yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Type</th>
                  <th className="table-th">Dates</th>
                  <th className="table-th">Days</th>
                  <th className="table-th">Reason</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.leaves.map((l) => (
                  <tr key={l._id}>
                    <td className="table-td font-medium capitalize">{l.leaveType}</td>
                    <td className="table-td whitespace-nowrap">{formatDay(l.startDate)} – {formatDay(l.endDate)}</td>
                    <td className="table-td">{l.days}</td>
                    <td className="table-td max-w-xs">
                      <p className="truncate">{l.reason}</p>
                      {l.reviewComment && <p className="truncate text-xs text-slate-500">{l.reviewedBy?.name}: {l.reviewComment}</p>}
                    </td>
                    <td className="table-td"><Badge value={l.status} /></td>
                    <td className="table-td text-right">
                      {l.status === 'pending' && (
                        <button onClick={() => cancel(l._id)} className="text-sm font-medium text-red-600 hover:underline">Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Apply for leave">
        <form onSubmit={apply} className="space-y-4">
          <div>
            <label className="label">Leave type</label>
            <select className="input" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
              {Object.entries(data.balance).map(([type, b]) => (
                <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)} ({b.remaining} left)</option>
              ))}
              <option value="unpaid">Unpaid (salary deducted)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">From</label>
              <input type="date" className="input" required min={todayKey()} value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value, endDate: form.endDate < e.target.value ? e.target.value : form.endDate })} />
            </div>
            <div>
              <label className="label">To</label>
              <input type="date" className="input" required min={form.startDate || todayKey()} value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <p className="text-xs text-slate-500">Weekends are not counted as leave days.</p>
          <div>
            <label className="label">Reason</label>
            <textarea className="input" rows={3} required maxLength={500} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button disabled={saving} className="btn-primary">{saving ? 'Submitting...' : 'Submit request'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function LeaveRequests() {
  const [status, setStatus] = useState('pending')
  const [leaves, setLeaves] = useState(null)

  const load = () => {
    api.get('/leaves', { params: status ? { status } : {} })
      .then((r) => setLeaves(r.data))
      .catch((e) => toast.error(getErrorMessage(e)))
  }

  useEffect(() => {
    setLeaves(null)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const review = async (leave, decision) => {
    let comment = ''
    if (decision === 'rejected') {
      comment = window.prompt('Reason for rejection (optional):') ?? null
      if (comment === null) return
    }
    try {
      await api.patch(`/leaves/${leave._id}/review`, { status: decision, comment })
      toast.success(`Leave ${decision}`)
      load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <h3 className="font-semibold">Leave requests</h3>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>
      {!leaves ? (
        <Loader />
      ) : leaves.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No leave requests" text={status === 'pending' ? 'All caught up!' : undefined} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">Employee</th>
                <th className="table-th">Type</th>
                <th className="table-th">Dates</th>
                <th className="table-th">Reason</th>
                <th className="table-th">Applied</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.map((l) => (
                <tr key={l._id}>
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <Avatar name={l.employee?.name} size="h-8 w-8 text-xs" />
                      <div>
                        <p className="font-medium">{l.employee?.name}</p>
                        <p className="text-xs text-slate-500">{l.employee?.department?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td capitalize">{l.leaveType}</td>
                  <td className="table-td whitespace-nowrap">{formatDay(l.startDate)} – {formatDay(l.endDate)} <span className="text-slate-400">({l.days}d)</span></td>
                  <td className="table-td max-w-xs"><p className="truncate">{l.reason}</p></td>
                  <td className="table-td whitespace-nowrap">{formatDate(l.createdAt)}</td>
                  <td className="table-td"><Badge value={l.status} /></td>
                  <td className="table-td text-right whitespace-nowrap">
                    {l.status === 'pending' ? (
                      <>
                        <button onClick={() => review(l, 'approved')} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" title="Approve"><Check size={18} /></button>
                        <button onClick={() => review(l, 'rejected')} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Reject"><X size={18} /></button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">by {l.reviewedBy?.name || '—'}</span>
                    )}
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

export default function Leaves() {
  const { hasRole } = useAuth()
  const canReview = hasRole('admin', 'manager')
  const [tab, setTab] = useState(canReview ? 'requests' : 'mine')

  return (
    <>
      <PageHeader title="Leaves" subtitle="Apply for leave and track approvals" />
      {canReview && (
        <Tabs tabs={[{ value: 'requests', label: 'Team requests' }, { value: 'mine', label: 'My leaves' }]} active={tab} onChange={setTab} />
      )}
      {tab === 'requests' && canReview ? <LeaveRequests /> : <MyLeaves />}
    </>
  )
}
