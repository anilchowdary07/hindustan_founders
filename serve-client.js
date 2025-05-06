const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from the dist/public directory (built client)
app.use(express.static(path.join(__dirname, 'dist/public')));

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Add a mock API endpoint for highlights
app.get('/api/highlights', (req, res) => {
  console.log('Fetching highlights');
  res.status(200).json({
    jobs: [
      {
        id: 1,
        title: "Senior Software Engineer",
        company: "TechStartup Inc.",
        location: "Bangalore, India (Remote)",
        jobType: "Full-time",
        logo: "https://via.placeholder.com/150",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        user: {
          id: 1,
          name: "Demo Founder",
          company: "TechStartup Inc.",
          isVerified: true
        }
      },
      {
        id: 2,
        title: "Product Manager",
        company: "FinTech Solutions",
        location: "Mumbai, India",
        jobType: "Full-time",
        logo: "https://via.placeholder.com/150",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        user: {
          id: 2,
          name: "Demo Investor",
          company: "FinTech Solutions",
          isVerified: true
        }
      },
      {
        id: 3,
        title: "UI/UX Designer",
        company: "DesignHub",
        location: "Delhi, India (Hybrid)",
        jobType: "Full-time",
        logo: "https://via.placeholder.com/150",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        user: {
          id: 3,
          name: "Demo Mentor",
          company: "DesignHub",
          isVerified: true
        }
      }
    ],
    pitches: [
      {
        id: 1,
        title: "AI-Powered Healthcare Platform",
        tagline: "Revolutionizing patient care with predictive analytics",
        industry: "Healthcare",
        fundingStage: "Seed",
        fundingAmount: 500000,
        logo: "https://via.placeholder.com/150",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        user: {
          id: 1,
          name: "Demo Founder",
          company: "HealthTech AI",
          isVerified: true
        }
      },
      {
        id: 2,
        title: "Sustainable Fashion Marketplace",
        tagline: "Connecting eco-conscious consumers with ethical brands",
        industry: "Fashion",
        fundingStage: "Pre-seed",
        fundingAmount: 200000,
        logo: "https://via.placeholder.com/150",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        user: {
          id: 2,
          name: "Eco Fashion",
          company: "Green Threads",
          isVerified: true
        }
      },
      {
        id: 3,
        title: "EdTech Platform for Skill Development",
        tagline: "Bridging the gap between education and employment",
        industry: "Education",
        fundingStage: "Series A",
        fundingAmount: 2000000,
        logo: "https://via.placeholder.com/150",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        user: {
          id: 3,
          name: "Learn Tech",
          company: "SkillBridge",
          isVerified: true
        }
      }
    ],
    people: [
      {
        id: 2,
        name: "Vikram Malhotra",
        role: "Founder & CTO",
        company: "CodeNova",
        location: "Bangalore, India",
        avatarUrl: null,
        isVerified: true,
        mutualConnections: 3
      },
      {
        id: 3,
        name: "Priya Sharma",
        role: "Product Manager",
        company: "TechInnovate",
        location: "Mumbai, India",
        avatarUrl: null,
        isVerified: false,
        mutualConnections: 2
      },
      {
        id: 4,
        name: "Rahul Kapoor",
        role: "Angel Investor",
        company: "Venture Capital Partners",
        location: "Delhi, India",
        avatarUrl: null,
        isVerified: true,
        mutualConnections: 5
      }
    ]
  });
});

// Add a mock API endpoint for current user
app.get('/api/auth/me', (req, res) => {
  res.status(200).json({
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'founder',
    title: 'CEO',
    company: 'Demo Startup',
    location: 'India',
    bio: 'Demo account for testing',
    isVerified: true,
    avatarUrl: null,
    profileCompleted: true,
    createdAt: new Date().toISOString()
  });
});

// Add a mock API endpoint for user data
app.get('/api/user', (req, res) => {
  res.status(200).json({
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'founder',
    title: 'CEO',
    company: 'Demo Startup',
    location: 'India',
    bio: 'Demo account for testing',
    isVerified: true,
    avatarUrl: null,
    profileCompleted: true,
    createdAt: new Date().toISOString()
  });
});

// Add a mock API endpoint for updating user role
app.post('/api/user/role', (req, res) => {
  const { role } = req.body;
  console.log(`Updating user role to: ${role}`);
  
  res.status(200).json({
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    role: role || 'founder',
    title: 'CEO',
    company: 'Demo Startup',
    location: 'India',
    bio: 'Demo account for testing',
    isVerified: true,
    avatarUrl: null,
    profileCompleted: true,
    createdAt: new Date().toISOString()
  });
});

