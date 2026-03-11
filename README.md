# IndiCorp Medicine Inventory & POS System

A professional, full-stack Pharmacy Management System built with the MERN stack (MongoDB, Express, React, Node.js). This system handles inventory management, point-of-sale (POS) transactions, analytics, and user role management with a modern, responsive UI supporting both Light and Dark modes.

---

## 🚀 Key Features

- **Advanced Inventory**: Full CRUD for medicines with category/subcategory support, stock tracking, and shelf management.
- **Dynamic POS**: Real-time billing system with cart management, tax calculation, and instant invoice generation.
- **Invoice System**: Publicly accessible, print-optimized invoices for customers with fallback support for legacy sales data.
- **Analytics Dashboard**: Visual representation of sales performance, stock levels, and transaction history.
- **Role-Based Access (RBAC)**: Secure access control for Admins and Pharmacists.
- **Theme Support**: Seamless transition between premium Light and Dark modes with persistent user preference.
- **Security**: JWT-based authentication, password hashing, and protected API routes.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TanStack Query (React Query), Framer Motion, Axios, React Icons.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), PDFKit, Multer.
- **Styling**: Vanilla CSS with a customized semantic variable system for perfect theme compatibility.

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin123@gmail.com` | `admin123@` |
| **Pharmacist** | `csj@gmail.com` | `12345678` |

---

## 📦 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file with:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# NODE_ENV=development
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create a .env file with:
# VITE_API_URL=http://localhost:5000/api
npm run dev
```

---

## 📂 Project Structure

- `frontend/`: React application with organized components, pages, and services.
- `backend/`: Express API with controllers, models, routes, and middleware.
- `uploads/`: Directory for medicine images and documents.

---

## 👤 Author

- **Shivam**
- GitHub: [student-shivam](https://github.com/student-shivam)

---

Developed with ❤️ for efficient pharmacy management.
