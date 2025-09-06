import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/types';
import { IUserRepository } from '../../../domain/user/repositories/user.repository.interface';
import { UserResponse } from '../../dto/user.dto';

@injectable()
export class GetUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(id: string): Promise<UserResponse | null> {
    const user = await this.userRepository.findById(id);
    return user ? user.toJSON() : null;
  }

  async executeByEmail(email: string): Promise<UserResponse | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? user.toJSON() : null;
  }

  async executeAll(): Promise<UserResponse[]> {
    const users = await this.userRepository.findAll();
    return users.map(user => user.toJSON());
  }
}
