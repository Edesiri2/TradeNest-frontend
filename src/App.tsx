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
import StockTransferModule from './components/warehouse/stock-transfer';
import OutletModule from './components/outlet/outlet';
import Users from './components/settings/Users';
import Roles from './components/settings/Roles';
import { useAuthStore } from './lib/store/useAuthStore';

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

  // Check auth on app load
  useEffect(() => {
    checkAuth();
  }, []);
  
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
              <Route path="settings/outlets" element={<OutletModule />} />
              <Route path="reports/sales" element={<Reports />} />
              <Route path="warehouse/overview" element={<WarehouseModule />} />
              <Route path="warehouse/transfers" element={<StockTransferModule />} />

              {/* Settings routes */}
              <Route path="settings">
                <Route path="users" element={<Users />} />
                <Route path="roles" element={<Roles />} />
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