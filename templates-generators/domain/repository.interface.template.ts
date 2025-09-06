import { <%= pascalCase %> } from '../entities/<%= kebabCase %>.entity';

export interface I<%= pascalCase %>Repository {
  findById(id: string): Promise<<%= pascalCase %> | null>;
  findAll(): Promise<<%= pascalCase %>[]>;
  save(<%= camelCase %>: <%= pascalCase %>): Promise<void>;
  update(<%= camelCase %>: <%= pascalCase %>): Promise<void>;
  delete(id: string): Promise<void>;
  findByName(name: string): Promise<<%= pascalCase %> | null>;
  findByStatus(isActive: boolean): Promise<<%= pascalCase %>[]>;
}
