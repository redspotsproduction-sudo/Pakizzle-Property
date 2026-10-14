import { PricingPlan } from "../types";

const STORAGE_KEY = 'pakizzle_pricing_plans';

const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: 'p1',
    name: 'Standard User Plus',
    description: 'Designed for private sellers looking for a quick, high-exposure sale.',
    price: 1500,
    currency: 'PKR',
    billingCycle: 'once',
    features: [
      '2 Standard Vehicle Listings',
      '1 Featured Listing Upgrade (7 Days)',
      '12 Certified High-Res Images per listing',
      'Instant WhatsApp Chat Integration CTA',
      'Valid for 30 consecutive days',
      'Auto-bump search results every 7 days',
    ],
    listingLimit: 2,
    featuredLimit: 1,
    validityDays: 30,
    type: 'user',
    targetUserSegment: 'user',
    status: 'active',
    sortOrder: 1,
    imageLimit: 12,
    isVideoAllowed: false,
    boostIntervalDays: 7,
    isApiSyncAllowed: false,
    isCrmIntegrationAllowed: false,
    isWhatsAppCtaAllowed: true,
    isSponsoredBannerAllowed: false,
    supportSla: '24h',
    teamSlotsCount: 1,
    colorTheme: '#4A90D2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p2',
    name: 'Dealer Prime Suite',
    description: 'Professional monthly subscription engineered for medium to large independent dealerships.',
    price: 18500,
    currency: 'PKR',
    billingCycle: 'monthly',
    features: [
      'Up to 50 active inventory listings',
      '10 Featured Listing credits per month',
      '25 High-Res Images + Video Walkthrough uploads',
      'Dynamic Leads CRM Integration & analytics',
      'Verified Dealership Trusted Badge',
      'Dedicated Dealer Micro-website landing page',
      'Auto-bump search results every 3 days',
    ],
    isPopular: true,
    badgeText: 'Highly Recommended',
    listingLimit: 50,
    featuredLimit: 10,
    validityDays: 30,
    type: 'dealer',
    targetUserSegment: 'dealer',
    status: 'active',
    sortOrder: 2,
    imageLimit: 25,
    isVideoAllowed: true,
    boostIntervalDays: 3,
    isApiSyncAllowed: true,
    isCrmIntegrationAllowed: true,
    isWhatsAppCtaAllowed: true,
    isSponsoredBannerAllowed: false,
    supportSla: '4h',
    teamSlotsCount: 5,
    colorTheme: '#5FA84C',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p3',
    name: 'Enterprise Fleet Cloud',
    description: 'All-inclusive high-exposure package for manufacturer networks, leasing groups, and corporate fleets.',
    price: 75000,
    currency: 'PKR',
    billingCycle: 'monthly',
    features: [
      'Up to 500 active fleet listings',
      '50 Featured Listing credits per month',
      '45 High-Res Images & 4K Reel Video uploads',
      'Automated Inventory Sync via REST API & JSON Feed',
      'Main-page Premium Sponsored Banner spot (rotating)',
      '1-Hour Instant Incident Support SLA',
      '20 Corporate team member sub-accounts',
      'Auto-bump search results every day',
    ],
    listingLimit: 500,
    featuredLimit: 50,
    validityDays: 30,
    type: 'company',
    targetUserSegment: 'company',
    status: 'active',
    sortOrder: 3,
    imageLimit: 45,
    isVideoAllowed: true,
    boostIntervalDays: 1,
    isApiSyncAllowed: true,
    isCrmIntegrationAllowed: true,
    isWhatsAppCtaAllowed: true,
    isSponsoredBannerAllowed: true,
    supportSla: '1h',
    teamSlotsCount: 20,
    colorTheme: '#7A1E5E',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const pricingService = {
  getPlans: async (): Promise<PricingPlan[]> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLANS));
      return DEFAULT_PLANS;
    }
    return JSON.parse(stored);
  },

  updatePlan: async (id: string, updates: Partial<PricingPlan>): Promise<PricingPlan> => {
    const plans = await pricingService.getPlans();
    const index = plans.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Plan not found');
    
    const updatedPlan = {
      ...plans[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    plans[index] = updatedPlan;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    return updatedPlan;
  },

  addPlan: async (plan: Omit<PricingPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<PricingPlan> => {
    const plans = await pricingService.getPlans();
    const newPlan: PricingPlan = {
      ...plan,
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    plans.push(newPlan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    return newPlan;
  },

  deletePlan: async (id: string): Promise<void> => {
    const plans = await pricingService.getPlans();
    const filtered = plans.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
