import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Warehouse, 
  BarChart, 
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { getNavigationItems } from '../../data/navigation';
import { useMobile } from '../../hooks/use-mobile';
import './layout.css';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const isMobile = useMobile();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const navigationItems = getNavigationItems(user?.role || 'cashier');

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const isItemActive = (itemPath: string, hasChildren: boolean = false) => {
    if (hasChildren) {
      return expandedItems.has(itemPath);
    }
    return location.pathname === itemPath;
  };

  const renderNavigationItem = (item: any, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isItemActive(item.path, hasChildren);
    const isExpanded = expandedItems.has(item.path);

    return (
      <div key={item.path}>
        <NavLink
          to={hasChildren ? '#' : item.path}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.path);
            }
          }}
          className={`
            sidebar-item
            ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
            ${level > 0 ? 'sidebar-child' : ''}
          `}
          style={level > 0 ? { marginLeft: '1rem' } : {}}
        >
          <item.icon size={20} className="sidebar-item-icon" />
          
          {isOpen && (
            <>
              <span className="sidebar-item-text">{item.label}</span>
              {hasChildren && (
                isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              )}
            </>
          )}
        </NavLink>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && isOpen && (
          <div className="sidebar-children">
            {item.children.map((child: any) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isMobile) {
    return null; // Don't render sidebar on mobile
  }

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      {/* Logo section */}
      {isOpen && (
        <div className="sidebar-header">
          <div className="flex items-center">
            <div className="login-logo" style={{ width: '2rem', height: '2rem', marginRight: '0.75rem' }}>
              TN
            </div>
            <span className="login-title" style={{ fontSize: '1.25rem', margin: 0 }}>
              TradeNest
            </span>
          </div>
        </div>
      )}

      {/* Navigation items */}
      <nav className="sidebar-nav">
        {navigationItems.map(item => renderNavigationItem(item))}
      </nav>

      {/* App version */}
      {isOpen && (
        <div className="sidebar-footer">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', textAlign: 'center' }}>
            v1.0.0
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;