// ReceiptScanner.tsx
import React, { useState } from 'react';
import { X, Camera, Upload, Check } from 'lucide-react';
import { Button } from '../ui';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockAlert: number;
  status: 'pending' | 'approved';
  supplier?: string;
  description?: string;
}

interface ReceiptScannerProps {
  onImport: (products: Product[]) => void;
  onCancel: () => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onImport, onCancel }) => {
  const [scanning, setScanning] = useState(false);
  const [extractedProducts, setExtractedProducts] = useState<Product[]>([]);

  const handleSimulateScan = () => {
    setScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      const mockProducts: Product[] = [
        {
          id: `scan_${Date.now()}_1`,
          name: 'Wireless Mouse',
          sku: 'ACC-012',
          category: 'Accessories',
          brand: 'TechBrand',
          costPrice: 12.75,
          sellingPrice: 29.99,
          quantity: 5,
          lowStockAlert: 2,
          status: 'pending',
          supplier: 'Office Supplies Co.',
        },
        {
          id: `scan_${Date.now()}_2`,
          name: 'Monitor Stand',
          sku: 'FUR-015',
          category: 'Furniture',
          brand: 'ErgoTech',
          costPrice: 35.00,
          sellingPrice: 69.99,
          quantity: 8,
          lowStockAlert: 3,
          status: 'pending',
          supplier: 'Office Supplies Co.',
        }
      ];
      setExtractedProducts(mockProducts);
      setScanning(false);
    }, 2000);
  };

  const handleImport = () => {
    onImport(extractedProducts);
  };

  return (
    <div className="receipt-scanner">
      <div className="scanner-header">
        <h2>
          <Camera size={20} />
          Scan Receipt
        </h2>
        <Button variant="ghost" icon={X} onClick={onCancel} children={undefined} />
      </div>

      <div className="scanner-content">
        {!scanning && extractedProducts.length === 0 && (
          <div className="scanner-options">
            <div className="scanner-option" onClick={handleSimulateScan}>
              <Camera size={32} />
              <h3>Simulate Scan</h3>
              <p>Click to simulate receipt scanning</p>
            </div>
            
            <div className="scanner-option">
              <Upload size={32} />
              <h3>Upload Image</h3>
              <p>Upload receipt image for processing</p>
            </div>
          </div>
        )}

        {scanning && (
          <div className="scanning-overlay">
            <div className="scanning-animation">
              <Camera size={48} />
              <p>Scanning receipt...</p>
            </div>
          </div>
        )}

        {extractedProducts.length > 0 && (
          <div className="extracted-products">
            <h3>Extracted Products ({extractedProducts.length})</h3>
            <div className="products-list">
              {extractedProducts.map((product) => (
                <div key={product.id} className="extracted-product">
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p>SKU: {product.sku} • Qty: {product.quantity}</p>
                    <p>Cost: ₦{product.costPrice} • Selling: ₦{product.sellingPrice}</p>
                  </div>
                  <div className="product-meta">
                    <span className="category">{product.category}</span>
                    <span className="brand">{product.brand}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="scanner-footer">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {extractedProducts.length > 0 && (
          <Button variant="primary" icon={Check} onClick={handleImport}>
            Import {extractedProducts.length} Products
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;