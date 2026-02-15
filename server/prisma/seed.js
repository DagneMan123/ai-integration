const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@simuai.com' },
    update: {},
    create: {
      email: 'admin@simuai.com',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample employer
  const employerPassword = await bcrypt.hash('employer123', 12);
  const employer = await prisma.user.upsert({
    where: { email: 'employer@techcorp.com' },
    update: {},
    create: {
      email: 'employer@techcorp.com',
      passwordHash: employerPassword,
      firstName: 'John',
      lastName: 'Manager',
      role: 'EMPLOYER',
      phone: '+251911234567',
      isVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Employer user created:', employer.email);

  // Create sample candidate
  const candidatePassword = await bcrypt.hash('candidate123', 12);
  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@example.com' },
    update: {},
    create: {
      email: 'candidate@example.com',
      passwordHash: candidatePassword,
      firstName: 'Jane',
      lastName: 'Developer',
      role: 'CANDIDATE',
      phone: '+251911234568',
      isVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Candidate user created:', candidate.email);

  // Create candidate profile
  const candidateProfile = await prisma.candidateProfile.upsert({
    where: { userId: candidate.id },
    update: {},
    create: {
      userId: candidate.id,
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      experienceLevel: 'Mid-level',
      education: {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        university: 'Addis Ababa University',
        graduationYear: 2020
      },
      workExperience: [
        {
          company: 'Tech Solutions Ltd',
          position: 'Junior Developer',
          startDate: '2020-06',
          endDate: '2022-12',
          description: 'Developed web applications using React and Node.js'
        }
      ],
      languages: ['English', 'Amharic'],
      availability: 'Immediate',
      expectedSalary: 25000.00
    },
  });

  console.log('✅ Candidate profile created');

  // Create sample company
  const company = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'TechCorp Ethiopia',
      description: 'Leading technology company in Ethiopia specializing in software development and digital solutions.',
      industry: 'Technology',
      size: '50-200',
      website: 'https://techcorp.et',
      address: 'Addis Ababa, Ethiopia',
      isVerified: true,
      createdById: employer.id,
    },
  });

  console.log('✅ Company created:', company.name);

  // Create sample jobs
  const jobs = [
    {
      title: 'Senior Full Stack Developer',
      description: 'We are looking for an experienced Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
      jobType: 'full-time',
      experienceLevel: 'Senior',
      salaryMin: 35000.00,
      salaryMax: 50000.00,
      location: 'Addis Ababa, Ethiopia',
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
      interviewType: 'technical',
      status: 'ACTIVE',
      companyId: company.id,
      createdById: employer.id,
    },
    {
      title: 'Frontend Developer',
      description: 'Join our frontend team to create amazing user experiences. You will work with React, TypeScript, and modern CSS frameworks.',
      jobType: 'full-time',
      experienceLevel: 'Mid-level',
      salaryMin: 25000.00,
      salaryMax: 35000.00,
      location: 'Addis Ababa, Ethiopia',
      requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML', 'Git'],
      interviewType: 'technical',
      status: 'ACTIVE',
      companyId: company.id,
      createdById: employer.id,
    },
    {
      title: 'Backend Developer',
      description: 'We need a skilled Backend Developer to build robust APIs and manage our server infrastructure.',
      jobType: 'full-time',
      experienceLevel: 'Mid-level',
      salaryMin: 30000.00,
      salaryMax: 40000.00,
      location: 'Remote',
      requiredSkills: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Docker'],
      interviewType: 'technical',
      status: 'ACTIVE',
      companyId: company.id,
      createdById: employer.id,
    }
  ];

  for (const jobData of jobs) {
    const job = await prisma.job.create({
      data: jobData,
    });
    console.log('✅ Job created:', job.title);
  }

  // Create sample application
  const application = await prisma.application.create({
    data: {
      jobId: 1,
      candidateId: candidate.id,
      status: 'PENDING',
      coverLetter: 'I am very interested in this position and believe my skills align well with your requirements.',
    },
  });

  console.log('✅ Application created');

  // Create sample interview
  const interview = await prisma.interview.create({
    data: {
      jobId: 1,
      candidateId: candidate.id,
      status: 'PENDING',
      questions: {
        questions: [
          {
            id: 1,
            question: 'Tell me about your experience with React.',
            type: 'Technical',
            difficulty: 'Medium'
          },
          {
            id: 2,
            question: 'How do you handle state management in large applications?',
            type: 'Technical',
            difficulty: 'Hard'
          }
        ]
      }
    },
  });

  console.log('✅ Interview created');

  // Create activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'USER_LOGIN',
        description: 'Admin user logged in',
        ipAddress: '127.0.0.1',
      },
      {
        userId: employer.id,
        action: 'JOB_CREATED',
        description: 'Created new job posting',
        ipAddress: '127.0.0.1',
      },
      {
        userId: candidate.id,
        action: 'APPLICATION_SUBMITTED',
        description: 'Applied for Full Stack Developer position',
        ipAddress: '127.0.0.1',
      },
    ],
  });

  console.log('✅ Activity logs created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Sample Accounts Created:');
  console.log('👤 Admin: admin@simuai.com / admin123');
  console.log('🏢 Employer: employer@techcorp.com / employer123');
  console.log('👨‍💻 Candidate: candidate@example.com / candidate123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });