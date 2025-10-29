import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserStage } from '../types/UserStage';

export class AuthController {
  private readonly authService: AuthService;
  constructor(dataSource: DataSource) {
    this.authService = new AuthService(dataSource);
  }

  signUp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, deviceInfo } = req.body;
      
      // Capture device details from request
      const ip = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = Array.isArray(req.headers['user-agent']) 
        ? req.headers['user-agent'].join(' ') 
        : req.headers['user-agent'];
      
      const t0 = Date.now();
      await this.authService.signUp(
        { email, password },
        {
          ip,
          userAgent,
          deviceDetails: deviceInfo ? JSON.stringify(deviceInfo) : undefined
        }
      );
      // Fire-and-forget: send OTP and registration email to avoid blocking signup response
      this.authService.sendOtp(email)
        .then(() => console.log(`[signup] OTP sent successfully to ${email}`))
        .catch(err => console.error(`[signup] OTP send failed for ${email}:`, err.message));

      // this.authService.sendRegistrationEmail(email, password)
      //   .then(() => console.log(`[signup] Registration email sent to ${email}`))
      //   .catch(err => console.error(`[signup] Registration email failed for ${email}:`, err.message));
      const total = Date.now() - t0;
      console.log(`[signup] Completed core signup flow for ${email} in ${total}ms (OTP sending async)`);
      res.status(200).json({ message: 'Signup successful. OTP (if email configured) is being sent.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      console.log(message);
      res.status(400).json({ message });
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const isVerified = await this.authService.verifyOtp(email, otp);
      if (!isVerified) {
        res.status(400).json({ message: 'Invalid OTP' });
        return;
      }
      const user = await this.authService.userRepository.findOne({ where: { email } });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      const token = this.authService.generateJwt(user);
      res.status(200).json({ message: 'OTP verified, proceed to complete profile', token });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message });
    }
  };

  completeProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { fullName, phone, profession, domain, profilePhoto } = req.body;
      const user = await this.authService.userRepository.findOne({ where: { email: req.user!.email } });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      user.fullName = fullName;
      user.phone = phone;
      user.profession = profession;
      user.domain = domain;
      user.profilePhoto = profilePhoto;
      user.isProfileComplete = true;
      user.stage = UserStage.PROFILE_COMPLETE;

      await this.authService.userRepository.save(user);
      const token = this.authService.generateJwt(user);

      res.status(200).json({ message: 'Signup successful', token });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const user = await this.authService.userRepository.findOne({ where: { email } });

      if (!user || !user.password) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const token = this.authService.generateJwt(user);
      // Fire-and-forget: alert user via email about the new login
      // try {
      //   const ip = req.ip || req.headers['x-forwarded-for'] as string | undefined;
      //   const agent = req.headers['user-agent'];
      //   this.authService.sendLoginAlert(user.email, ip, Array.isArray(agent) ? agent.join(' ') : agent as string | undefined)
      //     .then(() => console.log(`[login] Login alert sent to ${user.email}`))
      //     .catch(err => console.error(`[login] Login alert failed for ${user.email}:`, err.message));
      // } catch (err) {
      //   console.error('[login] sendLoginAlert invocation failed:', (err as Error).message);
      // }

      // Return response matching Google login structure
      res.status(200).json({ 
        message: 'Login successful', 
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          image: user.profilePhoto
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message });
    }
  };

  googleSignIn = async (req: Request, res: Response): Promise<void> => {
    try {
      const { idToken } = req.body;
      const user = await this.authService.googleSignIn(idToken);
      const token = this.authService.generateJwt(user);
      
      // Return response matching credential login structure
      res.status(200).json({ 
        message: 'Google sign-in successful', 
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          image: user.profilePhoto
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message });
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }

      await this.authService.forgotPassword(email);
      res.status(200).json({ 
        message: 'If an account exists with this email, a reset code has been sent.' 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      // Don't reveal if user exists or not for security
      res.status(200).json({ 
        message: 'If an account exists with this email, a reset code has been sent.' 
      });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, resetToken, newPassword } = req.body;

      if (!email || !resetToken || !newPassword) {
        res.status(400).json({ message: 'Email, reset token, and new password are required' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long' });
        return;
      }

      await this.authService.resetPassword(email, resetToken, newPassword);
      res.status(200).json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message });
    }
  };

  changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'Current password and new password are required' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ message: 'New password must be at least 6 characters long' });
        return;
      }

      if (!req.user?.email) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      await this.authService.changePassword(req.user.email, currentPassword, newPassword);
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message });
    }
  };
}