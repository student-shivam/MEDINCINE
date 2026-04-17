# Medicine Inventory System

A full-stack MERN pharmacy management system for medicine inventory, billing, orders, analytics, staff access, and invoice generation.

LIVE=https://medicininventry.netlify.app/

## Tech Stack

- Frontend: React 19, Vite, React Query, Axios, Framer Motion
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO, PDFKit, Multer
- Database: MongoDB Atlas or local MongoDB

## Features

- Authentication with admin and pharmacist roles
- Medicine inventory management with image upload
- Category and subcategory support
- POS billing and order generation
- Invoice preview and print support
- Dashboard analytics and alerts
- Profile management
- Real-time notifications with Socket.IO

## Project Structure

```text
Mern-medicine-inventory-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── validators/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   └── vite.config.js
└── README.md
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/student-shivam/MEDINCINE.git
cd MEDINCINE
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/medicine
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CRON_TIMEZONE=Asia/Kolkata
```

Start backend:

```bash
npm run dev
```

### 3. Install frontend dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

## Default Admin Login

On first backend startup, the app creates a default admin if none exists.

- Email: `admin@example.com`
- Password: `admin123@`

Change these credentials after first login in production use.

## API Health Check

After starting backend, test:

```bash
http://localhost:5000/api/health
```

## Deployment Guide

### Recommended Hosting

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

### 1. Deploy Backend on Render

- Create a new Web Service on Render
- Connect GitHub repo: `student-shivam/MEDINCINE`
- Set root directory to `backend`
- Build command: `npm install`
- Start command: `npm start`

Set these environment variables on Render:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_strong_secret
JWT_EXPIRE=7d
NODE_ENV=production
CRON_TIMEZONE=Asia/Kolkata
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### 2. Deploy Frontend on Vercel

- Import the same GitHub repository into Vercel
- Set root directory to `frontend`
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

Set this environment variable on Vercel:

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

### 3. MongoDB Atlas

- Create a cluster
- Create a database user
- Add IP access
- Copy the connection string into `MONGO_URI`

## Production Notes

- Do not commit `.env` files
- `backend/uploads/` is ignored from git and is not persistent on many free hosts
- For long-term image storage, use Cloudinary, S3, or a persistent disk
- Set `CLIENT_URL` on the backend to allow frontend requests in production

## Useful Commands

### Frontend

```bash
npm run dev
npm run build
npm run lint
```

### Backend

```bash
npm run dev
npm start
```

## Git Push Workflow

```bash
git add .
git commit -m "Update project setup and documentation"
git push origin main
```

## Author

Shivam

GitHub: https://github.com/student-shivam