// Add a mock API endpoint for updating user profile
app.patch('/api/users/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userData = req.body;
  console.log(`Updating user ${userId} with data:`, userData);
  
  res.status(200).json({
    id: userId,
    name: userData.name || 'Demo User',
    email: 'demo@example.com',
    role: userData.role || 'founder',
    title: userData.title || 'CEO',
    company: userData.company || 'Demo Startup',
    location: userData.location || 'India',
    bio: userData.bio || 'Demo account for testing',
    isVerified: true,
    avatarUrl: userData.avatarUrl || null,
    profileCompleted: true,
    createdAt: new Date().toISOString()
  });
});

// Add a mock API endpoint for user registration
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  console.log(`Registering new user: ${name}, ${email}, role: ${role}`);
  
  res.status(201).json({
    id: 1,
    name: name || 'Demo User',
    email: email || 'demo@example.com',
    role: role || 'founder',
    title: '',
    company: '',
    location: '',
    bio: '',
    isVerified: false,
    avatarUrl: null,
    profileCompleted: false,
    createdAt: new Date().toISOString()
  });
});

// Add a mock API endpoint for user login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`Logging in user: ${email}`);
  
  res.status(200).json({
    id: 1,
    name: 'Demo User',
    email: email || 'demo@example.com',
    role: 'founder',
    title: 'CEO',
    company: 'Demo Startup',
    location: 'India',
    bio: 'Demo account for testing',
    isVerified: true,
    avatarUrl: null,
    profileCompleted: true,
    createdAt: new Date().toISOString()
  });
});

// Add a mock API endpoint for posts
app.get('/api/posts', (req, res) => {
  res.status(200).json([
    {
      id: 1001,
      content: "Just secured our first round of funding for my AI-powered healthcare startup! Looking forward to revolutionizing patient care with predictive analytics. #StartupLife #HealthTech #AI",
      userId: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      likes: 42,
      comments: 8,
      media: null,
      user: {
        id: 1,
        name: "Demo Founder",
        role: "Founder & CEO",
        company: "HealthAI Solutions",
        isVerified: true,
        profilePicture: null
      }
    },
    {
      id: 1002,
      content: "Excited to announce that we're expanding our team! Looking for talented developers with experience in React, Node.js, and AI/ML. DM me if you're interested or know someone who might be a good fit. #Hiring #TechJobs #StartupHiring",
      userId: 2,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      likes: 28,
      comments: 15,
      media: null,
      user: {
        id: 2,
        name: "Demo Investor",
        role: "Angel Investor",
        company: "Venture Capital Partners",
        isVerified: true,
        profilePicture: null
      }
    }
  ]);
});

