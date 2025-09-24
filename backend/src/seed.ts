import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const sampleConflicts = [
  {
    title: 'Armed clashes between government forces and rebels in Aleppo',
    description: 'Intense fighting between Syrian government forces and opposition groups resulted in civilian casualties.',
    country: 'Syria',
    region: 'Middle East',
    latitude: 36.2021,
    longitude: 37.1343,
    date: new Date('2023-03-15'),
    fatalities: 23,
    eventType: 'Battles',
    source: 'ACLED'
  },
  {
    title: 'Terrorist attack on civilian market in Kabul',
    description: 'Bombing at a crowded marketplace during morning hours.',
    country: 'Afghanistan',
    region: 'South Asia',
    latitude: 34.5553,
    longitude: 69.2075,
    date: new Date('2023-04-12'),
    fatalities: 45,
    eventType: 'Violence against civilians',
    source: 'ACLED'
  },
  {
    title: 'Ethnic violence in Tigray region',
    description: 'Clashes between ethnic groups over territorial disputes.',
    country: 'Ethiopia',
    region: 'Eastern Africa',
    latitude: 14.2700,
    longitude: 38.2755,
    date: new Date('2023-05-08'),
    fatalities: 18,
    eventType: 'Violence against civilians',
    source: 'ACLED'
  },
  {
    title: 'Military operation against separatist forces',
    description: 'Ukrainian forces conduct operation against separatist-held territories.',
    country: 'Ukraine',
    region: 'Eastern Europe',
    latitude: 48.0195,
    longitude: 37.8029,
    date: new Date('2023-06-22'),
    fatalities: 12,
    eventType: 'Battles',
    source: 'ACLED'
  },
  {
    title: 'Jihadist attack on military outpost',
    description: 'Armed group attacks government military position.',
    country: 'Mali',
    region: 'Western Africa',
    latitude: 16.7794,
    longitude: -3.0094,
    date: new Date('2023-07-03'),
    fatalities: 8,
    eventType: 'Battles',
    source: 'ACLED'
  },
  {
    title: 'Police clash with protesters',
    description: 'Violence erupts during anti-government demonstration.',
    country: 'Myanmar',
    region: 'Southeast Asia',
    latitude: 19.7633,
    longitude: 96.0785,
    date: new Date('2023-08-17'),
    fatalities: 6,
    eventType: 'Riots',
    source: 'ACLED'
  },
  {
    title: 'Drone strike on military facility',
    description: 'Unmanned aerial vehicle targets government installation.',
    country: 'Yemen',
    region: 'Middle East',
    latitude: 15.3694,
    longitude: 44.1910,
    date: new Date('2023-09-05'),
    fatalities: 15,
    eventType: 'Remote violence',
    source: 'ACLED'
  },
  {
    title: 'Inter-communal violence over resources',
    description: 'Farmers and herders clash over water access rights.',
    country: 'Nigeria',
    region: 'Western Africa',
    latitude: 9.0579,
    longitude: 7.4951,
    date: new Date('2023-10-11'),
    fatalities: 34,
    eventType: 'Violence against civilians',
    source: 'ACLED'
  },
  {
    title: 'Government airstrike on rebel positions',
    description: 'Air force targets opposition-controlled areas.',
    country: 'Libya',
    region: 'Northern Africa',
    latitude: 32.8872,
    longitude: 13.1913,
    date: new Date('2023-11-28'),
    fatalities: 19,
    eventType: 'Remote violence',
    source: 'ACLED'
  },
  {
    title: 'Explosive device detonation in public area',
    description: 'IED explodes near government building during rush hour.',
    country: 'Iraq',
    region: 'Middle East',
    latitude: 33.3128,
    longitude: 44.3615,
    date: new Date('2023-12-14'),
    fatalities: 27,
    eventType: 'Explosions/Remote violence',
    source: 'ACLED'
  },
  {
    title: 'Armed robbery leads to civilian casualties',
    description: 'Criminal group attacks village, resulting in multiple deaths.',
    country: 'Democratic Republic of Congo',
    region: 'Middle Africa',
    latitude: -4.0383,
    longitude: 21.7587,
    date: new Date('2024-01-09'),
    fatalities: 11,
    eventType: 'Violence against civilians',
    source: 'ACLED'
  },
  {
    title: 'Border skirmish between military forces',
    description: 'Tension escalates at disputed border region.',
    country: 'India',
    region: 'South Asia',
    latitude: 34.5794,
    longitude: 76.2711,
    date: new Date('2024-02-23'),
    fatalities: 4,
    eventType: 'Battles',
    source: 'ACLED'
  },
  {
    title: 'Protest dispersal turns violent',
    description: 'Security forces use excessive force against demonstrators.',
    country: 'Iran',
    region: 'Middle East',
    latitude: 35.6961,
    longitude: 51.4231,
    date: new Date('2024-03-18'),
    fatalities: 9,
    eventType: 'Riots',
    source: 'ACLED'
  },
  {
    title: 'Militia attack on peacekeeping forces',
    description: 'Armed group targets UN peacekeepers.',
    country: 'Central African Republic',
    region: 'Middle Africa',
    latitude: 4.3947,
    longitude: 18.5582,
    date: new Date('2024-04-07'),
    fatalities: 7,
    eventType: 'Battles',
    source: 'ACLED'
  },
  {
    title: 'Sectarian violence in mixed community',
    description: 'Religious tensions lead to communal clashes.',
    country: 'Pakistan',
    region: 'South Asia',
    latitude: 30.3753,
    longitude: 69.3451,
    date: new Date('2024-05-16'),
    fatalities: 22,
    eventType: 'Violence against civilians',
    source: 'ACLED'
  }
];

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acled.com' },
    update: {},
    create: {
      email: 'admin@acled.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@acled.com' },
    update: {},
    create: {
      email: 'user@acled.com',
      password: await bcrypt.hash('user123', 12),
      role: 'USER'
    }
  });

  console.log('Users created:', { adminUser, regularUser });

  // Clear existing conflicts
  await prisma.conflict.deleteMany({});

  // Create sample conflicts
  const conflicts = await prisma.conflict.createMany({
    data: sampleConflicts
  });

  console.log(`Created ${conflicts.count} conflicts`);

  // Get some stats
  const totalConflicts = await prisma.conflict.count();
  const totalFatalities = await prisma.conflict.aggregate({
    _sum: { fatalities: true }
  });

  console.log('Database seeded successfully!');
  console.log(`Total conflicts: ${totalConflicts}`);
  console.log(`Total fatalities: ${totalFatalities._sum.fatalities}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });