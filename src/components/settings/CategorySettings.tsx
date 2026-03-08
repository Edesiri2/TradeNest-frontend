import React, { useState } from 'react';
import ProductCategories from './ProductCategories';
import OperationalCostCategories from './OperationalCostCategories';

type CategoryTab = 'product' | 'operational-cost';

const CategorySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('product');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Categories</h1>
        <p className="text-gray-600">Manage product and operational cost categories in one place.</p>
      </div>

      <div className="reports-nav" style={{ marginBottom: '1.5rem' }}>
        <button className={`report-tab ${activeTab === 'product' ? 'active' : ''}`} onClick={() => setActiveTab('product')}>
          Product Categories
        </button>
        <button className={`report-tab ${activeTab === 'operational-cost' ? 'active' : ''}`} onClick={() => setActiveTab('operational-cost')}>
          Operational Cost Categories
        </button>
      </div>

      {activeTab === 'product' ? <ProductCategories /> : <OperationalCostCategories />}
    </div>
  );
};

export default CategorySettings;
