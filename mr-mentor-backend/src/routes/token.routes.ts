import { Router } from 'express';
import { TokenController } from '../controllers/token.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { DataSource } from 'typeorm';

export class TokenRoutes {
  public router: Router;
  private readonly tokenController: TokenController;

  constructor(dataSource: DataSource) {
    this.router = Router();
    this.tokenController = new TokenController(dataSource);
    this.initializeRoutes();
  }

  /**
   * Initialize token routes
   */
  private initializeRoutes(): void {
    // GET /api/tokens/balance - Get user's current token balance
    this.router.get('/tokens/balance', authMiddleware, this.tokenController.getUserTokenBalance);
    
    // POST /api/tokens/purchase - Create a new token purchase order
    this.router.post('/tokens/purchase', authMiddleware, this.tokenController.createTokenPurchase);
    
    // POST /api/tokens/verify-payment - Verify payment and complete token purchase
    this.router.post('/tokens/verify-payment', authMiddleware, this.tokenController.verifyPayment);
    
    // GET /api/tokens/history - Get user's token purchase history
    this.router.get('/tokens/history', authMiddleware, this.tokenController.getTokenPurchaseHistory);
    
    // GET /api/tokens/usage-history - Get user's token usage history
    this.router.get('/tokens/usage-history', authMiddleware, this.tokenController.getTokenUsageHistory);
    
    // DELETE /api/tokens/purchase/:purchaseId - Cancel a pending token purchase
    this.router.delete('/tokens/purchase/:purchaseId', authMiddleware, this.tokenController.cancelTokenPurchase);
    
    // POST /api/tokens/deduct - Deduct tokens from user's account
    this.router.post('/tokens/deduct', authMiddleware, this.tokenController.deductTokens);
  }
}
