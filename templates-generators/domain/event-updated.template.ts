import { DomainEvent } from '../../shared/domain-event';

export class <%= pascalCase %>UpdatedEvent extends DomainEvent {
  constructor(
    public readonly <%= camelCase %>Id: string,
    public readonly field: string,
    public readonly newValue: any
  ) {
    super('<%= pascalCase %>Updated');
  }
}
