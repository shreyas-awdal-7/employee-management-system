import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Building2, Pencil, Plus, Trash2, Users } from 'lucide-react'
import api, { getErrorMessage } from '../api/client'
import { EmptyState, Loader, Modal, PageHeader } from '../components/ui'

const empty = { name: '', description: '', head: '' }

export default function Departments() {
  const [departments, setDepartments] = useState(null)
  const [employees, setEmployees] = useState([])
  const [modal, setModal] = useState({ open: false, dept: null })
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () =>
    api.get('/departments').then((r) => setDepartments(r.data)).catch((e) => toast.error(getErrorMessage(e)))

  useEffect(() => {
    load()
    api.get('/employees', { params: { limit: 100, status: 'active' } }).then((r) => setEmployees(r.data.data)).catch(() => {})
  }, [])

  const openModal = (dept = null) => {
    setForm(dept ? { name: dept.name, description: dept.description || '', head: dept.head?._id || '' } : empty)
    setModal({ open: true, dept })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal.dept) await api.put(`/departments/${modal.dept._id}`, form)
      else await api.post('/departments', form)
      toast.success(modal.dept ? 'Department updated' : 'Department created')
      setModal({ open: false, dept: null })
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (dept) => {
    if (!window.confirm(`Delete ${dept.name} department?`)) return
    try {
      await api.delete(`/departments/${dept._id}`)
      toast.success('Department deleted')
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <>
      <PageHeader title="Departments" subtitle="Organise teams and assign department heads">
        <button className="btn-primary" onClick={() => openModal()}><Plus size={18} /> Add department</button>
      </PageHeader>

      {!departments ? (
        <Loader />
      ) : departments.length === 0 ? (
        <div className="card"><EmptyState icon={Building2} title="No departments yet" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {departments.map((d) => (
            <div key={d._id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Building2 size={22} />
                </div>
                <div className="flex">
                  <button onClick={() => openModal(d)} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(d)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{d.name}</h3>
              <p className="mt-1 flex-1 text-sm text-slate-500">{d.description || 'No description'}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="flex items-center gap-1.5 text-slate-600"><Users size={16} /> {d.employeeCount} employees</span>
                <span className="text-slate-500">Head: <span className="font-medium text-slate-700">{d.head?.name || '—'}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, dept: null })} title={modal.dept ? 'Edit department' : 'Add department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Department head</label>
            <select className="input" value={form.head} onChange={(e) => setForm({ ...form, head: e.target.value })}>
              <option value="">None</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.name} ({e.designation})</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModal({ open: false, dept: null })}>Cancel</button>
            <button disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
