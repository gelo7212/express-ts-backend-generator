import { IDependencyContainer } from '../types';

/**
 * Simple dependency injection container
 */
export class DependencyContainer implements IDependencyContainer {
  private services = new Map<string, any>();
  private singletons = new Map<string, () => any>();
  private instances = new Map<string, any>();

  register<T>(token: string, implementation: T): void {
    this.services.set(token, implementation);
  }

  registerSingleton<T>(token: string, factory: () => T): void {
    this.singletons.set(token, factory);
  }

  resolve<T>(token: string): T {
    // Check for singleton instances first
    if (this.instances.has(token)) {
      return this.instances.get(token);
    }

    // Check for singleton factories
    if (this.singletons.has(token)) {
      const factory = this.singletons.get(token)!;
      const instance = factory();
      this.instances.set(token, instance);
      return instance;
    }

    // Check for regular services
    if (this.services.has(token)) {
      return this.services.get(token);
    }

    throw new Error(`Service with token '${token}' not found`);
  }

  isRegistered(token: string): boolean {
    return this.services.has(token) || this.singletons.has(token);
  }

  clear(): void {
    this.services.clear();
    this.singletons.clear();
    this.instances.clear();
  }
}
