# AttendWise 🎓 – Smart College Attendance Manager

A full-stack, production-quality College Attendance Management Web App.

## Tech Stack

| Layer     | Tech                                  |
|-----------|---------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS v4     |
| Backend   | Node.js + Express.js                  |
| Database  | MongoDB (Mongoose)                    |
| Auth      | JWT + HTTP-only Cookies               |
| Charts    | Recharts                              |

## Quick Start

### 1. Start MongoDB
Make sure MongoDB is running on `mongodb://localhost:27017`

### 2. Backend
```bash
cd backend
npm run dev
# API runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## Features
- ✅ JWT Authentication (Register / Login / Logout)
- ✅ Dashboard with live stats, charts & smart insights
- ✅ Subject-wise attendance tracking with analytics
- ✅ Full-day / Half-day / Leave type support
- ✅ Attendance prediction engine (classes needed / can miss)
- ✅ Interactive calendar view
- ✅ Attendance calculator with scenario planner
- ✅ Reports with Pie / Line / Bar charts + CSV/JSON export
- ✅ Notification system (warning / critical / info)
- ✅ Semester management with holiday support
- ✅ Dark / Light theme toggle
- ✅ Mobile responsive layout

## Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendwise
JWT_SECRET=attendwise_super_secret_jwt_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```
