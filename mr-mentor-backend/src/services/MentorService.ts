import { User } from "@/entities/User";
import { MentorResponse } from "@/types/Mentor.types";
import { UserRole } from "@/types/UserTypes";
import { DataSource, Repository } from "typeorm";
import { MeetingStatus, Slots } from "@/entities/Slots";
import { SlotsFeedBack } from "@/entities/SlotsFeedBack";
import { TokenUsage, TokenUsageType } from "@/entities/TokenUsage";
import { Token } from "@/entities/Tokens";
import { TokenService } from "./TokenService";

export class MentorService {
  /**
   * Get mentors from the database
   * @returns {MentorResponse}  MentorResponse object containing status and mentors
   */
  public userRepository: Repository<User>;
  public slotsRepository: Repository<Slots>;
  public slotsFeedbackRepository: Repository<SlotsFeedBack>;
  public tokenService: TokenService;

  constructor(dataSource : DataSource) {
    this.userRepository = dataSource.getRepository(User);
    this.slotsRepository = dataSource.getRepository(Slots);
    this.slotsFeedbackRepository = dataSource.getRepository(SlotsFeedBack);
    this.tokenService = new TokenService(dataSource);
  }
   public async getMentors(): Promise<MentorResponse> {
    const mentors = await this.userRepository.find({
        relations: ["mentorProfile"],
        where: { role: UserRole.EXPERT},
    });
    for (const mentor of mentors) {
       delete (mentor as any).password;
       delete (mentor as any).googleId;
       delete (mentor as any).isProfileComplete;
       delete (mentor as any).isVerified;
    }
    return {
      status: 'OK',
      mentors: mentors
    }
  }

  /**
   * Get mentors with pagination, filtering, and search
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 9)
   * @param search Search query for mentor names
   * @param companies Array of company names to filter by
   * @param expertise Array of expertise areas to filter by
   * @param sortBy Sort field (options: 'slots', 'alphabetical', 'experience', 'rating', 'meets')
   * @returns Paginated mentor response
   */
  public async getMentorsPaginated(
    page: number = 1,
    limit: number = 9,
    search?: string,
    companies?: string[],
    expertise?: string[],
    sortBy?: string
  ): Promise<any> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.mentorProfile', 'mentorProfile')
      .where('user.role = :role', { role: UserRole.EXPERT });

    // Apply search filter
    if (search?.trim()) {
      const q = search.trim();
      queryBuilder.andWhere('user.fullName ILIKE :search', { search: `%${q}%` });
    }

    // Apply company filter
    if (companies && companies.length > 0) {
      queryBuilder.andWhere('mentorProfile.company IN (:...companies)', { companies });
    }

