# Medicine Inventory & POS System

A professional **full-stack Pharmacy Management System** built using the **MERN Stack (MongoDB, Express, React, Node.js)**.
This application helps pharmacies efficiently manage medicine inventory, perform point-of-sale (POS) billing, track analytics, and manage user roles through a clean and responsive interface with **Light and Dark mode support**.

---

## 🚀 Key Features

### 📦 Advanced Inventory Management

* Full CRUD operations for medicines
* Category and sub-category organization
* Stock level tracking and shelf management
* Medicine image upload support

### 🧾 Dynamic POS System

* Real-time billing with cart management
* Automatic tax and total calculation
* Instant invoice generation
* Fast checkout workflow

### 🖨️ Professional Invoice System

* Printable invoice layout
* Public invoice access for customers
* Compatible with legacy sales records

### 📊 Analytics Dashboard

* Sales performance overview
* Daily and monthly transaction insights
* Inventory and stock monitoring

### 🔐 Role-Based Access Control

Secure authentication system with different access levels:

* **Admin**
* **Pharmacist**

**Note:**
Self-registration from the signup page creates **Pharmacist accounts only**.
An **Admin account** can be created automatically on the first run or added manually through the admin panel.

### 🎨 Theme Support

* Modern **Light Mode**
* Elegant **Dark Mode**
* Persistent theme preference for users

### 🛡️ Security

* JWT authentication
* Password hashing
* Protected API routes
* Secure backend validation

---

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite
* TanStack Query (React Query)
* Framer Motion
* Axios
* React Icons

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* PDFKit
* Multer

### Styling

* Pure **Vanilla CSS**
* Custom **CSS Variable Theme System** for perfect dark/light compatibility

---

## 🔑 Demo Credentials

| Role       | Email                                         | Password  |
| ---------- | --------------------------------------------- | --------- |
| Admin      | [admin@example.com](mailto:admin@example.com) | admin123@ |
| Pharmacist | [csj@gmail.com](mailto:csj@gmail.com)         | 12345678  |

---

## 📦 Installation & Setup

### 1️⃣ Prerequisites

Make sure the following are installed:

* Node.js (v18 or higher)
* MongoDB (Local or Cloud)

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside **backend/**

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=some_complex_secret
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` inside **frontend/**

```
VITE_API_URL=http://localhost:5000/api
```

Run the frontend:

```bash
npm run dev
```

After signup the user will automatically be logged in and redirected to the correct dashboard.

If any authentication request fails, the frontend shows a **toast notification** while backend errors are stored in:

```
backend/crash.log
```

---

## 📂 Project Structure

```
project-root
│
├── frontend
│   ├── components
│   ├── pages
│   ├── services
│   └── styles
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   └── server.js
│
└── uploads
    └── medicine images
```

---

## 👨‍💻 Author

**Ravindra Yadav**

GitHub: https://github.com/student-shivam

Passionate about building **modern full-stack web applications** and practical systems that solve real-world problems.

---

⭐ If you like this project, consider giving it a **star on GitHub**.
