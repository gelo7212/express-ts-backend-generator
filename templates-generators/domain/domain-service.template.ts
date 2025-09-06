import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/types';
import { I<%= pascalCase %>Repository } from '../repositories/<%= kebabCase %>.repository.interface';
import { <%= pascalCase %> } from '../entities/<%= kebabCase %>.entity';

@injectable()
export class <%= pascalCase %>DomainService {
  constructor(
    @inject(TYPES.<%= pascalCase %>Repository) private <%= camelCase %>Repository: I<%= pascalCase %>Repository
  ) {}

  async validateUniqueName(name: string, excludeId?: string): Promise<boolean> {
    const existing<%= pascalCase %> = await this.<%= camelCase %>Repository.findByName(name);
    return !existing<%= pascalCase %> || existing<%= pascalCase %>.id === excludeId;
  }

  async canDelete(id: string): Promise<boolean> {
    const <%= camelCase %> = await this.<%= camelCase %>Repository.findById(id);
    if (!<%= camelCase %>) {
      return false;
    }
    
    // Add business logic for deletion validation
    // For example, check if <%= camelCase %> has dependencies
    return true;
  }

  async getActive<%= pluralPascalCase %>(): Promise<<%= pascalCase %>[]> {
    return this.<%= camelCase %>Repository.findByStatus(true);
  }
}
