/**
 * Tool Registration Diagnostic Test
 * Verifies that tools are properly registered and accessible
 */

import { getAllTools, getToolNames } from './lib/langchain/tools/index.js';
import './lib/langchain/tools/init.js';

console.log('\n' + '='.repeat(80));
console.log('🔧 TOOL REGISTRATION DIAGNOSTIC');
console.log('='.repeat(80) + '\n');

// Get all tools
const tools = getAllTools();
const toolNames = getToolNames();

console.log(`📊 Total Tools Registered: ${tools.length}\n`);

// Display each tool
toolNames.forEach((name, idx) => {
    const tool = tools[idx];
    console.log(`${idx + 1}. 🔧 ${name}`);
    console.log(`   Description: ${tool.description.substring(0, 100)}...`);
    console.log(`   Schema Fields: ${Object.keys(tool.schema.shape || {}).join(', ')}`);
    console.log('');
});

console.log('='.repeat(80));
console.log('✅ Tool registration check complete');
console.log('='.repeat(80) + '\n');
