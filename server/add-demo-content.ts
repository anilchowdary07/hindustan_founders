import { DatabaseStorage } from './storage';

export async function addDemoContent(storage: DatabaseStorage) {
  console.log('Adding more demo content...');

  try {
    // Get existing demo users
    const rahul = await storage.getUserByUsername('demofounder');
    const priya = await storage.getUserByUsername('demoinvestor');
    const vikram = await storage.getUserByUsername('demofounder2');
    const ananya = await storage.getUserByUsername('demofounder3');
    const arjun = await storage.getUserByUsername('demoinvestor2');

    if (!rahul || !priya || !vikram || !ananya || !arjun) {
      console.log('Demo users not found. Please run the demo data seeding first.');
      return;
    }

    // Add more posts
    const additionalPosts = [
      {
        userId: rahul.id,
        content: 'Just had an amazing meeting with potential investors from Singapore. Excited about the possibilities for TechInnovate to expand across Southeast Asia! #funding #expansion #startuplife',
        type: 'update'
      },
      {
        userId: priya.id,
        content: 'What metrics do you focus on most when evaluating early-stage SaaS startups? Is it MRR growth, CAC:LTV ratio, or something else? Curious to hear from other investors and founders. #venturecapital #metrics #saas',
        type: 'question'
      },
      {
        userId: vikram.id,
        content: 'Excited to announce that DataSense AI has been selected for the Google for Startups Accelerator program! Looking forward to working with mentors and scaling our AI solutions for Indian businesses. #GoogleForStartups #AI #milestone',
        type: 'update'
      },
      {
        userId: ananya.id,
        content: 'EcoWear is hiring! We are looking for a Sustainability Manager and a Senior Fashion Designer passionate about eco-friendly fashion. DM for details or check our website. #hiring #sustainablefashion #jobs',
        type: 'update'
      },
      {
        userId: arjun.id,
        content: 'Just published an article on "The Evolution of India\'s Startup Ecosystem" on our blog. Would love to hear your thoughts and experiences. Link in comments! #startupindia #venturecapital #ecosystem',
        type: 'update'
      },
      {
        userId: rahul.id,
        content: 'We are hosting a webinar next week on "Building AI-powered Customer Support Systems on a Budget." Register through the link in my profile. #AI #customerservice #webinar',
        type: 'event'
      },
      {
        userId: vikram.id,
        content: 'Has anyone worked with AWS SageMaker for production ML deployments? Looking for recommendations on best practices for Indian startups with limited ML engineering resources. #AWS #MachineLearning #MLOps',
        type: 'question'
      },
      {
        userId: ananya.id,
        content: 'Proud to share that EcoWear has been featured in Vogue India\'s "Sustainable Brands to Watch" issue! This recognition validates our mission to make sustainable fashion mainstream in India. #VogueIndia #sustainablefashion #milestone',
        type: 'update'
      },
      {
        userId: priya.id,
        content: 'Horizon Ventures is organizing a pitch day for fintech startups in Mumbai next month. If you are building something innovative in payments, lending, or insurtech, apply through the link in comments. #pitchday #fintech #mumbai',
        type: 'event'
      },
      {
        userId: arjun.id,
        content: 'Just returned from a tour of startup hubs in Tier 2 cities. The innovation happening outside the metros is incredible! Particularly impressed by the healthtech ecosystem in Coimbatore. #tier2startups #innovation #healthtech',
        type: 'update'
      },
      {
        userId: rahul.id,
        content: 'What customer feedback collection methods have worked best for your early-stage product? We are trying to optimize our feedback loops at TechInnovate. #productdevelopment #customerfeedback #startup',
        type: 'question'
      },
      {
        userId: vikram.id,
        content: 'Celebrating a milestone today: DataSense AI has processed over 1 million data points for our clients, helping them make better business decisions through AI! #milestone #datascience #AI',
        type: 'update'
      }
    ];

    // Insert additional posts
    for (const post of additionalPosts) {
      await storage.createPost(post);
      console.log(`Created additional post by user ${post.userId}`);
    }

    // We'll skip the conversation part for now since the methods don't exist
    console.log('Skipping conversation creation as the methods are not available');

    console.log('Additional demo content added successfully!');
  } catch (error) {
    console.error('Error adding demo content:', error);
    throw error;
  }
}