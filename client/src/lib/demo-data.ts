// This file contains demo data to populate the application
// with sample content for testing and demonstration purposes

import { faker } from '@faker-js/faker';

// Set seed for consistent generation
faker.seed(123);

// Generate avatar URLs using DiceBear API
const getAvatarUrl = (seed: string) => {
  return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`;
};

// Generate a random date within the last 6 months
const getRandomDate = () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  return faker.date.between({ from: sixMonthsAgo, to: now });
};

// Generate random users
export const demoUsers = Array.from({ length: 15 }, (_, i) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;
  
  return {
    id: i + 2, // Start from 2 since ID 1 is typically the admin
    name,
    username: faker.internet.userName({ firstName, lastName }).toLowerCase(),
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    password: faker.internet.password(),
    role: faker.helpers.arrayElement(['founder', 'investor', 'mentor']),
    title: faker.person.jobTitle(),
    company: faker.company.name(),
    location: `${faker.location.city()}, ${faker.location.country()}`,
    bio: faker.lorem.paragraph(),
    avatarUrl: getAvatarUrl(name),
    coverUrl: faker.image.urlLoremFlickr({ category: 'business' }),
    skills: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => 
      faker.helpers.arrayElement([
        'React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'Java', 'Product Management',
        'UI/UX Design', 'Marketing', 'Sales', 'Business Development', 'Data Science',
        'Machine Learning', 'Blockchain', 'Growth Hacking', 'SEO', 'Content Creation'
      ])
    ),
    interests: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => 
      faker.helpers.arrayElement([
        'Startup Growth', 'Technology', 'Artificial Intelligence', 'SaaS', 'E-commerce',
        'Fintech', 'Healthtech', 'Edtech', 'Sustainable Business', 'Social Impact',
        'Venture Capital', 'Angel Investing', 'Bootstrapping', 'Design Thinking'
      ])
    ),
    createdAt: getRandomDate(),
    profileCompleted: faker.number.int({ min: 60, max: 100 }),
    isVerified: true,
  };
});

// Generate random posts
export const demoPosts = Array.from({ length: 30 }, (_, i) => {
  const userId = faker.number.int({ min: 1, max: demoUsers.length + 1 });
  const hasMedia = faker.datatype.boolean(0.6); // 60% chance of having media
  
  return {
    id: i + 1,
    userId,
    content: faker.helpers.arrayElement([
      faker.lorem.paragraph(),
      `Just closed our seed round of $${faker.number.int({ min: 1, max: 10 })}M! 🚀 Excited for the next chapter of our journey.`,
      `Looking for a ${faker.person.jobTitle()} to join our team. DM me if interested!`,
      `Excited to announce our new partnership with ${faker.company.name()}!`,
      `Just published a new article on ${faker.helpers.arrayElement(['startup growth', 'fundraising', 'product development', 'team building'])}. Check it out!`,
      `Anyone here experienced with ${faker.helpers.arrayElement(['influencer marketing', 'content strategy', 'SEO optimization', 'growth hacking'])}? Need some advice.`,
      `Attending ${faker.company.name()} conference next week. Let's connect if you're there too!`,
      `Just hit ${faker.number.int({ min: 1000, max: 1000000 })} users! Thanks to everyone who supported us along the way.`,
      `What's your favorite tool for ${faker.helpers.arrayElement(['analytics', 'project management', 'customer support', 'email marketing'])}?`,
      `We're launching our beta next week! DM me if you want early access.`
    ]),
    media: hasMedia ? faker.image.urlLoremFlickr({ category: faker.helpers.arrayElement(['business', 'technology', 'office', 'people']) }) : null,
    createdAt: getRandomDate(),
    likes: faker.number.int({ min: 0, max: 50 }),
    commentsCount: faker.number.int({ min: 0, max: 15 })
  };
});

// Generate random comments
export const demoComments = demoPosts.flatMap(post => {
  return Array.from({ length: post.commentsCount }, (_, i) => {
    const userId = faker.number.int({ min: 1, max: demoUsers.length + 1 });
    
    return {
      id: (post.id * 100) + i,
      postId: post.id,
      userId,
      content: faker.helpers.arrayElement([
        faker.lorem.sentence(),
        "Congratulations! 🎉",
        "This is amazing news!",
        "Great work, keep it up!",
        "I'd love to learn more about this.",
        "Thanks for sharing!",
        "Very insightful!",
        "I've been following your journey, impressive progress!",
        "Would love to connect and discuss this further.",
        "Count me in!",
        "Interesting perspective.",
        "This resonates with what we're doing at our startup too."
      ]),
      createdAt: faker.date.between({ from: new Date(post.createdAt), to: new Date() })
    };
  });
});

