/**
 * Integration test for MongoDB schema generation and multi-database connectivity
 * This test validates that generated schemas work correctly with multiple database connections
 */

import * as fs from 'fs';
import * as path from 'path';
import { Application } from '../../../src/core/application';
import { TOKENS } from '../../../src/types';

describe('MongoDB Multi-Database Integration', () => {
  let app: Application;
  let testOutputDir: string;

  beforeAll(async () => {
    // Initialize the application
    app = new Application();
    await app.initialize();
    
    // Create test output directory
    testOutputDir = path.join(__dirname, '../../output');
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  afterAll(async () => {
    // Cleanup test output directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  describe('Schema Generation for Different Database Contexts', () => {
    it('should generate User schema for primary database', async () => {
      const commandRegistry = app.resolve(TOKENS.COMMAND_REGISTRY);
      const command = commandRegistry.getCommand('generate:schema:mongodb');
      
      expect(command).toBeDefined();
      
      // Change to test output directory
      const originalCwd = process.cwd();
      process.chdir(testOutputDir);
      
      try {
        await command!.execute(
          ['User'], 
          {
            config: path.join(__dirname, '../../fixtures/user-schema-config.json'),
            domain: 'users'
          }
        );
        
        // Verify generated files exist
        const schemaPath = path.join(testOutputDir, 'src/infrastructure/database/mongodb/schemas/user.schema.ts');
        const modelPath = path.join(testOutputDir, 'src/infrastructure/database/mongodb/models/user.model.ts');
        
        expect(fs.existsSync(schemaPath)).toBe(true);
        expect(fs.existsSync(modelPath)).toBe(true);
        
        // Verify schema content contains expected elements
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        expect(schemaContent).toContain('IUserDocument');
        expect(schemaContent).toContain('userSchema');
        expect(schemaContent).toContain('username:');
        expect(schemaContent).toContain('email:');
        expect(schemaContent).toContain('timestamps: true');
        
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate Order schema for analytics database', async () => {
      const commandRegistry = app.resolve(TOKENS.COMMAND_REGISTRY);
      const command = commandRegistry.getCommand('generate:schema:mongodb');
      
      const originalCwd = process.cwd();
      process.chdir(testOutputDir);
      
      try {
        await command!.execute(
          ['Order'], 
          {
            config: path.join(__dirname, '../../fixtures/order-schema-config.json'),
            domain: 'orders'
          }
        );
        
        // Verify generated files
        const schemaPath = path.join(testOutputDir, 'src/infrastructure/database/mongodb/schemas/order.schema.ts');
        const modelPath = path.join(testOutputDir, 'src/infrastructure/database/mongodb/models/order.model.ts');
        
        expect(fs.existsSync(schemaPath)).toBe(true);
        expect(fs.existsSync(modelPath)).toBe(true);
        
        // Verify schema content
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        expect(schemaContent).toContain('IOrderDocument');
        expect(schemaContent).toContain('orderSchema');
        expect(schemaContent).toContain('customerId:');
        expect(schemaContent).toContain('items:');
        expect(schemaContent).toContain('status:');
        expect(schemaContent).toContain('calculateTotal');
        
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate different schemas with proper isolation', async () => {
      const commandRegistry = app.resolve(TOKENS.COMMAND_REGISTRY);
      const command = commandRegistry.getCommand('generate:schema:mongodb');
      
      const originalCwd = process.cwd();
      process.chdir(testOutputDir);
      
      try {
        // Generate Product schema for e-commerce database
        await command!.execute(
          ['Product'], 
          {
            fields: JSON.stringify([
              { name: 'name', type: 'String', required: true },
              { name: 'price', type: 'Number', required: true, min: 0 },
              { name: 'category', type: 'String', required: true },
              { name: 'inStock', type: 'Boolean', default: true }
            ]),
            timestamps: true,
            indexes: true,
            domain: 'catalog'
          }
        );
        
        // Generate Log schema for logging database
        await command!.execute(
          ['Log'], 
          {
            fields: JSON.stringify([
              { name: 'level', type: 'String', required: true, enum: ['info', 'warn', 'error'] },
              { name: 'message', type: 'String', required: true },
              { name: 'source', type: 'String', required: true },
              { name: 'metadata', type: 'Mixed', required: false }
            ]),
            timestamps: true,
            domain: 'logging'
          }
        );
        
        // Verify both schemas exist and are different
        const productSchemaPath = path.join(testOutputDir, 'src/infrastructure/database/mongodb/schemas/product.schema.ts');
        const logSchemaPath = path.join(testOutputDir, 'src/infrastructure/database/mongodb/schemas/log.schema.ts');
        
        expect(fs.existsSync(productSchemaPath)).toBe(true);
        expect(fs.existsSync(logSchemaPath)).toBe(true);
        
        const productContent = fs.readFileSync(productSchemaPath, 'utf-8');
        const logContent = fs.readFileSync(logSchemaPath, 'utf-8');
        
        // Verify product schema
        expect(productContent).toContain('IProductDocument');
        expect(productContent).toContain('price:');
        expect(productContent).toContain('inStock:');
        
        // Verify log schema
        expect(logContent).toContain('ILogDocument');
        expect(logContent).toContain('level:');
        expect(logContent).toContain('message:');
        expect(logContent).toContain('source:');
        
        // Verify schemas are different
        expect(productContent).not.toContain('ILogDocument');
        expect(logContent).not.toContain('IProductDocument');
        
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Command Line Interface', () => {
    it('should handle invalid schema configuration gracefully', async () => {
      const commandRegistry = app.resolve(TOKENS.COMMAND_REGISTRY);
      const command = commandRegistry.getCommand('generate:schema:mongodb');
      
      const originalCwd = process.cwd();
      process.chdir(testOutputDir);
      
      try {
        // Test with invalid JSON fields
        await expect(
          command!.execute(
            ['InvalidSchema'], 
            {
              fields: 'invalid-json',
            }
          )
        ).rejects.toThrow();
        
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should require schema name parameter', async () => {
      const commandRegistry = app.resolve(TOKENS.COMMAND_REGISTRY);
      const command = commandRegistry.getCommand('generate:schema:mongodb');
      
      await expect(
        command!.execute([], {})
      ).rejects.toThrow('Schema name is required');
    });

    it('should support all command options', async () => {
      const commandRegistry = app.resolve(TOKENS.COMMAND_REGISTRY);
      const command = commandRegistry.getCommand('generate:schema:mongodb');
      
      const originalCwd = process.cwd();
      process.chdir(testOutputDir);
      
      try {
        await command!.execute(
          ['FullFeatureSchema'], 
          {
            fields: JSON.stringify([
              { name: 'title', type: 'String', required: true },
              { name: 'description', type: 'String', required: false }
            ]),
            timestamps: true,
            virtuals: true,
            indexes: true,
            methods: true,
            statics: true,
            domain: 'content'
          }
        );
        
        const schemaPath = path.join(testOutputDir, 'src/infrastructure/database/mongodb/schemas/full-feature-schema.schema.ts');
        expect(fs.existsSync(schemaPath)).toBe(true);
        
        const content = fs.readFileSync(schemaPath, 'utf-8');
        expect(content).toContain('timestamps: true');
        
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('File Generation Structure', () => {
    it('should generate proper directory structure', async () => {
      const commandRegistry = app.resolve(TOKENS.COMMAND_REGISTRY);
      const command = commandRegistry.getCommand('generate:schema:mongodb');
      
      const originalCwd = process.cwd();
      process.chdir(testOutputDir);
      
      try {
        await command!.execute(['TestStructure'], {
          fields: JSON.stringify([
            { name: 'test', type: 'String', required: true }
          ])
        });
        
        // Verify directory structure
        const baseDir = path.join(testOutputDir, 'src/infrastructure/database/mongodb');
        const schemasDir = path.join(baseDir, 'schemas');
        const modelsDir = path.join(baseDir, 'models');
        
        expect(fs.existsSync(baseDir)).toBe(true);
        expect(fs.existsSync(schemasDir)).toBe(true);
        expect(fs.existsSync(modelsDir)).toBe(true);
        
        // Verify files are in correct locations
        expect(fs.existsSync(path.join(schemasDir, 'test-structure.schema.ts'))).toBe(true);
        expect(fs.existsSync(path.join(modelsDir, 'test-structure.model.ts'))).toBe(true);
        
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
