import { Request, Response } from 'express';
import { MentorEarningsService } from '../services/MentorEarningsService';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class MentorEarningsController {
  private mentorEarningsService: MentorEarningsService;

  constructor() {
    this.mentorEarningsService = new MentorEarningsService();
  }

  /**
   * Get mentor earnings summary
   * GET /api/mentor/earnings
   */
  public getEarnings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const earnings = await this.mentorEarningsService.getMentorEarnings(userId);

      res.status(200).json({
        success: true,
        data: earnings
      });
    } catch (error) {
      console.error('Error fetching mentor earnings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch earnings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Request withdrawal
   * POST /api/mentor/withdraw
   */
  public requestWithdrawal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { amount, paymentMethod, bankUPI } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      if (!amount || !paymentMethod || !bankUPI) {
        res.status(400).json({
          success: false,
          message: 'Amount, payment method, and bank/UPI details are required'
        });
        return;
      }

      if (paymentMethod !== 'UPI' && paymentMethod !== 'Bank') {
        res.status(400).json({
          success: false,
          message: 'Invalid payment method. Must be UPI or Bank'
        });
        return;
      }

      const result = await this.mentorEarningsService.requestWithdrawal(
        userId,
        amount,
        paymentMethod,
        bankUPI
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to request withdrawal',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get payment history with pagination
   * GET /api/mentor/payment-history?page=1&limit=10
   */
  public getPaymentHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const history = await this.mentorEarningsService.getPaymentHistory(userId, page, limit);

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get withdrawal requests (Admin only)
   * GET /api/mentor/withdrawal-requests?status=requested
   */
  public getWithdrawalRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const status = req.query.status as any;

      const requests = await this.mentorEarningsService.getWithdrawalRequests(status);

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch withdrawal requests',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Complete withdrawal (Admin only)
   * POST /api/mentor/complete-withdrawal
   */
  public completeWithdrawal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { transactionId, transactionRefId } = req.body;

      if (!transactionId || !transactionRefId) {
        res.status(400).json({
          success: false,
          message: 'Transaction ID and reference ID are required'
        });
        return;
      }

      const transaction = await this.mentorEarningsService.completeWithdrawal(
        transactionId,
        transactionRefId
      );

      res.status(200).json({
        success: true,
        message: 'Withdrawal completed successfully',
        data: transaction
      });
    } catch (error) {
      console.error('Error completing withdrawal:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete withdrawal',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
