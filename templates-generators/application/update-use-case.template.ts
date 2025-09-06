import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/types';
import { I<%= pascalCase %>Repository } from '../../../domain/<%= lowercase %>/repositories/<%= kebabCase %>.repository.interface';
import { <%= pascalCase %> } from '../../../domain/<%= lowercase %>/entities/<%= kebabCase %>.entity';
import { Update<%= pascalCase %>Request, <%= pascalCase %>Response } from '../../dto/<%= kebabCase %>.dto';
import { <%= pascalCase %>DomainService } from '../../../domain/<%= lowercase %>/services/<%= kebabCase %>-domain.service';

@injectable()
export class Update<%= pascalCase %>UseCase {
  constructor(
    @inject(TYPES.<%= pascalCase %>Repository) private <%= camelCase %>Repository: I<%= pascalCase %>Repository,
    @inject(TYPES.<%= pascalCase %>DomainService) private <%= camelCase %>DomainService: <%= pascalCase %>DomainService
  ) {}

  async execute(id: string, request: Update<%= pascalCase %>Request): Promise<<%= pascalCase %>Response> {
    // Find existing <%= camelCase %>
    const <%= camelCase %> = await this.<%= camelCase %>Repository.findById(id);
    if (!<%= camelCase %>) {
      throw new Error('<%= pascalCase %> not found');
    }

    // Validate business rules if name is being updated
    if (request.name && request.name !== <%= camelCase %>.name) {
      const isNameUnique = await this.<%= camelCase %>DomainService.validateUniqueName(request.name, id);
      if (!isNameUnique) {
        throw new Error('<%= pascalCase %> with this name already exists');
      }
    }

    // Update properties
    if (request.name) {
      <%= camelCase %>.updateName(request.name);
    }
    if (request.description !== undefined) {
      <%= camelCase %>.updateDescription(request.description);
    }
    if (request.isActive !== undefined) {
      if (request.isActive) {
        <%= camelCase %>.activate();
      } else {
        <%= camelCase %>.deactivate();
      }
    }

    // Save updated <%= camelCase %>
    await this.<%= camelCase %>Repository.update(<%= camelCase %>);

    return <%= camelCase %>.toJSON();
  }
}
