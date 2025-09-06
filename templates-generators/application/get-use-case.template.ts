import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/types';
import { I<%= pascalCase %>Repository } from '../../../domain/<%= lowercase %>/repositories/<%= kebabCase %>.repository.interface';
import { <%= pascalCase %>Response } from '../../dto/<%= kebabCase %>.dto';

@injectable()
export class Get<%= pascalCase %>UseCase {
  constructor(
    @inject(TYPES.<%= pascalCase %>Repository) private <%= camelCase %>Repository: I<%= pascalCase %>Repository
  ) {}

  async execute(id: string): Promise<<%= pascalCase %>Response | null> {
    const <%= camelCase %> = await this.<%= camelCase %>Repository.findById(id);
    return <%= camelCase %> ? <%= camelCase %>.toJSON() : null;
  }

  async executeByName(name: string): Promise<<%= pascalCase %>Response | null> {
    const <%= camelCase %> = await this.<%= camelCase %>Repository.findByName(name);
    return <%= camelCase %> ? <%= camelCase %>.toJSON() : null;
  }

  async executeAll(): Promise<<%= pascalCase %>Response[]> {
    const <%= pluralCamelCase %> = await this.<%= camelCase %>Repository.findAll();
    return <%= pluralCamelCase %>.map(<%= camelCase %> => <%= camelCase %>.toJSON());
  }

  async executeActive(): Promise<<%= pascalCase %>Response[]> {
    const <%= pluralCamelCase %> = await this.<%= camelCase %>Repository.findByStatus(true);
    return <%= pluralCamelCase %>.map(<%= camelCase %> => <%= camelCase %>.toJSON());
  }
}
