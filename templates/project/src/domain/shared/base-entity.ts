import { v4 as uuidv4 } from 'uuid';
import { DomainEvent } from './domain-event';

export abstract class BaseEntity {
  protected _id: string;
  private _domainEvents: DomainEvent[] = [];

  constructor(id?: string) {
    this._id = id || uuidv4();
  }

  get id(): string {
    return this._id;
  }

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  equals(entity: BaseEntity): boolean {
    if (!(entity instanceof this.constructor)) {
      return false;
    }
    return entity.id === this.id;
  }
}
