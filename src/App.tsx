import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Inventory from './components/inventory/Inventory';
import { Sales } from './components/sales';
import './App.css';
import { Reports } from './components/reports';
import Login from './auth/Login';
import Register from './auth/Register';
import VerifyEmail from './auth/VerifyEmail';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import WarehouseModule from './components/warehouse/warehouse';
import StockTransferModule from './components/transfers/stock-transfer/stock-transfer';
import OutletModule from './components/outlet/outlet';
import Users from './components/settings/Users';
import Roles from './components/settings/Roles';
import CategorySettings from './components/settings/CategorySettings';
import Profile from './components/settings/Profile';
import Configuration from './components/settings/Configuration';
import { useAuthStore } from './lib/store/useAuthStore';
import { useSettingsStore } from './lib/store/useSettingsStore';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public route component (redirects to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();
  const { fetchSettings, settings } = useSettingsStore();

  // Check auth on app load
  useEffect(() => {
    checkAuth();
    void fetchSettings();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary-from', settings.brand.primaryFrom);
    document.documentElement.style.setProperty('--brand-primary-to', settings.brand.primaryTo);
  }, [settings.brand.primaryFrom, settings.brand.primaryTo]);
  
  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Layout wraps all pages that need sidebar/header */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* These render inside the Layout's Outlet */}
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="inventory/products" element={<Inventory />} />
              <Route path="sales/pos" element={<Sales />} />
              <Route path="outlets" element={<OutletModule />} />
              <Route path="reports/sales" element={<Reports />} />
              <Route path="reports/inventory" element={<Reports />} />
              <Route path="reports/profit-loss" element={<Reports />} />
              <Route path="reports/customers" element={<Reports />} />
              <Route path="reports/operational-costs" element={<Reports />} />
              <Route path="warehouse" element={<WarehouseModule />} />
              <Route path="transfers/stock" element={<StockTransferModule />} />

              {/* Settings routes */}
              <Route path="settings">
                <Route path="users" element={<Users />} />
                <Route path="roles" element={<Roles />} />
                <Route path="product-categories" element={<CategorySettings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="configuration" element={<Configuration />} />
              </Route>
            </Route>
            
            {/* You can add routes without layout if needed */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
