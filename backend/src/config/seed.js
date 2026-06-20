require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const logger = require('./logger');

const EVENTS = [
  {
    name: 'React Summit 2025',
    description: 'The biggest React conference. Talks on React 19, Next.js, Server Components, and the modern frontend ecosystem from top engineers at Meta, Vercel, and Shopify.',
    venue: 'Amsterdam, Netherlands',
    dateTime: new Date('2025-10-15T09:00:00Z'),
    totalSeats: 500,
    availableSeats: 500,
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    status: 'upcoming',
  },
  {
    name: 'Node.js Global Summit',
    description: 'Deep dive into Node.js performance, microservices, gRPC, event-driven architecture, and security best practices from core contributors.',
    venue: 'San Francisco, CA',
    dateTime: new Date('2025-11-05T10:00:00Z'),
    totalSeats: 300,
    availableSeats: 300,
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
    status: 'upcoming',
  },
  {
    name: 'UX Design Conference',
    description: 'Explore research-driven design systems, accessibility, inclusive product thinking, and AI-assisted design. Hands-on workshops included.',
    venue: 'London, UK',
    dateTime: new Date('2025-12-01T09:30:00Z'),
    totalSeats: 200,
    availableSeats: 200,
    category: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    status: 'upcoming',
  },
  {
    name: 'Data Science & AI World',
    description: 'LLMs, computer vision, MLOps, and real-world AI deployments. The premier event for data scientists and AI practitioners.',
    venue: 'New York, NY',
    dateTime: new Date('2026-01-20T08:00:00Z'),
    totalSeats: 600,
    availableSeats: 600,
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800',
    status: 'upcoming',
  },
  {
    name: 'Startup Founders Forum',
    description: 'Connect with founders, investors, and mentors. Pitch competitions, fireside chats, and networking dinners for early-stage to Series B startups.',
    venue: 'Austin, TX',
    dateTime: new Date('2026-02-10T09:00:00Z'),
    totalSeats: 150,
    availableSeats: 150,
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    status: 'upcoming',
  },
  {
    name: 'Cloud & DevOps Expo',
    description: 'Kubernetes, Terraform, CI/CD pipelines, observability, and platform engineering with live demos and certification prep sessions.',
    venue: 'Seattle, WA',
    dateTime: new Date('2026-03-05T10:00:00Z'),
    totalSeats: 400,
    availableSeats: 400,
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    status: 'upcoming',
  },
  {
    name: 'Cybersecurity World Congress',
    description: 'Penetration testing, zero-trust architecture, compliance, incident response, and ethical hacking workshops from CISO-level practitioners.',
    venue: 'Washington, D.C.',
    dateTime: new Date('2026-04-15T08:30:00Z'),
    totalSeats: 350,
    availableSeats: 350,
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    status: 'upcoming',
  },
  {
    name: 'Women in Tech Summit',
    description: 'Inspiring keynotes, mentorship, panel discussions, and career development workshops celebrating and empowering women in technology.',
    venue: 'Chicago, IL',
    dateTime: new Date('2026-03-25T09:00:00Z'),
    totalSeats: 250,
    availableSeats: 250,
    category: 'Community',
    imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800',
    status: 'upcoming',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    logger.info('Cleared existing users and events');

    // Create admin
    const adminHash = await bcrypt.hash('Admin123!', 12);
    await User.create({
      name: 'Admin User',
      email: 'admin@eventbooking.com',
      passwordHash: adminHash,
      role: 'admin',
    });
    logger.info('Admin created: admin@eventbooking.com / Admin123!');

    // Create demo user
    const userHash = await bcrypt.hash('Demo1234!', 12);
    await User.create({
      name: 'Demo User',
      email: 'demo@eventbooking.com',
      passwordHash: userHash,
      role: 'user',
    });
    logger.info('Demo user created: demo@eventbooking.com / Demo1234!');

    // Create events
    await Event.insertMany(EVENTS);
    logger.info(`${EVENTS.length} events seeded`);

    logger.info('Seed complete!');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Seed failed');
    process.exit(1);
  }
}

seed();
