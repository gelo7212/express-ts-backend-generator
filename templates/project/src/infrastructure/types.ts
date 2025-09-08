export const TYPES = {
  // Domain Services
  UserDomainService: Symbol.for('UserDomainService'),
  
  // Application Services
  UserApplicationService: Symbol.for('UserApplicationService'),
  
  // Use Cases
  CreateUserUseCase: Symbol.for('CreateUserUseCase'),
  GetUserUseCase: Symbol.for('GetUserUseCase'),
  UpdateUserUseCase: Symbol.for('UpdateUserUseCase'),
  DeleteUserUseCase: Symbol.for('DeleteUserUseCase'),
  
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  
  // Infrastructure
  Database: Symbol.for('Database'),
  DatabaseService: Symbol.for('DatabaseService'),
  EventBus: Symbol.for('EventBus'),
  Cache: Symbol.for('Cache'),
  Logger: Symbol.for('Logger'),
  
  // Controllers
  UserController: Symbol.for('UserController')
};

// Interface Types
export interface ILogger {
  info(message: string, meta?: any): void;
  error(message: string, error?: Error): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export interface IEventBus {
  publish(event: any): Promise<void>;
  subscribe(eventType: string, handler: (event: any) => Promise<void>): void;
}

export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}