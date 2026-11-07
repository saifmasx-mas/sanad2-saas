export type UserRole = 'expat' | 'provider' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  country: string; // e.g. "Germany", "UAE", "Sweden", "Syria"
  city?: string;
  avatarUrl?: string;
}

export interface ServicePackage {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  category: 'food' | 'energy' | 'health' | 'fuel' | 'home' | 'cash';
  priceUSD: number;
  priceSYP: number;
  unit: string;
  iconName: string;
  badge?: string;
  estimatedDeliveryHours: number;
  availableCities: string[];
  stockStatus: 'available' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
  aiSuggestedAdjustment?: number;
}

export type OrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'assigned_to_provider'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export interface OrderItem {
  serviceId: string;
  serviceTitle: string;
  quantity: number;
  unitPriceUSD: number;
  totalUSD: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  expatId: string;
  expatName: string;
  expatPhone: string;
  expatCountry: string;
  recipientName: string;
  recipientPhone: string;
  recipientCity: string;
  recipientAddress: string;
  recipientNotes?: string;
  items: OrderItem[];
  totalUSD: number;
  totalSYP: number;
  exchangeRateUsed: number;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  orderStatus: OrderStatus;
  providerId?: string;
  providerName?: string;
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
  proofImageUrl?: string;
  telegramNotificationSent: boolean;
}

export interface ExchangeRateInfo {
  usdToSypOfficial: number;
  usdToSypMarket: number;
  hedgedRate: number; // rate with buffer (e.g. +6%) for volatility
  volatilityIndex: 'low' | 'moderate' | 'high';
  lastRefreshed: string;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  source: string;
  action: string;
  details: string;
  status: 'success' | 'warning' | 'info';
}
