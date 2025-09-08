// Global test setup
import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  var __MONGO_URI__: string;
  var __MONGO_DB_NAME__: string;
  var __MONGO_SERVERS__: MongoMemoryServer[];
}

export default async function globalSetup() {
  console.log('Setting up MongoDB test servers...');
  
  // Create multiple MongoDB instances for testing
  const servers: MongoMemoryServer[] = [];
  const dbNames = ['test-primary', 'test-analytics', 'test-logs'];
  
  for (const dbName of dbNames) {
    const mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: dbName,
        port: undefined // Let MongoDB choose available port
      }
    });
    servers.push(mongoServer);
  }
  
  // Store server references globally
  (global as any).__MONGO_SERVERS__ = servers;
  (global as any).__MONGO_URI__ = servers[0].getUri();
  (global as any).__MONGO_DB_NAME__ = dbNames[0];
  
  console.log('MongoDB test servers ready');
}
