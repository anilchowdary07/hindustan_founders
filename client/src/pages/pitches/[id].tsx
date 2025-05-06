import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import PitchDetail from "@/components/pitch/pitch-detail";
import PitchList from "@/components/pitch/pitch-list";
import { BusinessPitch } from "@/types/pitch";

export default function PitchDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  // Fetch pitch details
  const {
    data: pitch,
    isLoading,
    error
  } = useQuery({
    queryKey: [`/api/pitches/${id}`],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const response = await fetch(`/api/pitches/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch pitch");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching pitch:", error);
        // Return mock data for demonstration
        return getMockPitch(Number(id));
      }
    },
    enabled: !!id
  });
  
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !pitch) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-red-500 mb-2">Failed to load pitch details</div>
            <button 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              onClick={() => router.push('/pitches')}
            >
              Back to Pitches
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PitchDetail pitch={pitch} />
        
        <div className="mt-16">
          <PitchList 
            title="Similar Pitches"
            endpoint={`/api/pitches/similar/${id}`}
            showFilters={false}
            showCreate={false}
            variant="compact"
            columns={4}
            limit={4}
          />
        </div>
      </div>
    </Layout>
  );
}

// Mock data for demonstration
function getMockPitch(id: number): BusinessPitch {
  return {
    id,
    userId: 1,
    title: "FinTech Revolution",
    tagline: "Transforming financial services with AI-powered solutions",
    category: "Fintech",
    stage: "Seed",
    status: "Seeking Investment",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    isPublic: true,
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    logo: "https://placehold.co/200x200/4F46E5/FFFFFF?text=FR",
    website: "https://fintechrevolution.example.com",
    location: "Mumbai, India",
    teamSize: 8,
    fundingGoal: 5000000,
    currentFunding: 2000000,
    problem: "Traditional banking systems are slow, expensive, and inaccessible to millions of Indians. Financial inclusion remains a significant challenge with complex paperwork and high fees creating barriers for average citizens.",
    solution: "We're building an AI-powered financial platform that simplifies banking, investments, and insurance through a single, easy-to-use mobile application with minimal paperwork and fees.",
    targetMarket: "Our primary target is the 300M+ smartphone users in India who are underserved by traditional banking, particularly young professionals and small business owners.",
    uniqueSellingPoint: "Our proprietary AI algorithm provides personalized financial recommendations while our blockchain-based infrastructure reduces costs by 80% compared to traditional banks.",
    businessModel: "Freemium model with basic services free and premium features available through subscription. We also generate revenue through partnership commissions.",
    marketOpportunity: "The Indian fintech market is projected to reach $150 billion by 2025, growing at a CAGR of 20%.",
    competitiveLandscape: "While there are several digital banking solutions, none offer our comprehensive suite of services with AI-powered personalization at our price point.",
    revenueModel: "Multiple revenue streams including subscription fees, transaction fees, and partnership commissions with financial institutions.",
    goToMarketStrategy: "We'll launch initially in major metro areas with a focus on young professionals, leveraging digital marketing and partnerships with employers.",
    traction: "We've completed our MVP and have 500 beta users with a waitlist of 2,000. User feedback has been overwhelmingly positive with a 92% satisfaction rate.",
    teamBackground: "Our founding team includes former executives from leading banks and tech companies with over 30 years of combined experience in fintech.",
    financialProjections: "We project reaching 100,000 users in year 1, 500,000 in year 2, and 2 million by year 3, with revenue of ₹50M, ₹250M, and ₹1B respectively.",
    fundingNeeds: "We're raising ₹5 crore to scale our technology, expand our team, and fund our go-to-market strategy for the next 18 months.",
    milestones: "Q1: Launch v1.0, Q2: Reach 50,000 users, Q3: Expand to 5 major cities, Q4: Launch premium subscription, Q6: Series A fundraising.",
    likes: 42,
    comments: 12,
    views: 350,
    bookmarks: 28,
    user: {
      id: 1,
      name: "Vikram Malhotra",
      title: "Founder & CEO",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    feedback: [
      {
        id: 101,
        userId: 2,
        pitchId: 1,
        content: "Very impressive solution to a real problem. I'd like to see more details about your customer acquisition strategy.",
        rating: 4,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
        user: {
          id: 2,
          name: "Priya Sharma",
          title: "Angel Investor",
          avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg"
        }
      },
      {
        id: 102,
        userId: 3,
        pitchId: 1,
        content: "The market size is compelling, but I'm concerned about regulatory challenges. How are you addressing compliance?",
        rating: 3,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
        user: {
          id: 3,
          name: "Rajiv Kumar",
          title: "VC Partner",
          avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg"
        }
      }
    ]
  };
}