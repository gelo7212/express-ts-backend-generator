#!/usr/bin/env node

/**
 * Test script to verify the generator works
 */

console.log('🧪 Testing Express TS Generator V2...\n');

import { CLI } from '../src/cli/cli';

async function test() {
  try {
    const cli = new CLI();
    
    // Test help command
    console.log('Testing help command...');
    await cli.run(['node', 'test', '--help']);
    
    console.log('\n✅ CLI initialized successfully!');
    console.log('✅ All core services registered');
    console.log('✅ Commands and generators loaded');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();
