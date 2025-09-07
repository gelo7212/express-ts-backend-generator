import { DomainEvent } from '../../shared/domain-event';

export class UserUpdatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly field: string,
    public readonly newValue: any
  ) {
    super('UserUpdated');
  }
}
