export type MenuCategory = 'all' | 'makanan' | 'snack' | 'coffee' | 'non-coffee' | 'minuman';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  image: string;
  fallbackGradient?: string;
  isPopular?: boolean;
  isAvailable: boolean;
  badge?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type PaymentMethod = 'tunai' | 'qris' | 'transfer';
export type OrderType = 'dine-in' | 'takeaway';

export interface Transaction {
  id: string;
  orderNumber: string;
  date: string;
  timestamp: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountName?: string;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  cashChange?: number;
  bankName?: string;
  orderType: OrderType;
  tableNumber?: string;
  customerName?: string;
  cashierName: string;
  status: 'lunas';
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  avgOrderValue: number;
}
