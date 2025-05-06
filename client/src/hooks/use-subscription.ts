import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { apiRequest } from '@/lib/queryClient';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  used?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: SubscriptionFeature[];
  popular?: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
}

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch user's subscription and available plans
  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    const fetchSubscriptionData = async () => {
      setIsLoading(true);
      try {
        // Fetch user's subscription
        const userSubscription = await apiRequest('GET', '/api/subscription');
        
        // If API fails, use mock data
        if (!userSubscription) {
          setSubscription(getMockSubscription(user.id));
        } else {
          setSubscription(userSubscription);
        }
        
        // Fetch available plans
        const plans = await apiRequest('GET', '/api/subscription/plans');
        
        // If API fails, use mock data
        if (!plans || !Array.isArray(plans)) {
          setAvailablePlans(getMockSubscriptionPlans());
        } else {
          setAvailablePlans(plans);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        // Use mock data on error
        setSubscription(getMockSubscription(user.id));
        setAvailablePlans(getMockSubscriptionPlans());
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user]);

  // Subscribe to a plan
  const subscribeToPlan = async (planId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to subscribe to a plan',
        variant: 'destructive',
      });
      return false;
    }

    setIsProcessing(true);
    try {
      // In a real implementation, this would redirect to a payment page
      // or open a payment modal
      
      // For now, we'll simulate a successful subscription
      const result = await apiRequest('POST', '/api/subscription', { planId });
      
      if (result && result.success) {
        // Update local subscription state
        const plan = availablePlans.find(p => p.id === planId);
        if (plan) {
          const newSubscription: UserSubscription = {
            id: `sub_${Date.now()}`,
            userId: user.id,
            planId,
            tier: plan.tier,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            cancelAtPeriodEnd: false,
          };
          setSubscription(newSubscription);
        }
        
        toast({
          title: 'Subscription successful',
          description: 'You have successfully subscribed to the plan',
        });
        return true;
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      toast({
        title: 'Subscription failed',
        description: 'There was an error processing your subscription. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async (cancelImmediately: boolean = false) => {
    if (!user || !subscription) {
      return false;
    }

    setIsProcessing(true);
    try {
      const result = await apiRequest('POST', '/api/subscription/cancel', { 
        cancelImmediately 
      });
      
      if (result && result.success) {
        // Update local subscription state
        setSubscription({
          ...subscription,
          status: cancelImmediately ? 'canceled' : 'active',
          cancelAtPeriodEnd: !cancelImmediately,
        });
        
        toast({
          title: 'Subscription canceled',
          description: cancelImmediately 
            ? 'Your subscription has been canceled immediately' 
            : 'Your subscription will be canceled at the end of the billing period',
        });
        return true;
      } else {
        throw new Error('Cancellation failed');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: 'Cancellation failed',
        description: 'There was an error canceling your subscription. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if user has access to a premium feature
  const hasAccess = (featureId: string): boolean => {
    if (!subscription) return false;
    
    // Free tier users have access to basic features
    if (subscription.tier === 'free' && ['basic_profile', 'basic_search', 'basic_networking'].includes(featureId)) {
      return true;
    }
    
    // Find the user's plan
    const userPlan = availablePlans.find(plan => plan.tier === subscription.tier);
    if (!userPlan) return false;
    
    // Check if the feature is included in the plan
    const feature = userPlan.features.find(f => f.id === featureId);
    return feature ? feature.included : false;
  };

  // Get feature usage and limits
  const getFeatureUsage = (featureId: string): { used: number; limit: number; percentage: number } | null => {
    if (!subscription) return null;
    
    // Find the user's plan
    const userPlan = availablePlans.find(plan => plan.tier === subscription.tier);
    if (!userPlan) return null;
    
    // Find the feature
    const feature = userPlan.features.find(f => f.id === featureId);
    if (!feature || !feature.included || feature.limit === undefined || feature.used === undefined) {
      return null;
    }
    
    return {
      used: feature.used,
      limit: feature.limit,
      percentage: (feature.used / feature.limit) * 100,
    };
  };

  return {
    subscription,
    availablePlans,
    isLoading,
    isProcessing,
    subscribeToPlan,
    cancelSubscription,
    hasAccess,
    getFeatureUsage,
  };
}

// Mock data functions
function getMockSubscription(userId: string): UserSubscription {
  return {
    id: 'sub_mock123',
    userId,
    planId: 'plan_basic',
    tier: 'basic',
    status: 'active',
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    cancelAtPeriodEnd: false,
  };
}

function getMockSubscriptionPlans(): SubscriptionPlan[] {
  return [
    {
      id: 'plan_free',
      name: 'Free',
      tier: 'free',
      price: 0,
      billingPeriod: 'monthly',
      features: [
        {
          id: 'basic_profile',
          name: 'Basic Profile',
          description: 'Create and maintain a basic professional profile',
          included: true,
        },
        {
          id: 'basic_search',
          name: 'Basic Search',
          description: 'Search for other professionals with limited filters',
          included: true,
        },
        {
          id: 'basic_networking',
          name: 'Basic Networking',
          description: 'Connect with up to 50 professionals',
          included: true,
          limit: 50,
          used: 12,
        },
        {
          id: 'advanced_search',
          name: 'Advanced Search',
          description: 'Access advanced search filters and saved searches',
          included: false,
        },
        {
          id: 'premium_content',
          name: 'Premium Content',
          description: 'Access premium articles, guides, and resources',
          included: false,
        },
        {
          id: 'analytics',
          name: 'Profile Analytics',
          description: 'See who viewed your profile and detailed engagement metrics',
          included: false,
        },
        {
          id: 'job_posting',
          name: 'Job Posting',
          description: 'Post jobs and access premium candidates',
          included: false,
        },
      ],
    },
    {
      id: 'plan_basic',
      name: 'Basic',
      tier: 'basic',
      price: 999,
      billingPeriod: 'monthly',
      popular: true,
      features: [
        {
          id: 'basic_profile',
          name: 'Basic Profile',
          description: 'Create and maintain a basic professional profile',
          included: true,
        },
        {
          id: 'basic_search',
          name: 'Basic Search',
          description: 'Search for other professionals with limited filters',
          included: true,
        },
        {
          id: 'basic_networking',
          name: 'Basic Networking',
          description: 'Connect with up to 200 professionals',
          included: true,
          limit: 200,
          used: 45,
        },
        {
          id: 'advanced_search',
          name: 'Advanced Search',
          description: 'Access advanced search filters and saved searches',
          included: true,
        },
        {
          id: 'premium_content',
          name: 'Premium Content',
          description: 'Access premium articles, guides, and resources',
          included: true,
        },
        {
          id: 'analytics',
          name: 'Profile Analytics',
          description: 'See who viewed your profile and detailed engagement metrics',
          included: false,
        },
        {
          id: 'job_posting',
          name: 'Job Posting',
          description: 'Post jobs and access premium candidates',
          included: false,
        },
      ],
    },
    {
      id: 'plan_premium',
      name: 'Premium',
      tier: 'premium',
      price: 2499,
      billingPeriod: 'monthly',
      features: [
        {
          id: 'basic_profile',
          name: 'Basic Profile',
          description: 'Create and maintain a basic professional profile',
          included: true,
        },
        {
          id: 'basic_search',
          name: 'Basic Search',
          description: 'Search for other professionals with limited filters',
          included: true,
        },
        {
          id: 'basic_networking',
          name: 'Basic Networking',
          description: 'Connect with unlimited professionals',
          included: true,
        },
        {
          id: 'advanced_search',
          name: 'Advanced Search',
          description: 'Access advanced search filters and saved searches',
          included: true,
        },
        {
          id: 'premium_content',
          name: 'Premium Content',
          description: 'Access premium articles, guides, and resources',
          included: true,
        },
        {
          id: 'analytics',
          name: 'Profile Analytics',
          description: 'See who viewed your profile and detailed engagement metrics',
          included: true,
        },
        {
          id: 'job_posting',
          name: 'Job Posting',
          description: 'Post up to 5 jobs per month and access premium candidates',
          included: true,
          limit: 5,
          used: 2,
        },
      ],
    },
    {
      id: 'plan_enterprise',
      name: 'Enterprise',
      tier: 'enterprise',
      price: 9999,
      billingPeriod: 'monthly',
      features: [
        {
          id: 'basic_profile',
          name: 'Basic Profile',
          description: 'Create and maintain a basic professional profile',
          included: true,
        },
        {
          id: 'basic_search',
          name: 'Basic Search',
          description: 'Search for other professionals with limited filters',
          included: true,
        },
        {
          id: 'basic_networking',
          name: 'Basic Networking',
          description: 'Connect with unlimited professionals',
          included: true,
        },
        {
          id: 'advanced_search',
          name: 'Advanced Search',
          description: 'Access advanced search filters and saved searches',
          included: true,
        },
        {
          id: 'premium_content',
          name: 'Premium Content',
          description: 'Access premium articles, guides, and resources',
          included: true,
        },
        {
          id: 'analytics',
          name: 'Profile Analytics',
          description: 'See who viewed your profile and detailed engagement metrics',
          included: true,
        },
        {
          id: 'job_posting',
          name: 'Job Posting',
          description: 'Post unlimited jobs and access premium candidates',
          included: true,
        },
        {
          id: 'enterprise_support',
          name: 'Enterprise Support',
          description: 'Dedicated account manager and priority support',
          included: true,
        },
        {
          id: 'team_management',
          name: 'Team Management',
          description: 'Manage your team members and their access',
          included: true,
        },
      ],
    },
  ];
}