// Add a mock API endpoint for jobs
app.get('/api/jobs', (req, res) => {
  // Extract query parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const type = req.query.type;
  const location = req.query.location;
  const q = req.query.q;
  
  console.log(`Jobs query: page=${page}, limit=${limit}, type=${type}, location=${location}, q=${q}`);
  
  // Sample job data
  const allJobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "TechStartup Inc.",
      location: "Bangalore, India (Remote)",
      jobType: "Full-time",
      description: "We're looking for a senior software engineer to join our team and help build our next-generation platform.",
      requirements: "5+ years of experience with React, Node.js, and TypeScript",
      salaryMin: 1800000,
      salaryMax: 2500000,
      applicationUrl: "https://example.com/apply",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      logo: "https://via.placeholder.com/150",
      user: {
        id: 1,
        name: "Demo Founder",
        avatarUrl: null,
        role: "Founder & CEO",
        company: "TechStartup Inc."
      }
    },
    {
      id: 2,
      title: "Product Manager",
      company: "FinTech Solutions",
      location: "Mumbai, India",
      jobType: "Full-time",
      description: "Join our product team to help define and build innovative financial products.",
      requirements: "3+ years of product management experience in fintech",
      salaryMin: 2000000,
      salaryMax: 3000000,
      applicationUrl: "https://example.com/apply",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      logo: "https://via.placeholder.com/150",
      user: {
        id: 2,
        name: "Demo Investor",
        avatarUrl: null,
        role: "Angel Investor",
        company: "FinTech Solutions"
      }
    },
    {
      id: 3,
      title: "UI/UX Designer",
      company: "DesignHub",
      location: "Delhi, India (Hybrid)",
      jobType: "Full-time",
      description: "We're looking for a talented UI/UX designer to help create beautiful and intuitive user experiences.",
      requirements: "Portfolio showcasing UI/UX work, experience with Figma and Adobe Creative Suite",
      salaryMin: 1500000,
      salaryMax: 2200000,
      applicationUrl: "https://example.com/apply",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
      logo: "https://via.placeholder.com/150",
      user: {
        id: 3,
        name: "Demo Mentor",
        avatarUrl: null,
        role: "Business Mentor",
        company: "DesignHub"
      }
    },
    {
      id: 4,
      title: "Frontend Developer",
      company: "WebTech Solutions",
      location: "Hyderabad, India",
      jobType: "Contract",
      description: "Looking for a skilled frontend developer to work on our client projects.",
      requirements: "3+ years of experience with React, HTML, CSS, and JavaScript",
      salaryMin: 1200000,
      salaryMax: 1800000,
      applicationUrl: "https://example.com/apply",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      logo: "https://via.placeholder.com/150",
      user: {
        id: 4,
        name: "Rahul Kapoor",
        avatarUrl: null,
        role: "CTO",
        company: "WebTech Solutions"
      }
    },
    {
      id: 5,
      title: "Data Scientist",
      company: "AI Innovations",
      location: "Pune, India (Remote)",
      jobType: "Part-time",
      description: "Join our AI team to work on cutting-edge machine learning projects.",
      requirements: "Experience with Python, TensorFlow, and data analysis",
      salaryMin: 1500000,
      salaryMax: 2200000,
      applicationUrl: "https://example.com/apply",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), // 6 days ago
      logo: "https://via.placeholder.com/150",
      user: {
        id: 5,
        name: "Priya Sharma",
        avatarUrl: null,
        role: "AI Lead",
        company: "AI Innovations"
      }
    }
  ];
  
  // Filter jobs based on query parameters
  let filteredJobs = [...allJobs];
  
  if (type) {
    filteredJobs = filteredJobs.filter(job => job.jobType.toLowerCase() === type.toLowerCase());
  }
  
  if (location) {
    filteredJobs = filteredJobs.filter(job => 
      job.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  if (q) {
    filteredJobs = filteredJobs.filter(job => 
      job.title.toLowerCase().includes(q.toLowerCase()) ||
      job.description.toLowerCase().includes(q.toLowerCase()) ||
      job.company.toLowerCase().includes(q.toLowerCase())
    );
  }
  
  // Paginate results
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
  
  // Ensure all jobs have the required properties
  const safeJobs = paginatedJobs.map(job => ({
    ...job,
    logo: job.logo || "https://via.placeholder.com/150",
    user: job.user || {
      id: 1,
      name: "Default User",
      avatarUrl: null,
      role: "Default Role",
      company: job.company || "Default Company"
    }
  }));
  
  console.log("Sending jobs data:", JSON.stringify(safeJobs, null, 2));
  
  res.status(200).json({
    jobs: safeJobs,
    pagination: {
      total: filteredJobs.length,
      page: page,
      limit: limit,
      totalPages: Math.ceil(filteredJobs.length / limit)
    }
  });
});

// Add a mock API endpoint for pitches
app.get('/api/pitches', (req, res) => {
  res.status(200).json([
    {
      id: 1,
      name: "EcoMart",
      description: "Sustainable online marketplace connecting eco-friendly product manufacturers with conscious consumers.",
      location: "India (Remote)",
      status: "IDEA",
      category: "E-commerce",
      userId: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      user: {
        id: 1,
        name: "Demo Founder",
        role: "Founder & CEO",
        company: "Demo Startup",
        isVerified: true,
        avatarUrl: null
      }
    },
    {
      id: 2,
      name: "FinEdge",
      description: "AI-powered financial advisory platform for small businesses and startups.",
      location: "India (Remote)",
      status: "REGISTERED",
      category: "FinTech",
      userId: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
      user: {
        id: 1,
        name: "Demo Founder",
        role: "Founder & CEO",
        company: "Demo Startup",
        isVerified: true,
        avatarUrl: null
      }
    },
    {
      id: 3,
      name: "AgroSense",
      description: "IoT-based solution for farmers to monitor soil health, weather conditions, and crop growth.",
      location: "India (Remote)",
      status: "IDEA",
      category: "AgriTech",
      userId: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
      user: {
        id: 1,
        name: "Demo Founder",
        role: "Founder & CEO",
        company: "Demo Startup",
        isVerified: true,
        avatarUrl: null
      }
    }
  ]);
});

