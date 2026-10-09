export interface Property {
  id: string; // Internal database ID (never exposed to end users)
  reference_id?: string; // 6-8 digit public shareable ID (e.g. "3421789")
  purpose?: 'for-sale' | 'for-rent' | 'rent' | 'sale'; // Purpose for SEO slug and filtering
  make: string; // Property type/category: "House", "Apartment", "Plot", "Commercial", "Penthouse"
  model: string; // Title / Model name: "Luxury Contemporary Villa", "Executive Flat", etc.
  title?: string; // Property title
  propertyType?: string; // Property type name
  year: number; // Year built / established
  price: number; // Price in PKR
  mileage: number; // Total covered area in Sq. Ft.
  location: string;
  city: string;
  area?: string;
  society?: string;
  size?: string;
  images: string[];
  type: 'residential' | 'commercial' | 'plot' | 'car' | 'bike' | 'part';
  category?: {
    parentId: string;
    childId?: string;
    subChildId?: string;
  };
  condition: 'ready' | 'under_construction' | 'off_plan' | 'new' | 'used' | 'certified';
  transmission: 'furnished' | 'unfurnished' | 'semi-furnished' | 'automatic' | 'manual';
  fuelType: 'house' | 'apartment' | 'penthouse' | 'plot' | 'commercial' | 'petrol' | 'diesel' | 'hybrid' | 'electric';
  engineSize: string; // E.g., "5 Beds", "3 Beds", "10 Marla", "1 Kanal"
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  baths?: number;
  furnishedStatus?: string;
  areaUnit?: 'marla' | 'kanal' | 'sqft' | 'sqyd';
  areaSize?: number;
  seller: {
    uid?: string;
    name: string;
    username?: string;
    isVerified: boolean;
    badgeType?: 'none' | 'basic' | 'identity' | 'business';
    verified_badge_type?: 'none' | 'basic' | 'identity' | 'business';
    rating: number;
  };
  createdAt: string;
  last_confirmed_active?: string; // Tracks when seller last confirmed listing availability (separate from createdAt)
  freshness_status?: 'fresh' | 'approaching_stale' | 'stale_pending_confirmation' | 'expired';
  confirmation_prompt_sent_at?: string; // Timestamp when 60-day "Still Available?" prompt was issued
  reactivated_at?: string; // Timestamp of latest reactivation
  specs?: {
    bedrooms?: number;
    bathrooms?: number;
    floors?: number;
    parkingSpaces?: number;
    furnishedStatus?: string;
    facing?: string; // "East", "Corner", "Park Facing", "Main Boulevard"
    acceleration?: string;
    topSpeed?: string;
    range?: string;
    horsepower?: number;
    torque?: string;
    seating?: number;
    driveTrain?: 'AWD' | 'RWD' | 'FWD';
  };
  features?: string[];
  description?: string;
  seoDescription?: string;
  status?: 'active' | 'inactive' | 'draft' | 'pending' | 'rejected' | 'sold' | 'under_review' | 'expired';
  isAuctionVerified?: boolean;
  isFeatured?: boolean;
  featuredUntil?: string;
  views?: number;
  favorites?: number;
  badges?: { type: string; label: string }[];
  updatedAt?: string;
  customFields?: Record<string, any>;
  bodyType?: string;
}

export type Vehicle = Property;

export type UserRole = 'user' | 'admin' | 'moderator' | 'finance' | 'support';
export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending';

export interface Address {
  id: string;
  type: 'Home' | 'Office' | 'Other';
  label?: string;
  address: string;
  city: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  isPendingOnboarding?: boolean;
  username?: string; // App Username (Handle)
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isVerified?: boolean;
  isOtpVerified?: boolean;
  phone_verified?: boolean;
  email_verified?: boolean;
  phone_verified_at?: string;
  email_verified_at?: string;
  identity_status?: 'unverified' | 'pending' | 'verified' | 'rejected' | 'partial';
  business_status?: 'unverified' | 'pending' | 'approved' | 'rejected' | 'none';
  verified_badge_type?: 'none' | 'basic' | 'identity' | 'business';
  rejection_reason?: string;
  trustScore: number;
  createdAt: string;
  lastLoginAt?: string;
  phoneNumber?: string;
  phone?: string; // For consistency
  isOnline?: boolean;
  lastSeen?: string;
  dob?: string;
  nationality?: string;
  gender?: string;
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
  notificationSettings?: {
    messages: boolean;
    listings: boolean;
    offers: boolean;
    security: boolean;
  };
  badgeType?: 'none' | 'basic' | 'identity' | 'business';
  // Security & CRM Fields
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  suspiciousActivityCount: number;
  lastKnownIp?: string;
  ipHistory?: { ip: string; timestamp: string; location?: string }[];
  verificationLevel: 0 | 1 | 2 | 3; // 0: None, 1: Email, 2: Phone, 3: ID Documents
  fraudTags?: string[];
  isProxyDetected?: boolean;
  isVpnDetected?: boolean;
  adminNotes?: string;
  credits?: number;
  featuredCredits?: number;
}

export interface DealerProfile {
  uid: string;
  businessName: string;
  licenseNumber: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
  subscriptionPlan: string;
  verifiedAt?: string;
  createdAt: string;
  rating?: number;
  activeListings?: number;
}

export interface ApprovalRequest {
  id: string;
  type: 'listing_approval' | 'dealer_verification' | 'auction_verification' | 'refund_request' | 'listing_edit';
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  targetId: string;
  oldData?: any;
  newData: any;
  adminNotes?: string;
  reviewedBy?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface SecurityAlert {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'suspicious_login' | 'multiple_accounts' | 'price_manipulation' | 'vpn_detected' | 'identity_mismatch' | 'high_frequency_listings' | 'fake_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
  metadata?: any;
  aiAgentNotes?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ip: string;
  location?: string;
  userAgent: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  type: 'subscription' | 'featured_listing' | 'verification_fee' | 'auction_deposit';
  paymentMethod: {
    type: 'card' | 'bank_transfer' | 'easypaisa' | 'jazzcash';
    details: string;
  };
  createdAt: string;
  metadata?: any;
}

export interface PayoutRequest {
  id: string;
  dealerId: string;
  dealerName: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'rejected';
  bankDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban?: string;
  };
  requestedAt: string;
  processedAt?: string;
}

export interface SystemReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetType: 'listing' | 'user' | 'dealer' | 'comment';
  category: 'scam' | 'offensive' | 'spam' | 'misleading' | 'other';
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  adminNotes?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'news' | 'guide' | 'announcement';
  image: string;
  author: string;
  status: 'published' | 'draft' | 'archived';
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string; // English
  nameAr?: string; // Arabic
  nameUr?: string; // Urdu
  nameFr?: string; // French
  nameRu?: string; // Russian
  slug: string;
  parentId: string | null;
  level: number; // 1, 2, 3...
  icon?: string; // SVG or Icon ID
  thumbnail?: string;
  banner?: string;
  description?: string; // English
  descriptionAr?: string;
  descriptionUr?: string;
  descriptionFr?: string;
  descriptionRu?: string;
  status: 'active' | 'disabled' | 'hidden' | 'draft' | 'pending';
  showOnHomepage: boolean;
  isFeatured: boolean;
  jobCategory?: boolean;
  priceOptional?: boolean;
  order: number;
  visibilityRules?: {
    regions?: string[];
    cities?: string[];
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  itemCount: number;
  version: number;
  isDraft: boolean;
  isCrowded?: boolean;
  creditCost?: number;
  createdAt: string;
  updatedAt: string;
}

export type CategoryFieldType = 
  | 'text' 
  | 'number' 
  | 'range' 
  | 'dropdown' 
  | 'multi-select' 
  | 'radio' 
  | 'checkbox' 
  | 'date' 
  | 'toggle' 
  | 'location' 
  | 'file' 
  | 'image' 
  | 'tags' 
  | 'dependent-dropdown';

export interface CategoryField {
  id: string;
  categoryIds: string[];
  popularStyleIds?: string[];
  name: string;
  icon?: string;
  nameTranslations?: {
    en?: string;
    ar?: string;
    ur?: string;
    fr?: string;
    ru?: string;
    [key: string]: string | undefined;
  };
  key: string;
  type: CategoryFieldType;
  required: boolean;
  searchable: boolean;
  filterable: boolean;
  showOnCard: boolean;
  showOnListingPage: boolean;
  showInAdminTable: boolean;
  order: number;
  groupName: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  unit?: string;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  options?: CategoryFieldOption[];
  conditionalLogic?: {
    dependantOnFieldId: string;
    showIfValue: any;
  };
  status: 'active' | 'inactive';
}

export interface CategoryFieldOption {
  value: string;
  label: string;
  parentId?: string; // For dependent dropdowns (e.g. Model parent is Brand)
}

