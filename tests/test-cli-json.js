#!/usr/bin/env node

/**
 * Test script for MongoDB schema generation with command line JSON
 * This helps users test the JSON parsing without shell escaping issues
 */

const { execSync } = require('child_process');
const path = require('path');

// Test cases for different field configurations
const testCases = [
  {
    name: 'Simple User Schema',
    schemaName: 'TestUser',
    fields: [
      { name: 'username', type: 'String', required: true, unique: true },
      { name: 'email', type: 'String', required: true, unique: true },
      { name: 'age', type: 'Number', required: false, min: 0, max: 120 }
    ],
    options: '--timestamps'
  },
  {
    name: 'Product Schema with Enum',
    schemaName: 'TestProduct',
    fields: [
      { name: 'name', type: 'String', required: true, minLength: 3, maxLength: 100 },
      { name: 'price', type: 'Number', required: true, min: 0 },
      { name: 'category', type: 'String', required: true, enum: ['electronics', 'clothing', 'books'] },
      { name: 'inStock', type: 'Boolean', default: true }
    ],
    options: '--timestamps --indexes'
  },
  {
    name: 'Order Schema with ObjectId',
    schemaName: 'TestOrder',
    fields: [
      { name: 'customerId', type: 'ObjectId', required: true },
      { name: 'items', type: 'Array', required: true },
      { name: 'status', type: 'String', required: true, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
      { name: 'total', type: 'Number', required: true, min: 0 }
    ],
    options: '--timestamps --virtuals --methods'
  }
];

console.log('🧪 Testing MongoDB Schema Generation with Command Line JSON\n');

const distPath = path.join(__dirname, '..', 'dist', 'index.js');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log('=' .repeat(50));
  
  try {
    // Convert fields to JSON string
    const fieldsJson = JSON.stringify(testCase.fields);
    
    // Build command
    const command = `node "${distPath}" generate:schema:mongodb ${testCase.schemaName} --fields '${fieldsJson}' ${testCase.options}`;
    
    console.log(`Command: ${command}\n`);
    
    // Execute command
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: path.join(__dirname, '..', 'test-output')
    });
    
    console.log('✅ Success!');
    console.log('Output:', output);
    
  } catch (error) {
    console.log('❌ Failed!');
    console.log('Error:', error.message);
    if (error.stdout) console.log('Stdout:', error.stdout);
    if (error.stderr) console.log('Stderr:', error.stderr);
  }
  
  console.log('\n' + '-'.repeat(50) + '\n');
});

console.log('🏁 Test completed!');
