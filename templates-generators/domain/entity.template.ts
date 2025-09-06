import { BaseEntity } from '../../shared/base-entity';
import { <%= pascalCase %>CreatedEvent } from '../events/<%= kebabCase %>-created.event';
import { <%= pascalCase %>UpdatedEvent } from '../events/<%= kebabCase %>-updated.event';

export interface <%= pascalCase %>Props {
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class <%= pascalCase %> extends BaseEntity {
  private _name: string;
  private _description?: string;
  private _isActive: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: <%= pascalCase %>Props, id?: string) {
    super(id);
    this._name = props.name;
    this._description = props.description;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    // Add domain event if it's a new <%= lowercase %>
    if (!id) {
      this.addDomainEvent(new <%= pascalCase %>CreatedEvent(this.id, this._name));
    }
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
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
    this.addDomainEvent(new <%= pascalCase %>UpdatedEvent(this.id, 'name', name));
  }

  updateDescription(description: string): void {
    this._description = description;
    this._updatedAt = new Date();
    this.addDomainEvent(new <%= pascalCase %>UpdatedEvent(this.id, 'description', description));
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
    this.addDomainEvent(new <%= pascalCase %>UpdatedEvent(this.id, 'isActive', true));
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
    this.addDomainEvent(new <%= pascalCase %>UpdatedEvent(this.id, 'isActive', false));
  }

  toJSON() {
    return {
      id: this.id,
      name: this._name,
      description: this._description,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}
