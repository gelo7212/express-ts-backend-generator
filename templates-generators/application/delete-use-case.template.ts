import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/types';
import { I<%= pascalCase %>Repository } from '../../../domain/<%= lowercase %>/repositories/<%= kebabCase %>.repository.interface';
import { <%= pascalCase %>DomainService } from '../../../domain/<%= lowercase %>/services/<%= kebabCase %>-domain.service';

@injectable()
export class Delete<%= pascalCase %>UseCase {
  constructor(
    @inject(TYPES.<%= pascalCase %>Repository) private <%= camelCase %>Repository: I<%= pascalCase %>Repository,
    @inject(TYPES.<%= pascalCase %>DomainService) private <%= camelCase %>DomainService: <%= pascalCase %>DomainService
  ) {}

  async execute(id: string): Promise<void> {
    // Check if <%= camelCase %> exists
    const <%= camelCase %> = await this.<%= camelCase %>Repository.findById(id);
    if (!<%= camelCase %>) {
      throw new Error('<%= pascalCase %> not found');
    }

    // Validate if deletion is allowed
    const canDelete = await this.<%= camelCase %>DomainService.canDelete(id);
    if (!canDelete) {
      throw new Error('<%= pascalCase %> cannot be deleted due to business constraints');
    }

    // Delete the <%= camelCase %>
    await this.<%= camelCase %>Repository.delete(id);
  }
}
