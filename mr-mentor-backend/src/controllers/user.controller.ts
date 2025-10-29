import { Request, Response } from 'express';
import { UserService, CreateUserDto, UpdateUserDto } from '../services/UserService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { DataSource } from 'typeorm';

export class UserController {
  private userService: UserService;

  constructor(dataSource: DataSource) {
    this.userService = new UserService(dataSource);
  }

  public getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;

      if (!userData.fullName || !userData.email) {
        res.status(400).json({
          success: false,
          message: 'fullName and email are required'
        });
        return;
      }

      const emailExists = await this.userService.emailExists(userData.email);
      if (emailExists) {
        res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
        return;
      }

      const user = await this.userService.createUser(userData);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        count: users.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

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

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userData: UpdateUserDto = req.body;

      if (userData.email) {
        const existingUser = await this.userService.getUserByEmail(userData.email);
        if (existingUser && existingUser.id !== id) {
          res.status(409).json({
            success: false,
            message: 'Email already exists'
          });
          return;
        }
      }

      const user = await this.userService.updateUser(id, userData);

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

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = {
        totalUsers: await this.userService.getUserCount(),
        // Add more statistics as needed
      };

      res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getUserDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID not found in token'
        });
        return;
      }

      const userWithTokens = await this.userService.getUserWithTokens(userId);

      if (!userWithTokens) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User details retrieved successfully',
        data: userWithTokens
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}