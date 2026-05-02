// ─── USER ROLES ──────────────────────────────────────────────
export enum UserRole {
  ADMIN    = 'admin',
  CUSTOMER = 'customer',
  VENDOR   = 'vendor',
}

// ─── ORDER STATUS ─────────────────────────────────────────────
export enum OrderStatus {
  PENDING    = 'pending',
  CONFIRMED  = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED    = 'shipped',
  DELIVERED  = 'delivered',
  CANCELLED  = 'cancelled',
  REFUNDED   = 'refunded',
}

// ─── PAYMENT STATUS ───────────────────────────────────────────
export enum PaymentStatus {
  PENDING   = 'pending',
  COMPLETED = 'completed',
  FAILED    = 'failed',
  REFUNDED  = 'refunded',
}

// ─── PAYMENT METHOD ───────────────────────────────────────────
export enum PaymentMethod {
  CARD         = 'card',
  COD          = 'cod',
  UPI          = 'upi',
  BANK_TRANSFER = 'bank_transfer',
}

// ─── PRODUCT STATUS ───────────────────────────────────────────
export enum ProductStatus {
  ACTIVE       = 'active',
  INACTIVE     = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DRAFT        = 'draft',
}

// ─── SORT DIRECTION ───────────────────────────────────────────
export enum SortDirection {
  ASC  = 'ASC',
  DESC = 'DESC',
}

// ─── EVENTS ───────────────────────────────────────────────────
export const EVENTS = {
  USER_REGISTERED:    'user.registered',
  ORDER_PLACED:       'order.placed',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  PAYMENT_SUCCESS:    'payment.success',
  PAYMENT_FAILED:     'payment.failed',
  PASSWORD_RESET:     'password.reset',
} as const;

// ─── PAGINATION ───────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT:     100,
} as const;