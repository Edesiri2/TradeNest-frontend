import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { getNavigationItems } from '../../data/navigation';
import { useMobile } from '../../hooks/use-mobile';
import './layout.css';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user, permissions } = useAuthStore();
  const location = useLocation();
  const isMobile = useMobile();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const navigationItems = getNavigationItems(user?.role.name || 'viewer', permissions);

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
    return location.pathname === itemPath || 
           (itemPath !== '/' && location.pathname.startsWith(itemPath));
  };

  const renderNavigationItem = (item: any, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isItemActive(item.path, hasChildren);
    const isExpanded = expandedItems.has(item.path);

    // Check permissions for this item
    const canShowItem = !item.permissions || 
      item.permissions.some((permission: string) => permissions.includes(permission));

    if (!canShowItem) return null;

    // Updated sidebar-item styles with brand colors
    const sidebarItemClasses = `
      flex items-center px-4 py-3 text-sm font-medium transition-all duration-200
      ${isActive 
        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border-l-4 border-indigo-500' 
        : 'text-gray-300 hover:text-white hover:bg-white/5'
      }
      ${level > 0 ? 'pl-8' : ''}
    `;

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
          className={sidebarItemClasses} // Use the variable here
        >
          <item.icon size={20} className="mr-3 flex-shrink-0" />
          
          {isOpen && (
            <>
              <span className="flex-1">{item.label}</span>
              {hasChildren && (
                isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              )}
            </>
          )}
        </NavLink>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && isOpen && (
          <div className="ml-4">
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
    <aside className={`sidebar bg-gradient-to-b from-indigo-800 via-purple-900 to-gray-900 ${isOpen ? 'w-64' : 'w-20'}`}>
      {/* Logo section */}
      {isOpen ? (
        <div className="sidebar-header bg-gradient-to-r from-indigo-700 to-purple-800 p-5">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold">TN</span>
            </div>
            <span className="text-white font-bold text-lg">TradeNest</span>
          </div>
        </div>
      ) : (
        <div className="p-5 flex items-center justify-center">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">TN</span>
          </div>
        </div>
      )}

      {/* Navigation items */}
      <nav className="sidebar-nav p-2 space-y-1">
        {navigationItems.map(item => renderNavigationItem(item))}
      </nav>

      {/* User info section */}
      {isOpen && user && (
        <div className="sidebar-user-info mt-auto p-4 border-t border-white/10">
          <div className="flex items-center">
            <div className="sidebar-user-avatar w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
            <div className="ml-3">
              <div className="sidebar-user-name text-white text-sm font-medium">
                {user.fullName}
              </div>
              <div className="sidebar-user-role text-indigo-300 text-xs capitalize">
                {user.role.name.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isOpen && user && (
        <div className="sidebar-user-info mt-auto p-4 border-t border-white/10 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </div>
        </div>
      )}

      {/* App version */}
      <div className="sidebar-footer p-3 border-t border-white/10">
        <p className="text-xs text-gray-400 text-center">
          {isOpen ? 'v1.0.0' : 'v1'}
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;