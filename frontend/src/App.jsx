import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AuthRedirect from './routes/AuthRedirect';
import Layout from './components/layout/Layout';

import { CartProvider } from './context/CartContext';

import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import AddMedicine from './pages/AddMedicine';
import EditMedicine from './pages/EditMedicine';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ProfileSettingsPage from './pages/settings/ProfileSettingsPage';
import ChangePasswordSettingsPage from './pages/settings/ChangePasswordSettingsPage';
import SystemSettingsPage from './pages/settings/SystemSettingsPage';
import PharmacySettingsPage from './pages/settings/PharmacySettingsPage';
import InvoiceSettingsPage from './pages/settings/InvoiceSettingsPage';
import UserManagement from './pages/UserManagement';
import Sales from './pages/Sales';
import Analytics from './pages/Analytics';
import InvoicePreview from './pages/InvoicePreview';
import POS from './pages/POS';
import Checkout from './pages/Checkout';


import './styles/variables.css';
import './styles/layout.css';


const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    const applyTheme = (value) => {
      const nextTheme = value === 'dark' ? 'dark' : 'light';
      document.body.classList.toggle('dark-mode', nextTheme === 'dark');
      document.documentElement.style.colorScheme = nextTheme;
    };

    applyTheme(localStorage.getItem('theme'));

    const onStorage = (event) => {
      if (event.key === 'theme') {
        applyTheme(event.newValue);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Router>

          <Toaster position="top-right" reverseOrder={false} />

          <Routes>

            <Route path="/" element={<AuthRedirect />} />

            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/welcome" element={<Welcome />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route element={<ProtectedRoute roles={['admin', 'pharmacist']} />}>
                  <Route path="/pos" element={<POS />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/invoice/:id" element={<InvoicePreview />} />
                </Route>

                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/profile" element={<ProfileSettingsPage />} />
                <Route path="/settings/change-password" element={<ChangePasswordSettingsPage />} />
                <Route path="/settings/system" element={<SystemSettingsPage />} />
                <Route path="/settings/pharmacy" element={<PharmacySettingsPage />} />
                <Route path="/settings/invoice" element={<InvoiceSettingsPage />} />

                <Route element={<ProtectedRoute roles={['admin']} />}>
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin/medicines" element={<Medicines />} />
                  <Route path="/admin/add-medicine" element={<AddMedicine />} />
                  <Route path="/edit-medicine/:id" element={<EditMedicine />} />
                  <Route path="/admin/sales" element={<Sales />} />
                  <Route path="/admin/staff" element={<UserManagement />} />
                  <Route path="/admin/reports" element={<Analytics />} />
                </Route>

                <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/medicines" element={<Navigate to="/admin/medicines" replace />} />
                <Route path="/add-medicine" element={<Navigate to="/admin/add-medicine" replace />} />
                <Route path="/sales" element={<Navigate to="/admin/sales" replace />} />
                <Route path="/users" element={<Navigate to="/admin/staff" replace />} />
                <Route path="/analytics" element={<Navigate to="/admin/reports" replace />} />
              </Route>
            </Route>


            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