    // Apply expertise filter
    if (expertise && expertise.length > 0) {
      queryBuilder.andWhere('mentorProfile.expertise && :expertise', { expertise });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply sorting
    switch (sortBy) {
      case 'slots':
        queryBuilder.orderBy('mentorProfile.slotsLeft', 'DESC');
        break;
      case 'alphabetical':
        queryBuilder.orderBy('user.fullName', 'ASC');
        break;
      case 'experience':
        queryBuilder.orderBy('mentorProfile.experience', 'DESC');
        break;
      case 'rating':
        queryBuilder.addSelect(
          `(SELECT AVG(fb.rating) FROM slots_feedback fb
           JOIN slots s ON s.id = fb.slotId
           WHERE s.mentorId = user.id)`,
          'avgRating'
        ).orderBy('avgRating', 'DESC', 'NULLS LAST');
        break;
      case 'meets':
        queryBuilder.addSelect(
          `(SELECT COUNT(s.id) FROM slots s
           WHERE s.mentorId = user.id AND s.status = 'completed')`,
          'totalMeets'
        ).orderBy('totalMeets', 'DESC');
        break;
      default:
        queryBuilder.orderBy('user.createdAt', 'DESC');
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const mentors = await queryBuilder.getMany();

    // Clean sensitive data
    for (const mentor of mentors) {
      delete (mentor as any).password;
      delete (mentor as any).googleId;
      delete (mentor as any).isProfileComplete;
      delete (mentor as any).isVerified;
    }

    const totalPages = Math.ceil(total / limit);

    return {
      status: 'OK',
      mentors: mentors,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    };
  }
    public async getMentorsByCategory(category: string, subCategory: string): Promise<MentorResponse> {
      const mentors = await this.userRepository.find({
          relations: ["mentorProfile"],
          where: { role: UserRole.EXPERT , mentorProfile:{
            category:category,
            subCategory:subCategory
          }},
          take: 4
      });
      for (const mentor of mentors) {
         delete (mentor as any).password;
         delete (mentor as any).googleId;
         delete (mentor as any).isProfileComplete;
         delete (mentor as any).isVerified;
      }
      return {
        status: 'OK',
        mentors: mentors
      }
  
    }

    public async getMentorSlots(mentorId: string): Promise<any> {
      const slots = await this.slotsRepository.find({
        where: { mentorId: mentorId }
      });
      return slots;
    }

    public async createSlot(slot: Partial<Slots>): Promise<Slots> {
      const startDateTime = new Date(slot.startDateTime as any);
      const endDateTime = new Date(slot.endDateTime as any);
      const studentId = slot.studentId;
      const mentorId = slot.mentorId;

      // Validate required fields
      if (!studentId) {
        throw new Error('Student ID is required');
      }

      console.log('Looking for slot with:', {
        mentorId,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString()
      });

      // Check if an available slot exists for this time
      // Use string comparison for dates to avoid timezone issues
      const availableSlots = await this.slotsRepository.find({
        where: { 
          mentorId: mentorId, 
          isAvailable: true,
          studentId: null as any
        }
      });

      console.log('All available slots:', availableSlots.map(s => ({
        id: s.id,
        start: new Date(s.startDateTime).toISOString(),
        end: new Date(s.endDateTime).toISOString()
      })));

      // Find matching slot by comparing ISO strings
      const availableSlot = availableSlots.find(s => {
        const slotStart = new Date(s.startDateTime).toISOString();
        const slotEnd = new Date(s.endDateTime).toISOString();
        const requestStart = startDateTime.toISOString();
        const requestEnd = endDateTime.toISOString();
        
        return slotStart === requestStart && slotEnd === requestEnd;
      });

      console.log('Found matching slot:', availableSlot ? availableSlot.id : 'None');

      if (!availableSlot) {
        throw new Error('This time slot is not available for booking');
      }

      // Start transaction
      const queryRunner = this.slotsRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Check if user has sufficient tokens first (within the transaction context)
        const tokenRepository = queryRunner.manager.getRepository(Token);
        const userToken = await tokenRepository.findOne({
          where: { userId: studentId }
        });

        if (!userToken || Number(userToken.token || 0) < 1) {
          throw new Error('Insufficient tokens to book this slot');
        }

        // Update the available slot with student information
        availableSlot.studentId = studentId;
        availableSlot.status = MeetingStatus.CONFIRMED;
        const savedSlot = await queryRunner.manager.save(Slots, availableSlot);

        // Deduct token within the same transaction
        const balanceBefore = Number(userToken.token || 0);
        const balanceAfter = balanceBefore - 1;
        userToken.token = balanceAfter;
        await tokenRepository.save(userToken);

        // Record token usage within the same transaction
        const tokenUsageRepository = queryRunner.manager.getRepository(TokenUsage);
        const tokenUsage = tokenUsageRepository.create({
          userId: studentId,
          slotId: savedSlot.id,
          usageType: TokenUsageType.MEETING_BOOKING,
          tokensUsed: 1,
          balanceBefore,
          balanceAfter,
          description: `Meeting booked with mentor ${mentorId}`,
          referenceId: savedSlot.id
        });
        await tokenUsageRepository.save(tokenUsage);

        // Commit transaction
        await queryRunner.commitTransaction();

        return savedSlot;
      } catch (error) {
        // Rollback transaction if any error occurs
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release the query runner
        await queryRunner.release();
      }
    }

