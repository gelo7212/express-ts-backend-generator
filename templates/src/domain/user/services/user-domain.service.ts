import { injectable, inject } from 'inversify';
import { TYPES, IEventBus } from '../../../infrastructure/types';
import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email';

@injectable()
export class UserDomainService {
  constructor(
    @inject(TYPES.EventBus) private eventBus: IEventBus
  ) {}

  async validateUserCreation(name: string, email: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new Error('User name is required');
    }

    if (name.length < 2) {
      throw new Error('User name must be at least 2 characters long');
    }

    // Email validation is handled by Email value object
    new Email(email); // This will throw if invalid
  }

  async publishDomainEvents(user: User): Promise<void> {
    const events = user.domainEvents;
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    user.clearDomainEvents();
  }

  canUserBeDeleted(user: User): boolean {
    // Add business rules for user deletion
    return user.isActive === false;
  }
}
