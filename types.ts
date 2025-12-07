
export interface Vendor {
  id: string;
  name: string;
  address: string;
  phone: string;
  ownerName: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  logo?: string; // Base64 or URL
  subscriptionStart?: string; // ISO Date
  subscriptionEnd?: string; // ISO Date
  commissionRate?: number; // Percentage
}

export interface Product {
  id: string;
  vendorId: string; // New
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description?: string;
  color?: string; 
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderType = 'DINE_IN' | 'TAKE_AWAY' | 'ONLINE';

export interface Customer {
  id: string;
  vendorId: string; // New
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  totalVisits: number;
  lastVisit?: number;
}

export interface Promotion {
  id: string;
  vendorId: string; // New
  code: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minSpend?: number;
  isActive: boolean;
  eligibleProductIds?: string[];
}

export interface Transaction {
  id: string;
  vendorId: string; // New
  date: string; 
  timestamp: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  total: number;
  cashReceived?: number;
  change?: number;
  paymentMethod: 'cash' | 'card' | 'qr';
  cardType?: 'DEBIT' | 'CREDIT';
  bankName?: string;
  customerName?: string;
  customerId?: string;
  orderType: OrderType;
}

export interface SavedOrder {
  id: string;
  vendorId: string; // New
  customerName: string;
  items: CartItem[];
  timestamp: number;
  orderType: OrderType;
}

export enum ViewState {
  POS = 'POS',
  INVENTORY = 'INVENTORY',
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  CUSTOMERS = 'CUSTOMERS',
  PROMOS = 'PROMOS',
  USERS = 'USERS',
  VENDORS = 'VENDORS' // New for Super Admin
}

export type UserRole = 'super_admin' | 'vendor_admin' | 'cashier';

export interface User {
  username: string;
  vendorId?: string; // Optional for super_admin, required for others
  role: UserRole;
  name: string;
  password?: string;
}

export interface SummaryStats {
  totalSales: number;
  transactionCount: number;
  topProduct: string;
  averageOrderValue: number;
}

// --- Toast Types ---
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export interface ViewProps {
  onShowToast: (message: string, type: ToastType) => void;
  categories: string[];
  onAddCategory?: (category: string) => void;
  onDeleteCategory?: (category: string) => void;
  onClearCart?: () => void;
  onResetTransactions?: () => void;
}
