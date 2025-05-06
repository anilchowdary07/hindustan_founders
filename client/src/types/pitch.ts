export type PitchCategory = 
  | 'Fintech' 
  | 'E-commerce' 
  | 'AgriTech' 
  | 'HealthTech' 
  | 'EdTech' 
  | 'CleanTech' 
  | 'AI/ML' 
  | 'SaaS' 
  | 'Hardware' 
  | 'Marketplace' 
  | 'Consumer' 
  | 'Enterprise' 
  | 'Other';

export type PitchStage = 
  | 'Idea' 
  | 'Prototype' 
  | 'MVP' 
  | 'Pre-seed' 
  | 'Seed' 
  | 'Series A' 
  | 'Series B+' 
  | 'Profitable';

export type PitchStatus = 
  | 'Draft' 
  | 'Published' 
  | 'Seeking Feedback' 
  | 'Seeking Investment' 
  | 'Archived';

export interface BusinessPitch {
  id: number;
  userId: number;
  title: string;
  tagline: string;
  category: PitchCategory;
  stage: PitchStage;
  status: PitchStatus;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  coverImage?: string;
  logo?: string;
  website?: string;
  location?: string;
  teamSize?: number;
  fundingGoal?: number;
  currentFunding?: number;
  
  // Elevator pitch sections
  problem: string;
  solution: string;
  targetMarket: string;
  uniqueSellingPoint: string;
  
  // Detailed pitch sections
  businessModel?: string;
  marketOpportunity?: string;
  competitiveLandscape?: string;
  revenueModel?: string;
  goToMarketStrategy?: string;
  traction?: string;
  teamBackground?: string;
  financialProjections?: string;
  fundingNeeds?: string;
  milestones?: string;
  
  // Engagement metrics
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  bookmarks?: number;
  
  // Relationships
  user?: {
    id: number;
    name: string;
    avatarUrl?: string;
    title?: string;
  };
  team?: TeamMember[];
  feedback?: PitchFeedback[];
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
  linkedIn?: string;
}

export interface PitchFeedback {
  id: number;
  userId: number;
  pitchId: number;
  content: string;
  rating?: number; // 1-5 scale
  category?: 'general' | 'product' | 'market' | 'business' | 'team' | 'financials';
  createdAt: Date;
  user?: {
    id: number;
    name: string;
    avatarUrl?: string;
    title?: string;
  };
}

export interface PitchFilters {
  category?: PitchCategory | 'All';
  stage?: PitchStage | 'All';
  status?: PitchStatus | 'All';
  search?: string;
  sort?: 'newest' | 'popular' | 'trending' | 'funding';
}