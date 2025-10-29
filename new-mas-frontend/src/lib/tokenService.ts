import { api, createApiWithToken } from './api';

export interface TokenBalance {
  tokenBalance: number;
  userId: string;
}

export interface TokenPurchaseRequest {
  tokenQuantity: number;
  amount: number;
  currency?: string;
}

export interface TokenPurchaseResponse {
  tokenPurchase: {
    id: string;
    userId: string;
    tokenQuantity: number;
    amount: number;
    currency: string;
    paymentStatus: string;
    razorpayOrderId: string;
    createdAt: string;
  };
  razorpayOrder: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
  razorpayKeyId: string;
}

export interface PaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentVerificationResponse {
  tokenPurchase: {
    id: string;
    userId: string;
    tokenQuantity: number;
    amount: number;
    currency: string;
    paymentStatus: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    completedAt: string;
  };
  newTokenBalance: number;
}

export interface TokenPurchaseHistory {
  id: string;
  userId: string;
  tokenQuantity: number;
  amount: number;
  currency: string;
  paymentStatus: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface TokenUsageHistory {
  id: string;
  userId: string;
  slotId?: string;
  usageType: 'meeting_booking' | 'penalty' | 'refund' | 'bonus';
  tokensUsed: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceId?: string;
  createdAt: string;
  slot?: {
    id: string;
    title?: string;
  };
}

export class TokenService {
  /**
   * Get user's current token balance
   */
  static async getTokenBalance(token?: string): Promise<TokenBalance> {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.get('/api/tokens/balance');
    return response.data.data;
  }

  /**
   * Create a new token purchase order
   */
  static async createTokenPurchase(data: TokenPurchaseRequest, token?: string): Promise<TokenPurchaseResponse> {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.post('/api/tokens/purchase', data);
    return response.data.data;
  }

  /**
   * Verify payment and complete token purchase
   */
  static async verifyPayment(data: PaymentVerificationRequest, token?: string): Promise<PaymentVerificationResponse> {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.post('/api/tokens/verify-payment', data);
    return response.data.data;
  }

  /**
   * Get user's token purchase history
   */
  static async getTokenPurchaseHistory(token?: string): Promise<TokenPurchaseHistory[]> {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.get('/api/tokens/history');
    return response.data.data;
  }

  /**
   * Get user's token usage history
   */
  static async getTokenUsageHistory(token?: string): Promise<TokenUsageHistory[]> {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.get('/api/tokens/usage-history');
    return response.data.data;
  }

  /**
   * Cancel a pending token purchase
   */
  static async cancelTokenPurchase(purchaseId: string, token?: string): Promise<void> {
    const apiInstance = token ? createApiWithToken(token) : api;
    await apiInstance.delete(`/api/tokens/purchase/${purchaseId}`);
  }

  /**
   * Deduct tokens from user's account
   */
  static async deductTokens(tokenQuantity: number, token?: string): Promise<{ deductedTokens: number; remainingBalance: number }> {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.post('/api/tokens/deduct', { tokenQuantity });
    return response.data.data;
  }
}