// Add a mock API endpoint for a specific job
app.get('/api/jobs/:id', (req, res) => {
  const jobId = parseInt(req.params.id);
  console.log(`Fetching job with ID: ${jobId}`);
  
  const jobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "TechStartup Inc.",
      location: "Bangalore, India (Remote)",
      jobType: "Full-time",
      description: "We're looking for a senior software engineer to join our team and help build our next-generation platform. The ideal candidate will have strong experience with modern web technologies and a passion for building high-quality, scalable applications.\n\nResponsibilities:\n- Design, develop, and maintain web applications using React, Node.js, and TypeScript\n- Collaborate with product managers, designers, and other engineers\n- Write clean, maintainable, and well-tested code\n- Participate in code reviews and technical discussions\n- Mentor junior engineers",
      requirements: "5+ years of experience with React, Node.js, and TypeScript\n- Strong understanding of web fundamentals (HTML, CSS, JavaScript)\n- Experience with RESTful APIs and GraphQL\n- Familiarity with cloud services (AWS, GCP, or Azure)\n- Bachelor's degree in Computer Science or equivalent experience",
      salaryMin: 1800000,
      salaryMax: 2500000,
      applicationUrl: "https://example.com/apply",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      logo: "https://via.placeholder.com/150",
      user: {
        id: 1,
        name: "Demo Founder",
        company: "TechStartup Inc.",
        isVerified: true,
      }
    },
    {
      id: 2,
      title: "Product Manager",
      company: "FinTech Solutions",
      location: "Mumbai, India",
      jobType: "Full-time",
      description: "Join our product team to help define and build innovative financial products. You'll work closely with engineering, design, and business teams to deliver features that delight our users and drive business growth.\n\nResponsibilities:\n- Lead the product development lifecycle from conception to launch\n- Gather and analyze user feedback to inform product decisions\n- Define product requirements and create detailed specifications\n- Work with engineering teams to ensure successful implementation\n- Track and measure product performance post-launch",
      requirements: "3+ years of product management experience in fintech\n- Strong analytical and problem-solving skills\n- Excellent communication and stakeholder management abilities\n- Experience with agile development methodologies\n- Bachelor's degree in Business, Computer Science, or related field",
      salaryMin: 2000000,
      salaryMax: 3000000,
      applicationUrl: "https://example.com/apply",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      logo: "https://via.placeholder.com/150",
      user: {
        id: 2,
        name: "Demo Investor",
        company: "FinTech Solutions",
        isVerified: true,
      }
    },
    {
      id: 3,
      title: "UI/UX Designer",
      company: "DesignHub",
      location: "Delhi, India (Hybrid)",
      jobType: "Full-time",
      description: "We're looking for a talented UI/UX designer to help create beautiful and intuitive user experiences. You'll be responsible for the entire design process, from research and wireframing to creating high-fidelity mockups and prototypes.\n\nResponsibilities:\n- Conduct user research and usability testing\n- Create wireframes, user flows, and interactive prototypes\n- Design visually appealing and intuitive user interfaces\n- Collaborate with product and engineering teams\n- Stay up-to-date with design trends and best practices",
      requirements: "Portfolio showcasing UI/UX work, experience with Figma and Adobe Creative Suite\n- 2+ years of experience in UI/UX design\n- Strong understanding of design principles and user-centered design\n- Experience with design systems and component libraries\n- Excellent communication and collaboration skills",
      salaryMin: 1500000,
      salaryMax: 2200000,
      applicationUrl: "https://example.com/apply",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
      logo: "https://via.placeholder.com/150",
      user: {
        id: 3,
        name: "Demo Mentor",
        company: "DesignHub",
        isVerified: true,
      }
    },
    {
      id: 4,
      title: "Frontend Developer",
      company: "WebTech Solutions",
      location: "Hyderabad, India",
      jobType: "Contract",
      description: "Looking for a skilled frontend developer to work on our client projects. You'll be responsible for implementing responsive and interactive user interfaces using modern web technologies.\n\nResponsibilities:\n- Develop responsive web applications using HTML, CSS, and JavaScript\n- Implement UI components using React and related libraries\n- Ensure cross-browser compatibility and performance optimization\n- Collaborate with designers and backend developers\n- Write clean, maintainable code with appropriate documentation",
      requirements: "3+ years of experience with React, HTML, CSS, and JavaScript\n- Experience with responsive design and cross-browser compatibility\n- Familiarity with modern frontend build tools and workflows\n- Knowledge of performance optimization techniques\n- Strong problem-solving skills and attention to detail",
      salaryMin: 1200000,
      salaryMax: 1800000,
      applicationUrl: "https://example.com/apply",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      logo: "https://via.placeholder.com/150",
      user: {
        id: 4,
        name: "Rahul Kapoor",
        company: "WebTech Solutions",
        isVerified: true,
      }
    },
    {
      id: 5,
      title: "Data Scientist",
      company: "AI Innovations",
      location: "Pune, India (Remote)",
      jobType: "Part-time",
      description: "Join our AI team to work on cutting-edge machine learning projects. You'll analyze data, build models, and help develop AI-powered features for our products.\n\nResponsibilities:\n- Analyze and interpret complex data sets\n- Develop machine learning models and algorithms\n- Collaborate with engineering teams to implement AI solutions\n- Evaluate and improve model performance\n- Stay current with the latest research and techniques in AI/ML",
      requirements: "Experience with Python, TensorFlow, and data analysis\n- Strong background in statistics and mathematics\n- Experience with data visualization and communication\n- Knowledge of machine learning algorithms and techniques\n- Master's or PhD in Computer Science, Statistics, or related field preferred",
      salaryMin: 1500000,
      salaryMax: 2200000,
      applicationUrl: "https://example.com/apply",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), // 6 days ago
      logo: "https://via.placeholder.com/150",
      user: {
        id: 5,
        name: "Priya Sharma",
        company: "AI Innovations",
        isVerified: true,
      }
    }
  ];
  
  let job = jobs.find(j => j.id === jobId);
  
  if (job) {
    // Ensure job has all required properties
    job = {
      ...job,
      logo: job.logo || "https://via.placeholder.com/150",
      user: job.user || {
        id: 1,
        name: "Default User",
        avatarUrl: null,
        role: "Default Role",
        company: job.company || "Default Company"
      }
    };
    
    console.log("Sending job detail:", JSON.stringify(job, null, 2));
    res.status(200).json(job);
  } else {
    res.status(404).json({ message: "Job not found" });
  }
});

