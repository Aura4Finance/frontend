/**
 * OraFi Admin API Types
 * Generated from Postman Collection and API Documentation
 * Collection UID: 49355600-f125104c-3c63-4dfb-988f-4779aaaacc12
 */

// ==================== Common Types ====================

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  nextCursor?: string;
  prevCursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ==================== Admin Auth Types ====================

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
}

export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  accessToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
}

// ==================== Admin Profile Types ====================

export interface AdminProfile {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  provider: string;
  googleId: string | null;
  role: string;
  emailVerified: boolean;
  disabled: boolean;
  createdAt: string;
  businessProfile: any | null;
}

export interface CreateAdminRequest {
  email: string;
  firstname: string;
  lastname: string;
}

// ==================== Metrics Types ====================

export interface DashboardMetrics {
  totalTransactions: number;
  totalCustomers: number;
  totalMerchants: number;
  totalRevenue: number;
  transactionsTrend?: Trend;
  customersTrend?: Trend;
  merchantsTrend?: Trend;
  revenueTrend?: Trend;
}

export interface Trend {
  value: number;
  isPositive: boolean;
}

export interface TransactionMetricsParams {
  mode?: "test" | "live";
  status?: TransactionStatus;
}

export interface MerchantMetrics {
  total: number;
  active: number;
  suspended: number;
  pending: number;
}

export interface HealthMetrics {
  status: "healthy" | "degraded" | "down";
  uptime: number;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: "operational" | "degraded" | "down";
  responseTime: number;
  lastChecked: string;
}

export interface RevenueMetrics {
  total: number;
  byDate: RevenueByDate[];
  byToken: RevenueByToken[];
}

export interface RevenueByDate {
  date: string;
  revenue: number;
}

export interface RevenueByToken {
  token: string;
  revenue: number;
  percentage: number;
}

// ==================== Merchant Types ====================

export type MerchantStatus = "ACTIVE" | "DISABLED" | "PENDING" | "SUSPENDED";

export interface Merchant {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  businessName?: string;
  status: MerchantStatus;
  mode: "test" | "live";
  createdAt: string;
  updatedAt: string;
  totalRevenue?: number;
  totalTransactions?: number;
  apiKey?: string;
  webhookUrl?: string;
  category?: string;
}

export interface GetMerchantsParams extends PaginationParams {
  search?: string;
  status?: MerchantStatus;
  mode?: "test" | "live";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface MerchantDetails extends Merchant {
  website?: string;
  phoneNumber?: string;
  address?: string;
  description?: string;
  logo?: string;
  kycStatus?: "verified" | "pending" | "rejected";
}

// ==================== Transaction Types ====================

export type TransactionType = "PAYMENT" | "PAYOUT" | "REFUND";
export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED" | "CANCELLED";

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  token: string;
  fee?: number;
  netAmount?: number;
  customerId?: string;
  customerEmail?: string;
  merchantId?: string;
  merchantName?: string;
  paymentLinkId?: string;
  mode: "test" | "live";
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface GetTransactionsParams extends PaginationParams {
  type?: TransactionType;
  status?: TransactionStatus;
  token?: string;
  date?: DateFilter;
  customerId?: string;
  paymentLinkId?: string;
  userId?: string;
  mode?: "test" | "live";
}

export interface DateFilter {
  type: "preset" | "custom";
  interval?: "today" | "yesterday" | "last7days" | "last30days" | "thisMonth" | "lastMonth";
  startDate?: string;
  endDate?: string;
}

export interface TransactionDetails extends Transaction {
  customer?: {
    id: string;
    name: string;
    email: string;
    walletAddress?: string;
  };
  merchant?: {
    id: string;
    name: string;
    email: string;
  };
  paymentLink?: {
    id: string;
    title: string;
    amount: number;
  };
  blockchain?: {
    network: string;
    txHash?: string;
    blockNumber?: number;
    confirmations?: number;
  };
}

// ==================== Customer Types ====================

export type CustomerStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface Customer {
  id: string;
  name: string;
  email: string;
  walletAddress?: string;
  phoneNumber?: string;
  country?: string;
  status: CustomerStatus;
  totalTransactions: number;
  totalSpent: number;
  joinedDate: string;
  lastActive?: string;
}

export interface GetCustomersParams extends PaginationParams {
  search?: string;
  status?: CustomerStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CustomerDetails extends Customer {
  recentTransactions?: Transaction[];
  merchantId?: string;
  metadata?: Record<string, any>;
}

// ==================== System Health Types ====================

export interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  uptime: number;
  services: ServiceHealth[];
  incidents: Incident[];
}

export interface Incident {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  status: "open" | "investigating" | "resolved";
  createdAt: string;
  resolvedAt?: string;
}

// ==================== Settings Types ====================

export interface NotificationPreferences {
  emailAlerts: boolean;
  transactionAlerts: boolean;
  systemAlerts: boolean;
  marketingEmails: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange?: string;
  sessionTimeout: number;
}

export interface UpdateProfileRequest {
  firstname?: string;
  lastname?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UpdateNotificationsRequest {
  emailAlerts?: boolean;
  transactionAlerts?: boolean;
  systemAlerts?: boolean;
  marketingEmails?: boolean;
}
