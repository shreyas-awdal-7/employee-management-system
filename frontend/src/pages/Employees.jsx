import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import api, { getErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import EmployeeFormModal from '../components/EmployeeFormModal'
import { Avatar, Badge, EmptyState, Loader, PageHeader } from '../components/ui'
import { formatCurrency, formatDate } from '../utils/format'

export default function Employees() {
  const { hasRole, user } = useAuth()
  const isAdmin = hasRole('admin')

  const [result, setResult] = useState(null)
  const [departments, setDepartments] = useState([])
  const [filters, setFilters] = useState({ q: '', department: '', role: '', status: '', page: 1 })
  const [modal, setModal] = useState({ open: false, employee: null })

  const load = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
    api.get('/employees', { params: { ...params, limit: 10 } })
      .then((r) => setResult(r.data))
      .catch((e) => toast.error(getErrorMessage(e)))
  }

  useEffect(() => {
    api.get('/departments').then((r) => setDepartments(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const setFilter = (key) => (e) => setFilters({ ...filters, [key]: e.target.value, page: 1 })

  const handleDelete = async (emp) => {
    if (!window.confirm(`Delete ${emp.name}? Their attendance, leaves and payslips will also be removed.`)) return
    try {
      await api.delete(`/employees/${emp._id}`)
      toast.success('Employee deleted')
      load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle={isAdmin ? 'Manage your workforce' : `Team members in ${user.department?.name || 'your department'}`}
      >
        {isAdmin && (
          <button className="btn-primary" onClick={() => setModal({ open: true, employee: null })}>
            <Plus size={18} /> Add employee
          </button>
        )}
      </PageHeader>

      <div className="card">
        <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-56 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search by name, email, ID or designation" value={filters.q} onChange={setFilter('q')} />
          </div>
          {isAdmin && (
            <select className="input w-auto" value={filters.department} onChange={setFilter('department')}>
              <option value="">All departments</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          )}
          <select className="input w-auto" value={filters.role} onChange={setFilter('role')}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
          <select className="input w-auto" value={filters.status} onChange={setFilter('status')}>
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {!result ? (
          <Loader />
        ) : result.data.length === 0 ? (
          <EmptyState icon={Users} title="No employees found" text="Try a different search or filter" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Employee</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Joined</th>
                  {isAdmin && <th className="table-th">Salary</th>}
                  <th className="table-th">Status</th>
                  {isAdmin && <th className="table-th text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.data.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/60">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} />
                        <div>
                          <p className="font-medium text-slate-900">{emp.name}</p>
                          <p className="text-xs text-slate-500">{emp.employeeId} · {emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <p>{emp.department?.name || '—'}</p>
                      <p className="text-xs text-slate-500">{emp.designation}</p>
                    </td>
                    <td className="table-td"><Badge value={emp.role} /></td>
                    <td className="table-td whitespace-nowrap">{formatDate(emp.dateOfJoining)}</td>
                    {isAdmin && <td className="table-td">{formatCurrency(emp.salary)}</td>}
                    <td className="table-td"><Badge value={emp.status} /></td>
                    {isAdmin && (
                      <td className="table-td text-right whitespace-nowrap">
                        <button onClick={() => setModal({ open: true, employee: emp })} className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(emp)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result && result.total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            <span>
              Showing {(result.page - 1) * result.limit + 1}–{Math.min(result.page * result.limit, result.total)} of {result.total}
            </span>
            <div className="flex gap-2">
              <button disabled={result.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="btn-secondary px-2 py-1.5">
                <ChevronLeft size={16} />
              </button>
              <button disabled={result.page >= result.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="btn-secondary px-2 py-1.5">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <EmployeeFormModal
        open={modal.open}
        employee={modal.employee}
        departments={departments}
        onClose={() => setModal({ open: false, employee: null })}
        onSaved={() => {
          setModal({ open: false, employee: null })
          load()
        }}
      />
    </>
  )
}