// Add a mock API endpoint for creating a job
app.post('/api/jobs', (req, res) => {
  console.log('Creating new job:', req.body);
  
  const newJob = {
    id: 100, // Generate a new ID
    ...req.body,
    createdAt: new Date().toISOString(),
    user: {
      id: 1,
      name: "Demo Founder",
      company: req.body.company || "Demo Company",
      isVerified: true,
    }
  };
  
  res.status(201).json(newJob);
});

// Add mock API endpoints for connections
app.get('/api/connections', (req, res) => {
  res.status(200).json([
    {
      id: 1,
      user: {
        id: 2,
        name: "Vikram Malhotra",
        role: "Founder & CTO",
        company: "CodeNova",
        location: "Bangalore, India",
        avatarUrl: null,
        isVerified: true
      },
      status: "accepted",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() // 30 days ago
    },
    {
      id: 2,
      user: {
        id: 3,
        name: "Priya Sharma",
        role: "Product Manager",
        company: "TechInnovate",
        location: "Mumbai, India",
        avatarUrl: null,
        isVerified: false
      },
      status: "accepted",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() // 15 days ago
    },
    {
      id: 3,
      user: {
        id: 4,
        name: "Rahul Kapoor",
        role: "Angel Investor",
        company: "Venture Capital Partners",
        location: "Delhi, India",
        avatarUrl: null,
        isVerified: true
      },
      status: "accepted",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() // 7 days ago
    }
  ]);
});

app.get('/api/connections/requests', (req, res) => {
  res.status(200).json([
    {
      id: 4,
      user: {
        id: 5,
        name: "Ananya Sharma",
        role: "Marketing Director",
        company: "Digital Strategies",
        location: "Hyderabad, India",
        avatarUrl: null,
        isVerified: false
      },
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    }
  ]);
});

