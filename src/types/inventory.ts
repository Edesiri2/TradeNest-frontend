import type { BaseEntity } from './common';

export interface Product extends BaseEntity {
  sku: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  lowStockAlert: number;
  supplierId?: string;
  warehouseId: string;
  outletId?: string;
  barcode?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface Warehouse extends BaseEntity {
  name: string;
  location: string;
  capacity: number;
  currentStockValue: number;
  managerId: string;
  contactInfo: string;
  isActive: boolean;
}

export interface Outlet extends BaseEntity {
  name: string;
  location: string;
  type: 'retail' | 'wholesale';
  managerId: string;
  contactInfo: string;
  openingHours?: string;
  isActive: boolean;
}

export interface Supplier extends BaseEntity {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  productsSupplied: string[];
  paymentTerms: string;
  isActive: boolean;
}

export interface StockTransfer extends BaseEntity {
  fromWarehouseId: string;
  toOutletId: string;
  items: TransferItem[];
  status?: string;
  notes?: string;
  deliveredAt?: Date;
}

export interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

export interface InventoryAudit extends BaseEntity {
  outletId: string;
  userId: string;
  items: AuditItem[];
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  completedAt?: Date;
}

export interface AuditItem {
  productId: string;
  expectedQuantity: number;
  countedQuantity: number;
  variance: number;
}
