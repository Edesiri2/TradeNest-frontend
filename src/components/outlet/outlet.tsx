import React, { useState } from 'react';
import OutletList from './outletList';
import OutletForm from './OutletForm';
import './outlets.css';

type OutletView = 'list' | 'add' | 'edit';

const Outlets: React.FC = () => {
  const [currentView, setCurrentView] = useState<OutletView>('list');
  const [selectedOutlet, setSelectedOutlet] = useState<any>(null);

  const handleEditOutlet = (outlet: any) => {
    setSelectedOutlet(outlet);
    setCurrentView('edit');
  };

  const handleAddOutlet = () => {
    setSelectedOutlet(null);
    setCurrentView('add');
  };

  const handleSaveOutlet = () => {
    setCurrentView('list');
    setSelectedOutlet(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedOutlet(null);
  };

  return (
    <div className="outlets-module">
      <div className="outlets-module__content">
        {currentView === 'list' && (
          <OutletList
            onEditOutlet={handleEditOutlet}
            onAddOutlet={handleAddOutlet}
          />
        )}

        {(currentView === 'add' || currentView === 'edit') && (
          <OutletForm
            outlet={selectedOutlet}
            onSave={handleSaveOutlet}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default Outlets;