app.get('/api/connections/suggestions', (req, res) => {
  res.status(200).json([
    {
      id: 6,
      name: "Arjun Mehta",
      role: "Software Engineer",
      company: "Tech Innovators",
      location: "Pune, India",
      avatarUrl: null,
      isVerified: false,
      mutualConnections: 2
    },
    {
      id: 7,
      name: "Neha Gupta",
      role: "UX Designer",
      company: "Creative Solutions",
      location: "Bangalore, India",
      avatarUrl: null,
      isVerified: true,
      mutualConnections: 1
    },
    {
      id: 8,
      name: "Sanjay Patel",
      role: "Startup Advisor",
      company: "Growth Mentors",
      location: "Mumbai, India",
      avatarUrl: null,
      isVerified: true,
      mutualConnections: 3
    }
  ]);
});

app.post('/api/connections', (req, res) => {
  const { receiverId } = req.body;
  console.log(`Creating connection request to user ${receiverId}`);
  
  res.status(201).json({
    id: 100,
    requesterId: 1,
    receiverId: receiverId,
    status: "pending",
    createdAt: new Date().toISOString()
  });
});

app.patch('/api/connections/:connectionId', (req, res) => {
  const connectionId = parseInt(req.params.connectionId);
  const { status } = req.body;
  console.log(`Updating connection ${connectionId} status to ${status}`);
  
  res.status(200).json({
    id: connectionId,
    requesterId: 5,
    receiverId: 1,
    status: status,
    updatedAt: new Date().toISOString()
  });
});

// Add a mock API endpoint for a specific pitch
app.get('/api/pitches/:id', (req, res) => {
  const pitchId = parseInt(req.params.id);
  
  const pitches = [
    {
      id: 1,
      name: "EcoMart",
      description: "Sustainable online marketplace connecting eco-friendly product manufacturers with conscious consumers.",
      location: "India (Remote)",
      status: "IDEA",
      category: "E-commerce",
      userId: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      user: {
        id: 1,
        name: "Demo Founder",
        role: "Founder & CEO",
        company: "Demo Startup",
        isVerified: true,
        avatarUrl: null
      }
    },
    {
      id: 2,
      name: "FinEdge",
      description: "AI-powered financial advisory platform for small businesses and startups.",
      location: "India (Remote)",
      status: "REGISTERED",
      category: "FinTech",
      userId: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
      user: {
        id: 1,
        name: "Demo Founder",
        role: "Founder & CEO",
        company: "Demo Startup",
        isVerified: true,
        avatarUrl: null
      }
    },
    {
      id: 3,
      name: "AgroSense",
      description: "IoT-based solution for farmers to monitor soil health, weather conditions, and crop growth.",
      location: "India (Remote)",
      status: "IDEA",
      category: "AgriTech",
      userId: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
      user: {
        id: 1,
        name: "Demo Founder",
        role: "Founder & CEO",
        company: "Demo Startup",
        isVerified: true,
        avatarUrl: null
      }
    }
  ];
  
  const pitch = pitches.find(p => p.id === pitchId);
  
  if (pitch) {
    res.status(200).json(pitch);
  } else {
    res.status(404).json({ message: "Pitch not found" });
  }
});

// Add a mock API endpoint for saved jobs
app.get('/api/jobs/saved', (req, res) => {
  res.status(200).json({
    jobs: [
      {
        id: 1,
        title: "Senior Software Engineer",
        company: "TechStartup Inc.",
        location: "Bangalore, India (Remote)",
        jobType: "Full-time",
        description: "We're looking for a senior software engineer to join our team and help build our next-generation platform.",
        requirements: "5+ years of experience with React, Node.js, and TypeScript",
        salaryMin: 1800000,
        salaryMax: 2500000,
        applicationUrl: "https://example.com/apply",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        savedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        logo: "https://via.placeholder.com/150",
        user: {
          id: 1,
          name: "Demo Founder",
          avatarUrl: null,
          role: "Founder & CEO",
          company: "TechStartup Inc."
        }
      }
    ],
    pagination: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  });
});

// Add a mock API endpoint for notifications
app.get('/api/notifications', (req, res) => {
  res.status(200).json([
    {
      id: 1,
      type: 'connection',
      content: 'Ananya Sharma sent you a connection request',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      relatedId: 1,
      relatedType: 'connection'
    },
    {
      id: 2,
      type: 'message',
      content: 'Vikram Mehta commented on your post: "Great insights! Would love to connect and discuss more about this topic."',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      relatedId: 1,
      relatedType: 'post'
    },
    {
      id: 3,
      type: 'job',
      content: 'Google India posted a new job: "Senior Software Engineer" that matches your profile',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      relatedId: 1,
      relatedType: 'job'
    }
  ]);
});

