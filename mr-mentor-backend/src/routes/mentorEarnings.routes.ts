import { Router } from 'express';
import { MentorEarningsController } from '../controllers/mentorEarnings.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

export class MentorEarningsRoutes {
  public router: Router;
  private readonly mentorEarningsController: MentorEarningsController;

  constructor() {
    this.router = Router();
    this.mentorEarningsController = new MentorEarningsController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Mentor routes (require authentication)
    // GET /api/mentor/earnings - Get earnings summary
    this.router.get('/mentor/earnings', authMiddleware, this.mentorEarningsController.getEarnings);

    // POST /api/mentor/withdraw - Request withdrawal
    this.router.post('/mentor/withdraw', authMiddleware, this.mentorEarningsController.requestWithdrawal);

    // GET /api/mentor/payment-history - Get payment history
    this.router.get('/mentor/payment-history', authMiddleware, this.mentorEarningsController.getPaymentHistory);

    // Admin routes (require admin authentication)
    // GET /api/mentor/withdrawal-requests - Get all withdrawal requests
    this.router.get('/mentor/withdrawal-requests', authMiddleware, adminMiddleware, this.mentorEarningsController.getWithdrawalRequests);

    // POST /api/mentor/complete-withdrawal - Complete withdrawal
    this.router.post('/mentor/complete-withdrawal', authMiddleware, adminMiddleware, this.mentorEarningsController.completeWithdrawal);
  }
}

export default new MentorEarningsRoutes().router;
