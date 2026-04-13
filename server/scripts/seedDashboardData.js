const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

async function seedDashboardData() {
  try {
    console.log('🌱 Starting dashboard data seeding...');

    // Create test candidate user
    const candidateEmail = 'candidate@test.com';
    let candidate = await prisma.user.findUnique({
      where: { email: candidateEmail }
    });

    if (!candidate) {
      candidate = await prisma.user.create({
        data: {
          email: candidateEmail,
          passwordHash: await bcrypt.hash('password123', 10),
          firstName: 'John',
          lastName: 'Candidate',
          role: 'CANDIDATE',
          isVerified: true,
          isActive: true
        }
      });
      console.log('✅ Created candidate user:', candidate.email);
    } else {
      console.log('⏭️  Candidate user already exists');
    }

    // Create test employer user
    const employerEmail = 'employer@test.com';
    let employer = await prisma.user.findUnique({
      where: { email: employerEmail }
    });

    if (!employer) {
      employer = await prisma.user.create({
        data: {
          email: employerEmail,
          passwordHash: await bcrypt.hash('password123', 10),
          firstName: 'Jane',
          lastName: 'Employer',
          role: 'EMPLOYER',
          isVerified: true,
          isActive: true
        }
      });
      console.log('✅ Created employer user:', employer.email);
    } else {
      console.log('⏭️  Employer user already exists');
    }

    // Create test company
    let company = await prisma.company.findFirst({
      where: { name: 'Tech Corp' }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Tech Corp',
          industry: 'Technology',
          website: 'https://techcorp.com',
          description: 'A leading technology company',
          createdById: employer.id,
          isVerified: true
        }
      });
      console.log('✅ Created company:', company.name);
    } else {
      console.log('⏭️  Company already exists');
    }

    // Create test jobs
    const jobTitles = ['Senior Developer', 'Product Manager', 'UX Designer'];
    const jobs = [];

    for (const title of jobTitles) {
      let job = await prisma.job.findFirst({
        where: { title, companyId: company.id }
      });

      if (!job) {
        job = await prisma.job.create({
          data: {
            title,
            description: `We are looking for a ${title} to join our team`,
            requirements: 'Experience with modern technologies',
            salary: '80000-120000',
            location: 'San Francisco, CA',
            status: 'ACTIVE',
            companyId: company.id,
            createdById: employer.id
          }
        });
        console.log('✅ Created job:', job.title);
      } else {
        console.log('⏭️  Job already exists:', title);
      }
      jobs.push(job);
    }

    // Create test applications
    for (const job of jobs) {
      let application = await prisma.application.findFirst({
        where: { candidateId: candidate.id, jobId: job.id }
      });

      if (!application) {
        application = await prisma.application.create({
          data: {
            candidateId: candidate.id,
            jobId: job.id,
            status: 'PENDING',
            appliedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          }
        });
        console.log('✅ Created application for:', job.title);
      } else {
        console.log('⏭️  Application already exists');
      }
    }

    // Create test interviews
    const interviewStatuses = ['SCHEDULED', 'COMPLETED', 'COMPLETED'];
    for (let i = 0; i < jobs.length; i++) {
      let interview = await prisma.interview.findFirst({
        where: { candidateId: candidate.id, jobId: jobs[i].id }
      });

      if (!interview) {
        interview = await prisma.interview.create({
          data: {
            candidateId: candidate.id,
            jobId: jobs[i].id,
            status: interviewStatuses[i],
            startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            overallScore: interviewStatuses[i] === 'COMPLETED' ? Math.floor(Math.random() * 40) + 60 : null
          }
        });
        console.log('✅ Created interview for:', jobs[i].title, '- Status:', interviewStatuses[i]);
      } else {
        console.log('⏭️  Interview already exists');
      }
    }

    console.log('\n✨ Dashboard data seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Candidate - Email: candidate@test.com, Password: password123');
    console.log('Employer - Email: employer@test.com, Password: password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDashboardData();
