import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { DataSource } from 'typeorm';

export class AdminRoutes {
  public router: Router;
  private readonly adminController: AdminController;

  constructor(dataSource: DataSource) {
    this.router = Router();
    this.adminController = new AdminController(dataSource);
    this.initializeRoutes();
  }

  /**
   * Initialize admin routes
   */
  private initializeRoutes(): void {
    this.router.get('/dashboard', authMiddleware, adminMiddleware, this.adminController.getDashboard);
    
    // User management routes
    this.router.get('/admins', authMiddleware, adminMiddleware, this.adminController.getAllAdmins);
    this.router.get('/mentees', authMiddleware, adminMiddleware, this.adminController.getAllMentees);
    this.router.get('/experts', authMiddleware, adminMiddleware, this.adminController.getAllExperts);
    
    this.router.post('/experts', authMiddleware, adminMiddleware, this.adminController.addExpert);
    this.router.post('/admins', authMiddleware, adminMiddleware, this.adminController.addAdmin);
    this.router.post('/students', authMiddleware, adminMiddleware, this.adminController.addStudent);
    
    this.router.delete('/users/:id', authMiddleware, adminMiddleware, this.adminController.removeUser);
    
    // GET /api/admin/users/:id - Get user by ID (admin only)
    this.router.get('/users/:id', authMiddleware, adminMiddleware, this.adminController.getUserById);

    // PUT /api/admin/users/:id - Update user (admin only)
    this.router.put('/users/:id', authMiddleware, adminMiddleware, this.adminController.updateUser);
  }
}