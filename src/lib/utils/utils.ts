import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Product, Sale } from '../../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export function formatCurrency(amount: number, currency: string = 'NGN'): string {
//   return new Intl.NumberFormat('en-NG', {
//     style: 'currency',
//     currency: currency,
//     minimumFractionDigits: 2,
//   }).format(amount);
// }

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

// export function generateSKU(category: string, brand: string = ''): string {
//   const timestamp = Date.now().toString(36);
//   const random = Math.random().toString(36).substring(2, 5);
//   const categoryCode = category.substring(0, 3).toUpperCase();
//   const brandCode = brand ? brand.substring(0, 2).toUpperCase() : 'GN';
  
//   return `TN-${categoryCode}-${brandCode}-${timestamp}${random}`.toUpperCase();
// }

export function calculateProfit(costPrice: number, sellingPrice: number, quantity: number = 1): number {
  return (sellingPrice - costPrice) * quantity;
}

export function calculateProfitMargin(costPrice: number, sellingPrice: number): number {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

// Inventory utilities
export function getLowStockProducts(products: Product[]): Product[] {
  return products.filter(product => product.currentStock <= product.lowStockAlert);
}

export function getTotalInventoryValue(products: Product[]): number {
  return products.reduce((total, product) => total + (product.costPrice * product.currentStock), 0);
}

// Sales utilities
export function getTodaySales(sales: Sale[]): Sale[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    saleDate.setHours(0, 0, 0, 0);
    return saleDate.getTime() === today.getTime();
  });
}

export function getSalesTotal(sales: Sale[]): number {
  return sales.reduce((total, sale) => total + sale.totalAmount, 0);
}

// Date utilities
export function getDateRange(days: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return { startDate, endDate };
}

// Local storage utilities
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
};
// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
};

// SKU Generation (simple version)
export const generateSKU = (productName: string): string => {
  const prefix = productName.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`;
};