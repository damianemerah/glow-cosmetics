// This script can be used to apply the database migration if needed
// Run with: node scripts/apply-migration.mjs

import { execSync } from "child_process";

try {
  console.log("Applying Supabase migrations...");
  execSync("npx supabase migration up", { stdio: "inherit" });
  console.log("Migration applied successfully!");
} catch (error) {
  console.error("Error applying migration:", error);
  process.exit(1);
}
