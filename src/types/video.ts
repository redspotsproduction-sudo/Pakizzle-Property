export type VideoStatus = 'pending_review' | 'approved' | 'rejected' | 'deactivated';
export type VisibilityScope = 'public' | 'listing_only';
export type VideoFormat = 'mp4' | 'mov';
export type CreatorBadgeType = 'identity' | 'business' | 'none';
export type CreatorType = 'agent' | 'agency' | 'owner';

export interface VideoRenditions {
  '360p'?: string;
  '480p'?: string;
  '720p'?: string;
  [key: string]: string | undefined;
}

export interface VideoOverlaySpec {
  priceText: string;
  locationText: string;
  propertyType?: string;
  keySpecs: string[]; // e.g. ["5 Bed", "6 Bath", "1 Kanal"]
  customTag?: string; // e.g. "Corner Plot", "Brand New", "Direct Owner"
}

export interface VideoTrimRange {
  startSec: number;
  endSec: number;
}

export interface AIPrescreenResult {
  passed: boolean;
  confidence: number; // 0 - 1.0
  label: 'genuine_walkthrough' | 'suspicious_content' | 'non_property' | 'poor_quality';
  detectedElements: string[]; // e.g. ['kitchen', 'living_room', 'balcony', 'exterior']
  flaggedReasons: string[];
}

export interface VideoEngagementStats {
  viewsCount: number;
  uniqueViewersCount: number;
  likesCount: number;
  sharesCount: number;
  savesCount: number;
  watchTimeTotalSeconds: number;
  completionRate: number; // Percentage 0 - 100
  listingClicksCount: number; // Direct inquiries / CTR
}

export interface PropertyVideo {
  id: string;
  listingId: string;
  listingReferenceId?: string;
  listingTitle?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorBadge: CreatorBadgeType;
  creatorType: CreatorType;
  title: string;
  caption: string;
  videoUrl: string;
  renditions: VideoRenditions;
  thumbnailUrl: string;
  duration: number; // In seconds, max 90
  fileSizeBytes: number;
  format: VideoFormat;
  aspectRatio: '9:16';
  overlaySpec: VideoOverlaySpec;
  trimRange: VideoTrimRange;
  status: VideoStatus;
  rejectionReason?: string;
  visibilityScope: VisibilityScope;
  isFeatured: boolean;
  sortBoostScore: number;
  aiPrescreen: AIPrescreenResult;
  stats: VideoEngagementStats;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface VideoReport {
  id: string;
  videoId: string;
  listingId?: string;
  reporterId?: string;
  reporterEmail?: string;
  reason: 'misleading_property' | 'inappropriate_content' | 'wrong_location' | 'spam_watermark' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface VideoPlatformSettings {
  id: string;
  featureEnabled: boolean;
  maxDurationSeconds: number; // default 90
  maxFileSizeMb: number; // default 75
  allowedFormats: VideoFormat[]; // ['mp4', 'mov']
  aiPrescreenRequired: boolean;
  rankingWeights: {
    recencyWeight: number; // default 0.45
    engagementWeight: number; // default 0.35
    ctrWeight: number; // default 0.20
    featuredBoost: number; // default 50.0
  };
  updatedAt: string;
  updatedBy?: string;
}

export interface VideoUploadPayload {
  listingId: string;
  title: string;
  caption: string;
  videoFile?: File;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  fileSizeBytes: number;
  format: VideoFormat;
  trimRange: VideoTrimRange;
  overlaySpec: VideoOverlaySpec;
  selectedQualityTier?: 'auto' | '360p' | '480p' | '720p';
}

export interface CreatorEligibilityCheck {
  canUpload: boolean;
  reason?: string;
  identityStatus: string;
  businessStatus: string;
  verifiedBadgeType: string;
  videoSuspended: boolean;
  suspensionReason?: string;
  eligibleListings: {
    id: string;
    referenceId: string;
    title: string;
    city: string;
    location: string;
    price: number;
    propertyType: string;
  }[];
}
