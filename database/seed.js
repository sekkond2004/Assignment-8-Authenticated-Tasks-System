const { db, Project, Task, User } = require('./setup');
const bcrypt = require('bcryptjs');

// SAMPLE USERS
const sampleUsers = [
  {
    username: "john_doe",
    email: "john@example.com",
    password: "password123"
  },
  {
    username: "jane_smith",
    email: "jane@example.com",
    password: "password123"
  }
];

// SAMPLE PROJECTS
const sampleProjects = [
  {
    name: "Website Redesign",
    description: "Complete overhaul of company website with modern design",
    status: "active",
    dueDate: new Date('2024-12-31'),
    userId: 1
  },
  {
    name: "Mobile App Development",
    description: "Build iOS and Android app for customer portal",
    status: "active",
    dueDate: new Date('2024-11-15'),
    userId: 1
  },
  {
    name: "Marketing Campaign",
    description: "Q4 social media and advertising campaign",
    status: "planning",
    dueDate: new Date('2024-10-01'),
    userId: 2
  }
];

// SAMPLE TASKS
const sampleTasks = [
  {
    title: "Create wireframes",
    description: "Design initial wireframes for all main pages",
    completed: false,
    priority: "high",
    dueDate: new Date('2024-09-15'),
    projectId: 1
  },
  {
    title: "Set up development environment",
    description: "Configure local dev environment with necessary tools",
    completed: true,
    priority: "high",
    dueDate: new Date('2024-08-20'),
    projectId: 1
  },
  {
    title: "Research mobile frameworks",
    description: "Compare React Native vs Flutter for app development",
    completed: false,
    priority: "medium",
    dueDate: new Date('2024-09-30'),
    projectId: 2
  },
  {
    title: "Create app mockups",
    description: "Design user interface mockups for key app screens",
    completed: false,
    priority: "medium",
    dueDate: new Date('2024-10-05'),
    projectId: 2
  },
  {
    title: "Define target audience",
    description: "Research and define primary target demographics",
    completed: true,
    priority: "high",
    dueDate: new Date('2024-08-25'),
    projectId: 3
  },
  {
    title: "Create content calendar",
    description: "Plan social media posts for next 3 months",
    completed: false,
    priority: "medium",
    dueDate: new Date('2024-09-20'),
    projectId: 3
  }
];

// SEED FUNCTION
async function seedDatabase() {
  try {
    await db.authenticate();
    console.log('Connected to database for seeding.');

    const saltRounds = 10;

    // ✅ Hash passwords safely
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, saltRounds)
      }))
    );

    // ✅ Insert users FIRST
    await User.bulkCreate(hashedUsers);
    console.log('Sample users inserted successfully.');

    // ✅ Then projects
    await Project.bulkCreate(sampleProjects);
    console.log('Sample projects inserted successfully.');

    // ✅ Then tasks
    await Task.bulkCreate(sampleTasks);
    console.log('Sample tasks inserted successfully.');

    await db.close();
    console.log('Database seeding completed.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run seed
seedDatabase();