    public async getUsersMeetings(userId: string): Promise<any> {
      const meetings = await this.slotsRepository.find({
        where: { studentId: userId },
        relations: ["mentor"]
      });
      return meetings;
    }

    public async changeMeetingStatus(meetingId: string, status: MeetingStatus, requestorId?: string, requestorRole?: string): Promise<any> {
      const meeting = await this.slotsRepository.findOne({ where: { id: meetingId }, relations: ["mentor"] });
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      // Prevent students from changing meeting status except for requesting cancellation
      if (requestorRole === 'user' && status !== MeetingStatus.CANCELLATION_REQUESTED) {
        throw new Error('Students can only request meeting cancellation. Direct status changes are not allowed.');
      }

      // Check if the status change is to CANCELLED and requires mentor approval
      if (status === MeetingStatus.CANCELLED) {
        // If requestor is a student, they can only request cancellation, not cancel directly
        if (requestorRole === 'user' && requestorId === meeting.studentId) {
          // Student can only request cancellation, mentor must approve
          meeting.status = MeetingStatus.CANCELLATION_REQUESTED;
          return await this.slotsRepository.save(meeting);
        }

        // If requestor is the mentor, they can cancel directly
        if (requestorRole === 'expert' && requestorId === meeting.mentorId) {
          meeting.status = MeetingStatus.CANCELLED;
          // Refund tokens when mentor cancels
          if (meeting.studentId) {
            await this.tokenService.addTokensToUser(meeting.studentId, 1, {
              usageType: TokenUsageType.REFUND,
              slotId: meeting.id,
              description: `Meeting cancelled by mentor - refund issued`,
              referenceId: meeting.id
            });
          }
          return await this.slotsRepository.save(meeting);
        }

        // If no requestor info provided, assume it's a mentor approval
        if (!requestorId || !requestorRole) {
          meeting.status = MeetingStatus.CANCELLED;
          // Refund tokens when meeting is cancelled
          if (meeting.studentId) {
            await this.tokenService.addTokensToUser(meeting.studentId, 1, {
              usageType: TokenUsageType.REFUND,
              slotId: meeting.id,
              description: `Meeting cancelled - refund issued`,
              referenceId: meeting.id
            });
          }
          return await this.slotsRepository.save(meeting);
        }

        throw new Error('Only mentors can cancel meetings directly. Students can request cancellation.');
      }

      // For other status changes, only allow mentors to make changes
      if (requestorRole === 'user') {
        throw new Error('Students cannot change meeting status. Only mentors can modify meeting details.');
      }

      // For other status changes, proceed normally for mentors/admins
      meeting.status = status;
      return await this.slotsRepository.save(meeting);
    }

    public async requestMeetingCancellation(meetingId: string, studentId: string): Promise<any> {
      const meeting = await this.slotsRepository.findOne({ where: { id: meetingId } });
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      if (meeting.studentId !== studentId) {
        throw new Error('You can only request cancellation for your own meetings');
      }

      if (meeting.status !== MeetingStatus.CONFIRMED) {
        throw new Error('Only confirmed meetings can be cancelled');
      }

      meeting.status = MeetingStatus.CANCELLATION_REQUESTED;
      return await this.slotsRepository.save(meeting);
    }

