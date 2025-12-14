import db, { hashPassword, initializeDatabase } from "../lib/database.js";

export function seedDatabase() {
  console.log("Seeding mentorship database...");

  // Initialize database
  initializeDatabase();

  // Create sample users
  const users = [
    {
      name: "John Doe",
      email: "john@example.com",
      password: hashPassword("password123"),
      role: "mentee",
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      password: hashPassword("password123"),
      role: "mentee",
    },
    {
      name: "Dr. Sarah Johnson",
      email: "sarah@example.com",
      password: hashPassword("password123"),
      role: "mentor",
    },
    {
      name: "Mike Chen",
      email: "mike@example.com",
      password: hashPassword("password123"),
      role: "mentor",
    },
    {
      name: "Admin User",
      email: "admin@example.com",
      password: hashPassword("admin123"),
      role: "admin",
    },
  ];

  users.forEach((user) => {
    try {
      db.prepare(`
        INSERT OR IGNORE INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `).run(user.name, user.email, user.password, user.role);
    } catch (error) {
      console.log(`User ${user.email} might already exist`);
    }
  });

  // Get created users
  const createdUsers = db.prepare("SELECT * FROM users").all() as any[];

  // Create dummy mentors (8 mentors, one per domain)
  const dummyMentors = [
    {
      name: "Aarav Shah",
      domain: "Machine Learning",
      skills: JSON.stringify(["Python", "TensorFlow", "Django"]),
      bio: "Senior ML Engineer with 8 years of AI experience.",
      experience: "8 years",
      rating: 4.9,
      total_ratings: 32,
      linkedin: "https://linkedin.com/in/aaravshah",
      github: "https://github.com/aaravml",
      hourly_rate: 80,
      availability: "Mon-Fri, 10am-7pm IST",
    },
    {
      name: "Ishita Verma",
      domain: "Data Science",
      skills: JSON.stringify(["Python", "Pandas", "Cloud Computing"]),
      bio: "Data Scientist with a passion for predictive analytics.",
      experience: "6 years",
      rating: 4.8,
      total_ratings: 28,
      linkedin: "https://linkedin.com/in/ishitaverma",
      github: "https://github.com/ishitads",
      hourly_rate: 70,
      availability: "Mon-Sat, 9am-6pm IST",
    },
    {
      name: "Rahul Mehta",
      domain: "Web Development",
      skills: JSON.stringify(["JavaScript", "React", "Node.js"]),
      bio: "Full-stack developer and backend lead at TechNova.",
      experience: "7 years",
      rating: 4.7,
      total_ratings: 45,
      linkedin: "https://linkedin.com/in/rahulmehta",
      github: "https://github.com/rahuldev",
      hourly_rate: 65,
      availability: "Flexible hours",
    },
    {
      name: "Neha Gupta",
      domain: "Cloud Computing",
      skills: JSON.stringify(["AWS", "Python", "C++"]),
      bio: "Cloud Architect specializing in scalable infrastructure.",
      experience: "9 years",
      rating: 4.6,
      total_ratings: 38,
      linkedin: "https://linkedin.com/in/nehagupta",
      github: "https://github.com/nehacloud",
      hourly_rate: 85,
      availability: "Mon-Fri, 11am-8pm IST",
    },
    {
      name: "Ananya Patel",
      domain: "Mobile Development",
      skills: JSON.stringify(["Kotlin", "Java", "Android"]),
      bio: "Android Engineer building intuitive mobile experiences.",
      experience: "5 years",
      rating: 4.9,
      total_ratings: 22,
      linkedin: "https://linkedin.com/in/ananyapatel",
      github: "https://github.com/ananyadev",
      hourly_rate: 60,
      availability: "Mon-Sat, 10am-7pm IST",
    },
    {
      name: "Karan Singh",
      domain: "DevOps",
      skills: JSON.stringify(["Docker", "Kubernetes", "CI/CD"]),
      bio: "DevOps Specialist focused on automation and CI/CD pipelines.",
      experience: "8 years",
      rating: 4.5,
      total_ratings: 35,
      linkedin: "https://linkedin.com/in/karansingh",
      github: "https://github.com/karanops",
      hourly_rate: 75,
      availability: "Mon-Fri, 9am-6pm IST",
    },
    {
      name: "Meera Das",
      domain: "UI/UX Design",
      skills: JSON.stringify(["Figma", "Adobe XD", "Design Systems"]),
      bio: "UI/UX Designer passionate about intuitive user experiences.",
      experience: "6 years",
      rating: 4.8,
      total_ratings: 29,
      linkedin: "https://linkedin.com/in/meeradas",
      github: "https://github.com/meeraux",
      hourly_rate: 55,
      availability: "Mon-Sat, 10am-6pm IST",
    },
    {
      name: "Rohit Khanna",
      domain: "Product Management",
      skills: JSON.stringify(["Agile", "Scrum", "Leadership"]),
      bio: "Product Manager with 10 years of experience leading tech teams.",
      experience: "10 years",
      rating: 4.9,
      total_ratings: 42,
      linkedin: "https://linkedin.com/in/rohitkhanna",
      github: "https://github.com/rohitpm",
      hourly_rate: 90,
      availability: "Mon-Fri, 9am-7pm IST",
    },
  ];

  // Check if mentors table is empty
  const existingMentors = db.prepare("SELECT COUNT(*) as count FROM mentors").get() as any;
  
  if (existingMentors.count === 0) {
    console.log("Seeding dummy mentors...");
    dummyMentors.forEach((mentor) => {
      try {
        db.prepare(`
          INSERT INTO mentors (
            name, domain, skills, bio, experience, rating, total_ratings,
            linkedin, github, hourly_rate, availability
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          mentor.name,
          mentor.domain,
          mentor.skills,
          mentor.bio,
          mentor.experience,
          mentor.rating,
          mentor.total_ratings,
          mentor.linkedin,
          mentor.github,
          mentor.hourly_rate,
          mentor.availability
        );
      } catch (error) {
        console.error(`Error inserting mentor ${mentor.name}:`, error);
      }
    });
    console.log(`✅ Seeded ${dummyMentors.length} dummy mentors`);
  } else {
    console.log(`Mentors table already has ${existingMentors.count} mentors. Skipping seed.`);
  }

  // Also create mentors for existing users if they don't have mentor profiles
  const mentorsForUsers = [
    {
      user_id: createdUsers.find((u) => u.email === "sarah@example.com")?.id,
      name: "Dr. Sarah Johnson",
      domain: "Machine Learning",
      skills: JSON.stringify(["Python", "TensorFlow", "PyTorch", "MLOps"]),
      bio: "10+ years of experience in ML and AI. Former Google researcher, now leading ML teams at startups.",
      experience: "PhD in Computer Science, published 50+ papers, mentor to 100+ students",
      rating: 4.8,
      total_ratings: 25,
      linkedin: "https://linkedin.com/in/sarahjohnson",
      github: "https://github.com/sarahj",
      hourly_rate: 75,
      availability: "Mon-Fri, 9am-6pm EST",
    },
    {
      user_id: createdUsers.find((u) => u.email === "mike@example.com")?.id,
      name: "Mike Chen",
      domain: "Web Development",
      skills: JSON.stringify(["JavaScript", "React", "Node.js", "TypeScript"]),
      bio: "Full-stack developer with expertise in React, Node.js, and cloud architecture. Built 20+ production apps.",
      experience: "8 years in web development, worked at Microsoft and Amazon, now freelance consultant",
      rating: 4.6,
      total_ratings: 18,
      linkedin: "https://linkedin.com/in/mikechen",
      github: "https://github.com/mikechen",
      hourly_rate: 60,
      availability: "Flexible hours, available weekends",
    },
  ];

  mentorsForUsers.forEach((mentor) => {
    if (mentor.user_id) {
      try {
        const existing = db.prepare("SELECT id FROM mentors WHERE user_id = ?").get(mentor.user_id);
        if (!existing) {
          db.prepare(`
            INSERT INTO mentors (
              user_id, name, domain, skills, bio, experience, rating, total_ratings,
              linkedin, github, hourly_rate, availability
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            mentor.user_id,
            mentor.name,
            mentor.domain,
            mentor.skills,
            mentor.bio,
            mentor.experience,
            mentor.rating,
            mentor.total_ratings,
            mentor.linkedin,
            mentor.github,
            mentor.hourly_rate,
            mentor.availability
          );
        }
      } catch (error) {
        console.log(`Mentor ${mentor.name} might already exist`);
      }
    }
  });

  console.log("✅ Database seeded successfully!");
  console.log("\nSample accounts created:");
  console.log("Mentee: john@example.com / password123");
  console.log("Mentee: jane@example.com / password123");
  console.log("Mentor: sarah@example.com / password123");
  console.log("Mentor: mike@example.com / password123");
  console.log("Admin: admin@example.com / admin123");
}

// Only run if called directly via npm script
if (import.meta.url.includes('seed-mentorship')) {
  seedDatabase();
}

