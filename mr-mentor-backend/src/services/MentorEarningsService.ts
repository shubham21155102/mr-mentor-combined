import { DatabaseService } from '../config/database';
import { MentorEarnings, MentorTransaction, TransactionType, WithdrawalStatus } from '../entities/MentorEarnings';

export class MentorEarningsService {
  private readonly db = DatabaseService.getInstance();
  private readonly mentorEarningsRepository = this.db.dataSource.getRepository(MentorEarnings);
  private readonly mentorTransactionRepository = this.db.dataSource.getRepository(MentorTransaction);

  /**
   * Get or create mentor earnings record
   */
  async getOrCreateMentorEarnings(mentorId: string): Promise<MentorEarnings> {
    let earnings = await this.mentorEarningsRepository.findOne({
      where: { mentorId }
    });

    if (!earnings) {
      earnings = this.mentorEarningsRepository.create({
        mentorId,
        totalEarnings: 0,
        availableBalance: 0,
        withdrawnAmount: 0
      });
      await this.mentorEarningsRepository.save(earnings);
    }

    return earnings;
  }

  /**
   * Add earnings for a completed session (1 token = ₹300)
   * Checks if earnings were already credited for this slot to prevent duplicates
   */
  async addEarnings(
    mentorId: string, 
    tokens: number, 
    slotId: string, 
    description?: string,
    durationMinutes?: number
  ): Promise<{ success: boolean; message: string; earnings?: MentorEarnings }> {
    // Check if earnings already credited for this slot
    const existingTransaction = await this.mentorTransactionRepository.findOne({
      where: { 
        slotId,
        type: TransactionType.EARNING
      }
    });

    if (existingTransaction) {
      return {
        success: false,
        message: `Earnings already credited for this meeting (slot: ${slotId})`
      };
    }

    const earnings = await this.getOrCreateMentorEarnings(mentorId);
    const amount = tokens * 300; // 1 token = ₹300

    // Update earnings
    earnings.totalEarnings = Number(earnings.totalEarnings) + amount;
    earnings.availableBalance = Number(earnings.availableBalance) + amount;

    // Create transaction record with duration info
    let transactionDescription = description || 'Earning from session';
    if (!description && durationMinutes) {
      transactionDescription = `Earning from session (${durationMinutes} minutes)`;
    }

    const transaction = this.mentorTransactionRepository.create({
      mentorId,
      type: TransactionType.EARNING,
      amount,
      slotId,
      description: transactionDescription
    });

    await this.mentorTransactionRepository.save(transaction);
    await this.mentorEarningsRepository.save(earnings);

    return {
      success: true,
      message: `Earnings of ₹${amount} credited successfully`,
      earnings
    };
  }

  /**
   * Get mentor earnings summary
   */
  async getMentorEarnings(mentorId: string): Promise<{
    totalEarnings: number;
    availableBalance: number;
    withdrawnAmount: number;
    lastTransaction?: MentorTransaction;
  }> {
    const earnings = await this.getOrCreateMentorEarnings(mentorId);
    
    // Get last transaction
    const lastTransaction = await this.mentorTransactionRepository.findOne({
      where: { mentorId },
      order: { createdAt: 'DESC' }
    });

    return {
      totalEarnings: Number(earnings.totalEarnings),
      availableBalance: Number(earnings.availableBalance),
      withdrawnAmount: Number(earnings.withdrawnAmount),
      lastTransaction
    };
  }

  /**
   * Request withdrawal
   */
  async requestWithdrawal(
    mentorId: string,
    amount: number,
    paymentMethod: 'UPI' | 'Bank',
    bankUPI: string
  ): Promise<{ success: boolean; message: string; transaction?: MentorTransaction }> {
    const earnings = await this.getOrCreateMentorEarnings(mentorId);

    if (Number(earnings.availableBalance) < amount) {
      return {
        success: false,
        message: 'Insufficient balance'
      };
    }

    // Create withdrawal transaction
    const transaction = this.mentorTransactionRepository.create({
      mentorId,
      type: TransactionType.WITHDRAWAL,
      amount: -amount, // Negative for withdrawal
      status: WithdrawalStatus.REQUESTED,
      paymentMethod,
      bankUPI,
      description: `Withdrawal request via ${paymentMethod}`
    });

    await this.mentorTransactionRepository.save(transaction);

    // Update available balance
    earnings.availableBalance = Number(earnings.availableBalance) - amount;
    await this.mentorEarningsRepository.save(earnings);

    return {
      success: true,
      message: 'Withdrawal request submitted successfully',
      transaction
    };
  }

  /**
   * Get payment history with pagination
   */
  async getPaymentHistory(
    mentorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    transactions: MentorTransaction[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.mentorTransactionRepository.findAndCount({
      where: { mentorId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    });

    return {
      transactions,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Complete withdrawal (admin only)
   */
  async completeWithdrawal(transactionId: string, transactionRefId: string): Promise<MentorTransaction> {
    const transaction = await this.mentorTransactionRepository.findOne({
      where: { id: transactionId }
    });

    if (!transaction || transaction.type !== TransactionType.WITHDRAWAL) {
      throw new Error('Transaction not found');
    }

    transaction.status = WithdrawalStatus.COMPLETED;
    transaction.transactionId = transactionRefId;
    transaction.completedAt = new Date();

    const earnings = await this.getOrCreateMentorEarnings(transaction.mentorId);
    earnings.withdrawnAmount = Number(earnings.withdrawnAmount) + Math.abs(Number(transaction.amount));
    
    await this.mentorEarningsRepository.save(earnings);
    await this.mentorTransactionRepository.save(transaction);

    return transaction;
  }

  /**
   * Get withdrawal requests (admin only)
   */
  async getWithdrawalRequests(status?: WithdrawalStatus): Promise<MentorTransaction[]> {
    const where: any = { type: TransactionType.WITHDRAWAL };
    
    if (status) {
      where.status = status;
    }

    return await this.mentorTransactionRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['mentor']
    });
  }
}
