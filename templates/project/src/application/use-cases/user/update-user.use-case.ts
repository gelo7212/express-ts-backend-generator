import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/types';
import { IUserRepository } from '../../../domain/user/repositories/user.repository.interface';
import { UserDomainService } from '../../../domain/user/services/user-domain.service';
import { Email } from '../../../domain/user/value-objects/email';
import { UpdateUserRequest, UserResponse } from '../../dto/user.dto';

@injectable()
export class UpdateUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserDomainService) private userDomainService: UserDomainService
  ) {}

  async execute(id: string, request: UpdateUserRequest): Promise<UserResponse | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }

    // Update fields if provided
    if (request.name !== undefined) {
      await this.userDomainService.validateUserCreation(request.name, user.email.value);
      user.updateName(request.name);
    }

    if (request.email !== undefined) {
      const emailVO = new Email(request.email);
      
      // Check if new email is already taken by another user
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser && existingUser.id !== user.id) {
        throw new Error('Email is already taken by another user');
      }
      
      user.updateEmail(emailVO);
    }

    if (request.isActive !== undefined) {
      if (request.isActive) {
        user.activate();
      } else {
        user.deactivate();
      }
    }

    // Save updated user
    const updatedUser = await this.userRepository.update(user);

    // Publish domain events
    await this.userDomainService.publishDomainEvents(updatedUser);

    return updatedUser.toJSON();
  }
}
