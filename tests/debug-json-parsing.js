#!/usr/bin/env node

// Test the JSON reconstruction logic independently
function reconstructPowerShellJson(input) {
  console.log('Input:', input);
  
  // PowerShell often strips quotes from JSON, so we need to reconstruct them
  let reconstructed = input;
  
  // First, handle smart quotes that might have been introduced
  reconstructed = reconstructed
    .replace(/'/g, '"')  // Replace smart quotes with regular quotes
    .replace(/'/g, '"')  // Replace other smart quotes
    .replace(/"/g, '"')  // Replace other smart quotes
    .replace(/"/g, '"'); // Replace other smart quotes
  
  console.log('After smart quote replacement:', reconstructed);
  
  // If PowerShell stripped quotes completely, we need to reconstruct the JSON
  if (reconstructed.includes('{name:') || reconstructed.includes('[{name:')) {
    console.log('PowerShell stripped quotes detected, reconstructing JSON...');
    
    // Step 1: Add quotes around property names
    reconstructed = reconstructed.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '"$1":');
    console.log('After property name quoting:', reconstructed);
    
    // Step 2: Add quotes around string values (complex regex to handle different contexts)
    // Handle values after colons that aren't numbers, booleans, or already quoted
    reconstructed = reconstructed.replace(/:"?([a-zA-Z][a-zA-Z0-9_]*)"?([,\]\}])/g, (match, value, terminator) => {
      // Don't quote boolean values, null, or numbers
      if (value === 'true' || value === 'false' || value === 'null' || !isNaN(Number(value))) {
        return `:${value}${terminator}`;
      }
      return `:"${value}"${terminator}`;
    });
    console.log('After string value quoting:', reconstructed);
    
    // Step 3: Handle array values like [electronics,clothing,books]
    reconstructed = reconstructed.replace(/\[([^\[\]]*)\]/g, (match, content) => {
      console.log(`Processing array: [${content}]`);
      // Skip if it contains objects (has colons)
      if (content.includes(':')) {
        console.log('  -> Contains objects, skipping');
        return match;
      }
      
      // Split by comma and quote string items
      const items = content.split(',').map(item => {
        item = item.trim();
        console.log(`  -> Processing item: "${item}"`);
        // Skip if already quoted
        if (item.startsWith('"') && item.endsWith('"')) {
          console.log('  -> Already quoted');
          return item;
        }
        // Skip numbers and booleans
        if (item === 'true' || item === 'false' || item === 'null' || !isNaN(Number(item))) {
          console.log('  -> Is primitive');
          return item;
        }
        // Quote everything else
        console.log('  -> Quoting as string');
        return `"${item}"`;
      });
      
      const result = `[${items.join(',')}]`;
      console.log(`  -> Result: ${result}`);
      return result;
    });
    console.log('After array processing:', reconstructed);
  }
  
  console.log('Final result:', reconstructed);
  return reconstructed;
}

// Test cases
const testCases = [
  // Simple case
  '[{name:username,type:String,required:true}]',
  
  // With enum
  '[{name:category,type:String,enum:[electronics,clothing,books]}]',
  
  // Complex case with mixed values
  '[{name:age,type:Number,required:false,min:0,max:120}]'
];

console.log('🧪 Testing JSON Reconstruction Logic\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}:`);
  console.log('==================');
  try {
    const result = reconstructPowerShellJson(testCase);
    console.log('Attempting to parse...');
    const parsed = JSON.parse(result);
    console.log('✅ Success! Parsed:', JSON.stringify(parsed, null, 2));
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
  console.log('\n');
});
