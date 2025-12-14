import db, { initializeDatabase } from "../lib/database.js";

// Initialize database to ensure tables exist
initializeDatabase();

console.log("\n=== USER DATABASE ===\n");

// Get all users
const users = db.prepare("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC").all() as any[];

if (users.length === 0) {
  console.log("No users found in database.\n");
} else {
  console.log(`Total users: ${users.length}\n`);
  users.forEach((user, index) => {
    console.log(`User ${index + 1}:`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Created: ${user.created_at || "N/A"}`);
    console.log("");
  });
}

// Get password hashes (for verification purposes only)
console.log("\n=== PASSWORD HASHES (for verification) ===\n");
const usersWithPasswords = db.prepare("SELECT id, name, email, password FROM users").all() as any[];
usersWithPasswords.forEach((user) => {
  console.log(`${user.email}:`);
  console.log(`  Password Hash: ${user.password.substring(0, 50)}...`);
  console.log("");
});

console.log("\n=== DATABASE LOCATION ===\n");
console.log("Database file: server/data/mentorship.db");
console.log("\nTo view the database directly:");
console.log("1. Install DB Browser for SQLite: https://sqlitebrowser.org/");
console.log("2. Open: server/data/mentorship.db");
console.log("3. Or use SQLite CLI: sqlite3 server/data/mentorship.db");
