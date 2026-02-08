import React from 'react';
import { Bell, Search, User, Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { useMobile } from '../../hooks/use-mobile';
import './layout.css';

interface HeaderProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, sidebarOpen }) => {
  const { user, logout } = useAuthStore();
  const isMobile = useMobile();

  //className="header bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"

  return (
    <header className="header">
      <div className="header-content">
        {/* Left section */}
        <div className="header-left">
          <button
            onClick={onMenuToggle}
            className="btn-icon"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          {/* Logo/Brand - hidden on mobile when sidebar is open */}
          {(!isMobile || !sidebarOpen) && (
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-xl" style={{ width: '2rem', height: '2rem', marginRight: '0.75rem' }}>
                TN
              </div>
              <h1 className="login-title" style={{ fontSize: '1.25rem', margin: 0 }}>
                TradeNest
              </h1>
            </div>
          )}
        </div>

        {/* Search bar - hidden on mobile */}
        {!isMobile && (
          <div className="header-center">
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search products, customers, sales..."
                className="search-input"
              />
            </div>
          </div>
        )}

        {/* Right section */}
        <div className="header-right">
          {/* Notifications */}
          <button className="btn-icon relative">
            <Bell size={20} />
            <span 
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                border: '2px solid white'
              }}
            ></span>
          </button>

          {/* User menu */}
          <div className="flex items-center gap-2">
            <div className="user-info">
              <div className="text-sm font-medium" style={{ color: 'var(--gray-900)' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs" style={{ color: 'var(--gray-500)', textTransform: 'capitalize' }}>
                {user?.role.name}
              </div>
            </div>
            
            <div className="user-menu">
              <button className="user-menu-button">
                <User size={16} />
              </button>
              
              {/* Dropdown menu */}
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <div className="text-sm font-medium" style={{ color: 'var(--gray-900)' }}>
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--gray-500)' }}>
                    {user?.email}
                  </div>
                </div>
                
                <button 
                  onClick={logout}
                  className="user-menu-item user-menu-item-danger"
                >
                  <LogOut size={16} style={{ marginRight: '0.5rem' }} />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;