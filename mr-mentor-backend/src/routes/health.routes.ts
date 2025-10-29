import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export class HealthRoutes {
  public router: Router;
  private healthController: HealthController;

  constructor() {
    this.router = Router();
    this.healthController = new HealthController();
    this.initializeRoutes();
  }

  /**
   * Initialize health routes
   */
  private initializeRoutes(): void {
    // GET /api/health - Health check endpoint
    this.router.get('/health', this.healthController.getHealth);
  }
}
