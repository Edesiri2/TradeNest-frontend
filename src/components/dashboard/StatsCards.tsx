import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import { productStore } from '../../lib/store'; // Import from your actual store
import { useSalesStore } from '../../lib/store/salesStore';
import { formatCurrency, getTodaySales, getSalesTotal } from '../../lib/utils/utils';
import './dashboard.css';

const StatsCards: React.FC = () => {
  const { sales } = useSalesStore();
  const { 
    products, 
    summary, 
    pagination, 
    fetchProducts, 
    loading, 
    error 
  } = productStore(); // Use productStore instead of useInventoryStore

  // Fetch products when component mounts to get real data
  useEffect(() => {
    fetchProducts({ page: 1, limit: 10 }); // Fetch minimal data for stats
  }, [fetchProducts]);

  const todaySales = getTodaySales(sales);
  const totalRevenue = getSalesTotal(sales);
  const todayRevenue = getSalesTotal(todaySales);
  
  // Use REAL data from productStore API
  const lowStockCount = summary?.lowStockCount || 0;
  const inventoryValue = summary?.totalValue || 0;
  const totalProducts = pagination?.totalProducts || 0;

  // Loading state
  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="stat-card loading">
            <div className="stat-card__skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="stats-grid">
        <div className="stat-card error">
          <div className="stat-card__content">
            <div className="stat-card__info">
              <p className="stat-card__label">Error Loading Data</p>
              <p className="stat-card__error">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      type: "revenue" as const,
      description: "From yesterday"
    },
    {
      title: "Total Products",
      value: totalProducts.toLocaleString(), // REAL DATA from API
      change: "+5.2%",
      trend: "up" as const,
      icon: Package,
      type: "products" as const,
      description: "In inventory"
    },
    {
      title: "Low Stock Items",
      value: lowStockCount.toString(), // REAL DATA from API
      change: lowStockCount > 0 ? `+${lowStockCount}` : "0",
      trend: lowStockCount > 0 ? "up" as const : "down" as const,
      icon: AlertTriangle, // Changed to AlertTriangle for low stock
      type: "alerts" as const,
      description: "Need restocking"
    },
    {
      title: "Inventory Value",
      value: formatCurrency(inventoryValue), // REAL DATA from API
      change: "+8.1%",
      trend: "up" as const,
      icon: ShoppingCart,
      type: "inventory" as const,
      description: "Total stock value"
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className={`stat-card stat-card--${stat.type}`}>
          <div className="stat-card__content">
            <div className="stat-card__info">
              <p className="stat-card__label">{stat.title}</p>
              <h3 className="stat-card__value">{stat.value}</h3>
              <div className={`stat-card__change stat-card__change--${stat.trend === 'up' ? 'positive' : 'negative'}`}>
                {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.change}
              </div>
              <p className="stat-card__trend">{stat.description}</p>
            </div>
            <div className={`stat-card__icon stat-card__icon--${stat.type}`}>
              <stat.icon size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;