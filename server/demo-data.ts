import { DatabaseStorage } from './storage';
import bcrypt from 'bcryptjs';

// Function to generate a secure password hash
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function seedDemoData(storage: DatabaseStorage) {
  console.log('Starting to seed demo data...');

  try {
    // Check if demo data already exists
    const existingUsers = await storage.getUserByUsername('demofounder');
    if (existingUsers) {
      console.log('Demo data already exists, skipping seeding.');
      return;
    }

    // Create demo users
    const demoUsers = [
      {
        username: 'demofounder',
        password: await hashPassword('password123'),
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        role: 'founder',
        title: 'CEO & Co-founder',
        company: 'TechInnovate',
        location: 'Bangalore, India',
        bio: 'Serial entrepreneur with 10+ years of experience in SaaS and fintech. Previously founded two successful startups with exits.',
        profileCompleted: 100
      },
      {
        username: 'demoinvestor',
        password: await hashPassword('password123'),
        name: 'Priya Patel',
        email: 'priya@example.com',
        role: 'investor',
        title: 'Managing Partner',
        company: 'Horizon Ventures',
        location: 'Mumbai, India',
        bio: 'Early-stage investor focused on fintech, healthtech, and enterprise SaaS. Previously worked at Goldman Sachs for 8 years.',
        profileCompleted: 100
      },
      {
        username: 'demofounder2',
        password: await hashPassword('password123'),
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        role: 'founder',
        title: 'CTO & Co-founder',
        company: 'DataSense AI',
        location: 'Hyderabad, India',
        bio: 'AI researcher turned entrepreneur. Building tools to make artificial intelligence accessible to businesses of all sizes.',
        profileCompleted: 100
      },
      {
        username: 'demofounder3',
        password: await hashPassword('password123'),
        name: 'Ananya Desai',
        email: 'ananya@example.com',
        role: 'founder',
        title: 'Founder & CEO',
        company: 'EcoWear',
        location: 'Delhi, India',
        bio: 'Passionate about sustainable fashion. Building India\'s first carbon-neutral clothing brand with a focus on ethical manufacturing.',
        profileCompleted: 100
      },
      {
        username: 'demoinvestor2',
        password: await hashPassword('password123'),
        name: 'Arjun Mehta',
        email: 'arjun@example.com',
        role: 'investor',
        title: 'Investment Director',
        company: 'Bharat Capital',
        location: 'Chennai, India',
        bio: 'Focused on Series A investments in consumer tech, fintech, and edtech. Looking for founders solving uniquely Indian problems.',
        profileCompleted: 100
      }
    ];

    // Insert users
    for (const user of demoUsers) {
      await storage.createUser(user);
      console.log(`Created user: ${user.name}`);
    }

    // Get user IDs for reference
    const rahul = await storage.getUserByUsername('demofounder');
    const priya = await storage.getUserByUsername('demoinvestor');
    const vikram = await storage.getUserByUsername('demofounder2');
    const ananya = await storage.getUserByUsername('demofounder3');
    const arjun = await storage.getUserByUsername('demoinvestor2');

    if (!rahul || !priya || !vikram || !ananya || !arjun) {
      throw new Error('Failed to retrieve created users');
    }

    // Create pitches
    const demoPitches = [
      {
        userId: rahul.id,
        name: 'TechInnovate',
        description: 'We are building a next-generation SaaS platform that helps SMBs automate their customer support using AI. Our solution reduces response times by 80% and increases customer satisfaction scores by 35%.',
        problem: 'Small businesses struggle with providing timely customer support due to limited resources. Traditional solutions are either too expensive or too basic.',
        solution: 'Our AI-powered platform automates routine inquiries and provides agents with smart suggestions for complex issues, all at an affordable price point.',
        targetMarket: 'SMBs in e-commerce, SaaS, and service industries with 10-200 employees.',
        businessModel: 'Subscription-based pricing starting at ₹2,999/month with tiered plans based on volume and features.',
        competition: 'Zendesk, Freshdesk, and Intercom are our main competitors, but they target larger enterprises with complex needs and higher price points.',
        traction: 'Currently serving 50+ paying customers with 92% retention rate. MRR of ₹15 lakhs with 15% month-over-month growth.',
        team: 'Founded by ex-Zoho and ex-Freshworks engineers with 20+ years of combined experience in customer support software.',
        fundingStage: 'seed',
        fundingAmount: '₹2.5 Crore',
        category: 'saas',
        location: 'Bangalore, India',
        pitchDeckUrl: 'https://example.com/pitch-deck.pdf',
        websiteUrl: 'https://techinnovate.example.com',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        status: 'published'
      },
      {
        userId: vikram.id,
        name: 'DataSense AI',
        description: 'DataSense AI is democratizing artificial intelligence for Indian businesses by providing easy-to-use, no-code AI tools that solve real business problems without requiring technical expertise.',
        problem: 'AI adoption in Indian SMEs is less than 5% due to technical complexity, high costs, and lack of specialized talent.',
        solution: 'Our no-code platform allows businesses to implement AI solutions for customer segmentation, demand forecasting, and personalization without hiring data scientists.',
        targetMarket: 'Mid-sized retail, e-commerce, and manufacturing businesses in India with annual revenue between ₹10-100 crore.',
        businessModel: 'SaaS subscription model with usage-based pricing. Average customer pays ₹50,000 per month.',
        competition: 'International players like DataRobot and Obviously AI, but they lack localization for Indian business contexts and data.',
        traction: '25 paying customers including 2 publicly listed companies. ₹12 lakhs MRR growing at 20% month-over-month.',
        team: 'Founded by IIT and IIM alumni with experience at Microsoft AI research and Flipkart\'s data science team.',
        fundingStage: 'pre-seed',
        fundingAmount: '₹1 Crore',
        category: 'artificial-intelligence',
        location: 'Hyderabad, India',
        pitchDeckUrl: 'https://example.com/datasense-pitch.pdf',
        websiteUrl: 'https://datasense.example.com',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        status: 'published'
      },
      {
        userId: ananya.id,
        name: 'EcoWear',
        description: 'EcoWear is India\'s first carbon-neutral clothing brand, creating stylish, sustainable fashion using organic fabrics and ethical manufacturing processes.',
        problem: 'The fashion industry is one of the largest polluters globally, and consumers lack accessible, stylish sustainable options in India.',
        solution: 'We create timeless, high-quality clothing using organic cotton, recycled materials, and natural dyes, manufactured in our carbon-neutral facilities.',
        targetMarket: 'Environmentally conscious urban consumers aged 25-40 with disposable income.',
        businessModel: 'D2C e-commerce with premium pricing (30-40% higher than fast fashion) justified by quality and sustainability.',
        competition: 'International brands like Patagonia and Reformation, but they are expensive for Indian consumers. Local players lack true sustainability credentials.',
        traction: '₹1.2 crore in sales in the first year, 65% repeat purchase rate, 30k+ Instagram followers with strong engagement.',
        team: 'Founded by NIFT graduate with experience at major fashion houses and an operations expert from Myntra.',
        fundingStage: 'seed',
        fundingAmount: '₹3 Crore',
        category: 'consumer',
        location: 'Delhi, India',
        pitchDeckUrl: 'https://example.com/ecowear-pitch.pdf',
        websiteUrl: 'https://ecowear.example.com',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        status: 'published'
      }
    ];

    // Insert pitches
    for (const pitch of demoPitches) {
      await storage.createPitch(pitch);
      console.log(`Created pitch: ${pitch.name}`);
    }

    // Create jobs
    const demoJobs = [
      {
        userId: rahul.id,
        title: 'Senior Full Stack Developer',
        company: 'TechInnovate',
        location: 'Bangalore, India',
        description: 'We are looking for a Senior Full Stack Developer to join our growing team. You will be responsible for developing and maintaining our core SaaS platform, working with both frontend and backend technologies.',
        responsibilities: '- Design and implement new features for our AI-powered customer support platform\n- Work with product managers to refine specifications and requirements\n- Optimize application for maximum speed and scalability\n- Collaborate with the data science team to integrate AI models into the platform',
        requirements: '- 5+ years of experience in full stack development\n- Strong proficiency in React, Node.js, and TypeScript\n- Experience with SQL and NoSQL databases\n- Understanding of CI/CD pipelines and DevOps practices\n- Experience with AWS or similar cloud platforms',
        jobType: 'full-time',
        locationType: 'hybrid',
        salary: '₹25-35 LPA',
        applicationLink: 'https://techinnovate.example.com/careers',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        userId: vikram.id,
        title: 'Machine Learning Engineer',
        company: 'DataSense AI',
        location: 'Hyderabad, India',
        description: 'DataSense AI is seeking a talented Machine Learning Engineer to help build and improve our no-code AI platform. You will work on developing and optimizing machine learning models that power our core features.',
        responsibilities: '- Develop and implement machine learning algorithms and models\n- Collaborate with the product team to understand customer needs and translate them into ML solutions\n- Optimize existing models for performance and accuracy\n- Stay up-to-date with the latest ML research and techniques',
        requirements: '- Masters or PhD in Computer Science, Machine Learning, or related field\n- 3+ years of experience in applied machine learning\n- Proficiency in Python and ML frameworks (TensorFlow, PyTorch)\n- Experience with NLP and computer vision applications\n- Strong mathematical and statistical skills',
        jobType: 'full-time',
        locationType: 'remote',
        salary: '₹20-30 LPA',
        applicationLink: 'https://datasense.example.com/careers',
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // 45 days from now
      },
      {
        userId: ananya.id,
        title: 'Sustainability Manager',
        company: 'EcoWear',
        location: 'Delhi, India',
        description: 'EcoWear is looking for a Sustainability Manager to oversee our environmental initiatives and ensure our products meet the highest sustainability standards. This role will be crucial in maintaining our carbon-neutral status and developing new eco-friendly practices.',
        responsibilities: '- Develop and implement sustainability strategies across the organization\n- Manage carbon offset programs and sustainability certifications\n- Work with suppliers to ensure compliance with our ethical and environmental standards\n- Create reports on our environmental impact and progress towards sustainability goals',
        requirements: '- Bachelor\'s or Master\'s degree in Environmental Science, Sustainability, or related field\n- 3+ years of experience in sustainability management, preferably in the fashion industry\n- Knowledge of carbon accounting and offset programs\n- Familiarity with textile sustainability certifications (GOTS, Oeko-Tex, etc.)\n- Strong communication and project management skills',
        jobType: 'full-time',
        locationType: 'on-site',
        salary: '₹15-20 LPA',
        applicationLink: 'https://ecowear.example.com/careers',
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
      }
    ];

    // Insert jobs
    for (const job of demoJobs) {
      await storage.createJob(job);
      console.log(`Created job: ${job.title} at ${job.company}`);
    }

    // Create connections
    const connections = [
      { userId1: rahul.id, userId2: priya.id, status: 'accepted' },
      { userId1: rahul.id, userId2: vikram.id, status: 'accepted' },
      { userId1: vikram.id, userId2: ananya.id, status: 'accepted' },
      { userId1: ananya.id, userId2: arjun.id, status: 'accepted' },
      { userId1: priya.id, userId2: arjun.id, status: 'accepted' },
      { userId1: priya.id, userId2: ananya.id, status: 'pending' },
      { userId1: vikram.id, userId2: arjun.id, status: 'pending' }
    ];

    for (const connection of connections) {
      await storage.createConnection(connection);
      console.log(`Created connection between users ${connection.userId1} and ${connection.userId2}`);
    }

    // Create posts
    const demoPosts = [
      {
        userId: rahul.id,
        content: 'Excited to announce that TechInnovate has just crossed 50 paying customers! Our AI-powered customer support platform is helping businesses reduce response times by 80%. Looking for talented engineers to join our growing team. #startup #AI #customerservice',
        type: 'update'
      },
      {
        userId: priya.id,
        content: 'Horizon Ventures is actively looking for early-stage startups in fintech and healthtech. If you are building something innovative in these spaces, I would love to connect! #venturecapital #investing #startups',
        type: 'update'
      },
      {
        userId: vikram.id,
        content: 'Just published a new blog post on "How SMEs can implement AI without a data science team." Check it out on our website! #AI #MachineLearning #SME',
        type: 'update'
      },
      {
        userId: ananya.id,
        content: 'Proud to share that EcoWear has been certified carbon-neutral! Our commitment to sustainable fashion goes beyond just using organic materials - we are making sure our entire supply chain is environmentally responsible. #sustainability #fashion #climateaction',
        type: 'update'
      },
      {
        userId: arjun.id,
        content: 'What is the biggest challenge you are facing as a founder in India right now? Looking to understand the ecosystem better and how investors can provide more value beyond capital. #founderlife #startupindia',
        type: 'question'
      },
      {
        userId: rahul.id,
        content: 'Looking for recommendations on the best payment gateway for a SaaS business in India. Currently evaluating Razorpay, Cashfree, and PayU. Any experiences to share? #fintech #saas #india',
        type: 'question'
      },
      {
        userId: vikram.id,
        content: 'Just read an excellent paper on few-shot learning techniques that could be game-changing for businesses with limited data. Happy to share insights if anyone is interested! #machinelearning #AI #datascience',
        type: 'update'
      },
      {
        userId: ananya.id,
        content: 'We are hosting a sustainable fashion workshop next month in Delhi. If you are interested in learning about eco-friendly materials and ethical manufacturing, DM me for details! #sustainablefashion #workshop #delhi',
        type: 'event'
      }
    ];

    // Insert posts
    for (const post of demoPosts) {
      await storage.createPost(post);
      console.log(`Created post by user ${post.userId}`);
    }

    // Create conversations and messages
    const conversations = [
      {
        user1Id: rahul.id,
        user2Id: priya.id
      },
      {
        user1Id: vikram.id,
        user2Id: arjun.id
      },
      {
        user1Id: ananya.id,
        user2Id: rahul.id
      }
    ];

    for (const conversation of conversations) {
      const convo = await storage.createConversation(conversation);
      console.log(`Created conversation between users ${conversation.user1Id} and ${conversation.user2Id}`);

      if (convo) {
        // Add messages to the first conversation (Rahul and Priya)
        if (conversation.user1Id === rahul.id && conversation.user2Id === priya.id) {
          const messages = [
            {
              conversationId: convo.id,
              senderId: rahul.id,
              content: 'Hi Priya, thanks for connecting! I would love to tell you more about TechInnovate and explore if there might be investment opportunities.',
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
            },
            {
              conversationId: convo.id,
              senderId: priya.id,
              content: 'Hello Rahul! I have been following your progress and I am impressed with your traction. Lets set up a call to discuss further.',
              timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
            },
            {
              conversationId: convo.id,
              senderId: rahul.id,
              content: 'That sounds great! How does next Tuesday at 3pm work for you?',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            },
            {
              conversationId: convo.id,
              senderId: priya.id,
              content: 'Tuesday works perfectly. I will send you a calendar invite with the meeting details.',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            },
            {
              conversationId: convo.id,
              senderId: rahul.id,
              content: 'Looking forward to it! I will prepare a brief overview of our current metrics and growth plans.',
              timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
            }
          ];

          for (const message of messages) {
            await storage.createMessage(message);
          }
          console.log(`Added messages to conversation between Rahul and Priya`);
        }

        // Add messages to the second conversation (Vikram and Arjun)
        if (conversation.user1Id === vikram.id && conversation.user2Id === arjun.id) {
          const messages = [
            {
              conversationId: convo.id,
              senderId: vikram.id,
              content: 'Hi Arjun, I noticed you are interested in AI startups. I would love to tell you about what we are building at DataSense.',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            },
            {
              conversationId: convo.id,
              senderId: arjun.id,
              content: 'Hello Vikram! Yes, I am very interested in the AI space, especially solutions for Indian businesses. Tell me more about DataSense.',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            },
            {
              conversationId: convo.id,
              senderId: vikram.id,
              content: 'We are building a no-code AI platform specifically designed for Indian SMEs. Our platform allows businesses to implement AI solutions without hiring data scientists.',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
              conversationId: convo.id,
              senderId: arjun.id,
              content: 'That sounds interesting. What kind of traction are you seeing so far?',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
              conversationId: convo.id,
              senderId: vikram.id,
              content: 'We have 25 paying customers including 2 publicly listed companies. Our MRR is ₹12 lakhs and growing at 20% month-over-month.',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            }
          ];

          for (const message of messages) {
            await storage.createMessage(message);
          }
          console.log(`Added messages to conversation between Vikram and Arjun`);
        }

        // Add messages to the third conversation (Ananya and Rahul)
        if (conversation.user1Id === ananya.id && conversation.user2Id === rahul.id) {
          const messages = [
            {
              conversationId: convo.id,
              senderId: ananya.id,
              content: 'Hi Rahul! I saw your post about customer support solutions. Do you have any experience with sustainability reporting tools?',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
              conversationId: convo.id,
              senderId: rahul.id,
              content: 'Hello Ananya! I do not have direct experience with sustainability tools, but I know a few founders in that space. What are you looking for specifically?',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
              conversationId: convo.id,
              senderId: ananya.id,
              content: 'We are looking for a tool to track our carbon footprint across our supply chain. As a sustainable fashion brand, this is crucial for us.',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
              conversationId: convo.id,
              senderId: rahul.id,
              content: 'I can introduce you to Nikhil from GreenMetrics. They are building exactly what you are looking for. Would that be helpful?',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
              conversationId: convo.id,
              senderId: ananya.id,
              content: 'That would be amazing! Thank you so much for the connection.',
              timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
            }
          ];

          for (const message of messages) {
            await storage.createMessage(message);
          }
          console.log(`Added messages to conversation between Ananya and Rahul`);
        }
      }
    }

    console.log('Demo data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}