// Generate random pitches (startup ideas)
export const demoPitches = Array.from({ length: 12 }, (_, i) => {
  const userId = faker.number.int({ min: 1, max: demoUsers.length + 1 });
  const categories = ['SaaS', 'E-commerce', 'Fintech', 'Healthtech', 'Edtech', 'AI', 'Mobile App', 'Hardware', 'B2B', 'B2C', 'Marketplace', 'Social Impact'];
  const statuses = ['draft', 'published', 'featured'];
  
  return {
    id: i + 1,
    name: faker.company.name(),
    description: faker.lorem.paragraphs(3),
    userId,
    logo: faker.image.avatar(),
    category: faker.helpers.arrayElement(categories),
    location: `${faker.location.city()}, ${faker.location.country()}`,
    status: faker.helpers.arrayElement(statuses),
    createdAt: getRandomDate(),
    problem: faker.lorem.paragraph(3),
    solution: faker.lorem.paragraph(3),
    marketSize: `$${faker.number.int({ min: 1, max: 100 })}B+`,
    businessModel: faker.lorem.paragraph(2),
    competition: faker.lorem.paragraph(2),
    fundingStage: faker.helpers.arrayElement(['Pre-seed', 'Seed', 'Series A', 'Series B', 'Bootstrapped']),
    fundingAmount: faker.helpers.arrayElement([null, `$${faker.number.int({ min: 200, max: 5000 })}K`]),
    team: faker.lorem.paragraph(),
    vision: faker.lorem.paragraph(2),
    pitchDeck: faker.helpers.arrayElement([null, 'https://docsend.com/view/sample-pitch-deck']),
    website: faker.helpers.arrayElement([null, faker.internet.url()]),
  };
});

// Generate random job postings
export const demoJobs = Array.from({ length: 20 }, (_, i) => {
  const userId = faker.number.int({ min: 1, max: demoUsers.length + 1 });
  const locationTypes = ['remote', 'hybrid', 'on-site'];
  const jobTypes = ['full-time', 'part-time', 'contract', 'internship'];
  const company = faker.company.name();
  
  // Create a future date for expiration (between 15 and 60 days from now)
  const now = new Date();
  const expiresAt = new Date(now.getTime() + faker.number.int({ min: 15, max: 60 }) * 24 * 60 * 60 * 1000);
  
  return {
    id: i + 1,
    title: faker.person.jobTitle(),
    company,
    location: `${faker.location.city()}, ${faker.location.country()}`,
    description: faker.lorem.paragraphs(3),
    responsibilities: faker.lorem.paragraphs(2),
    requirements: faker.lorem.paragraphs(2),
    userId,
    salary: faker.helpers.arrayElement([
      null,
      `₹${faker.number.int({ min: 5, max: 30 })}L - ₹${faker.number.int({ min: 31, max: 50 })}L`,
      `$${faker.number.int({ min: 50, max: 150 })}K - $${faker.number.int({ min: 151, max: 300 })}K`
    ]),
    locationType: faker.helpers.arrayElement(locationTypes),
    jobType: faker.helpers.arrayElement(jobTypes),
    applicationLink: faker.internet.url(),
    logo: faker.image.urlLoremFlickr({ category: 'business' }),
    createdAt: getRandomDate(),
    expiresAt,
    skills: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => 
      faker.helpers.arrayElement([
        'React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'Java', 'Product Management',
        'UI/UX Design', 'Marketing', 'Sales', 'Business Development', 'Data Science',
        'Machine Learning', 'Blockchain', 'Growth Hacking', 'SEO', 'Content Creation',
        'Project Management', 'Agile', 'Scrum', 'DevOps', 'AWS', 'Azure', 'Google Cloud'
      ])
    )
  };
});

// Generate random articles
export const demoArticles = Array.from({ length: 15 }, (_, i) => {
  const userId = faker.number.int({ min: 1, max: demoUsers.length + 1 });
  const categories = ['Startup Advice', 'Funding', 'Growth', 'Product', 'Marketing', 'Technology', 'Leadership', 'Innovation'];
  
  return {
    id: i + 1,
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(8),
    summary: faker.lorem.paragraph(),
    userId,
    coverImage: faker.image.urlLoremFlickr({ category: 'business' }),
    category: faker.helpers.arrayElement(categories),
    tags: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => 
      faker.lorem.word()
    ),
    createdAt: getRandomDate(),
    readTime: faker.number.int({ min: 3, max: 15 }),
    likes: faker.number.int({ min: 0, max: 200 }),
    views: faker.number.int({ min: 100, max: 5000 })
  };
});

