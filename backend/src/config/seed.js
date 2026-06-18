require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, User, Event } = require('../models');

const events = [
  {
    name: 'React Summit 2024',
    description:
      'The biggest React conference of the year. Join top speakers, workshops, and networking sessions covering the latest in React, Next.js, and the modern frontend ecosystem.',
    dateTime: new Date('2024-10-15T09:00:00Z'),
    venue: 'Amsterdam, Netherlands',
    totalSeats: 500,
    availableSeats: 500,
    category: 'Technology',
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  },
  {
    name: 'Node.js Global Summit',
    description:
      'Deep dive into server-side JavaScript. Topics include performance tuning, microservices architecture, security best practices, and the latest Node.js features.',
    dateTime: new Date('2024-11-05T10:00:00Z'),
    venue: 'San Francisco, CA',
    totalSeats: 300,
    availableSeats: 300,
    category: 'Technology',
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
  },
  {
    name: 'UX Design Conference',
    description:
      'Explore cutting-edge UX research, design systems, accessibility, and product thinking. Hands-on workshops and talks from designers at top tech companies.',
    dateTime: new Date('2024-12-01T09:30:00Z'),
    venue: 'London, UK',
    totalSeats: 200,
    availableSeats: 200,
    category: 'Design',
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
  },
  {
    name: 'Data Science & AI World',
    description:
      'The premier event for data scientists, ML engineers, and AI practitioners. Covering LLMs, computer vision, MLOps, and real-world AI deployments.',
    dateTime: new Date('2025-01-20T08:00:00Z'),
    venue: 'New York, NY',
    totalSeats: 600,
    availableSeats: 600,
    category: 'Technology',
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800',
  },
  {
    name: 'Startup Founders Forum',
    description:
      'Connect with founders, investors, and mentors. Pitch competitions, fireside chats, and networking dinners. Ideal for early-stage to Series B startups.',
    dateTime: new Date('2025-02-10T09:00:00Z'),
    venue: 'Austin, TX',
    totalSeats: 150,
    availableSeats: 150,
    category: 'Business',
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
  },
  {
    name: 'Cloud & DevOps Expo',
    description:
      'Everything cloud-native: Kubernetes, Terraform, CI/CD pipelines, observability, and platform engineering. Live demos and certification prep sessions.',
    dateTime: new Date('2025-03-05T10:00:00Z'),
    venue: 'Seattle, WA',
    totalSeats: 400,
    availableSeats: 400,
    category: 'Technology',
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
  },
  {
    name: 'Women in Tech Summit',
    description:
      'Celebrating and empowering women in technology. Inspiring keynotes, mentorship programs, panel discussions, and career development workshops.',
    dateTime: new Date('2025-03-25T09:00:00Z'),
    venue: 'Chicago, IL',
    totalSeats: 250,
    availableSeats: 250,
    category: 'Community',
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800',
  },
  {
    name: 'Cybersecurity World Congress',
    description:
      'Stay ahead of evolving threats. Penetration testing, zero-trust architecture, compliance, incident response, and ethical hacking workshops.',
    dateTime: new Date('2025-04-15T08:30:00Z'),
    venue: 'Washington, D.C.',
    totalSeats: 350,
    availableSeats: 350,
    category: 'Technology',
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
  },
];

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced (reset).');

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@events.com',
      password: 'Admin123',
      role: 'admin',
    });
    console.log('Admin user created: admin@events.com / Admin123');

    // Create demo user
    await User.create({
      name: 'Demo User',
      email: 'demo@events.com',
      password: 'Demo1234',
      role: 'user',
    });
    console.log('Demo user created: demo@events.com / Demo1234');

    // Create events
    await Event.bulkCreate(events);
    console.log(`${events.length} events seeded.`);

    console.log('\nSeed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
