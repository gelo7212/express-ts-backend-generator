import { Router } from 'express';

/**
 * Route Registration Interface
 * Defines the structure for route registration
 */
export interface RouteConfig {
  path: string;
  router: Router;
  name: string;
  description?: string;
}

/**
 * Route Registry - Centralized route management
 * This allows automatic route registration without modifying app.ts
 */
export class RouteRegistry {
  private static routes: RouteConfig[] = [];

  /**
   * Register a new route
   */
  static register(config: RouteConfig): void {
    // Check if route already exists
    const existingIndex = this.routes.findIndex(route => route.path === config.path);
    
    if (existingIndex >= 0) {
      // Update existing route
      this.routes[existingIndex] = config;
      console.log(`🔄 Updated route: ${config.path} (${config.name})`);
    } else {
      // Add new route
      this.routes.push(config);
      console.log(`➕ Registered route: ${config.path} (${config.name})`);
    }
  }

  /**
   * Get all registered routes
   */
  static getRoutes(): RouteConfig[] {
    return [...this.routes];
  }

  /**
   * Remove a route by path
   */
  static unregister(path: string): boolean {
    const index = this.routes.findIndex(route => route.path === path);
    if (index >= 0) {
      const removed = this.routes.splice(index, 1)[0];
      console.log(`➖ Unregistered route: ${removed.path} (${removed.name})`);
      return true;
    }
    return false;
  }

  /**
   * Clear all routes
   */
  static clear(): void {
    this.routes = [];
  }
}
