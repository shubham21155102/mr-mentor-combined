import { Response } from 'express';
import { AdminDashboardService } from '../services/AdminDashboardService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { DataSource } from 'typeorm';

export class AdminController {
  private adminDashboardService: AdminDashboardService;

  constructor(dataSource: DataSource) {
    this.adminDashboardService = new AdminDashboardService(dataSource);
  }

  public getDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const data = await this.adminDashboardService.getDashboardData();
      res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getAllAdmins = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await this.adminDashboardService.getAllAdmins(page, limit);
      res.status(200).json({
        success: true,
        message: 'Admins retrieved successfully',
        data: {
          users: data.users,
          pagination: {
            page,
            limit,
            total: data.total,
            totalPages: Math.ceil(data.total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve admins',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getAllMentees = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await this.adminDashboardService.getAllMentees(page, limit);
      res.status(200).json({
        success: true,
        message: 'Mentees retrieved successfully',
        data: {
          users: data.users,
          pagination: {
            page,
            limit,
            total: data.total,
            totalPages: Math.ceil(data.total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve mentees',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getAllExperts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await this.adminDashboardService.getAllExperts(page, limit);
      res.status(200).json({
        success: true,
        message: 'Experts retrieved successfully',
        data: {
          users: data.users,
          pagination: {
            page,
            limit,
            total: data.total,
            totalPages: Math.ceil(data.total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve experts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public addExpert = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userData = req.body;
      const user = await this.adminDashboardService.addExpert(userData);
      res.status(201).json({
        success: true,
        message: 'Expert added successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add expert',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public addAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userData = req.body;
      const user = await this.adminDashboardService.addAdmin(userData);
      res.status(201).json({
        success: true,
        message: 'Admin added successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add admin',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public addStudent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userData = req.body;
      const user = await this.adminDashboardService.addStudent(userData);
      res.status(201).json({
        success: true,
        message: 'Student added successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add student',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public removeUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.adminDashboardService.removeUser(id);
      if (success) {
        res.status(200).json({
          success: true,
          message: 'User removed successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to remove user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.adminDashboardService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userData = req.body;

      const user = await this.adminDashboardService.updateUser(id, userData);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}