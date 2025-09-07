import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/types';
import { IUserRepository } from '../../../domain/user/repositories/user.repository.interface';
import { UserDomainService } from '../../../domain/user/services/user-domain.service';

@injectable()
export class DeleteUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserDomainService) private userDomainService: UserDomainService
  ) {}

  async execute(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return false;
    }

    // Check if user can be deleted (business rule)
    if (!this.userDomainService.canUserBeDeleted(user)) {
      throw new Error('Cannot delete an active user. Please deactivate first.');
    }

    await this.userRepository.delete(id);
    return true;
  }
}
