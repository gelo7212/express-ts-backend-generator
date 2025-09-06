import { injectable } from 'inversify';
import { I<%= pascalCase %>Repository } from '../../domain/<%= lowercase %>/repositories/<%= kebabCase %>.repository.interface';
import { <%= pascalCase %> } from '../../domain/<%= lowercase %>/entities/<%= kebabCase %>.entity';

@injectable()
export class <%= pascalCase %>Repository implements I<%= pascalCase %>Repository {
  private <%= pluralCamelCase %>: Map<string, <%= pascalCase %>> = new Map();

  async findById(id: string): Promise<<%= pascalCase %> | null> {
    return this.<%= pluralCamelCase %>.get(id) || null;
  }

  async findAll(): Promise<<%= pascalCase %>[]> {
    return Array.from(this.<%= pluralCamelCase %>.values());
  }

  async save(<%= camelCase %>: <%= pascalCase %>): Promise<void> {
    this.<%= pluralCamelCase %>.set(<%= camelCase %>.id, <%= camelCase %>);
  }

  async update(<%= camelCase %>: <%= pascalCase %>): Promise<void> {
    if (this.<%= pluralCamelCase %>.has(<%= camelCase %>.id)) {
      this.<%= pluralCamelCase %>.set(<%= camelCase %>.id, <%= camelCase %>);
    } else {
      throw new Error('<%= pascalCase %> not found');
    }
  }

  async delete(id: string): Promise<void> {
    if (!this.<%= pluralCamelCase %>.delete(id)) {
      throw new Error('<%= pascalCase %> not found');
    }
  }

  async findByName(name: string): Promise<<%= pascalCase %> | null> {
    for (const <%= camelCase %> of this.<%= pluralCamelCase %>.values()) {
      if (<%= camelCase %>.name === name) {
        return <%= camelCase %>;
      }
    }
    return null;
  }

  async findByStatus(isActive: boolean): Promise<<%= pascalCase %>[]> {
    return Array.from(this.<%= pluralCamelCase %>.values()).filter(<%= camelCase %> => <%= camelCase %>.isActive === isActive);
  }
}
