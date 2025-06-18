#!/usr/bin/env node

console.log('Hello from Koksmat Companion!');
console.log('Current time:', new Date().toISOString());
console.log('Arguments:', process.argv.slice(2));

// Simulate some work
setTimeout(() => {
  console.log('Work completed successfully!');
  process.exit(0);
}, 2000);