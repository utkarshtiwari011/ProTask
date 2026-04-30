const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/protask');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();

    console.log('Data Cleared...'.red.inverse);

    // Create Users
    // Using .create() so pre-save hook runs
    const admin = await User.create({
      name: 'John Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    const member1 = await User.create({
      name: 'Sarah Member',
      email: 'sarah@test.com',
      password: 'password123',
      role: 'member'
    });

    const member2 = await User.create({
      name: 'Mike Dev',
      email: 'mike@test.com',
      password: 'password123',
      role: 'member'
    });

    const member3 = await User.create({
      name: 'Emily Designer',
      email: 'emily@test.com',
      password: 'password123',
      role: 'member'
    });

    const extraMembers = [];
    for (let i = 4; i <= 13; i++) {
      const newMember = await User.create({
        name: `Test Member ${i}`,
        email: `member${i}@test.com`,
        password: 'password123',
        role: 'member'
      });
      extraMembers.push(newMember);
    }

    console.log('Users Created...'.green.inverse);

    // Create Projects
    const project1 = await Project.create({
      name: 'Cloud Infrastructure Upgrade',
      description: 'Migrating legacy servers to AWS and implementing Kubernetes for better scalability and reliability.',
      admin: admin._id,
      members: [member1._id, member2._id, member3._id]
    });

    const project2 = await Project.create({
      name: 'Mobile App Revamp',
      description: 'Complete redesign of the user interface for our iOS and Android applications.',
      admin: admin._id,
      members: [member1._id, member3._id]
    });

    console.log('Projects Created...'.green.inverse);

    // Create Tasks
    await Task.create([
      { title: 'Setup VPC', description: 'Configure VPC and subnets', status: 'done', priority: 'high', project: project1._id, assignedTo: member1._id },
      { title: 'CI/CD Pipeline', description: 'Setup GitHub Actions', status: 'in-progress', priority: 'medium', project: project1._id, assignedTo: member2._id },
      { title: 'K8s Cluster', description: 'Setup EKS cluster', status: 'todo', priority: 'high', project: project1._id, assignedTo: member2._id },
      { title: 'UI Mockups', description: 'Figma onboarding designs', status: 'done', priority: 'medium', project: project2._id, assignedTo: member3._id },
      { title: 'Dark Mode', description: 'Implement dark theme', status: 'in-progress', priority: 'low', project: project2._id, assignedTo: member1._id }
    ]);

    console.log('Tasks Created...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
