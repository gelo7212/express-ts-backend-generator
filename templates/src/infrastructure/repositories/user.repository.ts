import { injectable } from 'inversify';
import { IUserRepository } from '../../domain/user/repositories/user.repository.interface';
import { User, UserProps } from '../../domain/user/entities/user.entity';
import { Email } from '../../domain/user/value-objects/email';

@injectable()
export class UserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    return users.find(user => user.email.value === email) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async update(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  // Helper method to seed initial data
  async seed(): Promise<void> {
    const user1 = new User({
      name: 'John Doe',
      email: new Email('john.doe@example.com'),
      isActive: true
    });

    const user2 = new User({
      name: 'Jane Smith',
      email: new Email('jane.smith@example.com'),
      isActive: true
    });

    await this.save(user1);
    await this.save(user2);
  }
}
