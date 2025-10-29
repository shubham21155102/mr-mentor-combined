import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { DataSource } from 'typeorm';
import { authMiddleware } from '../middleware/auth.middleware';

export class AuthRoutes {
  public router: Router;
  private authController: AuthController;

  constructor(dataSource: DataSource) {
    this.router = Router();
    this.authController = new AuthController(dataSource);
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/auth/signup', this.authController.signUp);
    this.router.post('/auth/verify-otp', this.authController.verifyOtp);
    this.router.post('/auth/complete-profile', authMiddleware, this.authController.completeProfile);
    this.router.post('/auth/login', this.authController.login);
    this.router.post('/auth/google', this.authController.googleSignIn);
    this.router.post('/auth/forgot-password', this.authController.forgotPassword);
    this.router.post('/auth/reset-password', this.authController.resetPassword);
    this.router.post('/auth/change-password', authMiddleware, this.authController.changePassword);
  }
}