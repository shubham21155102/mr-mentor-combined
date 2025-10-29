import { DataSource, Repository } from 'typeorm';
import { Token } from '../entities/Tokens';
import { TokenPurchase, PaymentStatus } from '../entities/TokenPurchase';
import { User } from '../entities/User';
import { TokenUsage, TokenUsageType } from '../entities/TokenUsage';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export interface CreateTokenPurchaseDto {
  userId: string;
  tokenQuantity: number;
  amount: number;
  currency?: string;
}

export interface RazorpayOrderResponse {
  id: string;
  // Razorpay returns an 'entity' field (e.g., 'order')
  entity?: string;
  amount: number;
  // amount fields may be present
  amount_paid?: number;
  amount_due?: number;
  currency: string;
  receipt?: string;
  offer_id?: string | null;
  status: string;
  attempts?: number;
  notes?: Record<string, any>;
  created_at?: number;
}

export class TokenService {
  private readonly tokenRepository: Repository<Token>;
  private readonly tokenPurchaseRepository: Repository<TokenPurchase>;
  private readonly tokenUsageRepository: Repository<TokenUsage>;
  private readonly userRepository: Repository<User>;
  private readonly razorpay: Razorpay;

  constructor(dataSource: DataSource) {
    this.tokenRepository = dataSource.getRepository(Token);
    this.tokenPurchaseRepository = dataSource.getRepository(TokenPurchase);
    this.tokenUsageRepository = dataSource.getRepository(TokenUsage);
    this.userRepository = dataSource.getRepository(User);
    
    // Initialize Razorpay only if keys are provided
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
    } else {
      console.warn('Razorpay keys not configured. Token purchase functionality will be limited.');
      this.razorpay = null as any;
    }
  }

  /**
   * Get user's current token balance
   */
  async getUserTokenBalance(userId: string): Promise<number> {
    const token = await this.tokenRepository.findOne({
      where: { userId }
    });
    return token?.token || 0;
  }

  /**
   * Create a new token purchase order
   */
  async createTokenPurchase(data: CreateTokenPurchaseDto): Promise<{ tokenPurchase: TokenPurchase; razorpayOrder: RazorpayOrderResponse }> {
    try {
      const { userId, tokenQuantity, amount, currency = 'INR' } = data;

      // Verify user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      // Check if Razorpay is initialized
      if (!this.razorpay) {
        throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
      }

      // Create token purchase record
      const tokenPurchase = this.tokenPurchaseRepository.create({
        userId,
        tokenQuantity,
        amount,
        currency,
        paymentStatus: PaymentStatus.PENDING
      });

      const savedTokenPurchase = await this.tokenPurchaseRepository.save(tokenPurchase);

      // Create Razorpay order
      // Generate a shorter receipt ID (max 40 characters for Razorpay)
      const receiptId = `tp_${savedTokenPurchase.id.substring(0, 36)}`;
      const razorpayOrder = await this.razorpay.orders.create({
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: receiptId,
        notes: {
          tokenPurchaseId: savedTokenPurchase.id,
          userId,
          tokenQuantity: tokenQuantity.toString()
        }
      });

      // Update token purchase with Razorpay order ID
      savedTokenPurchase.razorpayOrderId = razorpayOrder.id;
      await this.tokenPurchaseRepository.save(savedTokenPurchase);

      return {
        tokenPurchase: savedTokenPurchase,
        razorpayOrder: {
          id: razorpayOrder.id,
          entity: razorpayOrder.entity,
          amount: typeof razorpayOrder.amount === 'string' ? parseInt(razorpayOrder.amount, 10) : razorpayOrder.amount,
          amount_paid: typeof razorpayOrder.amount_paid === 'string' ? parseInt(razorpayOrder.amount_paid, 10) : razorpayOrder.amount_paid,
          amount_due: typeof razorpayOrder.amount_due === 'string' ? parseInt(razorpayOrder.amount_due, 10) : razorpayOrder.amount_due,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
          offer_id: razorpayOrder.offer_id,
          status: razorpayOrder.status,
          attempts: typeof razorpayOrder.attempts === 'string' ? parseInt(razorpayOrder.attempts, 10) : razorpayOrder.attempts,
          notes: razorpayOrder.notes,
          created_at: typeof razorpayOrder.created_at === 'string' ? parseInt(razorpayOrder.created_at, 10) : razorpayOrder.created_at
        }
      };
    } catch (error) {
      console.error('Error in createTokenPurchase:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Unknown error occurred: ${JSON.stringify(error)}`);
      }
    }
  }

  /**
   * Verify and complete payment
   */
  async verifyAndCompletePayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<{ success: boolean; tokenPurchase?: TokenPurchase; error?: string }> {
    try {
      // Check if Razorpay is initialized
      if (!this.razorpay) {
        return { success: false, error: 'Razorpay is not configured' };
      }

      // Find the token purchase
      const tokenPurchase = await this.tokenPurchaseRepository.findOne({
        where: { razorpayOrderId }
      });

      if (!tokenPurchase) {
        return { success: false, error: 'Token purchase not found' };
      }

      if (tokenPurchase.paymentStatus === PaymentStatus.COMPLETED) {
        return { success: false, error: 'Payment already completed' };
      }

      // Verify the signature
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return { success: false, error: 'Invalid signature' };
      }

      // Update token purchase status
      tokenPurchase.paymentStatus = PaymentStatus.COMPLETED;
      tokenPurchase.razorpayPaymentId = razorpayPaymentId;
      tokenPurchase.razorpaySignature = razorpaySignature;
      tokenPurchase.completedAt = new Date();

      await this.tokenPurchaseRepository.save(tokenPurchase);

      // Add tokens to user's account
      await this.addTokensToUser(tokenPurchase.userId, tokenPurchase.tokenQuantity);

      return { success: true, tokenPurchase };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { success: false, error: 'Payment verification failed' };
    }
  }

  /**
   * Add tokens to user's account
   */
  async addTokensToUser(
    userId: string,
    tokenQuantity: number,
    options?: {
      usageType?: TokenUsageType;
      slotId?: string;
      description?: string;
      referenceId?: string;
    }
  ): Promise<void> {
    let userToken = await this.tokenRepository.findOne({
      where: { userId }
    });

    const balanceBefore = Number(userToken?.token || 0);
    const balanceAfter = balanceBefore + tokenQuantity;

    if (!userToken) {
      // Create new token record for user
      userToken = this.tokenRepository.create({
        userId,
        token: tokenQuantity,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      });
    } else {
      // Add to existing tokens
      userToken.token = balanceAfter;
      if (!userToken.expiresAt) {
        userToken.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      }
    }

    await this.tokenRepository.save(userToken);

    // Record token usage if options are provided (for refunds, bonuses, etc.)
    if (options) {
      await this.recordTokenUsage(
        userId,
        tokenQuantity,
        options.usageType || TokenUsageType.REFUND,
        balanceBefore,
        balanceAfter,
        options.slotId,
        options.description,
        options.referenceId
      );
    }
  }

  /**
   * Record token usage in database
   */
  async recordTokenUsage(
    userId: string,
    tokensUsed: number,
    usageType: TokenUsageType,
    balanceBefore: number,
    balanceAfter: number,
    slotId?: string,
    description?: string,
    referenceId?: string
  ): Promise<void> {
    const tokenUsage = this.tokenUsageRepository.create({
      userId,
      slotId,
      usageType,
      tokensUsed,
      balanceBefore,
      balanceAfter,
      description,
      referenceId
    });

    await this.tokenUsageRepository.save(tokenUsage);
  }

  /**
   * Deduct tokens from user's account
   */
  async deductTokensFromUser(
    userId: string,
    tokenQuantity: number,
    options?: {
      usageType?: TokenUsageType;
      slotId?: string;
      description?: string;
      referenceId?: string;
    }
  ): Promise<boolean> {
    const userToken = await this.tokenRepository.findOne({
      where: { userId }
    });

    if (!userToken || Number(userToken.token || 0) < tokenQuantity) {
      return false; // Insufficient tokens
    }

    const balanceBefore = Number(userToken.token || 0);
    const balanceAfter = balanceBefore - tokenQuantity;

    userToken.token = balanceAfter;
    await this.tokenRepository.save(userToken);

    // Record token usage if options are provided
    if (options) {
      await this.recordTokenUsage(
        userId,
        tokenQuantity,
        options.usageType || TokenUsageType.MEETING_BOOKING,
        balanceBefore,
        balanceAfter,
        options.slotId,
        options.description,
        options.referenceId
      );
    }

    return true;
  }

  /**
   * Get user's token purchase history
   */
  async getUserTokenPurchaseHistory(userId: string): Promise<TokenPurchase[]> {
    return await this.tokenPurchaseRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get user's token usage history
   */
  async getUserTokenUsageHistory(userId: string): Promise<TokenUsage[]> {
    return await this.tokenUsageRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['slot']
    });
  }

  /**
   * Get token purchase by ID
   */
  async getTokenPurchaseById(id: string): Promise<TokenPurchase | null> {
    return await this.tokenPurchaseRepository.findOne({
      where: { id },
      relations: ['user']
    });
  }

  /**
   * Cancel a pending token purchase
   */
  async cancelTokenPurchase(id: string): Promise<boolean> {
    const tokenPurchase = await this.tokenPurchaseRepository.findOne({
      where: { id }
    });

    if (!tokenPurchase || tokenPurchase.paymentStatus !== PaymentStatus.PENDING) {
      return false;
    }

    tokenPurchase.paymentStatus = PaymentStatus.CANCELLED;
    await this.tokenPurchaseRepository.save(tokenPurchase);
    return true;
  }
}
