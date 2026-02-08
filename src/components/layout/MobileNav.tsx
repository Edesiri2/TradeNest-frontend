import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart 
} from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { getFlatNavigation } from '../../data/navigation';
import { useMobile } from '../../hooks/use-mobile';
import './layout.css';

const MobileNav: React.FC = () => {
  const { user } = useAuthStore();
  const isMobile = useMobile();
  const navigationItems = getFlatNavigation(user?.role.name || 'cashier').slice(0, 4); // Limit to 4 items

  if (!isMobile) {
    return null;
  }

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-content">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              mobile-nav-item
              ${isActive ? 'mobile-nav-item-active' : 'mobile-nav-item-inactive'}
            `}
          >
            <item.icon size={20} className="mobile-nav-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;