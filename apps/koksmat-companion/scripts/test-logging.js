#!/usr/bin/env node

console.log("[INFO] Starting test logging script...");
console.log("[VERBOSE] This is a verbose message with details");

// Simulate some work
console.log("[INFO] Processing data...");

setTimeout(() => {
  console.warn("[WARN] This is a warning message");
  console.log("[INFO] Halfway through processing");
}, 1000);

setTimeout(() => {
  console.error("[ERROR] This is an error message (but not a real error)");
  console.log("[INFO] Almost done...");
}, 2000);

setTimeout(() => {
  console.log("[INFO] Test logging script completed successfully");
  process.exit(0);
}, 3000);
