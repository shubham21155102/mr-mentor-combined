import { Router } from 'express';
import { MentorsController } from '@/controllers/mentors.controller';
import { DataSource } from 'typeorm';
import { authMiddleware } from '../middleware/auth.middleware';

export class MentorRoutes {
  public router: Router;
  private mentorController: MentorsController;

  constructor(dataSource: DataSource) {
    this.router = Router();
    this.mentorController = new MentorsController(dataSource);
    this.initializeRoutes();
  }

  /**
   * Initialize health routes
   */
  private initializeRoutes(): void {
    // GET /mentors
    this.router.get('/mentors', this.mentorController.getMentors);
    // GET /mentors/paginated
    this.router.get('/mentors/paginated', this.mentorController.getMentorsPaginated);
    // GET /mentors/category?category=&subCategory=
    this.router.get('/mentors/category', this.mentorController.getMentorsByCategory);
    // GET /mentors/:mentorId/slots
    this.router.get('/mentors/:mentorId/slots', this.mentorController.getMentorSlots);

    // POST /mentors/slots/available - Mark slots as available
    this.router.post('/mentors/slots/available', this.mentorController.markSlotsAvailable);
    // GET /mentors/:mentorId/slots/available - Get mentor's available slots
    this.router.get('/mentors/:mentorId/slots/available', this.mentorController.getMentorAvailableSlots);
    // DELETE /mentors/slots/available - Remove slots from availability
    this.router.delete('/mentors/slots/available', this.mentorController.removeSlotsAvailability);

    // POST /mentors/slots
    this.router.post('/mentors/slots', this.mentorController.createSlot);
    // GET /mentors/users/:userId/meetings
    this.router.get('/mentors/users/:userId/meetings', this.mentorController.getUsersMeetings);
    // PUT /mentors/users/:userId/meetings/:meetingId/status
    this.router.put('/mentors/users/:userId/meetings/:meetingId/status', this.mentorController.changeMeetingStatus);
    // POST /mentors/meetings/:meetingId/request-cancellation
    this.router.post('/mentors/meetings/:meetingId/request-cancellation', this.mentorController.requestMeetingCancellation);
    // PUT /mentors/meetings/:meetingId/approve-cancellation
    this.router.put('/mentors/meetings/:meetingId/approve-cancellation', this.mentorController.approveMeetingCancellation);
    // POST /mentors/users/:userId/meetings/:meetingId/feedback
    this.router.post('/mentors/users/:userId/meetings/:meetingId/feedback', this.mentorController.createSlotsFeedback);
    // GET /mentors/meetings/:meetingId/details - Protected route
    this.router.get('/mentors/meetings/:meetingId/details', authMiddleware, this.mentorController.getMeetingDetails);
    // GET /mentors/:mentorId/profile
    this.router.get('/mentors/:mentorId/profile', this.mentorController.getMentorProfile);
    // GET /mentors/leaderboard
    this.router.get('/mentors/leaderboard', this.mentorController.getLeaderboard);
    // GET /mentors/:mentorId/leaderboard
    this.router.get('/mentors/:mentorId/leaderboard', this.mentorController.getLeaderboardByMentorId);
  }
}
