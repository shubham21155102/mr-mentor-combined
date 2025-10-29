import { Request, Response } from 'express';
import { HealthService } from '../services/HealthService';

export class HealthController {
  private healthService: HealthService;

  constructor() {
    this.healthService = new HealthService();
  }

  /**
   * Handle health check endpoint
   * @param req Express request object
   * @param res Express response object
   */
  public getHealth = (req: Request, res: Response): void => {
    try {
      const healthData = this.healthService.getHealthStatus();
      const isHealthy = this.healthService.isHealthy();

      if (isHealthy) {
        res.status(200).json({
          success: true,
          data: healthData
        });
      } else {
        res.status(503).json({
          success: false,
          message: 'Service unavailable',
          data: healthData
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
