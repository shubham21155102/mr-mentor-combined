import { Request, Response } from 'express';
import { SlotCompletionService } from '../services/SlotCompletionService';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class SlotCompletionController {
  private slotCompletionService: SlotCompletionService;

  constructor() {
    this.slotCompletionService = new SlotCompletionService();
  }

  /**
   * Mark meeting as started
   * POST /api/slots/:slotId/start
   */
  public startMeeting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { slotId } = req.params;

      if (!slotId) {
        res.status(400).json({
          success: false,
          message: 'Slot ID is required'
        });
        return;
      }

      const result = await this.slotCompletionService.startMeeting(slotId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error starting meeting:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start meeting',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Complete meeting and credit earnings
   * POST /api/slots/:slotId/complete
   */
  public completeMeeting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { slotId } = req.params;
      const { actualEndTime } = req.body;

      if (!slotId) {
        res.status(400).json({
          success: false,
          message: 'Slot ID is required'
        });
        return;
      }

      const endTime = actualEndTime ? new Date(actualEndTime) : undefined;

      const result = await this.slotCompletionService.completeMeeting(slotId, endTime);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error completing meeting:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete meeting',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get meeting details including duration and earnings status
   * GET /api/slots/:slotId/details
   */
  public getMeetingDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { slotId } = req.params;

      if (!slotId) {
        res.status(400).json({
          success: false,
          message: 'Slot ID is required'
        });
        return;
      }

      const slot = await this.slotCompletionService.getMeetingDetails(slotId);

      if (!slot) {
        res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: slot.id,
          status: slot.status,
          scheduledStart: slot.startDateTime,
          scheduledEnd: slot.endDateTime,
          actualStartTime: slot.actualStartTime,
          actualEndTime: slot.actualEndTime,
          durationMinutes: slot.durationMinutes,
          earningsCredited: slot.earningsCredited,
          earningsCreditedAt: slot.earningsCreditedAt,
          mentorId: slot.mentorId,
          studentId: slot.studentId
        }
      });
    } catch (error) {
      console.error('Error fetching meeting details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch meeting details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
