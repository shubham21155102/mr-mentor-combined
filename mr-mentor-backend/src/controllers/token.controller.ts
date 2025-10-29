import { Response } from 'express';
import { DataSource } from 'typeorm';
import { TokenService, CreateTokenPurchaseDto } from '../services/TokenService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class TokenController {
  private readonly tokenService: TokenService;

  constructor(dataSource: DataSource) {
    this.tokenService = new TokenService(dataSource);
  }

  /**
   * Get user's current token balance
   */
  public getUserTokenBalance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const tokenBalance = await this.tokenService.getUserTokenBalance(userId);
      
      res.status(200).json({
        success: true,
        message: 'Token balance retrieved successfully',
        data: {
          tokenBalance,
          userId
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve token balance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Create a new token purchase order
   */
  public createTokenPurchase = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { tokenQuantity, amount, currency = 'INR' } = req.body;

      if (!tokenQuantity || !amount) {
        res.status(400).json({
          success: false,
          message: 'Token quantity and amount are required'
        });
        return;
      }

      if (tokenQuantity <= 0 || amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Token quantity and amount must be positive'
        });
        return;
      }

      const purchaseData: CreateTokenPurchaseDto = {
        userId,
        tokenQuantity,
        amount,
        currency
      };

      const result = await this.tokenService.createTokenPurchase(purchaseData);

      res.status(201).json({
        success: true,
        message: 'Token purchase order created successfully',
        data: {
          tokenPurchase: result.tokenPurchase,
          razorpayOrder: result.razorpayOrder,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create token purchase order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Verify payment and complete token purchase
   */
  public verifyPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        res.status(400).json({
          success: false,
          message: 'Razorpay order ID, payment ID, and signature are required'
        });
        return;
      }

      const result = await this.tokenService.verifyAndCompletePayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Payment verified and tokens added successfully',
          data: {
            tokenPurchase: result.tokenPurchase,
            newTokenBalance: await this.tokenService.getUserTokenBalance(userId)
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Payment verification failed'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get user's token purchase history
   */
  public getTokenPurchaseHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const purchaseHistory = await this.tokenService.getUserTokenPurchaseHistory(userId);

      res.status(200).json({
        success: true,
        message: 'Token purchase history retrieved successfully',
        data: purchaseHistory
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve token purchase history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get user's token usage history
   */
  public getTokenUsageHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const usageHistory = await this.tokenService.getUserTokenUsageHistory(userId);

      res.status(200).json({
        success: true,
        message: 'Token usage history retrieved successfully',
        data: usageHistory
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve token usage history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Cancel a pending token purchase
   */
  public cancelTokenPurchase = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { purchaseId } = req.params;

      if (!purchaseId) {
        res.status(400).json({
          success: false,
          message: 'Purchase ID is required'
        });
        return;
      }

      const success = await this.tokenService.cancelTokenPurchase(purchaseId);

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Token purchase cancelled successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to cancel token purchase. Purchase may not exist or already completed.'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to cancel token purchase',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Deduct tokens from user's account (for meeting bookings)
   */
  public deductTokens = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { tokenQuantity } = req.body;

      if (!tokenQuantity || tokenQuantity <= 0) {
        res.status(400).json({
          success: false,
          message: 'Valid token quantity is required'
        });
        return;
      }

      const success = await this.tokenService.deductTokensFromUser(userId, tokenQuantity);

      if (success) {
        const newBalance = await this.tokenService.getUserTokenBalance(userId);
        res.status(200).json({
          success: true,
          message: 'Tokens deducted successfully',
          data: {
            deductedTokens: tokenQuantity,
            remainingBalance: newBalance
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Insufficient token balance'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to deduct tokens',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
