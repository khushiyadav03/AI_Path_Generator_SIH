import db from "./database.js";

export async function autoSeedMentors() {
  try {
    const mentorCount = db.prepare("SELECT COUNT(*) as count FROM mentors").get() as any;
    if (mentorCount.count === 0) {
      console.log("No mentors found. Auto-seeding dummy mentors...");
      const { seedDatabase } = await import("../scripts/seed-mentorship.js");
      seedDatabase();
    }
  } catch (error) {
    // Table might not exist yet, that's okay - it will be created by initializeDatabase
    console.warn("Could not check/seed mentors:", error);
  }
}

