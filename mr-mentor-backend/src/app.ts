import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Routes } from './routes';
import { DatabaseService } from './config/database';
import dotenv from 'dotenv';
dotenv.config();
export class App {
  public app: Application;
  private readonly routes: Routes;
  private readonly database: DatabaseService;

  constructor() {
    this.app = express();
    this.database = DatabaseService.getInstance();
    this.routes = new Routes(this.database.dataSource);
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize Express middlewares
   */
  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors());
    
    // Logging middleware
    this.app.use(morgan('combined'));
    
    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  /**
   * Initialize application routes
   */
  private initializeRoutes(): void {
    // Mount all routes
    this.app.use('/', this.routes.router);
    
    // Default route
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Express TypeScript Template API',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          users: '/api/users',
          userStats: '/api/users/stats',
          googleMeet: {
            auth: '/api/google-meet/auth/url',
            meetings: '/api/google-meet/meetings',
            join: '/api/google-meet/meetings/:meetingId/join',
            recording: '/api/google-meet/meetings/:meetingId/recording',
            notify: '/api/google-meet/meetings/:meetingId/notify'
          }
        }
      });
    });
  }

  /**
   * Initialize error handling middleware
   */
  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
      });
    });

    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Global error handler:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    });
  }

  /**
   * Initialize database connection
   */
  public async initializeDatabase(): Promise<void> {
    try {
      await this.database.initialize();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Start the Express server
   */
  public async listen(port: number): Promise<void> {
    try {
      // Initialize database connection first
      await this.initializeDatabase();
      
      this.app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
        console.log(`📊 Health check available at: http://localhost:${port}/api/health`);
        console.log(`👥 User API available at: http://localhost:${port}/api/users`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}
