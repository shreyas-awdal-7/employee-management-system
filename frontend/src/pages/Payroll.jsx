import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BadgeCheck, Download, FileText, Play, Users, Wallet } from 'lucide-react'
import api, { downloadFile, getErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Avatar, Badge, EmptyState, Loader, PageHeader, StatCard, Tabs } from '../components/ui'
import { formatCurrency, MONTHS } from '../utils/format'

const download = async (p) => {
  try {
    await downloadFile(`/payroll/${p._id}/slip`, `payslip-${p.year}-${p.month}.pdf`)
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

function MyPayslips() {
  const [payslips, setPayslips] = useState(null)

  useEffect(() => {
    api.get('/payroll/me').then((r) => setPayslips(r.data)).catch((e) => toast.error(getErrorMessage(e)))
  }, [])

  if (!payslips) return <Loader />
  if (payslips.length === 0) {
    return <div className="card"><EmptyState icon={FileText} title="No payslips yet" text="Payslips appear here after payroll is processed" /></div>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {payslips.map((p) => (
        <div key={p._id} className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Payslip</p>
              <p className="text-lg font-semibold">{MONTHS[p.month - 1]} {p.year}</p>
            </div>
            <Badge value={p.status} />
          </div>
          <p className="mt-4 text-3xl font-bold text-indigo-600">{formatCurrency(p.netSalary)}</p>
          <p className="text-xs text-slate-500">Net salary</p>
          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Gross</span><span>{formatCurrency(p.earnings.gross)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Deductions</span><span className="text-red-600">− {formatCurrency(p.deductions.total)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Days present</span><span>{p.presentDays} / {p.workingDays}</span></div>
          </div>
          <button onClick={() => download(p)} className="btn-secondary mt-4 w-full"><Download size={16} /> Download PDF</button>
        </div>
      ))}
    </div>
  )
}

function PayrollAdmin() {
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [data, setData] = useState(null)
  const [running, setRunning] = useState(false)

  const load = () => {
    api.get('/payroll', { params: period }).then((r) => setData(r.data)).catch((e) => toast.error(getErrorMessage(e)))
  }

  useEffect(() => {
    setData(null)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  const generate = async () => {
    const regenerate = data?.payrolls.length > 0 &&
      window.confirm('Payroll already exists for this month. Recalculate unpaid payslips?')
    if (data?.payrolls.length > 0 && !regenerate) return
    setRunning(true)
    try {
      const { data: res } = await api.post('/payroll/generate', { ...period, regenerate })
      toast.success(res.message)
      load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setRunning(false)
    }
  }

  const markPaid = async (p) => {
    try {
      await api.patch(`/payroll/${p._id}/pay`)
      toast.success(`Marked ${p.employee.name}'s salary as paid`)
      load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex gap-2">
          <select className="input w-auto" value={period.month} onChange={(e) => setPeriod({ ...period, month: Number(e.target.value) })}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select className="input w-auto" value={period.year} onChange={(e) => setPeriod({ ...period, year: Number(e.target.value) })}>
            {[0, 1, 2].map((n) => <option key={n} value={now.getFullYear() - n}>{now.getFullYear() - n}</option>)}
          </select>
        </div>
        <button onClick={generate} disabled={running} className="btn-primary">
          <Play size={16} /> {running ? 'Processing...' : 'Run payroll'}
        </button>
      </div>

      {!data ? (
        <Loader />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Users} label="Payslips" value={data.summary.count} hint={`${data.summary.paid} paid`} />
            <StatCard icon={Wallet} label="Gross payout" value={formatCurrency(data.summary.totalGross)} color="sky" />
            <StatCard icon={FileText} label="Deductions" value={formatCurrency(data.summary.totalDeductions)} color="rose" />
            <StatCard icon={BadgeCheck} label="Net payout" value={formatCurrency(data.summary.totalNet)} color="emerald" />
          </div>

          <div className="card">
            {data.payrolls.length === 0 ? (
              <EmptyState icon={Wallet} title={`No payroll for ${MONTHS[period.month - 1]} ${period.year}`} text='Click "Run payroll" to generate payslips' />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="table-th">Employee</th>
                      <th className="table-th">Days</th>
                      <th className="table-th">Gross</th>
                      <th className="table-th">Deductions</th>
                      <th className="table-th">Net salary</th>
                      <th className="table-th">Status</th>
                      <th className="table-th text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.payrolls.map((p) => (
                      <tr key={p._id}>
                        <td className="table-td">
                          <div className="flex items-center gap-3">
                            <Avatar name={p.employee?.name} size="h-8 w-8 text-xs" />
                            <div>
                              <p className="font-medium">{p.employee?.name}</p>
                              <p className="text-xs text-slate-500">{p.employee?.employeeId} · {p.employee?.department?.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-td whitespace-nowrap">
                          {p.presentDays}/{p.workingDays}
                          {p.unpaidLeaveDays > 0 && <span className="ml-1 text-xs text-red-500">({p.unpaidLeaveDays} unpaid)</span>}
                        </td>
                        <td className="table-td">{formatCurrency(p.earnings.gross)}</td>
                        <td className="table-td text-red-600">− {formatCurrency(p.deductions.total)}</td>
                        <td className="table-td font-semibold">{formatCurrency(p.netSalary)}</td>
                        <td className="table-td"><Badge value={p.status} /></td>
                        <td className="table-td text-right whitespace-nowrap">
                          {p.status !== 'paid' && (
                            <button onClick={() => markPaid(p)} className="mr-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50">Mark paid</button>
                          )}
                          <button onClick={() => download(p)} className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" title="Download payslip">
                            <Download size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function Payroll() {
  const { hasRole } = useAuth()
  const isAdmin = hasRole('admin')
  const [tab, setTab] = useState(isAdmin ? 'run' : 'mine')

  return (
    <>
      <PageHeader title="Payroll" subtitle={isAdmin ? 'Process salaries and download payslips' : 'Your monthly payslips'} />
      {isAdmin && (
        <Tabs tabs={[{ value: 'run', label: 'Company payroll' }, { value: 'mine', label: 'My payslips' }]} active={tab} onChange={setTab} />
      )}
      {tab === 'run' && isAdmin ? <PayrollAdmin /> : <MyPayslips />}
    </>
  )
}
