# 👥 EMS – Employee Management System

A full-stack **MERN** HR platform to manage employees, departments, attendance, leaves and payroll, with **role-based access** for Admins, Managers and Employees.

> 👤 **Demo logins** (after `npm run seed`)
> Admin `admin@ems.com` / `admin123` · Manager `manager@ems.com` / `manager123` · Employee `employee@ems.com` / `employee123`

---

## ✨ Features

### 🔐 Authentication & Roles
- JWT login, password hashing with bcrypt, change password
- Three roles with different access:

| Feature | Admin | Manager | Employee |
|---|:-:|:-:|:-:|
| Dashboard with charts | ✅ company | ✅ company | ✅ personal |
| Manage employees (CRUD) | ✅ | 👁️ own department | ❌ |
| Manage departments | ✅ | ❌ | ❌ |
| Check-in / check-out | ✅ | ✅ | ✅ |
| Team attendance report | ✅ | ✅ own department | ❌ |
| Apply leave | ✅ | ✅ | ✅ |
| Approve / reject leave | ✅ | ✅ own department | ❌ |
| Run payroll, mark paid | ✅ | ❌ | ❌ |
| Download own payslip (PDF) | ✅ | ✅ | ✅ |

### 👥 Employees & Departments
- Auto-generated employee IDs (`EMP0001`…)
- Search, filter by department/role/status, server-side pagination
- Department heads and employee counts

### 🕘 Attendance
- One-click check-in / check-out, work hours auto-calculated
- Half-day marked automatically under 4 hours
- Daily team view: Present / Half-day / On leave / Absent
- Monthly attendance history with summary

### 🌴 Leave Management
- Casual (12), Sick (10), Earned (15) yearly quotas + Unpaid leave
- Weekends are excluded from leave days
- Overlap and balance checks, cancel pending requests
- Managers approve/reject with comments

### 💰 Payroll
- One-click monthly payroll for all active employees
- Salary breakup: Basic 50%, HRA 20%, Allowances 30%
- Deductions: PF (12% of basic), Professional Tax, Income Tax (TDS), pro-rata **unpaid leave** cut
- Downloadable **PDF payslips** generated with PDFKit
- Paid payslips are locked from recalculation

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router, Tailwind CSS, Recharts, Axios, Lucide icons |
| **Backend** | Node.js, Express 5, Mongoose, JWT, bcryptjs, PDFKit, Helmet |
| **Database** | MongoDB |
| **Testing** | Jest (salary and date calculation unit tests) |

---

## 🏗️ Project Structure

```
employee-management-system
├── backend
│   ├── src
│   │   ├── config/        # MongoDB connection
│   │   ├── controllers/   # auth, employees, departments, attendance, leaves, payroll, dashboard
│   │   ├── middleware/    # JWT auth, role guard, error handler
│   │   ├── models/        # Employee, Department, Attendance, Leave, Payroll
│   │   ├── routes/
│   │   ├── services/      # payroll generation
│   │   ├── utils/         # salary calculation, working-day maths, PDF payslip
│   │   ├── app.js
│   │   ├── server.js
│   │   └── seed.js        # demo data
│   └── tests/
└── frontend
    └── src
        ├── api/           # axios client
        ├── components/    # layout, UI kit, modals
        ├── context/       # auth context
        └── pages/         # Dashboard, Employees, Departments, Attendance, Leaves, Payroll, Profile
```

---

## 📡 API Overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` · PUT `/api/auth/change-password` | Logged in |
| GET / POST | `/api/employees` | Admin, Manager (read) |
| GET / PUT / DELETE | `/api/employees/:id` | Admin (self/manager can read) |
| PUT | `/api/employees/me` | Logged in |
| GET / POST / PUT / DELETE | `/api/departments` | Admin (all can read) |
| POST | `/api/attendance/check-in` · `/check-out` | Logged in |
| GET | `/api/attendance/me?month=&year=` | Logged in |
| GET | `/api/attendance?date=YYYY-MM-DD` | Admin, Manager |
| POST / GET | `/api/leaves` | Apply / list (Admin, Manager) |
| GET | `/api/leaves/me` | Logged in |
| PATCH | `/api/leaves/:id/review` · `/api/leaves/:id/cancel` | Manager/Admin · Owner |
| POST | `/api/payroll/generate` | Admin |
| GET | `/api/payroll?month=&year=` · `/api/payroll/me` | Admin · Logged in |
| PATCH | `/api/payroll/:id/pay` | Admin |
| GET | `/api/payroll/:id/slip` | Admin or owner (PDF) |
| GET | `/api/dashboard/stats` · `/api/dashboard/me` | Admin, Manager · Logged in |

---

## 🚀 Run Locally

**Prerequisites:** Node.js 18+, MongoDB running locally (or a MongoDB Atlas URI)

### Backend
```bash
cd backend
cp .env.example .env      # update MONGO_URI and JWT_SECRET if needed
npm install
npm run seed              # demo departments, employees, attendance, leaves, payroll
npm run dev               # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

### Tests
```bash
cd backend
npm test
```

---

## ⚙️ Environment Variables

**Backend (`backend/.env`)**

| Variable | Example |
|---|---|
| `PORT` | `5000` |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/ems` |
| `JWT_SECRET` | long random string |
| `JWT_EXPIRES_IN` | `1d` |
| `CORS_ORIGINS` | `http://localhost:5173` |

**Frontend (production only)**

| Variable | Example |
|---|---|
| `VITE_API_URL` | `https://your-api.onrender.com` |

---

## 👤 Author
**Shreyas Awdhal** · [GitHub](https://github.com/shreyas-awdal-7)