// Generate random events
export const demoEvents = Array.from({ length: 10 }, (_, i) => {
  const userId = faker.number.int({ min: 1, max: demoUsers.length + 1 });
  const eventTypes = ['Conference', 'Networking', 'Workshop', 'Webinar', 'Hackathon', 'Competition', 'Demo Day'];
  
  // Generate a future date (between 1 and 90 days from now)
  const now = new Date();
  const futureDate = new Date(now.getTime() + faker.number.int({ min: 1, max: 90 }) * 24 * 60 * 60 * 1000);
  
  // Generate end date (between 1 and 3 days after start date)
  const endDate = new Date(futureDate.getTime() + faker.number.int({ min: 1, max: 3 }) * 24 * 60 * 60 * 1000);
  
  return {
    id: i + 1,
    title: `${faker.company.buzzPhrase()} ${faker.helpers.arrayElement(eventTypes)}`,
    description: faker.lorem.paragraphs(3),
    shortDescription: faker.lorem.paragraph(),
    userId,
    location: faker.helpers.arrayElement([
      `${faker.location.city()}, ${faker.location.country()}`,
      'Virtual Event',
      `${faker.company.name()} Headquarters`
    ]),
    startDate: futureDate,
    endDate,
    eventType: faker.helpers.arrayElement(eventTypes),
    coverImage: faker.image.urlLoremFlickr({ category: 'business' }),
    isVirtual: faker.datatype.boolean(0.4), // 40% chance of being virtual
    registrationLink: faker.internet.url(),
    createdAt: getRandomDate(),
    maxAttendees: faker.helpers.arrayElement([null, faker.number.int({ min: 50, max: 500 })]),
    price: faker.helpers.arrayElement([
      'Free',
      `₹${faker.number.int({ min: 500, max: 5000 })}`,
      `$${faker.number.int({ min: 20, max: 200 })}`
    ]),
    speakers: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      title: faker.person.jobTitle(),
      company: faker.company.name(),
      bio: faker.lorem.paragraph(),
      image: getAvatarUrl(faker.person.fullName())
    }))
  };
});

// Generate random connections between users
export const demoConnections = Array.from({ length: 40 }, (_, i) => {
  const user1Id = faker.number.int({ min: 1, max: demoUsers.length + 1 });
  let user2Id;
  
  // Ensure we don't create connections with self
  do {
    user2Id = faker.number.int({ min: 1, max: demoUsers.length + 1 });
  } while (user1Id === user2Id);
  
  return {
    id: i + 1,
    user1Id,
    user2Id,
    status: faker.helpers.arrayElement(['pending', 'accepted']),
    createdAt: getRandomDate()
  };
});

// Generate random messages between connected users
export const demoMessages = demoConnections
  .filter(connection => connection.status === 'accepted')
  .flatMap(connection => {
    const messageCount = faker.number.int({ min: 1, max: 10 });
    
    return Array.from({ length: messageCount }, (_, i) => {
      const isFromUser1 = faker.datatype.boolean();
      const senderId = isFromUser1 ? connection.user1Id : connection.user2Id;
      const receiverId = isFromUser1 ? connection.user2Id : connection.user1Id;
      
      return {
        id: (connection.id * 100) + i,
        senderId,
        receiverId,
        content: faker.helpers.arrayElement([
          faker.lorem.sentence(),
          "Hi there! Nice to connect with you.",
          "Thanks for accepting my connection request!",
          "Would you be interested in discussing a potential collaboration?",
          "I saw your recent post and found it very insightful.",
          "Are you attending any upcoming events?",
          "I'd love to learn more about your startup.",
          "How's your fundraising going?",
          "Do you have any advice on finding a technical co-founder?",
          "What resources would you recommend for first-time founders?",
          "Wanted to share this article with you, might be useful: " + faker.internet.url()
        ]),
        createdAt: getRandomDate(),
        read: faker.datatype.boolean(0.8) // 80% chance of being read
      };
    });
  });

