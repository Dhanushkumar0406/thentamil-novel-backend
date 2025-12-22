import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Pool from DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // First, check if admin user exists
  let user = await prisma.users.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!user) {
    console.log('No admin user found. Creating admin user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await prisma.users.create({
      data: {
        full_name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log(`Created admin user: ${user.full_name} (ID: ${user.id}, Email: ${user.email})`);
    console.log('Login with: admin@example.com / password123');
  } else {
    console.log(`Admin user already exists: ${user.email}`);
    // Update password to ensure it's properly hashed
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log(`Updated admin password for: ${user.email}`);
    console.log('Login with: admin@example.com / password123');
  }

  // Insert sample novels
  const novels = [
    {
      author_name: 'அமுது',
      title: 'கடல் கடந்த காதல்',
      categories: ['காதல்', 'நாடகம்', 'வரலாறு'],
      novel_summary: 'இது கடல் கடந்து செல்லும் ஒரு காதல் கதை. இரு நாடுகளில் வாழும் இரு காதலர்களின் பயணம் மற்றும் அவர்களின் அன்பின் சக்தியைப் பற்றிய கதை.',
      chapters_count: 25,
      views: 1250,
      created_by: user.id,
    },
    {
      author_name: 'சுஜாதா',
      title: 'காவல் கோட்டம்',
      categories: ['த்ரில்லர்', 'மர்மம்'],
      novel_summary: 'ஒரு காவல் நிலையத்தில் நடக்கும் மர்மமான நிகழ்வுகள். ஒரு துப்பறியும் அதிகாரி இந்த வழக்கை தீர்க்க முயற்சிக்கிறார்.',
      chapters_count: 18,
      views: 2340,
      created_by: user.id,
    },
    {
      author_name: 'ஜெயமோகன்',
      title: 'விஷ்ணுபுரம்',
      categories: ['சமூகம்', 'நாடகம்'],
      novel_summary: 'தமிழ் நாட்டின் ஒரு கிராமத்தில் வாழும் மக்களின் வாழ்க்கை மற்றும் அவர்களின் போராட்டங்களைப் பற்றிய கதை.',
      chapters_count: 32,
      views: 3890,
      created_by: user.id,
    },
    {
      author_name: 'பாலகுமாரன்',
      title: 'உடையார்',
      categories: ['சாகசம்', 'வரலாறு'],
      novel_summary: 'மன்னர்கள் மற்றும் போர்வீரர்களின் காலத்தில் நடக்கும் வீரம் மிகுந்த கதை.',
      chapters_count: 40,
      views: 5120,
      created_by: user.id,
    },
    {
      author_name: 'அகிலன்',
      title: 'கயல் விழி',
      categories: ['காதல்', 'குடும்பம்'],
      novel_summary: 'குடும்ப பிரச்சனைகளுக்கு மத்தியில் மலரும் அழகான காதல் கதை.',
      chapters_count: 22,
      views: 1876,
      created_by: user.id,
    },
    {
      author_name: 'சாண்டில்யன்',
      title: 'யவன ராணி',
      categories: ['வரலாறு', 'காதல்', 'சாகசம்'],
      novel_summary: 'கிரேக்க இளவரசி மற்றும் தமிழ் வீரனின் காதல் கதை. கலாச்சார மோதல்கள் மற்றும் அன்பின் வெற்றி.',
      chapters_count: 35,
      views: 4500,
      created_by: user.id,
    },
  ];

  for (const novel of novels) {
    const created = await prisma.novels.create({
      data: novel,
    });
    console.log(`Created novel: ${created.title} by ${created.author_name}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
