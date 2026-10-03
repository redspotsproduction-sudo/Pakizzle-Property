export type ListingPurpose = 'for-sale' | 'for-rent';
export type PropertyTypeSlug = 'house' | 'apartment' | 'plot' | 'commercial' | 'penthouse';
export type AreaUnit = 'marla' | 'kanal' | 'sqft';
export type PropertyCondition = 'ready' | 'under_construction' | 'off_plan';
export type FurnishedStatus = 'unfurnished' | 'semi-furnished' | 'furnished';

export interface UploadedPhoto {
  id: string;
  url: string;
  publicId?: string;
  isCover: boolean;
  status: 'uploading' | 'complete' | 'error';
  progress: number; // 0 - 100
  errorMessage?: string;
  fileName?: string;
}

export interface ListingWizardState {
  currentStep: number; // 0: Type, 1: Location, 2: Details, 3: Photos, 4: Price, 5: Review
  completedSteps: number[]; // Array of completed step indices for click-back
  isSubmitting: boolean;
  isDraftSaving: boolean;
  lastSavedAt: string | null;

  // Step 1: Type & Purpose
  purpose: ListingPurpose;
  propertyType: PropertyTypeSlug;

  // Step 2: Location
  city: string;
  areaName: string;
  addressDetail: string;

  // Step 3: Details & Specs
  size: number | '';
  sizeUnit: AreaUnit;
  sizeSqFt: number;
  bedrooms: number;
  bathrooms: number;
  condition: PropertyCondition;
  furnished: FurnishedStatus;
  yearBuilt: number;

  // Step 4: Photos
  photos: UploadedPhoto[];

  // Step 5: Price & Title
  price: number | '';
  isPriceNegotiable: boolean;
  titleDeedStatus: 'lda_approved' | 'cda_approved' | 'dha_transfer' | 'registry_inteqal' | 'unverified';

  // Step 6: Review & Publish
  title: string;
  description: string;
  aiSuggestedFaqs?: Array<{ question: string; answer: string }>;
  isAiEnhanced: boolean;
  confirmationChecked: boolean;
}

export const INITIAL_WIZARD_STATE: ListingWizardState = {
  currentStep: 0,
  completedSteps: [],
  isSubmitting: false,
  isDraftSaving: false,
  lastSavedAt: null,

  purpose: 'for-sale',
  propertyType: 'house',

  city: 'Lahore',
  areaName: 'DHA Phase 6',
  addressDetail: '',

  size: 10,
  sizeUnit: 'marla',
  sizeSqFt: 2250,
  bedrooms: 4,
  bathrooms: 4,
  condition: 'ready',
  furnished: 'furnished',
  yearBuilt: 2024,

  photos: [
    {
      id: 'default-cover-1',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      isCover: true,
      status: 'complete',
      progress: 100,
      fileName: 'front_elevation.jpg'
    },
    {
      id: 'default-photo-2',
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      isCover: false,
      status: 'complete',
      progress: 100,
      fileName: 'living_room.jpg'
    }
  ],

  price: 45000000,
  isPriceNegotiable: true,
  titleDeedStatus: 'lda_approved',

  title: 'Luxury 10 Marla Modern Designer Villa in DHA Phase 6',
  description: 'Architecturally curated modern villa built with imported Italian marble, German fixtures, solid ash wood doors, and complete LDA non-encumbrance title clearance.',
  aiSuggestedFaqs: [],
  isAiEnhanced: false,
  confirmationChecked: false,
};

export const STEP_DEFINITIONS = [
  { id: 'type', stepNumber: 1, label: 'Type & Purpose', shortLabel: 'Type' },
  { id: 'location', stepNumber: 2, label: 'Location', shortLabel: 'Location' },
  { id: 'details', stepNumber: 3, label: 'Details', shortLabel: 'Details' },
  { id: 'photos', stepNumber: 4, label: 'Photos', shortLabel: 'Photos' },
  { id: 'price', stepNumber: 5, label: 'Price & Title', shortLabel: 'Price' },
  { id: 'review', stepNumber: 6, label: 'Review & Publish', shortLabel: 'Review' },
] as const;

export function convertToSqFt(size: number, unit: AreaUnit): number {
  if (!size || isNaN(size)) return 0;
  switch (unit) {
    case 'marla':
      return Math.round(size * 225); // Standard contemporary Pakistani cadastral measurement
    case 'kanal':
      return Math.round(size * 4500); // 1 Kanal = 20 Marlas = 4500 sq ft
    case 'sqft':
      return Math.round(size);
    default:
      return Math.round(size);
  }
}
