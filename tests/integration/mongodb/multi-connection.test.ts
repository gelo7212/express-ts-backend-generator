import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MongoDBConnection, MongoConnectionConfig } from '../../../templates/infrastructure/mongodb/multi-connection';

describe('MongoDB Multi-Database Connection Tests', () => {
  let mongoServers: MongoMemoryServer[] = [];
  const databases = ['primary', 'analytics', 'logs'];

  beforeAll(async () => {
    // Create multiple in-memory MongoDB instances
    for (const dbName of databases) {
      const mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: dbName
        }
      });
      mongoServers.push(mongoServer);
    }
  });

  afterAll(async () => {
    // Close all connections and stop servers
    await MongoDBConnection.closeAll();
    
    for (const server of mongoServers) {
      await server.stop();
    }
    mongoServers = [];
  });

  afterEach(async () => {
    // Clean up connections after each test
    await MongoDBConnection.closeAll();
  });

  describe('Connection Initialization', () => {
    it('should initialize multiple database connections', async () => {
      const configs: MongoConnectionConfig[] = mongoServers.map((server, index) => ({
        uri: server.getUri(),
        name: databases[index],
        options: {
          maxPoolSize: 5,
          serverSelectionTimeoutMS: 10000
        }
      }));

      await MongoDBConnection.initialize(configs);

      expect(MongoDBConnection.isConnected()).toBe(true);
      expect(MongoDBConnection.getConnectionNames()).toEqual(databases);
    });

    it('should handle duplicate initialization gracefully', async () => {
      const configs: MongoConnectionConfig[] = [{
        uri: mongoServers[0].getUri(),
        name: 'primary'
      }];

      await MongoDBConnection.initialize(configs);
      
      // Should not throw error on second initialization
      await expect(MongoDBConnection.initialize(configs)).resolves.not.toThrow();
    });

    it('should create individual connections', async () => {
      const config: MongoConnectionConfig = {
        uri: mongoServers[0].getUri(),
        name: 'test-connection'
      };

      const connection = await MongoDBConnection.createConnection(config);
      
      expect(connection).toBeDefined();
      expect(connection.readyState).toBe(1); // Connected
      expect(MongoDBConnection.getConnection('test-connection')).toBe(connection);
    });
  });

  describe('Connection Management', () => {
    beforeEach(async () => {
      const configs: MongoConnectionConfig[] = mongoServers.map((server, index) => ({
        uri: server.getUri(),
        name: databases[index]
      }));

      await MongoDBConnection.initialize(configs);
    });

    it('should retrieve connections by name', () => {
      for (const dbName of databases) {
        const connection = MongoDBConnection.getConnection(dbName);
        expect(connection).toBeDefined();
        expect(connection?.readyState).toBe(1);
      }
    });

    it('should return undefined for non-existent connections', () => {
      const connection = MongoDBConnection.getConnection('non-existent');
      expect(connection).toBeUndefined();
    });

    it('should close specific connections', async () => {
      await MongoDBConnection.closeConnection('primary');
      
      expect(MongoDBConnection.getConnection('primary')).toBeUndefined();
      expect(MongoDBConnection.getConnection('analytics')).toBeDefined();
      expect(MongoDBConnection.getConnection('logs')).toBeDefined();
    });

    it('should close all connections', async () => {
      await MongoDBConnection.closeAll();
      
      expect(MongoDBConnection.isConnected()).toBe(false);
      expect(MongoDBConnection.getConnectionNames()).toEqual([]);
    });
  });

  describe('Health Checks', () => {
    beforeEach(async () => {
      const configs: MongoConnectionConfig[] = mongoServers.map((server, index) => ({
        uri: server.getUri(),
        name: databases[index]
      }));

      await MongoDBConnection.initialize(configs);
    });

    it('should perform health checks on all connections', async () => {
      const healthResults = await MongoDBConnection.healthCheck();
      
      expect(Object.keys(healthResults)).toEqual(databases);
      
      for (const dbName of databases) {
        expect(healthResults[dbName]).toBe(true);
      }
    });

    it('should detect unhealthy connections', async () => {
      // Close one connection manually to simulate failure
      const connection = MongoDBConnection.getConnection('primary');
      await connection?.close();
      
      const healthResults = await MongoDBConnection.healthCheck();
      
      expect(healthResults.primary).toBe(false);
      expect(healthResults.analytics).toBe(true);
      expect(healthResults.logs).toBe(true);
    });
  });

  describe('Cross-Database Operations', () => {
    beforeEach(async () => {
      const configs: MongoConnectionConfig[] = mongoServers.map((server, index) => ({
        uri: server.getUri(),
        name: databases[index]
      }));

      await MongoDBConnection.initialize(configs);
    });

    it('should perform operations on different databases', async () => {
      const primaryConn = MongoDBConnection.getConnection('primary');
      const analyticsConn = MongoDBConnection.getConnection('analytics');
      const logsConn = MongoDBConnection.getConnection('logs');

      // Create test collections and documents in each database
      const primaryResult = await primaryConn?.db.collection('users').insertOne({
        name: 'John Doe',
        email: 'john@example.com'
      });

      const analyticsResult = await analyticsConn?.db.collection('events').insertOne({
        event: 'user_signup',
        timestamp: new Date(),
        userId: primaryResult?.insertedId
      });

      const logsResult = await logsConn?.db.collection('application_logs').insertOne({
        level: 'info',
        message: 'User created successfully',
        timestamp: new Date()
      });

      expect(primaryResult?.insertedId).toBeDefined();
      expect(analyticsResult?.insertedId).toBeDefined();
      expect(logsResult?.insertedId).toBeDefined();

      // Verify data in each database
      const userCount = await primaryConn?.db.collection('users').countDocuments();
      const eventCount = await analyticsConn?.db.collection('events').countDocuments();
      const logCount = await logsConn?.db.collection('application_logs').countDocuments();

      expect(userCount).toBe(1);
      expect(eventCount).toBe(1);
      expect(logCount).toBe(1);
    });

    it('should maintain isolation between databases', async () => {
      const primaryConn = MongoDBConnection.getConnection('primary');
      const analyticsConn = MongoDBConnection.getConnection('analytics');

      // Insert into primary database
      await primaryConn?.db.collection('test_collection').insertOne({ data: 'primary' });

      // Verify the data doesn't exist in analytics database
      const analyticsData = await analyticsConn?.db.collection('test_collection').findOne({ data: 'primary' });
      
      expect(analyticsData).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid connection URIs', async () => {
      const invalidConfig: MongoConnectionConfig = {
        uri: 'mongodb://invalid-host:27017/test',
        name: 'invalid'
      };

      await expect(MongoDBConnection.createConnection(invalidConfig)).rejects.toThrow();
    });

    it('should handle connection timeouts', async () => {
      const config: MongoConnectionConfig = {
        uri: 'mongodb://localhost:99999/timeout-test',
        name: 'timeout-test',
        options: {
          serverSelectionTimeoutMS: 1000
        }
      };

      await expect(MongoDBConnection.createConnection(config)).rejects.toThrow();
    });
  });
});
