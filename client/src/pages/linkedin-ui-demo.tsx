import React, { useState } from "react";
import { LinkedInHome } from "@/components/home/linkedin-home";
import { LinkedInProfile } from "@/components/profile/linkedin-profile";
import { LinkedInNetwork } from "@/components/network/linkedin-network";
import { LinkedInNotifications } from "@/components/notifications/linkedin-notifications";
import { LinkedInJobs } from "@/components/jobs/linkedin-jobs";
import { LinkedInMessaging } from "@/components/messaging/linkedin-messaging";

export default function LinkedInUIDemo() {
  const [activeTab, setActiveTab] = useState("home");
  
  // Sample data for demo
  const sampleUser = {
    id: "1",
    name: "John Doe",
    title: "Software Engineer at Tech Company",
    avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    company: "Tech Company",
    location: "San Francisco, CA",
    connections: 500,
    verified: true,
    education: "Stanford University",
    about: "Passionate software engineer with 5+ years of experience in web development.",
    profileViews: 120,
    postImpressions: 1500,
    searchAppearances: 45
  };
  
  const samplePosts = [
    {
      id: "1",
      author: {
        id: "2",
        name: "Jane Smith",
        title: "Product Manager at Product Co",
        avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg",
        verified: true
      },
      content: "Just launched our new product! Check it out at productco.com",
      createdAt: new Date(Date.now() - 3600000),
      likes: 42,
      comments: 5,
      shares: 2,
      images: ["https://source.unsplash.com/random/800x600/?product"]
    },
    {
      id: "2",
      author: {
        id: "3",
        name: "Bob Johnson",
        title: "UX Designer at Design Studio",
        avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg",
        verified: false
      },
      content: "Here's my latest design project. What do you think?",
      createdAt: new Date(Date.now() - 7200000),
      likes: 28,
      comments: 12,
      shares: 4,
      images: ["https://source.unsplash.com/random/800x600/?design"]
    }
  ];
  
  const sampleConnections = [
    {
      id: "4",
      name: "Alice Williams",
      title: "Frontend Developer at Web Co",
      avatarUrl: "https://randomuser.me/api/portraits/women/4.jpg",
      company: "Web Co",
      mutualConnections: 12,
      isConnected: true
    },
    {
      id: "5",
      name: "Charlie Brown",
      title: "Backend Engineer at Server Inc",
      avatarUrl: "https://randomuser.me/api/portraits/men/5.jpg",
      company: "Server Inc",
      mutualConnections: 5,
      isConnected: true
    }
  ];
  
  const samplePendingConnections = [
    {
      id: "6",
      name: "David Miller",
      title: "Data Scientist at AI Corp",
      avatarUrl: "https://randomuser.me/api/portraits/men/6.jpg",
      company: "AI Corp",
      mutualConnections: 3,
      isPending: true
    }
  ];
  
  const sampleSuggestions = [
    {
      id: "7",
      name: "Eva Garcia",
      title: "Marketing Manager at Brand Co",
      avatarUrl: "https://randomuser.me/api/portraits/women/7.jpg",
      company: "Brand Co",
      mutualConnections: 8
    },
    {
      id: "8",
      name: "Frank Wilson",
      title: "Sales Director at Sales Inc",
      avatarUrl: "https://randomuser.me/api/portraits/men/8.jpg",
      company: "Sales Inc",
      mutualConnections: 2
    }
  ];
  
  const sampleNotifications = [
    {
      id: "1",
      type: "connection",
      actor: {
        id: "2",
        name: "Jane Smith",
        avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg"
      },
      content: "accepted your connection request",
      timestamp: new Date(Date.now() - 86400000),
      isRead: true,
      entityId: "4",
      entityType: "profile"
    },
    {
      id: "2",
      type: "mention",
      actor: {
        id: "3",
        name: "Bob Johnson",
        avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg"
      },
      content: "mentioned you in a post",
      timestamp: new Date(Date.now() - 7200000),
      isRead: true,
      entityId: "2",
      entityType: "post",
      entityPreview: "Great work! I love the design."
    },
    {
      id: "3",
      type: "like",
      actor: {
        id: "2",
        name: "Jane Smith",
        avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg"
      },
      content: "liked your post",
      timestamp: new Date(Date.now() - 3600000),
      isRead: false,
      entityId: "1",
      entityType: "post",
      entityPreview: "Just launched our new product! Check it out at productco.com"
    }
  ];
  
  const sampleJobs = [
    {
      id: "1",
      title: "Senior Software Engineer",
      company: {
        id: "1",
        name: "Tech Company",
        logoUrl: "https://logo.clearbit.com/google.com"
      },
      location: "San Francisco, CA",
      postedAt: new Date(Date.now() - 86400000),
      applicants: 45,
      isEasyApply: true,
      salary: "$120,000 - $150,000",
      jobType: "Full-time"
    },
    {
      id: "2",
      title: "Product Manager",
      company: {
        id: "2",
        name: "Product Co",
        logoUrl: "https://logo.clearbit.com/facebook.com"
      },
      location: "New York, NY",
      postedAt: new Date(Date.now() - 172800000),
      applicants: 78,
      isEasyApply: false,
      salary: "$110,000 - $140,000",
      jobType: "Full-time"
    }
  ];
  
  const sampleSavedJobs = [
    {
      id: "3",
      title: "UX Designer",
      company: {
        id: "3",
        name: "Design Studio",
        logoUrl: "https://logo.clearbit.com/apple.com"
      },
      location: "Seattle, WA",
      postedAt: new Date(Date.now() - 259200000),
      applicants: 32,
      isEasyApply: true,
      isSaved: true,
      salary: "$90,000 - $120,000",
      jobType: "Full-time"
    }
  ];
  
  const sampleConversations = [
    {
      id: "1",
      participants: [
        {
          id: "1",
          name: "John Doe",
          avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
          isOnline: true
        },
        {
          id: "2",
          name: "Jane Smith",
          avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg",
          isOnline: true
        }
      ],
      lastMessage: {
        id: "1",
        senderId: "2",
        text: "Hi John, how are you?",
        timestamp: new Date(Date.now() - 3600000),
        isRead: false
      },
      unreadCount: 1
    },
    {
      id: "2",
      participants: [
        {
          id: "1",
          name: "John Doe",
          avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
          isOnline: true
        },
        {
          id: "3",
          name: "Bob Johnson",
          avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg",
          isOnline: false
        }
      ],
      lastMessage: {
        id: "2",
        senderId: "1",
        text: "Thanks for the information!",
        timestamp: new Date(Date.now() - 86400000),
        isRead: true
      },
      unreadCount: 0
    }
  ];
  
  const sampleMessages = [
    {
      id: "1",
      senderId: "2",
      text: "Hi John, how are you?",
      timestamp: new Date(Date.now() - 3600000),
      isRead: false
    },
    {
      id: "2",
      senderId: "1",
      text: "I'm good, thanks for asking! How about you?",
      timestamp: new Date(Date.now() - 3500000),
      isRead: true
    },
    {
      id: "3",
      senderId: "2",
      text: "I'm doing well too. Just wanted to check in about the project we discussed last week.",
      timestamp: new Date(Date.now() - 3400000),
      isRead: false
    }
  ];
  
  // Render the appropriate component based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <LinkedInHome posts={samplePosts} />;
      case "network":
        return (
          <LinkedInNetwork 
            connections={sampleConnections}
            pendingConnections={samplePendingConnections}
            suggestions={sampleSuggestions}
            events={[]}
            groups={[]}
            pages={[]}
          />
        );
      case "notifications":
        return <LinkedInNotifications notifications={sampleNotifications} />;
      case "jobs":
        return (
          <LinkedInJobs 
            jobs={sampleJobs}
            savedJobs={sampleSavedJobs}
            appliedJobs={[]}
          />
        );
      case "messaging":
        return (
          <LinkedInMessaging 
            conversations={sampleConversations}
            currentUserId="1"
            selectedConversation={sampleConversations[0]}
            messages={sampleMessages}
          />
        );
      case "profile":
        return (
          <LinkedInProfile 
            user={sampleUser}
            isCurrentUser={true}
          />
        );
      default:
        return <LinkedInHome posts={samplePosts} />;
    }
  };
  
  return (
    <div className="bg-[#F3F2EF] min-h-screen pb-16">
      {/* Header */}
      <header className="bg-white border-b border-[#E0E0E0] fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold text-[#0A66C2]">LinkedIn UI Demo</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-16 pb-16">
        {renderContent()}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] z-20">
        <div className="flex justify-around">
          <button 
            className={`flex flex-col items-center py-2 px-3 ${activeTab === 'home' ? 'text-[#0A66C2]' : 'text-[#666666]'}`}
            onClick={() => setActiveTab('home')}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs mt-0.5">Home</span>
          </button>
          
          <button 
            className={`flex flex-col items-center py-2 px-3 ${activeTab === 'network' ? 'text-[#0A66C2]' : 'text-[#666666]'}`}
            onClick={() => setActiveTab('network')}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs mt-0.5">Network</span>
          </button>
          
          <button 
            className={`flex flex-col items-center py-2 px-3 ${activeTab === 'notifications' ? 'text-[#0A66C2]' : 'text-[#666666]'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs mt-0.5">Notifications</span>
          </button>
          
          <button 
            className={`flex flex-col items-center py-2 px-3 ${activeTab === 'jobs' ? 'text-[#0A66C2]' : 'text-[#666666]'}`}
            onClick={() => setActiveTab('jobs')}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs mt-0.5">Jobs</span>
          </button>
          
          <button 
            className={`flex flex-col items-center py-2 px-3 ${activeTab === 'messaging' ? 'text-[#0A66C2]' : 'text-[#666666]'}`}
            onClick={() => setActiveTab('messaging')}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs mt-0.5">Messaging</span>
          </button>
          
          <button 
            className={`flex flex-col items-center py-2 px-3 ${activeTab === 'profile' ? 'text-[#0A66C2]' : 'text-[#666666]'}`}
            onClick={() => setActiveTab('profile')}
          >
            <div className="h-6 w-6 rounded-full overflow-hidden">
              <img 
                src="https://randomuser.me/api/portraits/men/1.jpg" 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-xs mt-0.5">Me</span>
          </button>
        </div>
      </nav>
    </div>
  );
}