import { RouteRegistry } from '../route-registry';

// Import all route modules here
// This file will be auto-updated by the generator
import userRoutes from './user.routes';

/**
 * Route Registration
 * This file automatically registers all routes with the RouteRegistry
 * It's updated automatically by the generator when new routes are created
 */

// Register User routes
RouteRegistry.register({
  path: '/users',
  router: userRoutes,
  name: 'User Routes',
  description: 'User management endpoints'
});

// Auto-generated route registrations will be added below
// DO NOT MODIFY THIS SECTION MANUALLY - IT'S AUTO-GENERATED
// START_GENERATED_ROUTES

// END_GENERATED_ROUTES

export { RouteRegistry };
