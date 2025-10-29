import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Token } from '../entities/Tokens';
import { GoogleAuthTokens } from '../entities/GoogleAuthTokens';
import { Mentor } from '../entities/Mentor';
import { Slots } from '../entities/Slots';
import { SlotsFeedBack } from '../entities/SlotsFeedBack';
import { Issues } from '../entities/Issues';
import { TokenPurchase } from '../entities/TokenPurchase';
import { TokenUsage } from '../entities/TokenUsage';
import { MentorEarnings, MentorTransaction } from '../entities/MentorEarnings';

export class DatabaseService {
  private static instance: DatabaseService;
  public dataSource: DataSource;

  private constructor() {
    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'shubham',
      password: process.env.DB_PASSWORD || 'shubham',
      database: process.env.DB_NAME || 'template',
    //   synchronize: process.env.NODE_ENV === 'development', // Auto-sync in development
      synchronize: true, // Auto-sync in development
      logging: process.env.NODE_ENV === 'development' ? ['query', 'error', 'schema'] : false,
      dropSchema: false, // Don't drop existing data
      entities: [User, Token, GoogleAuthTokens, Mentor, Slots, SlotsFeedBack, Issues, TokenPurchase, TokenUsage, MentorEarnings, MentorTransaction],
      migrations: ['src/migrations/**/*.ts'],
      subscribers: ['src/subscribers/**/*.ts'],
      ssl: { rejectUnauthorized: false }
    });
  }

  /**
   * Get singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database connection
   */
  public async initialize(): Promise<void> {
    try {
      if (!this.dataSource.isInitialized) {
        console.log('🔄 Initializing database connection...');
        console.log('� Auto-synchronization is ENABLED for development mode');
        
        await this.dataSource.initialize();
        console.log('�️  Database connection established successfully');
        console.log('✅ Database schema auto-synchronized (if changes detected)');
      }
    } catch (error) {
      console.error('❌ Error during database initialization:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        console.log('🗄️  Database connection closed successfully');
      }
    } catch (error) {
      console.error('❌ Error during database connection closure:', error);
      throw error;
    }
  }

  /**
   * Get database connection status
   */
  public isConnected(): boolean {
    return this.dataSource.isInitialized;
  }
}
