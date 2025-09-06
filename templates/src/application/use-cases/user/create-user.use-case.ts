import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/types';
import { IUserRepository } from '../../../domain/user/repositories/user.repository.interface';
import { UserDomainService } from '../../../domain/user/services/user-domain.service';
import { User } from '../../../domain/user/entities/user.entity';
import { Email } from '../../../domain/user/value-objects/email';
import { CreateUserRequest, UserResponse } from '../../dto/user.dto';

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserDomainService) private userDomainService: UserDomainService
  ) {}

  async execute(request: CreateUserRequest): Promise<UserResponse> {
    // Domain validation
    await this.userDomainService.validateUserCreation(request.name, request.email);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user entity
    const user = new User({
      name: request.name,
      email: new Email(request.email),
      isActive: true
    });

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Publish domain events
    await this.userDomainService.publishDomainEvents(savedUser);

    return savedUser.toJSON();
  }
}
