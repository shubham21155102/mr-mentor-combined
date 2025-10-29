import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/User';
import { Token } from '../entities/Tokens';
import { UserStage } from '../types/UserStage';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import RegisterEmailTemplate from './templates/RegisterEmailTemplate';
import SignupOtpEmailTemplate from './templates/SignupOtpEmailTemplate';

dotenv.config();

const otpStore = new Map<string, { otp: string, timestamp: number }>();
const resetTokenStore = new Map<string, { token: string, timestamp: number }>();

export class AuthService {
  public userRepository: Repository<User>;
  public tokenRepository: Repository<Token>;
  private readonly oauth2Client: OAuth2Client;

  constructor(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
    this.tokenRepository = dataSource.getRepository(Token);
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  async signUp(userData: Partial<User>, deviceInfo?: { ip?: string; userAgent?: string; deviceDetails?: string }): Promise<User> {
    try {
      const { email, password } = userData;
      const existingUser = await this.userRepository.findOne({ where: { email } });

      if (existingUser) {
        throw new Error('User already exists');
      }
      const hashedPassword = await bcrypt.hash(password!, 10);
      const newUser = this.userRepository.create({ 
        ...userData, 
        password: hashedPassword,
        ipAddress: deviceInfo?.ip,
        userAgent: deviceInfo?.userAgent,
        deviceInfo: deviceInfo?.deviceDetails
      });
      const savedUser = await this.userRepository.save(newUser);
      // create the token here, non-blocking to save time
      this.tokenRepository.save(this.tokenRepository.create({ token: 0, userId: savedUser.id, user: savedUser })).catch(err => console.error('Token save failed', err));
      return savedUser;
    } catch (error) {
      throw new Error(`Sign up failed: ${(error as Error).message}`);
    }
  }

  async sendOtp(email: string): Promise<void> {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(email, { otp, timestamp: Date.now() });

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('[sendOtp] EMAIL_USER or EMAIL_PASS not set. Skipping actual email send. OTP:', otp);
        return; // Do not treat as fatal; user can still verify if OTP somehow delivered by another channel (or log for testing)
      }

      const html = SignupOtpEmailTemplate({ email, otp });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email - MAS Interview Tool',
        html,
      };

