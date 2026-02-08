import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/store'; // Fixed import path
import { useMobile } from '../../hooks/use-mobile';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Login from '../../auth/Login'; // Fixed import path
import './layout.css';

const Layout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const isMobile = useMobile();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Main content area */}
      <div className={`
        main-content
        ${sidebarOpen && !isMobile ? 'main-content-with-sidebar' : 'main-content-full'}
      `}>
        {/* Header */}
        <Header 
          onMenuToggle={toggleSidebar} 
          sidebarOpen={sidebarOpen}
        />

        {/* Page content */}
        <main className="main-content-area">
          <div className="page-content">
            <Outlet /> {/* This will render Dashboard, Inventory, or Sales */}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 30 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;