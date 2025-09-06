import { Router } from 'express';
import { container } from '../../../infrastructure/container';
import { TYPES } from '../../../infrastructure/types';
import { <%= pascalCase %>Controller } from '../controllers/<%= kebabCase %>.controller';
import { validationMiddleware } from '../middleware/validation.middleware';
import { Create<%= pascalCase %>Dto, Update<%= pascalCase %>Dto } from '../dto/<%= kebabCase %>.dto';

const router = Router();
const <%= camelCase %>Controller = container.get<<%= pascalCase %>Controller>(TYPES.<%= pascalCase %>Controller);

// GET /api/<%= pluralCamelCase %>
router.get('/', <%= camelCase %>Controller.getAll);

// GET /api/<%= pluralCamelCase %>/:id
router.get('/:id', <%= camelCase %>Controller.getById);

// POST /api/<%= pluralCamelCase %>
router.post(
  '/',
  validationMiddleware(Create<%= pascalCase %>Dto),
  <%= camelCase %>Controller.create
);

// PUT /api/<%= pluralCamelCase %>/:id
router.put(
  '/:id',
  validationMiddleware(Update<%= pascalCase %>Dto),
  <%= camelCase %>Controller.update
);

// DELETE /api/<%= pluralCamelCase %>/:id
router.delete('/:id', <%= camelCase %>Controller.delete);

export { router as <%= camelCase %>Routes };