// Generate random notifications for users
export const demoNotifications = Array.from({ length: 50 }, (_, i) => {
  const userId = faker.number.int({ min: 1, max: demoUsers.length + 1 });
  const notificationTypes = [
    'connection_request',
    'connection_accepted',
    'post_like',
    'post_comment',
    'message',
    'job_recommendation',
    'event_reminder',
    'article_mention',
    'pitch_feedback'
  ];
  
  const type = faker.helpers.arrayElement(notificationTypes);
  
  let content, relatedId, relatedType;
  
  switch (type) {
    case 'connection_request':
      content = `${faker.person.fullName()} sent you a connection request`;
      relatedId = faker.number.int({ min: 1, max: demoUsers.length + 1 });
      relatedType = 'user';
      break;
    case 'connection_accepted':
      content = `${faker.person.fullName()} accepted your connection request`;
      relatedId = faker.number.int({ min: 1, max: demoUsers.length + 1 });
      relatedType = 'user';
      break;
    case 'post_like':
      content = `${faker.person.fullName()} liked your post`;
      relatedId = faker.number.int({ min: 1, max: demoPosts.length });
      relatedType = 'post';
      break;
    case 'post_comment':
      content = `${faker.person.fullName()} commented on your post: "${faker.lorem.sentence()}"`;
      relatedId = faker.number.int({ min: 1, max: demoPosts.length });
      relatedType = 'post';
      break;
    case 'message':
      content = `You have a new message from ${faker.person.fullName()}`;
      relatedId = faker.number.int({ min: 1, max: demoMessages.length });
      relatedType = 'message';
      break;
    case 'job_recommendation':
      content = `New job recommendation: ${faker.person.jobTitle()} at ${faker.company.name()}`;
      relatedId = faker.number.int({ min: 1, max: demoJobs.length });
      relatedType = 'job';
      break;
    case 'event_reminder':
      content = `Reminder: ${faker.company.buzzPhrase()} event starts tomorrow`;
      relatedId = faker.number.int({ min: 1, max: demoEvents.length });
      relatedType = 'event';
      break;
    case 'article_mention':
      content = `${faker.person.fullName()} mentioned you in an article`;
      relatedId = faker.number.int({ min: 1, max: demoArticles.length });
      relatedType = 'article';
      break;
    case 'pitch_feedback':
      content = `${faker.person.fullName()} provided feedback on your pitch`;
      relatedId = faker.number.int({ min: 1, max: demoPitches.length });
      relatedType = 'pitch';
      break;
    default:
      content = faker.lorem.sentence();
      relatedId = null;
      relatedType = null;
  }
  
  return {
    id: i + 1,
    userId,
    type,
    content,
    relatedId,
    relatedType,
    createdAt: getRandomDate(),
    read: faker.datatype.boolean(0.3) // 30% chance of being read
  };
});

// Function to initialize all demo data
export async function initializeDemoData(apiRequest: any) {
  console.log('Initializing demo data...');
  
  try {
    // Add users
    console.log('Adding demo users...');
    for (const user of demoUsers) {
      await apiRequest('POST', '/api/users', user);
    }
    
    // Add posts
    console.log('Adding demo posts...');
    for (const post of demoPosts) {
      await apiRequest('POST', '/api/posts', post);
    }
    
    // Add comments
    console.log('Adding demo comments...');
    for (const comment of demoComments) {
      await apiRequest('POST', `/api/posts/${comment.postId}/comments`, comment);
    }
    
    // Add pitches
    console.log('Adding demo pitches...');
    for (const pitch of demoPitches) {
      await apiRequest('POST', '/api/pitches', pitch);
    }
    
    // Add jobs
    console.log('Adding demo jobs...');
    for (const job of demoJobs) {
      await apiRequest('POST', '/api/jobs', job);
    }
    
    // Add articles
    console.log('Adding demo articles...');
    for (const article of demoArticles) {
      await apiRequest('POST', '/api/articles', article);
    }
    
    // Add events
    console.log('Adding demo events...');
    for (const event of demoEvents) {
      await apiRequest('POST', '/api/events', event);
    }
    
    // Add connections
    console.log('Adding demo connections...');
    for (const connection of demoConnections) {
      await apiRequest('POST', '/api/connections', connection);
    }
    
    // Add messages
    console.log('Adding demo messages...');
    for (const message of demoMessages) {
      await apiRequest('POST', '/api/messages', message);
    }
    
    // Add notifications
    console.log('Adding demo notifications...');
    for (const notification of demoNotifications) {
      await apiRequest('POST', '/api/notifications', notification);
    }
    
    console.log('Demo data initialization complete!');
    return { success: true };
  } catch (error) {
    console.error('Error initializing demo data:', error);
    return { success: false, error };
  }
}
