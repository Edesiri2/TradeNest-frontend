export interface DashboardSummary {
  revenue: {
    total: number;
  };
  sales: {
    count: number;
    averageOrderValue: number;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    totalValue: number;
  };
  customers: {
    total: number;
    loyaltyMembers: number;
  };
}

export interface ReportFilters {
  outletId?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
}

export interface SalesReportData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByPayment: Array<{
    _id: string;
    totalAmount: number;
    count: number;
  }>;
  topProducts: Array<{
    _id: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

export interface InventoryReportData {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    value: number;
  }>;
}

export interface ProfitLossReportData {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
}

export interface CustomerAnalyticsData {
  totalCustomers: number;
  loyaltyMembers: number;
  totalLoyaltyPoints: number;
  topCustomers: Array<{
    _id: string;
    name: string;
    email?: string;
    loyaltyNumber?: string;
    loyaltyPoints: number;
    totalPurchases?: number;
  }>;
}

export interface OperationalCost {
  id: string;
  name: string;
  amount: number;
  category: string;
  notes?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}
