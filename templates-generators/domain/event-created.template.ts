import { DomainEvent } from '../../shared/domain-event';

export class <%= pascalCase %>CreatedEvent extends DomainEvent {
  constructor(
    public readonly <%= camelCase %>Id: string,
    public readonly name: string
  ) {
    super('<%= pascalCase %>Created');
  }
}
