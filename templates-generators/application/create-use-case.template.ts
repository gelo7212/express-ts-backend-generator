import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/types';
import { I<%= pascalCase %>Repository } from '../../../domain/<%= lowercase %>/repositories/<%= kebabCase %>.repository.interface';
import { <%= pascalCase %> } from '../../../domain/<%= lowercase %>/entities/<%= kebabCase %>.entity';
import { Create<%= pascalCase %>Request, <%= pascalCase %>Response } from '../../dto/<%= kebabCase %>.dto';
import { <%= pascalCase %>DomainService } from '../../../domain/<%= lowercase %>/services/<%= kebabCase %>-domain.service';

@injectable()
export class Create<%= pascalCase %>UseCase {
  constructor(
    @inject(TYPES.<%= pascalCase %>Repository) private <%= camelCase %>Repository: I<%= pascalCase %>Repository,
    @inject(TYPES.<%= pascalCase %>DomainService) private <%= camelCase %>DomainService: <%= pascalCase %>DomainService
  ) {}

  async execute(request: Create<%= pascalCase %>Request): Promise<<%= pascalCase %>Response> {
    // Validate business rules
    const isNameUnique = await this.<%= camelCase %>DomainService.validateUniqueName(request.name);
    if (!isNameUnique) {
      throw new Error('<%= pascalCase %> with this name already exists');
    }

    // Create <%= camelCase %> entity
    const <%= camelCase %> = new <%= pascalCase %>({
      name: request.name,
      description: request.description,
      isActive: request.isActive ?? true
    });

    // Save to repository
    await this.<%= camelCase %>Repository.save(<%= camelCase %>);

    return <%= camelCase %>.toJSON();
  }
}
