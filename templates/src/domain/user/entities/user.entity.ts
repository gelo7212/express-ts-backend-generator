import { BaseEntity } from '../../shared/base-entity';
import { Email } from '../value-objects/email';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserUpdatedEvent } from '../events/user-updated.event';

export interface UserProps {
  name: string;
  email: Email;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends BaseEntity {
  private _name: string;
  private _email: Email;
  private _isActive: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps, id?: string) {
    super(id);
    this._name = props.name;
    this._email = props.email;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    // Add domain event if it's a new user
    if (!id) {
      this.addDomainEvent(new UserCreatedEvent(this.id, this._name, this._email.value));
    }
  }

  get name(): string {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateName(name: string): void {
    this._name = name;
    this._updatedAt = new Date();
    this.addDomainEvent(new UserUpdatedEvent(this.id, 'name', name));
  }

  updateEmail(email: Email): void {
    this._email = email;
    this._updatedAt = new Date();
    this.addDomainEvent(new UserUpdatedEvent(this.id, 'email', email.value));
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
    this.addDomainEvent(new UserUpdatedEvent(this.id, 'isActive', true));
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
    this.addDomainEvent(new UserUpdatedEvent(this.id, 'isActive', false));
  }

  toJSON() {
    return {
      id: this.id,
      name: this._name,
      email: this._email.value,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}
