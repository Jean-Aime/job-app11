/**
 * Comprehensive Seed Data Script
 * Populates database with realistic test data for JobLink Africa
 * Run: node seed-comprehensive-data.js
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

// Password hash for "Test123!" 
const TEST_PASSWORD_HASH = 'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

const NIGERIAN_CITIES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 
  'Benin City', 'Enugu', 'Kaduna', 'Jos', 'Calabar'
];

const COMPANIES = [
  { name: 'TechCorp Africa', industry: 'Information Technology', size: '201-500', description: 'Leading tech company in West Africa' },
  { name: 'HealthPlus Nigeria', industry: 'Healthcare', size: '501-1000', description: 'Premier healthcare provider' },
  { name: 'FinServe Solutions', industry: 'Financial Services', size: '51-200', description: 'Innovative fintech solutions' },
  { name: 'EduLearn Africa', industry: 'Education', size: '51-200', description: 'EdTech platform for African students' },
  { name: 'BuildRight Construction', industry: 'Construction', size: '101-500', description: 'Major construction company' },
  { name: 'AgroTech Farms', industry: 'Agriculture', size: '51-200', description: 'Modern agricultural solutions' },
  { name: 'LogiMove Express', industry: 'Logistics', size: '101-500', description: 'Fast delivery services across Nigeria' },
  { name: 'CreativeHub Studio', industry: 'Media & Entertainment', size: '11-50', description: 'Creative design agency' },
  { name: 'RetailMart Nigeria', industry: 'Retail', size: '501-1000', description: 'Leading retail chain' },
  { name: 'EnergyTech Solutions', industry: 'Energy', size: '201-500', description: 'Renewable energy company' },
];

const JOB_SEEKERS = [
  { name: 'Adewale Johnson', occupation: 'Software Developer', experience: 5, city: 'Lagos', skills: ['JavaScript', 'React', 'Node.js', 'SQL'] },
  { name: 'Chidinma Okonkwo', occupation: 'Registered Nurse', experience: 3, city: 'Abuja', skills: ['Patient Care', 'Nursing', 'Emergency Medicine'] },
  { name: 'Emeka Nwankwo', occupation: 'Financial Analyst', experience: 4, city: 'Lagos', skills: ['Financial Analysis', 'Accounting', 'Excel'] },
  { name: 'Fatima Abubakar', occupation: 'Teacher', experience: 7, city: 'Kano', skills: ['Teaching', 'Curriculum Development', 'English'] },
  { name: 'Blessing Eze', occupation: 'Civil Engineer', experience: 6, city: 'Port Harcourt', skills: ['AutoCAD', 'Civil Engineering', 'Project Planning'] },
  { name: 'Ibrahim Mohammed', occupation: 'Digital Marketer', experience: 3, city: 'Lagos', skills: ['Digital Marketing', 'SEO', 'Social Media Marketing'] },
  { name: 'Ngozi Okafor', occupation: 'Accountant', experience: 5, city: 'Enugu', skills: ['Accounting', 'Tax Preparation', 'Auditing'] },
  { name: 'Yusuf Bello', occupation: 'Mechanical Engineer', experience: 8, city: 'Kaduna', skills: ['Mechanical Engineering', 'AutoCAD', 'Quality Control'] },
  { name: 'Amaka Obi', occupation: 'HR Manager', experience: 6, city: 'Lagos', skills: ['Recruitment', 'Team Leadership', 'HR Management'] },
  { name: 'Tunde Bakare', occupation: 'Data Analyst', experience: 4, city: 'Ibadan', skills: ['Data Analysis', 'Python', 'SQL', 'Machine Learning'] },
];

const JOBS = [
  { 
    title: 'Senior Full Stack Developer', 
    category: 'Technology & IT',
    type: 'full_time', 
    level: 'senior',
    description: 'We are seeking an experienced Full Stack Developer to join our growing team. You will work on cutting-edge web applications using React, Node.js, and PostgreSQL.',
    requirements: '5+ years experience in web development, Strong knowledge of JavaScript/TypeScript, Experience with React and Node.js, Understanding of database design',
    benefits: 'Competitive salary, Health insurance, Remote work option, Professional development budget',
    salaryMin: 300000, 
    salaryMax: 500000,
    remote: true,
    skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'TypeScript']
  },
  {
    title: 'Registered Nurse',
    category: 'Healthcare',
    type: 'full_time',
    level: 'mid',
    description: 'Join our healthcare team as a Registered Nurse. Provide quality patient care in a modern facility.',
    requirements: 'Valid nursing license, 2+ years clinical experience, Strong communication skills, Ability to work shifts',
    benefits: 'Health insurance, Paid time off, Continuing education support, Shift differentials',
    salaryMin: 150000,
    salaryMax: 250000,
    remote: false,
    skills: ['Nursing', 'Patient Care', 'Emergency Medicine', 'First Aid']
  },
  {
    title: 'Financial Analyst',
    category: 'Finance & Accounting',
    type: 'full_time',
    level: 'mid',
    description: 'Analyze financial data, prepare reports, and provide insights to support business decisions.',
    requirements: 'Bachelor degree in Finance/Accounting, 3+ years experience, Strong Excel skills, Knowledge of financial modeling',
    benefits: 'Competitive salary, Performance bonuses, Health insurance, Career growth opportunities',
    salaryMin: 200000,
    salaryMax: 350000,
    remote: false,
    skills: ['Financial Analysis', 'Accounting', 'Budgeting', 'Excel']
  },
  {
    title: 'Secondary School Teacher (Mathematics)',
    category: 'Education',
    type: 'full_time',
    level: 'mid',
    description: 'Teach mathematics to secondary school students. Create engaging lessons and support student learning.',
    requirements: 'Teaching certificate, Bachelor degree in Mathematics or Education, 2+ years teaching experience, Passion for education',
    benefits: 'Stable employment, Vacation time, Professional development, Teaching materials provided',
    salaryMin: 100000,
    salaryMax: 180000,
    remote: false,
    skills: ['Teaching', 'Mathematics', 'Communication', 'Curriculum Development']
  },
  {
    title: 'Civil Engineer',
    category: 'Engineering',
    type: 'full_time',
    level: 'senior',
    description: 'Lead civil engineering projects including roads, bridges, and building construction.',
    requirements: 'Bachelor degree in Civil Engineering, COREN registration, 5+ years experience, AutoCAD proficiency',
    benefits: 'Excellent compensation, Project bonuses, Health insurance, Site allowances',
    salaryMin: 350000,
    salaryMax: 600000,
    remote: false,
    skills: ['Civil Engineering', 'AutoCAD', 'Project Planning', 'Site Management']
  },
  {
    title: 'Digital Marketing Specialist',
    category: 'Marketing & Sales',
    type: 'full_time',
    level: 'mid',
    description: 'Develop and execute digital marketing campaigns across multiple channels.',
    requirements: '3+ years digital marketing experience, Google Ads certified, Strong analytics skills, Social media expertise',
    benefits: 'Remote work, Performance bonuses, Training opportunities, Modern tools',
    salaryMin: 180000,
    salaryMax: 300000,
    remote: true,
    skills: ['Digital Marketing', 'SEO', 'Social Media Marketing', 'Content Marketing']
  },
  {
    title: 'Accountant',
    category: 'Finance & Accounting',
    type: 'full_time',
    level: 'mid',
    description: 'Manage financial records, prepare reports, and ensure compliance with accounting standards.',
    requirements: 'ICAN/ACCA qualification, 4+ years experience, Strong attention to detail, Knowledge of accounting software',
    benefits: 'Competitive salary, Health insurance, Professional certification support, Annual bonuses',
    salaryMin: 180000,
    salaryMax: 280000,
    remote: false,
    skills: ['Accounting', 'Tax Preparation', 'Auditing', 'Financial Analysis']
  },
  {
    title: 'Mechanical Engineer',
    category: 'Engineering',
    type: 'full_time',
    level: 'senior',
    description: 'Design and maintain mechanical systems for industrial projects.',
    requirements: 'Bachelor degree in Mechanical Engineering, 6+ years experience, Strong CAD skills, Project management experience',
    benefits: 'Excellent package, Transportation allowance, Health coverage, Training abroad',
    salaryMin: 400000,
    salaryMax: 650000,
    remote: false,
    skills: ['Mechanical Engineering', 'AutoCAD', 'Quality Control', 'Project Management']
  },
  {
    title: 'Human Resources Manager',
    category: 'Human Resources',
    type: 'full_time',
    level: 'senior',
    description: 'Lead HR operations including recruitment, employee relations, and performance management.',
    requirements: 'Bachelor degree in HR/Business, 5+ years HR experience, CIPM certification, Strong leadership skills',
    benefits: 'Executive compensation, Health insurance, Car allowance, Professional development',
    salaryMin: 300000,
    salaryMax: 500000,
    remote: false,
    skills: ['HR Management', 'Recruitment', 'Team Leadership', 'Employee Relations']
  },
  {
    title: 'Data Analyst',
    category: 'Technology & IT',
    type: 'full_time',
    level: 'mid',
    description: 'Analyze business data, create dashboards, and provide actionable insights.',
    requirements: '3+ years data analysis experience, Strong SQL skills, Python/R knowledge, Data visualization expertise',
    benefits: 'Remote work, Competitive salary, Learning budget, Latest tools',
    salaryMin: 250000,
    salaryMax: 400000,
    remote: true,
    skills: ['Data Analysis', 'Python', 'SQL', 'Data Visualization']
  },
  {
    title: 'Junior Software Developer',
    category: 'Technology & IT',
    type: 'full_time',
    level: 'entry',
    description: 'Join our development team as a junior developer. Learn and grow while building real applications.',
    requirements: 'Bachelor degree in Computer Science, Basic programming knowledge, Passion for technology, Good problem-solving skills',
    benefits: 'Mentorship program, Health insurance, Remote flexibility, Learning opportunities',
    salaryMin: 150000,
    salaryMax: 250000,
    remote: true,
    skills: ['JavaScript', 'React', 'Programming', 'Problem Solving']
  },
  {
    title: 'Sales Executive',
    category: 'Marketing & Sales',
    type: 'full_time',
    level: 'mid',
    description: 'Drive sales growth by identifying new business opportunities and maintaining client relationships.',
    requirements: '2+ years sales experience, Excellent communication, Proven track record, Valid drivers license',
    benefits: 'Base + Commission, Car allowance, Health insurance, Performance bonuses',
    salaryMin: 120000,
    salaryMax: 300000,
    remote: false,
    skills: ['Sales', 'Communication', 'Negotiation', 'Customer Service']
  },
  {
    title: 'Content Writer',
    category: 'Creative & Design',
    type: 'contract',
    level: 'mid',
    description: 'Create engaging content for websites, blogs, and social media.',
    requirements: '2+ years writing experience, Strong English skills, SEO knowledge, Portfolio required',
    benefits: 'Flexible hours, Remote work, Competitive rates, Creative freedom',
    salaryMin: 100000,
    salaryMax: 200000,
    remote: true,
    skills: ['Writing', 'Content Marketing', 'SEO', 'Communication']
  },
  {
    title: 'Project Manager',
    category: 'Technology & IT',
    type: 'full_time',
    level: 'senior',
    description: 'Lead software development projects from planning to delivery.',
    requirements: '5+ years project management, PMP/Scrum certified, Strong leadership, Tech background',
    benefits: 'Executive package, Health insurance, Remote work, Professional growth',
    salaryMin: 400000,
    salaryMax: 700000,
    remote: true,
    skills: ['Project Management', 'Team Leadership', 'Agile', 'Communication']
  },
  {
    title: 'Graphic Designer',
    category: 'Creative & Design',
    type: 'full_time',
    level: 'mid',
    description: 'Create visual content for digital and print media.',
    requirements: '3+ years design experience, Adobe Creative Suite expert, Strong portfolio, Brand design experience',
    benefits: 'Creative environment, Modern tools, Health insurance, Flexible hours',
    salaryMin: 150000,
    salaryMax: 280000,
    remote: true,
    skills: ['Graphic Design', 'Adobe Photoshop', 'Adobe Illustrator', 'Brand Design']
  },
  {
    title: 'Customer Service Representative',
    category: 'Customer Service',
    type: 'full_time',
    level: 'entry',
    description: 'Provide excellent customer support via phone, email, and chat.',
    requirements: 'Good communication skills, Problem-solving ability, Computer literacy, Patience and empathy',
    benefits: 'Training provided, Health insurance, Shift allowances, Career progression',
    salaryMin: 80000,
    salaryMax: 150000,
    remote: false,
    skills: ['Customer Service', 'Communication', 'Problem Solving', 'Computer Skills']
  },
  {
    title: 'DevOps Engineer',
    category: 'Technology & IT',
    type: 'full_time',
    level: 'senior',
    description: 'Manage cloud infrastructure, CI/CD pipelines, and deployment automation.',
    requirements: '5+ years DevOps experience, AWS/Azure certified, Kubernetes knowledge, Strong scripting skills',
    benefits: 'Top salary, Remote work, Latest tools, Certification support',
    salaryMin: 450000,
    salaryMax: 800000,
    remote: true,
    skills: ['DevOps', 'Cloud Computing', 'Kubernetes', 'CI/CD']
  },
  {
    title: 'Legal Officer',
    category: 'Legal',
    type: 'full_time',
    level: 'mid',
    description: 'Provide legal advice and handle corporate legal matters.',
    requirements: 'Law degree, Called to Bar, 3+ years experience, Corporate law knowledge',
    benefits: 'Competitive salary, Health insurance, Professional development, Stable environment',
    salaryMin: 250000,
    salaryMax: 450000,
    remote: false,
    skills: ['Legal Research', 'Contract Law', 'Compliance', 'Communication']
  },
  {
    title: 'Administrative Assistant',
    category: 'Administrative',
    type: 'full_time',
    level: 'entry',
    description: 'Support daily office operations and administrative tasks.',
    requirements: 'OND/HND, Good organizational skills, Microsoft Office proficiency, Professional demeanor',
    benefits: 'Stable employment, Health insurance, Training, Career growth',
    salaryMin: 70000,
    salaryMax: 120000,
    remote: false,
    skills: ['Administration', 'Microsoft Office', 'Organization', 'Communication']
  },
  {
    title: 'Mobile App Developer (React Native)',
    category: 'Technology & IT',
    type: 'full_time',
    level: 'mid',
    description: 'Develop cross-platform mobile applications using React Native.',
    requirements: '3+ years mobile development, React Native expert, App store deployments, Strong JavaScript skills',
    benefits: 'Remote work, Competitive salary, Learning budget, Modern stack',
    salaryMin: 300000,
    salaryMax: 500000,
    remote: true,
    skills: ['Mobile Development', 'React', 'JavaScript', 'TypeScript']
  },
];

async function seedDatabase() {
  console.log('🌱 Starting comprehensive database seeding...\n');
  
  const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

  try {
    // Check if already seeded
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
    if (parseInt(existingUsers[0].count) > 0) {
      console.log('⚠️  Database already contains data.');
      console.log(`   Found ${existingUsers[0].count} users`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('   Do you want to continue and add more data? (yes/no): ', resolve);
      });
      readline.close();
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('Seeding cancelled.');
        return;
      }
    }

    // Get categories
    console.log('📋 Fetching job categories...');
    const categories = await sql`SELECT id, name FROM job_categories`;
    console.log(`✅ Found ${categories.length} categories`);

    // Get skills
    const skills = await sql`SELECT id, name FROM skills`;
    console.log(`✅ Found ${skills.length} skills\n`);

    const categoryMap = Object.fromEntries(categories.map(c => [c.name, c.id]));
    const skillMap = Object.fromEntries(skills.map(s => [s.name, s.id]));

    // Create employers and companies
    console.log('Step 1: Creating employers and companies...');
    const employerIds = [];
    
    for (let i = 0; i < COMPANIES.length; i++) {
      const company = COMPANIES[i];
      const userId = crypto.randomUUID();
      const email = `employer${i + 1}@joblink.com`;
      
      // Create user
      await sql`
        INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
        VALUES (${userId}, ${email}, ${TEST_PASSWORD_HASH}, 'employer', true, true, 'verified')
      `;

      // Create employer
      await sql`
        INSERT INTO employers (
          user_id, company_name, industry, company_size, 
          company_description, verification_status, is_verified,
          city, country, website
        ) VALUES (
          ${userId},
          ${company.name},
          ${company.industry},
          ${company.size},
          ${company.description},
          'approved',
          true,
          ${NIGERIAN_CITIES[i % NIGERIAN_CITIES.length]},
          'Nigeria',
          ${`https://www.${company.name.toLowerCase().replace(/\s+/g, '')}.com`}
        )
      `;

      employerIds.push({ userId, ...company });
    }
    
    console.log(`✅ Created ${employerIds.length} employers`);
    console.log(`   Login: employer1@joblink.com to employer${employerIds.length}@joblink.com`);
    console.log(`   Password: Test123!\n`);

    // Create job seekers
    console.log('Step 2: Creating job seekers...');
    const jobSeekerIds = [];
    
    for (let i = 0; i < JOB_SEEKERS.length; i++) {
      const seeker = JOB_SEEKERS[i];
      const userId = crypto.randomUUID();
      const email = `jobseeker${i + 1}@joblink.com`;
      
      // Create user
      await sql`
        INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
        VALUES (${userId}, ${email}, ${TEST_PASSWORD_HASH}, 'job_seeker', true, true, 'verified')
      `;

      // Create job seeker
      const seekerId = crypto.randomUUID();
      await sql`
        INSERT INTO job_seekers (
          id, user_id, full_name, phone_number, city, country,
          current_occupation, years_of_experience, availability,
          profile_completion_score
        ) VALUES (
          ${seekerId},
          ${userId},
          ${seeker.name},
          ${'+234' + Math.floor(Math.random() * 1000000000)},
          ${seeker.city},
          'Nigeria',
          ${seeker.occupation},
          ${seeker.experience},
          'immediately',
          ${60 + Math.floor(Math.random() * 30)}
        )
      `;

      // Add skills
      for (const skillName of seeker.skills) {
        const skillId = skillMap[skillName];
        if (skillId) {
          await sql`
            INSERT INTO job_seeker_skills (job_seeker_id, skill_id, proficiency_level)
            VALUES (${seekerId}, ${skillId}, ${['beginner', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)]})
          `;
        }
      }

      jobSeekerIds.push({ userId, seekerId, ...seeker });
    }
    
    console.log(`✅ Created ${jobSeekerIds.length} job seekers`);
    console.log(`   Login: jobseeker1@joblink.com to jobseeker${jobSeekerIds.length}@joblink.com`);
    console.log(`   Password: Test123!\n`);

    // Create jobs
    console.log('Step 3: Creating jobs...');
    const jobIds = [];
    
    for (let i = 0; i < JOBS.length; i++) {
      const job = JOBS[i];
      const employer = employerIds[i % employerIds.length];
      const jobId = crypto.randomUUID();
      const categoryId = categoryMap[job.category];
      const city = NIGERIAN_CITIES[i % NIGERIAN_CITIES.length];
      
      await sql`
        INSERT INTO jobs (
          id, employer_id, category_id, title, description,
          requirements, benefits, employment_type, experience_level,
          salary_min, salary_max, salary_currency,
          city, location, country, is_remote, status, view_count,
          latitude, longitude
        ) VALUES (
          ${jobId},
          ${employer.userId},
          ${categoryId},
          ${job.title},
          ${job.description},
          ${job.requirements},
          ${job.benefits},
          ${job.type},
          ${job.level},
          ${job.salaryMin},
          ${job.salaryMax},
          'NGN',
          ${city},
          ${city + ', Nigeria'},
          'Nigeria',
          ${job.remote},
          'active',
          ${Math.floor(Math.random() * 500)},
          ${6.5 + Math.random() * 4},
          ${3.3 + Math.random() * 4}
        )
      `;

      // Add job skills
      if (job.skills) {
        for (const skillName of job.skills) {
          const skillId = skillMap[skillName];
          if (skillId) {
            await sql`
              INSERT INTO job_skills (job_id, skill_id, is_required)
              VALUES (${jobId}, ${skillId}, ${Math.random() > 0.5})
            `;
          }
        }
      }

      jobIds.push(jobId);
    }
    
    console.log(`✅ Created ${jobIds.length} jobs\n`);

    // Create applications
    console.log('Step 4: Creating applications...');
    let appCount = 0;
    const statuses = ['pending', 'under_review', 'shortlisted', 'accepted', 'rejected'];
    
    for (const seeker of jobSeekerIds) {
      // Each job seeker applies to 2-5 random jobs
      const numApplications = 2 + Math.floor(Math.random() * 4);
      const shuffledJobs = [...jobIds].sort(() => Math.random() - 0.5).slice(0, numApplications);
      
      for (const jobId of shuffledJobs) {
        const appId = crypto.randomUUID();
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        await sql`
          INSERT INTO applications (
            id, job_id, job_seeker_id, status,
            cover_letter
          ) VALUES (
            ${appId},
            ${jobId},
            ${seeker.seekerId},
            ${status},
            ${'I am very interested in this position and believe my skills and experience make me a strong candidate.'}
          )
        `;
        appCount++;
      }
    }
    
    console.log(`✅ Created ${appCount} applications\n`);

    // Create saved jobs
    console.log('Step 5: Creating saved jobs...');
    let savedCount = 0;
    
    for (const seeker of jobSeekerIds) {
      // Each job seeker saves 2-4 random jobs
      const numSaved = 2 + Math.floor(Math.random() * 3);
      const shuffledJobs = [...jobIds].sort(() => Math.random() - 0.5).slice(0, numSaved);
      
      for (const jobId of shuffledJobs) {
        await sql`
          INSERT INTO saved_jobs (job_seeker_id, job_id)
          VALUES (${seeker.seekerId}, ${jobId})
          ON CONFLICT (job_seeker_id, job_id) DO NOTHING
        `;
        savedCount++;
      }
    }
    
    console.log(`✅ Created ${savedCount} saved jobs\n`);

    // Create admin user
    console.log('Step 6: Creating admin user...');
    const adminId = crypto.randomUUID();
    await sql`
      INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
      VALUES (${adminId}, 'admin@joblink.com', ${TEST_PASSWORD_HASH}, 'admin', true, true, 'verified')
    `;
    console.log('✅ Created admin user');
    console.log('   Login: admin@joblink.com');
    console.log('   Password: Test123!\n');

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📊 Summary:');
    console.log(`   ✅ ${employerIds.length} employers (companies)`);
    console.log(`   ✅ ${jobSeekerIds.length} job seekers`);
    console.log(`   ✅ ${jobIds.length} active jobs`);
    console.log(`   ✅ ${appCount} applications`);
    console.log(`   ✅ ${savedCount} saved jobs`);
    console.log(`   ✅ 1 admin user\n`);

    console.log('🔐 Test Accounts (Password: Test123!):');
    console.log('   Admin:       admin@joblink.com');
    console.log('   Employers:   employer1@joblink.com - employer10@joblink.com');
    console.log('   Job Seekers: jobseeker1@joblink.com - jobseeker10@joblink.com\n');

    console.log('🚀 Next Steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Login with any test account above');
    console.log('   3. Explore the app with real data!\n');

  } catch (err) {
    console.error('❌ Error seeding database:', err);
    console.error('\nDetails:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

seedDatabase();
