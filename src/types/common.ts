// Base interfaces
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// export interface User extends BaseEntity {
//   email: string;
//   name: string;
//   role: 'admin' | 'manager' | 'cashier';
//   outletId?: string;
//   isActive: boolean;
// }

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}