    public async approveMeetingCancellation(meetingId: string, mentorId: string): Promise<any> {
      const meeting = await this.slotsRepository.findOne({ where: { id: meetingId } });
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      if (meeting.mentorId !== mentorId) {
        throw new Error('Only the assigned mentor can approve cancellation');
      }

      if (meeting.status !== MeetingStatus.CANCELLATION_REQUESTED) {
        throw new Error('Only meetings with pending cancellation requests can be approved');
      }

      // Start transaction for token refund and meeting cancellation
      const queryRunner = this.slotsRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Refund 1 token to the student
        if (meeting.studentId) {
          await this.tokenService.addTokensToUser(meeting.studentId, 1, {
            usageType: TokenUsageType.REFUND,
            slotId: meeting.id,
            description: `Meeting cancellation approved - refund issued`,
            referenceId: meeting.id
          });
        }

        // Update meeting status
        meeting.status = MeetingStatus.CANCELLED;
        const updatedMeeting = await queryRunner.manager.save(Slots, meeting);

        // Commit transaction
        await queryRunner.commitTransaction();

        return updatedMeeting;
      } catch (error) {
        // Rollback transaction if any error occurs
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release the query runner
        await queryRunner.release();
      }
    }

    public async createSlotsFeedback(feedback: Partial<SlotsFeedBack>): Promise<SlotsFeedBack> {
      const newFeedback = this.slotsFeedbackRepository.create(feedback);
      return await this.slotsFeedbackRepository.save(newFeedback);
    }

    public async getMeetingDetails(meetingId: string): Promise<any> {
      const meeting = await this.slotsRepository.findOne({ 
        where: { id: meetingId }, 
        relations: ["feedback", "mentor", "mentor.mentorProfile", "user"] 
      });
      
      if (!meeting) {
        return null;
      }

      // Get mentor profile if exists (mentorProfile is an array)
      const mentorProfile = Array.isArray(meeting.mentor.mentorProfile) && meeting.mentor.mentorProfile.length > 0
        ? meeting.mentor.mentorProfile[0]
        : null;

      // Return structured data with meeting, mentor, and student details
      return {
        id: meeting.id,
        startDateTime: meeting.startDateTime,
        endDateTime: meeting.endDateTime,
        status: meeting.status,
        mentor: {
          id: meeting.mentor.id,
          fullName: meeting.mentor.fullName,
          email: meeting.mentor.email,
          profilePhoto: meeting.mentor.profilePhoto,
          company: mentorProfile?.company,
          role: mentorProfile?.role,
          institute: mentorProfile?.institute,
          category: mentorProfile?.category,
          subCategory: mentorProfile?.subCategory,
          description: mentorProfile?.description
        },
        student: {
          id: meeting.user.id,
          fullName: meeting.user.fullName,
          email: meeting.user.email,
          profilePhoto: meeting.user.profilePhoto
        },
        feedback: meeting.feedback ? {
          rating: meeting.feedback.rating,
          experience: meeting.feedback.experience,
          comments: meeting.feedback.comments,
          isMentorJoinedOnTime: meeting.feedback.isMentorJoinedOnTime
        } : null
      };
    }

    public async getMentorProfile(mentorId: string): Promise<any> {
      const mentor = await this.userRepository.findOne({ where: { id: mentorId }, relations: ["mentorProfile"] });
      return mentor;
    }

    /**
     * Get leaderboard for all mentors: total meets and average rating, ordered by meets desc then rating desc
     */
  public async getMentorsLeaderboard(page = 1, perPage = 10, paginate = true): Promise<any> {
      // Use query builder to aggregate meets (count of completed slots) and avg rating
      const qb = this.userRepository.createQueryBuilder('user')
        .select('user.id', 'mentorId')
        .addSelect('user.fullName', 'name')
        .addSelect('user.profilePhoto', 'profilePhoto')
        // total meets: count of slots where mentorId = user.id and status = 'completed'
        .addSelect(subQuery => {
          return subQuery
            .select('COUNT(slot.id)', 'meets')
            .from(Slots, 'slot')
            .where("slot.mentorId = user.id AND slot.status = 'completed'")
        }, 'meets')
        // average rating from slots_feedback joined by slot
        .addSelect(subQuery => {
          return subQuery
            .select('AVG(fb.rating)', 'avg_rating')
            .from(SlotsFeedBack, 'fb')
            .innerJoin(Slots, 's', 's.id = fb.slotId')
            .where('s.mentorId = user.id')
        }, 'avg_rating')
        .where('user.role = :role', { role: 'expert' })
        .orderBy('meets', 'DESC')
  .addOrderBy('avg_rating', 'DESC');

      const raw = await qb.getRawMany();

      // convert meets and avg_rating to numbers and compute rank
      const formatted = raw.map((r) => ({
        mentorId: r.mentorId,
        name: r.name,
        profilePhoto: r.profilePhoto,
        meets: Number(r.meets) || 0,
        rating: r.avg_rating ? Number(Number(r.avg_rating).toFixed(2)) : 0,
      }));

      // assign rank based on meets then rating
      formatted.sort((a, b) => {
        if (b.meets !== a.meets) return b.meets - a.meets;
        return b.rating - a.rating;
      });

      const ranked = formatted.map((f, i) => ({ rank: i + 1, ...f }));

      if (!paginate) {
        return ranked;
      }

      // pagination
      const total = ranked.length;
      const cappedPerPage = Math.min(perPage, 10); // enforce max 10 per page
      const totalPages = Math.max(1, Math.ceil(total / cappedPerPage));
      const currentPage = Math.max(1, Number(page) || 1);
      const start = (currentPage - 1) * cappedPerPage;
      const data = ranked.slice(start, start + cappedPerPage);

      return {
        total,
        page: currentPage,
        perPage: cappedPerPage,
        totalPages,
        data,
      };
    }

    /**
     * Get leaderboard entry for a single mentor by id
     */
    public async getMentorLeaderboardById(mentorId: string): Promise<any> {
      const all = await this.getMentorsLeaderboard();
      const found = all.find(m => m.mentorId === mentorId);
      if (!found) {
        // If mentor exists but no meets/ratings, still return zeros
        const mentor = await this.userRepository.findOne({ where: { id: mentorId } });
        if (!mentor) return null;
        return { rank: null, mentorId: mentor.id, name: mentor.fullName, profilePhoto: mentor.profilePhoto, meets: 0, rating: 0 };
      }
      return found;
    }

    /**
     * Mark slots as available for a mentor
     */
    public async markSlotsAvailable(slots: Array<{ startDateTime: string; endDateTime: string }>, mentorId: string): Promise<any> {
      const createdSlots = [];
      
      for (const slot of slots) {
        // Check if slot already exists
        const existingSlot = await this.slotsRepository.findOne({
          where: {
            mentorId,
            startDateTime: new Date(slot.startDateTime),
            endDateTime: new Date(slot.endDateTime),
          }
        });

        if (existingSlot) {
          // Update existing slot to be available
          existingSlot.isAvailable = true;
          await this.slotsRepository.save(existingSlot);
          createdSlots.push(existingSlot);
        } else {
          // Create new available slot
          const newSlot = this.slotsRepository.create({
            startDateTime: new Date(slot.startDateTime),
            endDateTime: new Date(slot.endDateTime),
            mentorId,
            isAvailable: true,
            studentId: null, // No student assigned yet
          });
          const savedSlot = await this.slotsRepository.save(newSlot);
          createdSlots.push(savedSlot);
        }
      }

      return createdSlots;
    }

    /**
     * Get mentor's available slots (not booked yet)
     */
    public async getMentorAvailableSlots(mentorId: string): Promise<any> {
      const slots = await this.slotsRepository.find({
        where: {
          mentorId,
          isAvailable: true,
          studentId: null as any, // TypeORM null check
        },
        order: {
          startDateTime: 'ASC'
        }
      });

      return slots;
    }

    /**
     * Remove slots from availability
     */
    public async removeSlotsAvailability(slotIds: string[], mentorId: string): Promise<any> {
      const slots = await this.slotsRepository.find({
        where: {
          id: slotIds as any,
          mentorId,
          studentId: null as any, // Can only remove unbooked slots
        }
      });

      for (const slot of slots) {
        slot.isAvailable = false;
        await this.slotsRepository.save(slot);
      }

      return slots;
    }
}

