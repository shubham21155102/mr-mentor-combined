import { Router } from 'express';
import { HealthRoutes } from './health.routes';
import { UserRoutes } from './user.routes';
import { AuthRoutes } from './auth.routes';
import { DataSource } from 'typeorm';
import { MentorRoutes } from './mentor.routes';
import { TokenRoutes } from './token.routes';
import { IssuesRoutes } from './issues.routes';
import { RecordingRoutes } from './recording.routes';
import { AdminRoutes } from './admin.routes';
import { MentorEarningsRoutes } from './mentorEarnings.routes';
import { SlotCompletionRoutes } from './slotCompletion.routes';

export class Routes {
  public router: Router;
  private readonly healthRoutes: HealthRoutes;
  private readonly userRoutes: UserRoutes;
  private readonly authRoutes: AuthRoutes;
  private readonly tokenRoutes: TokenRoutes;
  private readonly mentorsRoutes: MentorRoutes;
  private readonly issuesRoutes: IssuesRoutes;
  private readonly recordingRoutes: RecordingRoutes;
  private readonly adminRoutes: AdminRoutes;
  private readonly mentorEarningsRoutes: MentorEarningsRoutes;
  private readonly slotCompletionRoutes: SlotCompletionRoutes;
  
  constructor(dataSource: DataSource) {
    this.router = Router();
    this.healthRoutes = new HealthRoutes();
    this.userRoutes = new UserRoutes(dataSource);
    this.authRoutes = new AuthRoutes(dataSource);
    this.tokenRoutes = new TokenRoutes(dataSource);
    this.mentorsRoutes = new MentorRoutes(dataSource);
    this.issuesRoutes = new IssuesRoutes(dataSource);
    this.recordingRoutes = new RecordingRoutes();
    this.adminRoutes = new AdminRoutes(dataSource);
    this.mentorEarningsRoutes = new MentorEarningsRoutes();
    this.slotCompletionRoutes = new SlotCompletionRoutes();
    this.initializeRoutes();
  }

  /**
   * Initialize all application routes
   */
  private initializeRoutes(): void {
    // Mount health routes at /api
    this.router.use('/api', this.healthRoutes.router);

    this.router.use('/api', this.mentorsRoutes.router)
    
    // Mount user routes at /api
    this.router.use('/api', this.userRoutes.router);

  // Mount issues routes at /api
  this.router.use('/api', this.issuesRoutes.router);

    // Mount auth routes at /api
    this.router.use('/api', this.authRoutes.router);


    // Direct callback route for Google OAuth
    this.router.get('/auth/google/callback', (req, res) => {
      // Redirect to the Google Meet callback handler
      const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
      res.redirect(`/api/google-meet/auth/callback${queryString}`);
    });

    // Mount token routes at /api
    this.router.use('/api', this.tokenRoutes.router);
    
    // Mount mentor earnings routes at /api
    this.router.use('/api', this.mentorEarningsRoutes.router);
    
    // Mount slot completion routes at /api
    this.router.use('/api', this.slotCompletionRoutes.router);
    
    // Mount recording routes at /api
    this.router.use('/api', this.recordingRoutes.router);

    // Mount admin routes at /api/admin
    this.router.use('/api/admin', this.adminRoutes.router);
  }
}
