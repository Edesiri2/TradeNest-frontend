import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Inventory from './components/inventory/Inventory';
import { Sales } from './components/sales';
import './App.css';
import { Reports } from './components/reports';
import Login from './auth/Login';
import WarehouseModule from './components/warehouse/warehouse';
import StockTransferModule from './components/warehouse/stock-transfer';
import OutletModule from './components/outlet/outlet';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Layout wraps all pages that need sidebar/header */}
          <Route path="/" element={<Layout />}>
            {/* These render inside the Layout's Outlet */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="inventory/products" element={<Inventory />} />
            <Route path="sales/pos" element={<Sales />} />
            <Route path="settings/outlets" element={<OutletModule />} />
            <Route path="reports/sales" element={<Reports />} />
            <Route path="warehouse/overview" element={<WarehouseModule />} />
            <Route path="warehouse/transfers" element={<StockTransferModule />} />
          </Route>
          
          {/* You can add routes without layout if needed */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;