// Add a mock API endpoint for conversations
app.get('/api/conversations', (req, res) => {
  res.status(200).json([
    {
      id: 1,
      participants: [
        {
          id: 1,
          name: "Demo User",
          avatarUrl: null,
          status: 'online',
          lastSeen: new Date(),
        },
        {
          id: 2,
          name: "Vikram Malhotra",
          avatarUrl: null,
          status: 'online',
          lastSeen: new Date(),
        }
      ],
      lastMessage: {
        content: "Looking forward to our meeting tomorrow!",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      id: 2,
      participants: [
        {
          id: 1,
          name: "Demo User",
          avatarUrl: null,
          status: 'online',
          lastSeen: new Date(),
        },
        {
          id: 3,
          name: "Priya Sharma",
          avatarUrl: null,
          status: 'away',
          lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        }
      ],
      lastMessage: {
        content: "I'll review your pitch and get back to you",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        isRead: false,
      },
      unreadCount: 1,
    },
    {
      id: 3,
      participants: [
        {
          id: 1,
          name: "Demo User",
          avatarUrl: null,
          status: 'online',
          lastSeen: new Date(),
        },
        {
          id: 4,
          name: "Rahul Kapoor",
          avatarUrl: null,
          status: 'offline',
          lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        }
      ],
      lastMessage: {
        content: "Have you considered raising capital from angel investors?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        isRead: true,
      },
      unreadCount: 0,
    }
  ]);
});

// Add a mock API endpoint for conversation messages
app.get('/api/conversations/:conversationId/messages', (req, res) => {
  const conversationId = parseInt(req.params.conversationId);
  console.log(`Fetching messages for conversation ${conversationId}`);
  
  // Mock data for different conversations
  const mockMessages = {
    1: [
      {
        id: 1,
        content: "Hi Vikram, I wanted to discuss our upcoming product launch strategy.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        sender: { id: 1, name: "Demo User" },
        isCurrentUser: true,
      },
      {
        id: 2,
        content: "Sure! I've been analyzing the market data you sent. I think we should target urban professionals first.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5).toISOString(), // 5 minutes after previous message
        sender: { id: 2, name: 'Vikram Malhotra' },
        isCurrentUser: false,
      },
      {
        id: 3,
        content: "That makes sense. Do you have any specific marketing channels in mind?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), // 1 hour ago
        sender: { id: 1, name: "Demo User" },
        isCurrentUser: true,
      },
      {
        id: 4,
        content: "I think we should focus on LinkedIn and industry-specific webinars.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        sender: { id: 2, name: 'Vikram Malhotra' },
        isCurrentUser: false,
      },
      {
        id: 5,
        content: "Looking forward to our meeting tomorrow!",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        sender: { id: 2, name: 'Vikram Malhotra' },
        isCurrentUser: false,
      },
    ],
    2: [
      {
        id: 1,
        content: "Hello Priya, I've shared my startup pitch deck with you. Would appreciate your feedback.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        sender: { id: 1, name: "Demo User" },
        isCurrentUser: true,
      },
      {
        id: 2,
        content: "Hi there! I'll take a look at it over the weekend.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
        sender: { id: 3, name: 'Priya Sharma' },
        isCurrentUser: false,
      },
      {
        id: 3,
        content: "Thanks, I'm particularly interested in your thoughts on the financial projections.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        sender: { id: 1, name: "Demo User" },
        isCurrentUser: true,
      },
      {
        id: 4,
        content: "I'll review your pitch and get back to you",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        sender: { id: 3, name: 'Priya Sharma' },
        isCurrentUser: false,
      },
    ],
    3: [
      {
        id: 1,
        content: "Hi Rahul, I'm looking for investment opportunities for my tech startup.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        sender: { id: 1, name: "Demo User" },
        isCurrentUser: true,
      },
      {
        id: 2,
        content: "What's your current valuation and how much are you looking to raise?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        sender: { id: 4, name: 'Rahul Kapoor' },
        isCurrentUser: false,
      },
      {
        id: 3,
        content: "We're valued at $2M pre-money and looking to raise $500K for market expansion.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(), // 3.5 hours ago
        sender: { id: 1, name: "Demo User" },
        isCurrentUser: true,
      },
      {
        id: 4,
        content: "Have you considered raising capital from angel investors?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        sender: { id: 4, name: 'Rahul Kapoor' },
        isCurrentUser: false,
      },
    ]
  };
  
  // Return messages for the requested conversation or an empty array if not found
  res.json(mockMessages[conversationId] || []);
});

// Add a mock API endpoint for sending a message
app.post('/api/conversations/:conversationId/messages', (req, res) => {
  const conversationId = parseInt(req.params.conversationId);
  const { content } = req.body;
  console.log(`Sending message to conversation ${conversationId}: ${content}`);
  
  res.status(201).json({
    id: Math.floor(Math.random() * 1000) + 100,
    content,
    timestamp: new Date().toISOString(),
    sender: {
      id: 1,
      name: "Demo User",
      avatarUrl: null
    },
    isCurrentUser: true
  });
});

// Add a mock API endpoint for creating a new conversation
app.post('/api/conversations', (req, res) => {
  const { participants } = req.body;
  console.log(`Creating new conversation with participants: ${JSON.stringify(participants)}`);
  
  res.status(201).json({
    id: Math.floor(Math.random() * 1000) + 100,
    participants: [
      {
        id: 1,
        name: "Demo User",
        avatarUrl: null,
        status: 'online',
        lastSeen: new Date(),
      },
      ...participants.map(p => ({
        id: p,
        name: `User ${p}`,
        avatarUrl: null,
        status: 'offline',
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      }))
    ],
    createdAt: new Date().toISOString()
  });
});

// Add a mock API endpoint for user experiences
app.get('/api/users/:userId/experiences', (req, res) => {
  const userId = parseInt(req.params.userId);
  console.log(`Fetching experiences for user ${userId}`);
  
  res.status(200).json([
    {
      id: 1,
      title: "Founder & CEO",
      company: "Demo Startup",
      location: "Bangalore, India",
      startDate: "2020-01",
      endDate: null,
      current: true,
      description: "Founded and leading a tech startup focused on AI-powered solutions for healthcare.",
      userId: userId,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString() // 1 year ago
    },
    {
      id: 2,
      title: "Product Manager",
      company: "Tech Innovations",
      location: "Mumbai, India",
      startDate: "2018-03",
      endDate: "2019-12",
      current: false,
      description: "Led product development for a SaaS platform with over 10,000 users.",
      userId: userId,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 2).toISOString() // 2 years ago
    },
    {
      id: 3,
      title: "Software Engineer",
      company: "Global Solutions",
      location: "Delhi, India",
      startDate: "2016-06",
      endDate: "2018-02",
      current: false,
      description: "Developed web applications using React, Node.js, and MongoDB.",
      userId: userId,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 3).toISOString() // 3 years ago
    }
  ]);
});

