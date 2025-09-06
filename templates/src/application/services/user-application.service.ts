import { injectable, inject } from 'inversify';
import { TYPES } from '../../infrastructure/types';
import { CreateUserUseCase } from '../use-cases/user/create-user.use-case';
import { GetUserUseCase } from '../use-cases/user/get-user.use-case';
import { UpdateUserUseCase } from '../use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '../use-cases/user/delete-user.use-case';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '../dto/user.dto';

@injectable()
export class UserApplicationService {
  constructor(
    @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUserUseCase,
    @inject(TYPES.GetUserUseCase) private getUserUseCase: GetUserUseCase,
    @inject(TYPES.UpdateUserUseCase) private updateUserUseCase: UpdateUserUseCase,
    @inject(TYPES.DeleteUserUseCase) private deleteUserUseCase: DeleteUserUseCase
  ) {}

  async createUser(request: CreateUserRequest): Promise<UserResponse> {
    return await this.createUserUseCase.execute(request);
  }

  async getUserById(id: string): Promise<UserResponse | null> {
    return await this.getUserUseCase.execute(id);
  }

  async getUserByEmail(email: string): Promise<UserResponse | null> {
    return await this.getUserUseCase.executeByEmail(email);
  }

  async getAllUsers(): Promise<UserResponse[]> {
    return await this.getUserUseCase.executeAll();
  }

  async updateUser(id: string, request: UpdateUserRequest): Promise<UserResponse | null> {
    return await this.updateUserUseCase.execute(id, request);
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.deleteUserUseCase.execute(id);
  }
}
