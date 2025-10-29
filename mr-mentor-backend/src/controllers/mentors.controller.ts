import { Request, Response } from 'express';
import {MentorService} from '../services/MentorService'
import { DataSource } from 'typeorm';

export class MentorsController {
  private mentorsService: MentorService;

  constructor(dataSource : DataSource) {
    this.mentorsService = new MentorService(dataSource);
  }

  /**
   * Handle health check endpoint
   * @param req Express request object
   * @param res Express response object
   */
  public getMentors = async(req: Request, res: Response): Promise<void> => {
    try {
      const mentorsData = await this.mentorsService.getMentors();
      res.status(200).json({
        status: 'OK',
        data: mentorsData
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getMentorsPaginated = async(req: Request, res: Response): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 9;
      const search = req.query.search as string;
      const companies = req.query.companies ? (req.query.companies as string).split(',') : undefined;
      const expertise = req.query.expertise ? (req.query.expertise as string).split(',') : undefined;
      const sortBy = req.query.sortBy as string;

      const mentorsData = await this.mentorsService.getMentorsPaginated(
        page,
        limit,
        search,
        companies,
        expertise,
        sortBy
      );

      res.status(200).json({
        status: 'OK',
        data: mentorsData
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  public getMentorsByCategory = async(req: Request, res: Response): Promise<void> => {
    const category = req.query.category as string;
    const subCategory = req.query.subCategory as string;
    console.log(category, subCategory);
    
    if (!category || !subCategory) {
      res.status(400).json({
        success: false,
        message: 'Category and subCategory are required query parameters'
      });
      return;
    }
    
    try {
      const mentorsData = await this.mentorsService.getMentorsByCategory(category, subCategory);
      res.status(200).json({
        status: 'OK',
        data: mentorsData
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getMentorSlots = async(req: Request, res: Response): Promise<void> => {
    const mentorId = req.params.mentorId;
    
    if (!mentorId) {
      res.status(400).json({
        success: false,
        message: 'Mentor ID is required'
      });
      return;
    }
    
    try {
      const slotsData = await this.mentorsService.getMentorSlots(mentorId);
      res.status(200).json({
        status: 'OK',
        data: slotsData
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  public createSlot = async(req: Request, res: Response): Promise<void> => {
    const slot = req.body;
    try {
      const slotsData = await this.mentorsService.createSlot(slot);
      res.status(200).json({
        status: 'OK',
        data: slotsData
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  public getUsersMeetings = async(req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    try {
      const meetingsData = await this.mentorsService.getUsersMeetings(userId);
      res.status(200).json({
        status: 'OK',
        data: meetingsData
      })
    }
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  public changeMeetingStatus = async(req: Request, res: Response): Promise<void> => {
    const meetingId = req.params.meetingId;
    const status = req.body.status;
    const requestorId = req.body.requestorId;
    const requestorRole = req.body.requestorRole;

    // Additional validation: Prevent students from making unauthorized status changes
    if (requestorRole === 'user' && status !== 'cancellation_requested') {
      res.status(403).json({
        success: false,
        message: 'Students can only request meeting cancellation. You cannot change meeting status or timing.',
        error: 'Forbidden: Unauthorized action'
      });
      return;
    }

    try {
      const meetingsData = await this.mentorsService.changeMeetingStatus(meetingId, status, requestorId, requestorRole);
      res.status(200).json({
        status: 'OK',
        data: meetingsData
      })
    }
    catch (error) {
      // Handle specific errors with appropriate status codes
      if (error instanceof Error) {
        if (error.message.includes('Students can only request') || error.message.includes('Students cannot change')) {
          res.status(403).json({
            success: false,
            message: error.message,
            error: 'Forbidden'
          });
        } else if (error.message === 'Meeting not found') {
          res.status(404).json({
            success: false,
            message: 'Meeting not found',
            error: error.message
          });
        } else {
          res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'Unknown error'
        });
      }
    }
  }

  public requestMeetingCancellation = async(req: Request, res: Response): Promise<void> => {
    const meetingId = req.params.meetingId;
    const studentId = req.body.studentId;

    console.log('Cancellation request:', { meetingId, studentId });

    try {
      const meetingData = await this.mentorsService.requestMeetingCancellation(meetingId, studentId);
      res.status(200).json({
        success: true,
        data: meetingData,
        message: 'Cancellation request submitted successfully. Mentor approval is required.'
      })
    }
    catch (error) {
      console.error('Cancellation request failed:', error);

      // Return specific error codes for better debugging
      if (error instanceof Error) {
        if (error.message === 'Meeting not found') {
          res.status(404).json({
            success: false,
            message: 'Meeting not found',
            error: error.message
          });
        } else if (error.message === 'You can only request cancellation for your own meetings') {
          res.status(403).json({
            success: false,
            message: 'You can only request cancellation for your own meetings',
            error: error.message
          });
        } else if (error.message === 'Only confirmed meetings can be cancelled') {
          res.status(400).json({
            success: false,
            message: 'Only confirmed meetings can be cancelled',
            error: error.message
          });
        } else {
          res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'Unknown error'
        });
      }
    }
  }

  public approveMeetingCancellation = async(req: Request, res: Response): Promise<void> => {
    const meetingId = req.params.meetingId;
    const mentorId = req.body.mentorId;
    try {
      const meetingData = await this.mentorsService.approveMeetingCancellation(meetingId, mentorId);
      res.status(200).json({
        success: true,
        data: meetingData,
        message: 'Meeting cancelled successfully.'
      })
    }
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  public getLeaderboard = async(req: Request, res: Response): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const leaderboard = await this.mentorsService.getMentorsLeaderboard(page, 10, true);
      res.status(200).json({ status: 'OK', data: leaderboard });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  public getLeaderboardByMentorId = async(req: Request, res: Response): Promise<void> => {
    const mentorId = req.params.mentorId;
    if (!mentorId) {
      res.status(400).json({ success: false, message: 'Mentor ID is required' });
      return;
    }
    try {
      const entry = await this.mentorsService.getMentorLeaderboardById(mentorId);
      if (!entry) {
        res.status(404).json({ success: false, message: 'Mentor not found' });
        return;
      }
      res.status(200).json({ status: 'OK', data: entry });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
  public createSlotsFeedback = async(req: Request, res: Response): Promise<void> => {
    const feedback = req.body;
    try {
      const feedbackData = await this.mentorsService.createSlotsFeedback(feedback);
      res.status(200).json({
        status: 'OK',
        data: feedbackData
      })
    }
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public getMeetingDetails = async(req: Request, res: Response): Promise<void> => {
    const meetingId = req.params.meetingId;
    try {
      const meetingData = await this.mentorsService.getMeetingDetails(meetingId);
      res.status(200).json({
        status: 'OK',
        data: meetingData
      })
    }
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  public getMentorProfile = async(req: Request, res: Response): Promise<void> => {
    const mentorId = req.params.mentorId;
    try {
      const mentorData = await this.mentorsService.getMentorProfile(mentorId);
      res.status(200).json({
        status: 'OK',
        data: mentorData
      })
    }
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public markSlotsAvailable = async(req: Request, res: Response): Promise<void> => {
    const { slots, mentorId } = req.body;
    
    if (!mentorId || !slots || !Array.isArray(slots)) {
      res.status(400).json({
        success: false,
        message: 'Mentor ID and slots array are required'
      });
      return;
    }

    try {
      const slotsData = await this.mentorsService.markSlotsAvailable(slots, mentorId);
      res.status(200).json({
        status: 'OK',
        data: slotsData,
        message: 'Slots marked as available successfully'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getMentorAvailableSlots = async(req: Request, res: Response): Promise<void> => {
    const mentorId = req.params.mentorId;
    
    if (!mentorId) {
      res.status(400).json({
        success: false,
        message: 'Mentor ID is required'
      });
      return;
    }

    try {
      const slotsData = await this.mentorsService.getMentorAvailableSlots(mentorId);
      res.status(200).json({
        status: 'OK',
        data: slotsData
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public removeSlotsAvailability = async(req: Request, res: Response): Promise<void> => {
    const { slotIds, mentorId } = req.body;
    
    if (!mentorId || !slotIds || !Array.isArray(slotIds)) {
      res.status(400).json({
        success: false,
        message: 'Mentor ID and slot IDs array are required'
      });
      return;
    }

    try {
      const slotsData = await this.mentorsService.removeSlotsAvailability(slotIds, mentorId);
      res.status(200).json({
        status: 'OK',
        data: slotsData,
        message: 'Slots removed from availability successfully'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