// Add a mock API endpoint for creating a user experience
app.post('/api/users/:userId/experiences', (req, res) => {
  const userId = parseInt(req.params.userId);
  const experienceData = req.body;
  console.log(`Creating new experience for user ${userId}:`, experienceData);
  
  res.status(201).json({
    id: Math.floor(Math.random() * 1000) + 100,
    ...experienceData,
    userId: userId,
    createdAt: new Date().toISOString()
  });
});

// Add a mock API endpoint for user posts
app.get('/api/users/:userId/posts', (req, res) => {
  const userId = parseInt(req.params.userId);
  console.log(`Fetching posts for user ${userId}`);
  
  res.status(200).json([
    {
      id: 1001,
      content: "Just secured our first round of funding for my AI-powered healthcare startup! Looking forward to revolutionizing patient care with predictive analytics. #StartupLife #HealthTech #AI",
      userId: userId,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
      likes: 42,
      comments: 8,
      media: null,
      user: {
        id: userId,
        name: "Demo User",
        role: "Founder & CEO",
        company: "Demo Startup",
        isVerified: true,
        profilePicture: null
      }
    },
    {
      id: 1002,
      content: "Excited to announce that we're expanding our team! Looking for talented developers with experience in React, Node.js, and AI/ML. DM me if you're interested or know someone who might be a good fit. #Hiring #TechJobs #StartupHiring",
      userId: userId,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 2 weeks ago
      likes: 28,
      comments: 15,
      media: null,
      user: {
        id: userId,
        name: "Demo User",
        role: "Founder & CEO",
        company: "Demo Startup",
        isVerified: true,
        profilePicture: null
      }
    }
  ]);
});

// Handle all other API routes
app.all('/api/*', (req, res) => {
  console.log(`Unhandled API request: ${req.method} ${req.path}`);
  res.status(200).json({ message: 'API endpoint not implemented yet' });
});

// For any other routes, serve the index.html from the built client
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to view the application`);
});