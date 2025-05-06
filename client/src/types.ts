export const PitchCategory = {
  TECHNOLOGY: 'Technology',
  FINANCE: 'Finance',
  HEALTHCARE: 'Healthcare',
  FINTECH: 'fintech',
  HEALTHTECH: 'healthtech',
  EDTECH: 'edtech',
  AI_ML: 'ai_ml',
  CLEANTECH: 'cleantech',
  AGRITECH: 'agritech',
  ECOMMERCE: 'ecommerce',
  SAAS: 'saas',
} as const;

export type PitchCategory = typeof PitchCategory[keyof typeof PitchCategory];

export type BusinessPitch = {
  id: number;
  userId: number;
  title: string;
  tagline: string;
  category: PitchCategory;
  stage: string;
  status: 'draft' | 'published';
  // ... other required properties
};

export type Notification = {
  id: string;
  type: 'connection' | 'mention' | 'event' | 'comment' | 'like' | 'job' | 'other';
  actor: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  content: string;
  timestamp: Date;
  isRead: boolean;
  entityId?: string;
  entityType?: 'post' | 'comment' | 'job' | 'event';
  entityPreview?: string;
};

export type User = {
  isVerified: boolean;
  // Add other user properties
};
