import { useState } from 'react'
import toast from 'react-hot-toast'
import { Briefcase, Building2, Calendar, Mail, Phone, Wallet } from 'lucide-react'
import api, { getErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Avatar, Badge, PageHeader } from '../components/ui'
import { formatCurrency, formatDate } from '../utils/format'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [details, setDetails] = useState({ phone: user.phone || '', address: user.address || '', gender: user.gender || '' })
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const saveDetails = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/employees/me', details)
      setUser(data)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (pw.newPassword !== pw.confirm) return toast.error('New passwords do not match')
    try {
      await api.put('/auth/change-password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword })
      toast.success('Password changed')
      setPw({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const info = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone || '—' },
    { icon: Building2, label: 'Department', value: user.department?.name || '—' },
    { icon: Briefcase, label: 'Designation', value: user.designation || '—' },
    { icon: Calendar, label: 'Joined', value: formatDate(user.dateOfJoining) },
    { icon: Wallet, label: 'Monthly salary', value: formatCurrency(user.salary) },
  ]

  return (
    <>
      <PageHeader title="My Profile" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user.name} size="h-20 w-20 text-2xl" />
            <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.employeeId}</p>
            <div className="mt-2"><Badge value={user.role} /></div>
          </div>
          <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6">
            {info.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <Icon size={16} className="text-slate-400" />
                <span className="w-28 text-slate-500">{label}</span>
                <span className="min-w-0 truncate font-medium">{value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={saveDetails} className="card space-y-4 p-6">
            <h3 className="font-semibold">Personal details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Phone</label>
                <input className="input" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input" value={details.gender} onChange={(e) => setDetails({ ...details, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address</label>
                <textarea className="input" rows={2} value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end">
              <button disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>

          <form onSubmit={changePassword} className="card space-y-4 p-6">
            <h3 className="font-semibold">Change password</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Current password</label>
                <input type="password" required className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
              </div>
              <div>
                <label className="label">New password</label>
                <input type="password" required minLength={6} className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
              </div>
              <div>
                <label className="label">Confirm new password</label>
                <input type="password" required minLength={6} className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="btn-secondary">Update password</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
