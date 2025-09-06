import { User } from '../../../src/domain/user/entities/user.entity';
import { Email } from '../../../src/domain/user/value-objects/email';

describe('User Entity', () => {
  describe('constructor', () => {
    it('should create a user with valid properties', () => {
      const email = new Email('test@example.com');
      const user = new User({
        name: 'John Doe',
        email,
        isActive: true
      });

      expect(user.name).toBe('John Doe');
      expect(user.email).toBe(email);
      expect(user.isActive).toBe(true);
      expect(user.id).toBeDefined();
    });

    it('should generate UserCreatedEvent when creating new user', () => {
      const email = new Email('test@example.com');
      const user = new User({
        name: 'John Doe',
        email,
        isActive: true
      });

      const events = user.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('UserCreated');
    });
  });

  describe('updateName', () => {
    it('should update name and generate event', () => {
      const email = new Email('test@example.com');
      const user = new User({
        name: 'John Doe',
        email,
        isActive: true
      });

      user.clearDomainEvents(); // Clear initial events
      user.updateName('Jane Doe');

      expect(user.name).toBe('Jane Doe');
      
      const events = user.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('UserUpdated');
    });
  });

  describe('activate/deactivate', () => {
    it('should activate user and generate event', () => {
      const email = new Email('test@example.com');
      const user = new User({
        name: 'John Doe',
        email,
        isActive: false
      });

      user.clearDomainEvents();
      user.activate();

      expect(user.isActive).toBe(true);
      
      const events = user.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('UserUpdated');
    });

    it('should deactivate user and generate event', () => {
      const email = new Email('test@example.com');
      const user = new User({
        name: 'John Doe',
        email,
        isActive: true
      });

      user.clearDomainEvents();
      user.deactivate();

      expect(user.isActive).toBe(false);
      
      const events = user.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('UserUpdated');
    });
  });
});
