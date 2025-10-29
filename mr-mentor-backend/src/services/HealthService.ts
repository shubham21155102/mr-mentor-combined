import { HealthResponse } from '../types/health.types';
import { DatabaseService } from '../config/database';

export class HealthService {
  /**
   * Get health status of the application
   * @returns {HealthResponse} Health status information
   */
  public getHealthStatus(): HealthResponse {
    const database = DatabaseService.getInstance();
    
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: database.isConnected(),
        type: 'postgresql'
      }
    };
  }

  /**
   * Check if the application is healthy
   * @returns {boolean} True if healthy, false otherwise
   */
  public isHealthy(): boolean {
    const database = DatabaseService.getInstance();
    
    // Check database connection
    if (!database.isConnected()) {
      return false;
    }
    
    // Add other health checks here (external services, etc.)
    return true;
  }
}
