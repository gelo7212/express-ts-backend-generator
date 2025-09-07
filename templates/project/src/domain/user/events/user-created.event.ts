import { DomainEvent } from '../../shared/domain-event';

export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly email: string
  ) {
    super('UserCreated');
  }
}
