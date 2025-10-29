import { User } from '../entities/User';
import { UserStage } from '../types/UserStage';

/**
 * Helper utilities for managing user stages during signup flow
 */
export class UserStageHelper {
  /**
   * Get user stage name as string
   */
  static getStageName(stage: UserStage): string {
    const stageNames: Record<UserStage, string> = {
      [UserStage.SIGNUP]: 'SIGNUP',
      [UserStage.OTP_VERIFIED]: 'OTP_VERIFIED',
      [UserStage.PROFILE_COMPLETE]: 'PROFILE_COMPLETE',
    };
    return stageNames[stage] || 'UNKNOWN';
  }

  /**
   * Check if user can proceed to next stage
   */
  static canProceedToStage(currentStage: UserStage, targetStage: UserStage): boolean {
    // Users must progress through stages sequentially
    return targetStage === currentStage + 1;
  }

  /**
   * Validate stage transition
   */
  static validateStageTransition(user: User, targetStage: UserStage): { valid: boolean; error?: string } {
    if (!user.stage) {
      return { valid: false, error: 'User stage not initialized' };
    }

    if (user.stage === targetStage) {
      return { valid: false, error: `User is already at stage ${this.getStageName(targetStage)}` };
    }

    if (user.stage > targetStage) {
      return { valid: false, error: 'Cannot move to a previous stage' };
    }

    if (!this.canProceedToStage(user.stage, targetStage)) {
      return { 
        valid: false, 
        error: `Cannot skip stages. Current: ${this.getStageName(user.stage)}, Target: ${this.getStageName(targetStage)}` 
      };
    }

    // Stage-specific validations
    if (targetStage === UserStage.OTP_VERIFIED && !user.isVerified) {
      return { valid: false, error: 'Email must be verified before moving to OTP_VERIFIED stage' };
    }

    if (targetStage === UserStage.PROFILE_COMPLETE && !user.isProfileComplete) {
      return { valid: false, error: 'Profile must be complete before moving to PROFILE_COMPLETE stage' };
    }

    return { valid: true };
  }

  /**
   * Get next required action for user based on current stage
   */
  static getNextAction(user: User): string {
    switch (user.stage) {
      case UserStage.SIGNUP:
        return 'User needs to verify OTP';
      case UserStage.OTP_VERIFIED:
        return 'User needs to complete profile';
      case UserStage.PROFILE_COMPLETE:
        return 'Registration complete';
      default:
        return 'Unknown stage';
    }
  }

  /**
   * Get signup progress percentage
   */
  static getProgressPercentage(stage: UserStage): number {
    const progressMap: Record<UserStage, number> = {
      [UserStage.SIGNUP]: 33,
      [UserStage.OTP_VERIFIED]: 66,
      [UserStage.PROFILE_COMPLETE]: 100,
    };
    return progressMap[stage] || 0;
  }

  /**
   * Check if user registration is complete
   */
  static isRegistrationComplete(user: User): boolean {
    return user.stage === UserStage.PROFILE_COMPLETE && 
           user.isVerified && 
           user.isProfileComplete;
  }

  /**
   * Get incomplete users count by stage
   */
  static getIncompleteStageDescription(stage: UserStage): string {
    const descriptions: Record<UserStage, string> = {
      [UserStage.SIGNUP]: 'Users who registered but did not verify email',
      [UserStage.OTP_VERIFIED]: 'Users who verified email but did not complete profile',
      [UserStage.PROFILE_COMPLETE]: 'Users with complete registration',
    };
    return descriptions[stage] || 'Unknown stage';
  }
}
