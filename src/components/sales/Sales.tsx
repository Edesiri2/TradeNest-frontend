import React, { useEffect, useState } from 'react';
import { BarChart, History, ShoppingCart, Users } from 'lucide-react';
import { locationAPI } from '../../lib/api/locationApi';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { Button } from '../ui';
import CustomerManagement from './CustomerManagement';
import PosInterface from './PosInterface';
import SalesAnalytics from './SalesAnalytics';
import SalesHistory from './SalesHistory';
import './sales.css';

type SalesView = 'pos' | 'history' | 'customers' | 'analytics';

interface OutletOption {
  id: string;
  name: string;
  code: string;
}

const Sales: React.FC = () => {
  const { user } = useAuthStore();
  const [currentView, setCurrentView] = useState<SalesView>('pos');
  const [outlets, setOutlets] = useState<OutletOption[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState(user?.outletId || '');
  const isSuperAdmin = user?.role?.name === 'super_admin';

  useEffect(() => {
    if (!isSuperAdmin && user?.outletId) {
      setSelectedOutletId(user.outletId);
    }
  }, [isSuperAdmin, user?.outletId]);

  useEffect(() => {
    if (!isSuperAdmin) {
      return;
    }

    const loadOutlets = async () => {
      try {
        const response = await locationAPI.getOutlets();
        const nextOutlets = (response.data || [])
          .filter((outlet: any) => outlet.isActive !== false)
          .map((outlet: any) => ({
            id: outlet._id || outlet.id,
            name: outlet.name,
            code: outlet.code
          }));

        setOutlets(nextOutlets);
      } catch (error) {
        console.error('Failed to load outlets for sales:', error);
      }
    };

    void loadOutlets();
  }, [isSuperAdmin]);

  const effectiveOutletId = isSuperAdmin ? selectedOutletId : user?.outletId || '';

  const renderView = () => {
    switch (currentView) {
      case 'pos':
        return <PosInterface outletId={effectiveOutletId} />;
      case 'history':
        return <SalesHistory outletId={effectiveOutletId} />;
      case 'analytics':
        return <SalesAnalytics outletId={effectiveOutletId} />;
      case 'customers':
        return <CustomerManagement />;
      default:
        return <PosInterface outletId={effectiveOutletId} />;
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '0 1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <Button variant={currentView === 'pos' ? 'primary' : 'outline'} icon={ShoppingCart} onClick={() => setCurrentView('pos')}>
          POS
        </Button>
        <Button variant={currentView === 'history' ? 'primary' : 'outline'} icon={History} onClick={() => setCurrentView('history')}>
          Sales History
        </Button>
        <Button variant={currentView === 'customers' ? 'primary' : 'outline'} icon={Users} onClick={() => setCurrentView('customers')}>
          Customers
        </Button>
        <Button variant={currentView === 'analytics' ? 'primary' : 'outline'} icon={BarChart} onClick={() => setCurrentView('analytics')}>
          Analytics
        </Button>

        {isSuperAdmin && (
          <select
            value={selectedOutletId}
            onChange={(event) => setSelectedOutletId(event.target.value)}
            className="sales-history__filter"
            style={{ minWidth: '220px', marginLeft: 'auto' }}
          >
            <option value="">All Outlets</option>
            {outlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name} ({outlet.code})
              </option>
            ))}
          </select>
        )}
      </div>

      {renderView()}
    </div>
  );
};

export default Sales;
