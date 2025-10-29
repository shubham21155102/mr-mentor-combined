import { useState, useCallback } from 'react';
import { TokenService, TokenPurchaseRequest, PaymentVerificationRequest } from '../lib/tokenService';
import { useAuth } from './useAuth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayConfig {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, backendToken } = useAuth();

  const loadRazorpayScript = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => {
        setError('Failed to load Razorpay script');
        resolve();
      };
      document.body.appendChild(script);
    });
  }, []);

  const createTokenPurchase = useCallback(async (data: TokenPurchaseRequest) => {
    if (!isAuthenticated || !backendToken) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await TokenService.createTokenPurchase(data, backendToken);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create token purchase';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, backendToken]);

  const verifyPayment = useCallback(async (data: PaymentVerificationRequest) => {
    if (!isAuthenticated || !backendToken) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await TokenService.verifyPayment(data, backendToken);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Payment verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, backendToken]);

  const openRazorpay = useCallback(async (config: RazorpayConfig) => {
    try {
      await loadRazorpayScript();
      
      if (!window.Razorpay) {
        throw new Error('Razorpay script not loaded');
      }

      const razorpay = new window.Razorpay(config);
      razorpay.open();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [loadRazorpayScript]);

  const purchaseTokens = useCallback(async (
    tokenQuantity: number,
    amount: number,
    userInfo?: { name?: string; email?: string; contact?: string },
    onPaymentSuccess?: (result: { success: boolean; error?: string; response?: any }) => void
  ) => {
    if (!isAuthenticated || !backendToken) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setLoading(true);
      setError(null);

      // Create token purchase order
      const purchaseResponse = await createTokenPurchase({
        tokenQuantity,
        amount,
        currency: 'INR'
      });

      // Configure Razorpay
      const razorpayConfig: RazorpayConfig = {
        key: purchaseResponse.razorpayKeyId,
        amount: purchaseResponse.razorpayOrder.amount,
        currency: purchaseResponse.razorpayOrder.currency,
        name: 'MR Mentor',
        description: `Purchase ${tokenQuantity} tokens`,
        order_id: purchaseResponse.razorpayOrder.id,
        prefill: userInfo,
        notes: {
          tokenPurchaseId: purchaseResponse.tokenPurchase.id,
          tokenQuantity: tokenQuantity.toString()
        },
        theme: {
          color: '#1a97a4'
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verificationResult = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            
            // Payment successful
            console.log('Payment successful:', response);
            const result = { success: true, response, verificationResult };
            if (onPaymentSuccess) {
              onPaymentSuccess(result);
            }
            return result;
          } catch (err: any) {
            console.error('Payment verification failed:', err);
            const result = { success: false, error: err.message };
            if (onPaymentSuccess) {
              onPaymentSuccess(result);
            }
            return result;
          }
        }
      };

      // Open Razorpay checkout
      await openRazorpay(razorpayConfig);
      
      // Return immediately - success will be handled in the handler callback
      return { success: true, message: 'Payment window opened' };
    } catch (err: any) {
      console.error('Token purchase failed:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, backendToken, createTokenPurchase, verifyPayment, openRazorpay]);

  return {
    purchaseTokens,
    loading,
    error,
    clearError: () => setError(null)
  };
};
