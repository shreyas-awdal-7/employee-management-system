import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api, { getErrorMessage } from '../api/client'
import { Modal } from './ui'

const empty = {
  name: '', email: '', password: '', phone: '', gender: '', department: '', designation: '',
  role: 'employee', salary: '', dateOfJoining: '', status: 'active', address: '',
}

export default function EmployeeFormModal({ open, employee, departments, onClose, onSaved }) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(employee)

  useEffect(() => {
    if (!open) return
    setForm(
      employee
        ? {
            ...empty,
            ...employee,
            password: '',
            department: employee.department?._id || '',
            dateOfJoining: employee.dateOfJoining?.slice(0, 10) || '',
            phone: employee.phone || '',
            gender: employee.gender || '',
            address: employee.address || '',
            designation: employee.designation || '',
          }
        : empty
    )
  }, [open, employee])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, salary: Number(form.salary) }
    if (isEdit && !payload.password) delete payload.password
    try {
      if (isEdit) await api.put(`/employees/${employee._id}`, payload)
      else await api.post('/employees', payload)
      toast.success(isEdit ? 'Employee updated' : 'Employee added')
      onSaved()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit employee' : 'Add employee'} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Full name *</label>
          <input className="input" required value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">Email *</label>
          <input className="input" type="email" required value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label">{isEdit ? 'New password (optional)' : 'Password *'}</label>
          <input className="input" type="password" minLength={6} required={!isEdit} value={form.password} onChange={set('password')} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="label">Department</label>
          <select className="input" value={form.department} onChange={set('department')}>
            <option value="">Select department</option>
            {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Designation</label>
          <input className="input" value={form.designation} onChange={set('designation')} />
        </div>
        <div>
          <label className="label">Role</label>
          <select className="input" value={form.role} onChange={set('role')}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="label">Monthly salary (₹) *</label>
          <input className="input" type="number" min="0" required value={form.salary} onChange={set('salary')} />
        </div>
        <div>
          <label className="label">Date of joining</label>
          <input className="input" type="date" value={form.dateOfJoining} onChange={set('dateOfJoining')} />
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="input" value={form.gender} onChange={set('gender')}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Address</label>
          <textarea className="input" rows={2} value={form.address} onChange={set('address')} />
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button disabled={saving} className="btn-primary">{saving ? 'Saving...' : isEdit ? 'Update' : 'Add employee'}</button>
        </div>
      </form>
    </Modal>
  )
}
