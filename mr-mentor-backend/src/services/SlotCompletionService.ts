import { DatabaseService } from '../config/database';
import { Slots, MeetingStatus } from '../entities/Slots';
import { TokenUsage } from '../entities/TokenUsage';
import { MentorEarningsService } from './MentorEarningsService';

export class SlotCompletionService {
  private readonly db = DatabaseService.getInstance();
  private readonly slotsRepository = this.db.dataSource.getRepository(Slots);
  private readonly tokenUsageRepository = this.db.dataSource.getRepository(TokenUsage);
  private readonly mentorEarningsService = new MentorEarningsService();

  /**
   * Mark a slot as ended and credit earnings to mentor
   * Calculates actual meeting duration and prevents duplicate credits
   */
  async completeMeeting(
    slotId: string,
    actualEndTime?: Date
  ): Promise<{
    success: boolean;
    message: string;
    slot?: Slots;
    earningsCredited?: boolean;
    earningsAmount?: number;
  }> {
    try {
      // Find the slot with relations
      const slot = await this.slotsRepository.findOne({
        where: { id: slotId },
        relations: ['tokenUsage']
      });

      if (!slot) {
        return {
          success: false,
          message: 'Slot not found'
        };
      }

      // Check if already completed with earnings credited
      if (slot.status === MeetingStatus.COMPLETED && slot.earningsCredited) {
        return {
          success: false,
          message: 'Meeting already completed and earnings already credited',
          slot,
          earningsCredited: true
        };
      }

      // Calculate meeting duration
      const endTime = actualEndTime || new Date();
      const startTime = slot.actualStartTime || slot.startDateTime;
      const durationMs = endTime.getTime() - new Date(startTime).getTime();
      const durationMinutes = Math.floor(durationMs / (1000 * 60));

      // Update slot with completion details
      slot.status = MeetingStatus.COMPLETED;
      slot.actualEndTime = endTime;
      slot.durationMinutes = durationMinutes;

      // If not already started, set start time
      if (!slot.actualStartTime) {
        slot.actualStartTime = slot.startDateTime;
      }

      // Get token usage for this slot
      const tokenUsage = await this.tokenUsageRepository.findOne({
        where: { slotId: slot.id }
      });

      if (!tokenUsage) {
        // Save slot but don't credit earnings if no token usage found
        await this.slotsRepository.save(slot);
        return {
          success: false,
          message: 'Meeting completed but no token usage found. Earnings not credited.',
          slot,
          earningsCredited: false
        };
      }

      const tokensUsed = tokenUsage.tokensUsed || 1;

      // Credit earnings to mentor (only if not already credited)
      if (!slot.earningsCredited) {
        const earningsResult = await this.mentorEarningsService.addEarnings(
          slot.mentorId,
          tokensUsed,
          slot.id,
          undefined, // Let it use default description
          durationMinutes
        );

        if (earningsResult.success) {
          slot.earningsCredited = true;
          slot.earningsCreditedAt = new Date();
          await this.slotsRepository.save(slot);

          return {
            success: true,
            message: `Meeting completed. Earnings of ₹${tokensUsed * 300} credited to mentor.`,
            slot,
            earningsCredited: true,
            earningsAmount: tokensUsed * 300
          };
        } else {
          // Earnings already credited (duplicate protection)
          slot.earningsCredited = true;
          slot.earningsCreditedAt = new Date();
          await this.slotsRepository.save(slot);

          return {
            success: true,
            message: earningsResult.message,
            slot,
            earningsCredited: true
          };
        }
      } else {
        // Already credited
        await this.slotsRepository.save(slot);
        return {
          success: true,
          message: 'Meeting completed. Earnings were already credited.',
          slot,
          earningsCredited: true
        };
      }
    } catch (error) {
      console.error('Error completing meeting:', error);
      return {
        success: false,
        message: `Failed to complete meeting: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Mark meeting as started (optional - tracks actual start time)
   */
  async startMeeting(slotId: string): Promise<{ success: boolean; message: string; slot?: Slots }> {
    try {
      const slot = await this.slotsRepository.findOne({
        where: { id: slotId }
      });

      if (!slot) {
        return {
          success: false,
          message: 'Slot not found'
        };
      }

      if (slot.actualStartTime) {
        return {
          success: false,
          message: 'Meeting already started',
          slot
        };
      }

      slot.actualStartTime = new Date();
      await this.slotsRepository.save(slot);

      return {
        success: true,
        message: 'Meeting started',
        slot
      };
    } catch (error) {
      console.error('Error starting meeting:', error);
      return {
        success: false,
        message: `Failed to start meeting: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get meeting details including duration and earnings status
   */
  async getMeetingDetails(slotId: string): Promise<Slots | null> {
    return await this.slotsRepository.findOne({
      where: { id: slotId },
      relations: ['mentor', 'user', 'tokenUsage', 'feedback']
    });
  }
}
