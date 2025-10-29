import { Router } from 'express';
import { SlotCompletionController } from '../controllers/slotCompletion.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export class SlotCompletionRoutes {
  public router: Router;
  private readonly slotCompletionController: SlotCompletionController;

  constructor() {
    this.router = Router();
    this.slotCompletionController = new SlotCompletionController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All routes require authentication
    
    // POST /api/slots/:slotId/start - Mark meeting as started
    this.router.post('/slots/:slotId/start', authMiddleware, this.slotCompletionController.startMeeting);

    // POST /api/slots/:slotId/complete - Complete meeting and credit earnings
    this.router.post('/slots/:slotId/complete', authMiddleware, this.slotCompletionController.completeMeeting);

    // GET /api/slots/:slotId/details - Get meeting details with duration and earnings info
    this.router.get('/slots/:slotId/details', authMiddleware, this.slotCompletionController.getMeetingDetails);
  }
}

export default new SlotCompletionRoutes().router;