export interface CategoryVersion {
  id: string;
  categoryId: string;
  version: number;
  data: Partial<Category>;
  fields: CategoryField[];
  publishedAt?: string;
  publishedBy?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'location' | 'listing_card' | 'system';
  status?: 'sent' | 'delivered' | 'read';
  fileUrl?: string;
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
    address?: string;
  };
  metadata?: {
    listingId?: string;
    listingName?: string;
    listingPrice?: number;
    listingImage?: string;
    systemType?: 'blocked' | 'unblocked' | 'context_change';
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'listing' | 'message' | 'update' | 'system' | 'security' | 'auction';
  status: 'unread' | 'read';
  link?: string;
  metadata?: any;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: {
    uid: string;
    name: string;
    photoURL?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isBlocked: boolean;
  type: 'buying' | 'selling';
  vehicleId?: string;
  vehicleName?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhoto?: string;
  targetUserId: string;
  rating: number;
  comment: string;
  tags: string[];
  type: 'buyer' | 'seller';
  createdAt: string;
}

export interface InspectionRequest {
  id: string;
  userId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  address: string;
  city: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  status: 'pending' | 'contacted' | 'assigned' | 'completed' | 'cancelled';
  createdAt: any;
  updatedAt: any;
  adminNotes?: string;
  technicianId?: string;
  technicianName?: string;
}

export interface InsuranceRequest {
  id: string;
  userId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleVariant?: string;
  vehicleYear: string;
  vehicleValue: number;
  insuranceType: 'third_party' | 'comprehensive' | 'theft_only' | 'third_party_plus';
  coveragePeriod: '6_months' | '1_year' | '2_years';
  address: string;
  city: string;
  phone: string;
  email: string;
  status: 'pending' | 'quote_sent' | 'payment_received' | 'active' | 'expired' | 'cancelled';
  createdAt: any;
  updatedAt: any;
  adminNotes?: string;
  quoteAmount?: number;
  basePremium?: number;
  trackerFee?: number;
  providerId?: string | null;
  providerName?: string;
  policyNumber?: string;
  expiryDate?: string;
}

export interface FinancingRequest {
  id: string;
  userId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePrice: number;
  downPayment: number;
  loanTerm: string;
  monthlyIncome: number;
  employmentStatus: string;
  phone: string;
  email: string;
  status: 'pending' | 'documents_requested' | 'under_review' | 'approved' | 'rejected' | 'disbursed';
  createdAt: any;
  updatedAt: any;
  adminNotes?: string;
  monthlyInstallment?: number;
  interestRate?: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'once';
  features: string[];
  isPopular?: boolean;
  type: 'listing' | 'dealer' | 'featured' | 'user' | 'company';
  targetUserSegment?: 'user' | 'dealer' | 'company';
  listingLimit?: number;
  featuredLimit?: number;
  validityDays: number;
  status: 'active' | 'inactive';
  sortOrder: number;
  badgeText?: string;
  // Extended Premium Attributes
  imageLimit?: number;
  isVideoAllowed?: boolean;
  boostIntervalDays?: number;
  isApiSyncAllowed?: boolean;
  isCrmIntegrationAllowed?: boolean;
  isWhatsAppCtaAllowed?: boolean;
  isSponsoredBannerAllowed?: boolean;
  supportSla?: 'none' | '24h' | '4h' | '1h';
  teamSlotsCount?: number;
  colorTheme?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  type: 'category' | 'advertisement' | 'external';
  name: string;
  image: string;
  targetId?: string;
  externalLink?: string;
  country?: string;
  state?: string;
  city?: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PopularStyle {
  id: string;
  name: string;
  iconPreset: string; // 'suv' | 'sedan' | 'truck' | 'hatchback' | 'coupe' | 'convertible' | 'minivan' | 'wagon' | 'custom'
  imageUrl?: string;
  customSvgPath?: string;
  filterKey: string;
  filterValue: string;
  order: number;
  status: 'active' | 'hidden';
  createdAt: string;
  updatedAt?: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: {
    searchQuery?: string;
    make?: string;
    model?: string;
    variant?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
    minYear?: number | null;
    maxYear?: number | null;
    minMileage?: number | null;
    maxMileage?: number | null;
    bodyType?: string[];
    fuelType?: string[];
    cities?: string[];
    condition?: string[];
  };
  frequency: 'instant' | 'daily';
  alertMethods: {
    inApp: boolean;
    email: boolean;
  };
  createdAt: string;
  lastCheckedAt: string;
}

export interface CustomAd {
  id: string;
  title: string;
  description: string;
  cta: string;
  imageUrl: string;
  badge: string;
  link: string;
  slotType: 'leaderboard' | 'sidebar-medium' | 'sidebar-tall' | 'native-feed' | 'bottom-anchor' | 'all';
  status: 'active' | 'inactive';
  isCertifiedPartner?: boolean;
  
  // Advanced options for tall skyscrapers/ads
  highlightPill?: string; // e.g., "4% DLD Fee Waiver"
  startPriceText?: string; // e.g., "Villas Starting From"
  startPriceValue?: string; // e.g., "AED 2.99 MILLION*"
  spec1Title?: string; // e.g., "Capital Appr."
  spec1Value?: string; // e.g., "Up To 40%"
  spec2Title?: string; // e.g., "Rental Returns"
  spec2Value?: string; // e.g., "Up To 10%"
  spec3Title?: string; // e.g., "Golden Visa"
  spec3Value?: string; // e.g., "Perks"
  disclaimer?: string; // e.g., "*T&C APPLY | RERA NO: 1816177030"
  
  // Statistics/Metrics
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt?: string;
}
