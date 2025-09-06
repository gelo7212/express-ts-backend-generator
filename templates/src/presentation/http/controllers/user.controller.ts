import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../../infrastructure/types';
import { UserApplicationService } from '../../../application/services/user-application.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.UserApplicationService) 
    private userApplicationService: UserApplicationService
  ) {}

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const createUserDto = req.body as CreateUserDto;
      const user = await this.userApplicationService.createUser({
        name: createUserDto.name,
        email: createUserDto.email
      });

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userApplicationService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userApplicationService.getAllUsers();
      
      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateUserDto = req.body as UpdateUserDto;
      
      const user = await this.userApplicationService.updateUser(id, {
        name: updateUserDto.name,
        email: updateUserDto.email,
        isActive: updateUserDto.isActive
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.userApplicationService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
