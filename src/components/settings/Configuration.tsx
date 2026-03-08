import React, { useEffect, useMemo, useState } from 'react';
import { Palette, ShoppingCart, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useSettingsStore } from '../../lib/store/useSettingsStore';
import type { BusinessSettings } from '../../types/settings';

type SettingsTab = 'sales' | 'brand' | 'products';

const Configuration: React.FC = () => {
  const { settings, loading, saving, fetchSettings, updateSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('sales');
  const [draft, setDraft] = useState<BusinessSettings>(settings);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const tabs = useMemo(
    () => [
      { id: 'sales' as const, label: 'Sales', icon: ShoppingCart },
      { id: 'brand' as const, label: 'Brand', icon: Palette },
      { id: 'products' as const, label: 'Products', icon: Package }
    ],
    []
  );

  const handleSave = async () => {
    try {
      await updateSettings(draft);
      toast.success('Configuration updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update configuration');
    }
  };

  return (
    <div className="sales">
      <div className="sales__header">
        <h1 className="sales__title">Configuration</h1>
        <p className="sales__subtitle">Manage sales, brand, and product configuration by tab.</p>
      </div>

      <div className="reports-nav" style={{ marginBottom: '1.5rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`report-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="sales-empty">
          <p className="sales-empty__text">Loading configuration...</p>
        </div>
      ) : (
        <div className="reports-container">
          {activeTab === 'sales' && (
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Sales Configuration</h3>
                <p className="chart-subtitle">VAT and loyalty settings used during checkout.</p>
              </div>
              <div className="product-form__grid">
                <div className="product-form__group">
                  <label className="product-form__label">Enable VAT</label>
                  <select
                    value={draft.sales.enableVat ? 'true' : 'false'}
                    className="product-form__select"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        sales: {
                          ...current.sales,
                          enableVat: event.target.value === 'true'
                        }
                      }))
                    }
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div className="product-form__group">
                  <label className="product-form__label">VAT Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="product-form__input"
                    value={draft.sales.vatRate}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        sales: {
                          ...current.sales,
                          vatRate: Number(event.target.value || 0)
                        }
                      }))
                    }
                  />
                </div>
                <div className="product-form__group">
                  <label className="product-form__label">Enable Loyalty Bonus</label>
                  <select
                    value={draft.sales.loyaltyEnabled ? 'true' : 'false'}
                    className="product-form__select"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        sales: {
                          ...current.sales,
                          loyaltyEnabled: event.target.value === 'true'
                        }
                      }))
                    }
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div className="product-form__group">
                  <label className="product-form__label">Loyalty Bonus (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="product-form__input"
                    value={draft.sales.loyaltyBonusPercentage}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        sales: {
                          ...current.sales,
                          loyaltyBonusPercentage: Number(event.target.value || 0)
                        }
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'brand' && (
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Brand Configuration</h3>
                <p className="chart-subtitle">Control the primary gradient used across the app.</p>
              </div>
              <div className="product-form__grid">
                <div className="product-form__group">
                  <label className="product-form__label">Primary Gradient From</label>
                  <input
                    type="color"
                    className="product-form__input"
                    value={draft.brand.primaryFrom}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        brand: {
                          ...current.brand,
                          primaryFrom: event.target.value
                        }
                      }))
                    }
                  />
                </div>
                <div className="product-form__group">
                  <label className="product-form__label">Primary Gradient To</label>
                  <input
                    type="color"
                    className="product-form__input"
                    value={draft.brand.primaryTo}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        brand: {
                          ...current.brand,
                          primaryTo: event.target.value
                        }
                      }))
                    }
                  />
                </div>
              </div>
              <div
                style={{
                  marginTop: '1rem',
                  height: '4rem',
                  borderRadius: '1rem',
                  background: `linear-gradient(135deg, ${draft.brand.primaryFrom}, ${draft.brand.primaryTo})`
                }}
              />
            </div>
          )}

          {activeTab === 'products' && (
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Product Configuration</h3>
                <p className="chart-subtitle">Product rules that affect approvals and stock behavior.</p>
              </div>
              <div className="product-form__grid">
                <div className="product-form__group">
                  <label className="product-form__label">Require Approval</label>
                  <select
                    value={draft.products.requireApproval ? 'true' : 'false'}
                    className="product-form__select"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        products: {
                          ...current.products,
                          requireApproval: event.target.value === 'true'
                        }
                      }))
                    }
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div className="product-form__group">
                  <label className="product-form__label">Allow Negative Stock</label>
                  <select
                    value={draft.products.allowNegativeStock ? 'true' : 'false'}
                    className="product-form__select"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        products: {
                          ...current.products,
                          allowNegativeStock: event.target.value === 'true'
                        }
                      }))
                    }
                  >
                    <option value="false">Disabled</option>
                    <option value="true">Enabled</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="product-form__footer">
            <button
              type="button"
              className="pos-cart__action-btn pos-cart__action-btn--primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuration;
