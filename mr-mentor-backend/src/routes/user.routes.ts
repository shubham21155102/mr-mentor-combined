import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { DataSource } from 'typeorm';

export class UserRoutes {
  public router: Router;
  private readonly userController: UserController;

  constructor(dataSource: DataSource) {
    this.router = Router();
    this.userController = new UserController(dataSource);
    this.initializeRoutes();
  }

  /**
   * Initialize user routes
   */
  private initializeRoutes(): void {
    this.router.get('/user/profile', authMiddleware, this.userController.getUserProfile);
    
    // GET /api/user-details - Get user details with tokens (requires authentication)
    this.router.get('/user-details', authMiddleware, this.userController.getUserDetails);
    
    // GET /api/users - Get all users
    this.router.get('/users', this.userController.getAllUsers);

    // GET /api/users/stats - Get user statistics
    this.router.get('/users/stats', this.userController.getUserStats);

    // GET /api/users/:id - Get user by ID
    this.router.get('/users/:id', this.userController.getUserById);

    // POST /api/users - Create new user
    this.router.post('/users', this.userController.createUser);

    // PUT /api/users/:id - Update user
    this.router.put('/users/:id', this.userController.updateUser);

    // DELETE /api/users/:id - Delete user (soft delete)
    this.router.delete('/users/:id', this.userController.deleteUser);
  }
}
