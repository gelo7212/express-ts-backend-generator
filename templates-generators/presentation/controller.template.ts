import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/types';
import { Get<%= pascalCase %>UseCase } from '../../../application/use-cases/<%= lowercase %>/get-<%= kebabCase %>.use-case';
import { Create<%= pascalCase %>UseCase } from '../../../application/use-cases/<%= lowercase %>/create-<%= kebabCase %>.use-case';
import { Update<%= pascalCase %>UseCase } from '../../../application/use-cases/<%= lowercase %>/update-<%= kebabCase %>.use-case';
import { Delete<%= pascalCase %>UseCase } from '../../../application/use-cases/<%= lowercase %>/delete-<%= kebabCase %>.use-case';

@injectable()
export class <%= pascalCase %>Controller {
  constructor(
    @inject(TYPES.Get<%= pascalCase %>UseCase) private get<%= pascalCase %>UseCase: Get<%= pascalCase %>UseCase,
    @inject(TYPES.Create<%= pascalCase %>UseCase) private create<%= pascalCase %>UseCase: Create<%= pascalCase %>UseCase,
    @inject(TYPES.Update<%= pascalCase %>UseCase) private update<%= pascalCase %>UseCase: Update<%= pascalCase %>UseCase,
    @inject(TYPES.Delete<%= pascalCase %>UseCase) private delete<%= pascalCase %>UseCase: Delete<%= pascalCase %>UseCase
  ) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const <%= pluralCamelCase %> = await this.get<%= pascalCase %>UseCase.executeAll();
      res.status(200).json(<%= pluralCamelCase %>);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const <%= camelCase %> = await this.get<%= pascalCase %>UseCase.execute(id);
      
      if (!<%= camelCase %>) {
        res.status(404).json({ error: '<%= pascalCase %> not found' });
        return;
      }
      
      res.status(200).json(<%= camelCase %>);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const <%= camelCase %> = await this.create<%= pascalCase %>UseCase.execute(req.body);
      res.status(201).json(<%= camelCase %>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const <%= camelCase %> = await this.update<%= pascalCase %>UseCase.execute(id, req.body);
      res.status(200).json(<%= camelCase %>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.delete<%= pascalCase %>UseCase.execute(id);
      res.status(204).send();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  }
}
