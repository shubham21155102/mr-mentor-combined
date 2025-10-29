import { DataSource, Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../entities/User';
import { UserRole } from '../types/UserTypes';
import { Slots, MeetingStatus } from '../entities/Slots';
import { TokenPurchase } from '../entities/TokenPurchase';
import { Token } from '../entities/Tokens';

interface ConnectsData {
  completed: number;
  scheduled: number;
  cancelled: number;
}

interface RevenueData {
  amount: number;
  fromTokens: number;
}

interface TokensData {
  total: number;
  used: number;
  remaining: number;
}

interface UsersData {
  total: number;
  active: number;
  new: number;
}

interface TrendData {
  day: string;
  value: number;
}

interface DashboardData {
  connects: ConnectsData;
  revenue: RevenueData;
  tokens: TokensData;
  users: UsersData;
  connectsTrend: {
    completed: TrendData[];
    scheduled: TrendData[];
    cancelled: TrendData[];
  };
  revenueTrend: TrendData[];
  tokensTrend: TrendData[];
  usersTrend: TrendData[];
}

export class AdminDashboardService {
  private userRepository: Repository<User>;
  private slotsRepository: Repository<Slots>;
  private tokenPurchaseRepository: Repository<TokenPurchase>;
  private tokenRepository: Repository<Token>;

  constructor(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
    this.slotsRepository = dataSource.getRepository(Slots);
    this.tokenPurchaseRepository = dataSource.getRepository(TokenPurchase);
    this.tokenRepository = dataSource.getRepository(Token);
  }

  async getDashboardData(): Promise<DashboardData> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Connects
    const completed = await this.slotsRepository.count({ where: { status: MeetingStatus.COMPLETED } });
    const scheduled = await this.slotsRepository.count({ where: { status: MeetingStatus.CONFIRMED } }) +
                      await this.slotsRepository.count({ where: { status: MeetingStatus.TENTATIVE } });
    const cancelled = await this.slotsRepository.count({ where: { status: MeetingStatus.CANCELLED } });

    // Revenue
    const revenueResult = await this.tokenPurchaseRepository
      .createQueryBuilder('tp')
      .select('SUM(tp.amount)', 'total')
      .where('tp.paymentStatus = :status', { status: 'completed' })
      .getRawOne();
    const revenue = parseFloat(revenueResult?.total || '0');
    const fromTokens = Math.floor(revenue / 300); // since 1 token = 300 INR

    // Tokens
    const tokensResult = await this.tokenPurchaseRepository
      .createQueryBuilder('tp')
      .select('SUM(tp.tokenQuantity)', 'total')
      .where('tp.paymentStatus = :status', { status: 'completed' })
      .getRawOne();
    const totalTokens = parseInt(tokensResult?.total || '0');
    const usedTokens = completed + scheduled; // assuming each connect uses 1 token
    const remainingTokens = totalTokens - usedTokens;

    // Users
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { updatedAt: MoreThanOrEqual(thirtyDaysAgo) } });
    const newUsers = await this.userRepository.count({ where: { createdAt: MoreThanOrEqual(sevenDaysAgo) } });

    // Trends
    const connectsTrend = await this.getConnectsTrend(sevenDaysAgo);
    const revenueTrend = await this.getRevenueTrend(sevenDaysAgo);
    const tokensTrend = await this.getTokensTrend(sevenDaysAgo);
    const usersTrend = await this.getUsersTrend(sevenDaysAgo);

    return {
      connects: { completed, scheduled, cancelled },
      revenue: { amount: revenue, fromTokens },
      tokens: { total: totalTokens, used: usedTokens, remaining: remainingTokens },
      users: { total: totalUsers, active: activeUsers, new: newUsers },
      connectsTrend,
      revenueTrend,
      tokensTrend,
      usersTrend,
    };
  }

  private async getConnectsTrend(since: Date): Promise<{ completed: TrendData[], scheduled: TrendData[], cancelled: TrendData[] }> {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const completedTrend: TrendData[] = [];
    const scheduledTrend: TrendData[] = [];
    const cancelledTrend: TrendData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const completed = await this.slotsRepository
        .createQueryBuilder('s')
        .where('s.status = :status', { status: MeetingStatus.COMPLETED })
        .andWhere('s.startDateTime >= :start', { start: date })
        .andWhere('s.startDateTime < :end', { end: nextDate })
        .getCount();
      const scheduled = await this.slotsRepository
        .createQueryBuilder('s')
        .where('s.status IN (:...statuses)', { statuses: [MeetingStatus.CONFIRMED, MeetingStatus.TENTATIVE] })
        .andWhere('s.startDateTime >= :start', { start: date })
        .andWhere('s.startDateTime < :end', { end: nextDate })
        .getCount();
      const cancelled = await this.slotsRepository
        .createQueryBuilder('s')
        .where('s.status = :status', { status: MeetingStatus.CANCELLED })
        .andWhere('s.startDateTime >= :start', { start: date })
        .andWhere('s.startDateTime < :end', { end: nextDate })
        .getCount();

      const day = days[date.getDay()];
      completedTrend.push({ day, value: completed });
      scheduledTrend.push({ day, value: scheduled });
      cancelledTrend.push({ day, value: cancelled });
    }

    return { completed: completedTrend, scheduled: scheduledTrend, cancelled: cancelledTrend };
  }

  private async getRevenueTrend(since: Date): Promise<TrendData[]> {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const trend: TrendData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const result = await this.tokenPurchaseRepository
        .createQueryBuilder('tp')
        .select('SUM(tp.amount)', 'total')
        .where('tp.paymentStatus = :status', { status: 'completed' })
        .andWhere('tp.createdAt >= :start', { start: date })
        .andWhere('tp.createdAt < :end', { end: nextDate })
        .getRawOne();
      const value = parseFloat(result?.total || '0');

      const day = days[date.getDay()];
      trend.push({ day, value });
    }

    return trend;
  }

  private async getTokensTrend(since: Date): Promise<TrendData[]> {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const trend: TrendData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const result = await this.tokenPurchaseRepository
        .createQueryBuilder('tp')
        .select('SUM(tp.tokenQuantity)', 'total')
        .where('tp.paymentStatus = :status', { status: 'completed' })
        .andWhere('tp.createdAt >= :start', { start: date })
        .andWhere('tp.createdAt < :end', { end: nextDate })
        .getRawOne();
      const value = parseInt(result?.total || '0');

      const day = days[date.getDay()];
      trend.push({ day, value });
    }

    return trend;
  }

  private async getUsersTrend(since: Date): Promise<TrendData[]> {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const trend: TrendData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const value = await this.userRepository
        .createQueryBuilder('u')
        .where('u.createdAt >= :start', { start: date })
        .andWhere('u.createdAt < :end', { end: nextDate })
        .getCount();

      const day = days[date.getDay()];
      trend.push({ day, value });
    }

    return trend;
  }

  // User management methods
  public async getAllAdmins(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    try {
      const [users, total] = await this.userRepository.findAndCount({
        where: { role: UserRole.ADMIN },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' }
      });
      return { users, total };
    } catch (error) {
      throw new Error(`Failed to fetch admins: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getAllMentees(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    try {
      const [users, total] = await this.userRepository.findAndCount({
        where: { role: UserRole.USER },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' }
      });
      return { users, total };
    } catch (error) {
      throw new Error(`Failed to fetch mentees: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getAllExperts(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    try {
      const [users, total] = await this.userRepository.findAndCount({
        where: { role: UserRole.EXPERT },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' }
      });
      return { users, total };
    } catch (error) {
      throw new Error(`Failed to fetch experts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async addExpert(userData: { fullName: string; email: string; phone?: string; profession?: string; domain?: string; profilePhoto?: string }): Promise<User> {
    try {
      const user = this.userRepository.create({
        ...userData,
        role: UserRole.EXPERT,
        isVerified: true, // Assuming admin adds verified users
        isProfileComplete: true
      });
      return await this.userRepository.save(user);
    } catch (error) {
      throw new Error(`Failed to add expert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async addAdmin(userData: { fullName: string; email: string; phone?: string; profession?: string; domain?: string; profilePhoto?: string }): Promise<User> {
    try {
      const user = this.userRepository.create({
        ...userData,
        role: UserRole.ADMIN,
        isVerified: true,
        isProfileComplete: true
      });
      return await this.userRepository.save(user);
    } catch (error) {
      throw new Error(`Failed to add admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async addStudent(userData: { fullName: string; email: string; phone?: string; profession?: string; domain?: string; profilePhoto?: string }): Promise<User> {
    try {
      const user = this.userRepository.create({
        ...userData,
        role: UserRole.USER,
        isVerified: true,
        isProfileComplete: true
      });
      return await this.userRepository.save(user);
    } catch (error) {
      throw new Error(`Failed to add student: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async removeUser(id: string): Promise<boolean> {
    try {
      const result = await this.userRepository.delete(id);
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      throw new Error(`Failed to remove user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getUserById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      const user = await this.getUserById(id);
      if (!user) {
        return null;
      }
      Object.assign(user, userData);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}