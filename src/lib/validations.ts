import { z } from 'zod';

const Roles = {
  admin: "admin",
  manager: "manager",
  cashier: "cashier",
} as const;
// Auth validations
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'manager', 'cashier']),
});

// Product validations
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  costPrice: z.number().min(0, 'Cost price must be positive'),
  sellingPrice: z.number().min(0, 'Selling price must be positive'),
  currentStock: z.number().int().min(0, 'Stock cannot be negative'),
  lowStockAlert: z.number().int().min(0, 'Low stock alert must be positive'),
  supplierId: z.string().optional(),
  warehouseId: z.string().min(1, 'Warehouse is required'),
});

// Sale validations
export const saleSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one item is required'),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'mobile']),
  customerId: z.string().optional(),
});

// Customer validations
export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Stock transfer validations
export const stockTransferSchema = z.object({
  fromWarehouseId: z.string().min(1, 'Source warehouse is required'),
  toOutletId: z.string().min(1, 'Destination outlet is required'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

// Export types for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type SaleFormData = z.infer<typeof saleSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type StockTransferFormData = z.infer<typeof stockTransferSchema>;