      // Wrap sendMail in a timeout to avoid indefinite hang if SMTP blocks
      const timeoutMs = parseInt(process.env.EMAIL_TIMEOUT_MS || '8000');
      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_resolve, reject) => setTimeout(() => reject(new Error('SMTP send timeout')), timeoutMs))
      ]);
      console.log(`[sendOtp] OTP email dispatched to ${email}`);
    } catch (error) {
      throw new Error(`Failed to send OTP: ${(error as Error).message}`);
    }
  }

  /**
   * Send a login alert email to the user.
   * Non-blocking for controller usage — callers should fire-and-forget.
   */
  async sendLoginAlert(email: string, ip?: string, userAgent?: string): Promise<void> {
    try {
      const when = new Date().toLocaleString();

      const html = `
        <div style="font-family:Helvetica,Arial,sans-serif;color:#111;line-height:1.4">
          <h2 style="color:#1a97a4">New sign-in to your account</h2>
          <p>Hi,</p>
          <p>We noticed a sign-in to your account:</p>
          <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Time:</strong> ${when}</li>
            ${ip ? `<li><strong>IP:</strong> ${ip}</li>` : ''}
            ${userAgent ? `<li><strong>Agent:</strong> ${userAgent}</li>` : ''}
          </ul>
          <p style="color:#555">If this was you, you can safely ignore this message.</p>
          <p style="color:#d00">If you did not sign in, please reset your password immediately or contact support.</p>
          <hr/>
          <small style="color:#888">This is an automated message from MAS.</small>
        </div>
      `;

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('[sendLoginAlert] EMAIL_USER or EMAIL_PASS not set. Skipping send.');
        console.info(`[sendLoginAlert] would send to ${email} with time ${when}`);
        return;
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'New sign-in to your MAS account',
        html,
      };

      const timeoutMs = parseInt(process.env.EMAIL_TIMEOUT_MS || '8000');
      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_resolve, reject) => setTimeout(() => reject(new Error('SMTP send timeout')), timeoutMs))
      ]);
      console.log(`[sendLoginAlert] Login alert email dispatched to ${email}`);
    } catch (error) {
      // Don't throw — keep this non-fatal for login flow
      console.error('[sendLoginAlert] Failed to send login alert:', (error as Error).message);
    }
  }

  /**
   * Send registration email with credentials (HTML template)
   */
  async sendRegistrationEmail(email: string, password: string): Promise<void> {
    try {
      const html = RegisterEmailTemplate({ email, password });

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('[sendRegistrationEmail] EMAIL_USER or EMAIL_PASS not set. Skipping send.');
        console.info(`[sendRegistrationEmail] would send to ${email}`);
        return;
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to MAS - Your account details',
        html,
      };

      const timeoutMs = parseInt(process.env.EMAIL_TIMEOUT_MS || '8000');
      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_resolve, reject) => setTimeout(() => reject(new Error('SMTP send timeout')), timeoutMs))
      ]);
      console.log(`[sendRegistrationEmail] Registration email dispatched to ${email}`);
    } catch (error) {
      console.error('[sendRegistrationEmail] Failed to send registration email:', (error as Error).message);
    }
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    try {
      const storedOtp = otpStore.get(email);
      if (!storedOtp || storedOtp.otp !== otp) {
        return false;
      }

      const now = Date.now();
      const otpTimestamp = storedOtp.timestamp;
      if (now - otpTimestamp > 10 * 60 * 1000) { 
        otpStore.delete(email);
        return false;
      }
      await this.userRepository.findOne({ where: { email } }).then(user => {
        if (user) {
          user.isVerified = true;
          user.stage = UserStage.OTP_VERIFIED;
          this.userRepository.save(user);
        }
      });
      otpStore.delete(email);
      return true;
    } catch (error) {
      throw new Error(`OTP verification failed: ${(error as Error).message}`);
    }
  }

  generateJwt(user: User): string {
    try {
      return jwt.sign({ 
        id: user.id, 
        email: user.email,
        role: user.role 
      }, process.env.JWT_SECRET!, {
        expiresIn: '120d',
      });
    } catch (error) {
      throw new Error(`JWT generation failed: ${(error as Error).message}`);
    }
  }

  async googleSignIn(idToken: string): Promise<User> {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error('Invalid Google token');
      }

      let user = await this.userRepository.findOne({ where: { email: payload.email! } });

      if (!user) {
        user = this.userRepository.create({
          email: payload.email!,
          fullName: payload.name!,
          profilePhoto: payload.picture,
          googleId: payload.sub,
        });
        await this.userRepository.save(user);
        // Create a token with '0', non-blocking
        this.tokenRepository.save(this.tokenRepository.create({ token: 0, userId: user.id, user })).catch(err => console.error('Token save failed', err));
      }
      return user;
    } catch (error) {
      throw new Error(`Google sign in failed: ${(error as Error).message}`);
    }
  }

  /**
   * Send a password reset token to the user's email
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      // Check if user exists
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }

      // Generate a random 6-digit reset token
      const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
      resetTokenStore.set(email, { token: resetToken, timestamp: Date.now() });

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('[forgotPassword] EMAIL_USER or EMAIL_PASS not set. Skipping actual email send. Reset token:', resetToken);
        return;
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const html = `
        <div style="font-family:Helvetica,Arial,sans-serif;color:#111;line-height:1.6">
          <h2 style="color:#1a97a4">Password Reset Request</h2>
          <p>Hi ${user.fullName || 'there'},</p>
          <p>We received a request to reset your password for your MAS account.</p>
          <p>Your password reset code is:</p>
          <div style="background:#f5f5f5;padding:15px;border-radius:5px;text-align:center;margin:20px 0">
            <h1 style="color:#1a97a4;margin:0;font-size:32px;letter-spacing:5px">${resetToken}</h1>
          </div>
          <p>This code will expire in <strong>15 minutes</strong>.</p>
          <p style="color:#555">If you didn't request a password reset, you can safely ignore this email.</p>
          <hr/>
          <small style="color:#888">This is an automated message from MAS.</small>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request - MAS',
        html,
      };

      const timeoutMs = parseInt(process.env.EMAIL_TIMEOUT_MS || '8000');
      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_resolve, reject) => setTimeout(() => reject(new Error('SMTP send timeout')), timeoutMs))
      ]);
      console.log(`[forgotPassword] Reset token email dispatched to ${email}`);
    } catch (error) {
      throw new Error(`Failed to send reset token: ${(error as Error).message}`);
    }
  }

  /**
   * Verify the reset token and update the password
   */
  async resetPassword(email: string, resetToken: string, newPassword: string): Promise<void> {
    try {
      const storedToken = resetTokenStore.get(email);
      if (!storedToken || storedToken.token !== resetToken) {
        throw new Error('Invalid reset token');
      }

      const now = Date.now();
      const tokenTimestamp = storedToken.timestamp;
      // Token expires in 15 minutes
      if (now - tokenTimestamp > 15 * 60 * 1000) {
        resetTokenStore.delete(email);
        throw new Error('Reset token has expired');
      }

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await this.userRepository.save(user);

      // Clear the reset token
      resetTokenStore.delete(email);

      // Send confirmation email
      this.sendPasswordChangedEmail(email).catch(err => 
        console.error('[resetPassword] Failed to send confirmation email:', err.message)
      );

      console.log(`[resetPassword] Password successfully reset for ${email}`);
    } catch (error) {
      throw new Error(`Password reset failed: ${(error as Error).message}`);
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }

      // For Google OAuth users who don't have a password
      if (!user.password) {
        throw new Error('Cannot change password for Google OAuth accounts');
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }

      // Hash and save new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await this.userRepository.save(user);

      // Send confirmation email
      this.sendPasswordChangedEmail(email).catch(err => 
        console.error('[changePassword] Failed to send confirmation email:', err.message)
      );

      console.log(`[changePassword] Password successfully changed for ${email}`);
    } catch (error) {
      throw new Error(`Password change failed: ${(error as Error).message}`);
    }
  }

  /**
   * Send a confirmation email after password change
   */
  private async sendPasswordChangedEmail(email: string): Promise<void> {
    try {
      const when = new Date().toLocaleString();

      const html = `
        <div style="font-family:Helvetica,Arial,sans-serif;color:#111;line-height:1.6">
          <h2 style="color:#1a97a4">Password Changed Successfully</h2>
          <p>Hi,</p>
          <p>Your password for your MAS account was successfully changed on <strong>${when}</strong>.</p>
          <p>If you made this change, you can safely ignore this email.</p>
          <p style="color:#d00">If you did not change your password, please contact support immediately.</p>
          <hr/>
          <small style="color:#888">This is an automated message from MAS.</small>
        </div>
      `;

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('[sendPasswordChangedEmail] EMAIL_USER or EMAIL_PASS not set. Skipping send.');
        return;
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Password Changed - MAS',
        html,
      };

      const timeoutMs = parseInt(process.env.EMAIL_TIMEOUT_MS || '8000');
      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_resolve, reject) => setTimeout(() => reject(new Error('SMTP send timeout')), timeoutMs))
      ]);
      console.log(`[sendPasswordChangedEmail] Confirmation email dispatched to ${email}`);
    } catch (error) {
      console.error('[sendPasswordChangedEmail] Failed to send confirmation:', (error as Error).message);
    }
  }
}