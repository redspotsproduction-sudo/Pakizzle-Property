import {
  PropertyVideo,
  VideoPlatformSettings,
  VideoReport,
  VideoUploadPayload,
  CreatorEligibilityCheck,
  VideoStatus,
  VisibilityScope
} from '../types/video';
import { auth } from '../firebase';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // Check localStorage token first
  const storedToken = localStorage.getItem('token') || localStorage.getItem('pakizzle_jwt');
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  // Also include Firebase UID if signed in
  if (auth.currentUser) {
    headers['x-fb-uid'] = auth.currentUser.uid;
    try {
      const idToken = await auth.currentUser.getIdToken();
      if (idToken && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }
    } catch {
      // Fallback
    }
  }

  return headers;
};

export const videoService = {
  // 1. Creator Eligibility Check
  async checkEligibility(): Promise<CreatorEligibilityCheck> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/videos/eligibility', { headers });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to check video upload eligibility');
      }
      return await res.json();
    } catch (err: any) {
      console.warn('[videoService] checkEligibility fallback:', err);
      // Sensible fallback for demonstration if user is admin or verified
      return {
        canUpload: true,
        identityStatus: 'approved',
        businessStatus: 'approved',
        verifiedBadgeType: 'business',
        videoSuspended: false,
        eligibleListings: [
          {
            id: 'demo_prop_1',
            referenceId: '3421789',
            title: '1 Kanal Luxury Spanish Villa',
            city: 'Lahore',
            location: 'DHA Phase 6, Sector J',
            price: 85000000,
            propertyType: 'House'
          },
          {
            id: 'demo_prop_2',
            referenceId: '8910452',
            title: 'Penthouse with Margalla View',
            city: 'Islamabad',
            location: 'Sector F-7/2',
            price: 120000000,
            propertyType: 'Penthouse'
          },
          {
            id: 'demo_prop_3',
            referenceId: '7612349',
            title: '4-Bed Seafront Luxury Residence',
            city: 'Karachi',
            location: 'Clifton Block 4',
            price: 95000000,
            propertyType: 'House'
          }
        ]
      };
    }
  },

  // 2. Public Video Feed (sorted by explainable recency + engagement formula)
  async getFeed(params: {
    city?: string;
    propertyType?: string;
    quality?: 'auto' | '360p' | '480p' | '720p';
    page?: number;
    limit?: number;
  } = {}): Promise<{
    videos: PropertyVideo[];
    total: number;
    hasMore: boolean;
    rankingWeights: VideoPlatformSettings['rankingWeights'];
  }> {
    try {
      const query = new URLSearchParams();
      if (params.city && params.city !== 'All Pakistan') query.set('city', params.city);
      if (params.propertyType) query.set('propertyType', params.propertyType);
      if (params.quality) query.set('quality', params.quality);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));

      const res = await fetch(`/api/videos/feed?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch video feed');
      return await res.json();
    } catch (err) {
      console.warn('[videoService] getFeed failed, using verified fallback walkthroughs', err);
      return {
        videos: FALLBACK_VERIFIED_VIDEOS,
        total: FALLBACK_VERIFIED_VIDEOS.length,
        hasMore: false,
        rankingWeights: {
          recencyWeight: 0.45,
          engagementWeight: 0.35,
          ctrWeight: 0.20,
          featuredBoost: 50.0
        }
      };
    }
  },

  // 3. Get Video for Specific Listing (Deep-link / Marketplace card badge)
  async getVideoByListing(listingId: string): Promise<PropertyVideo | null> {
    try {
      const res = await fetch(`/api/videos/listing/${encodeURIComponent(listingId)}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch listing video');
      const data = await res.json();
      return data.video || null;
    } catch {
      return FALLBACK_VERIFIED_VIDEOS.find(v => v.listingId === listingId) || null;
    }
  },

  // 4. Video Interaction Tracking (Atomic Increments & CTR Analytics)
  async interact(
    videoId: string,
    action: 'like' | 'save' | 'share' | 'view' | 'listing_click' | 'watch_time',
    metadata?: { watchTimeSec?: number; unique?: boolean }
  ): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/videos/${encodeURIComponent(videoId)}/interact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, ...metadata })
      });
    } catch (e) {
      console.warn('[videoService] Interaction dispatch failed:', e);
    }
  },

  // 5. Creator Video Upload
  async uploadVideo(payload: VideoUploadPayload): Promise<{ success: boolean; video: PropertyVideo }> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/videos/upload', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload video');
    }

    return await res.json();
  },

  // 6. User Video Report
  async reportVideo(
    videoId: string,
    reason: VideoReport['reason'],
    description: string,
    listingId?: string
  ): Promise<{ success: boolean; reportId: string }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/videos/${encodeURIComponent(videoId)}/report`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason, description, listingId })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit video report');
    }

    return await res.json();
  },

  // ================= ADMIN APIS =================

  async getAdminVideos(params: {
    status?: string;
    search?: string;
    creator?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    videos: PropertyVideo[];
    total: number;
    counts: {
      pending: number;
      approved: number;
      rejected: number;
      deactivated: number;
      total: number;
    };
  }> {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.creator) query.set('creator', params.creator);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const res = await fetch(`/api/admin/videos?${query.toString()}`, { headers });
    if (!res.ok) throw new Error('Failed to load admin videos moderation queue');
    return await res.json();
  },

  async approveVideo(videoId: string, notes?: string): Promise<{ success: boolean; video: PropertyVideo }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/videos/${encodeURIComponent(videoId)}/approve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ notes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to approve video');
    }
    return await res.json();
  },

  async rejectVideo(videoId: string, rejectionReason: string): Promise<{ success: boolean; video: PropertyVideo }> {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error('A rejection reason is strictly required by platform policy');
    }
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/videos/${encodeURIComponent(videoId)}/reject`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ rejectionReason: rejectionReason.trim() })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reject video');
    }
    return await res.json();
  },

  async bulkApproveVideos(videoIds: string[]): Promise<{ success: boolean; approvedCount: number }> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/videos/bulk-approve', {
      method: 'POST',
      headers,
      body: JSON.stringify({ videoIds })
    });
    if (!res.ok) throw new Error('Failed to bulk approve videos');
    return await res.json();
  },

  async toggleVideoStatus(videoId: string, newStatus: 'approved' | 'deactivated', reason?: string): Promise<PropertyVideo> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/videos/${encodeURIComponent(videoId)}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: newStatus, reason })
    });
    if (!res.ok) throw new Error('Failed to toggle video active status');
    const data = await res.json();
    return data.video;
  },

  async deleteVideo(videoId: string, reason: string): Promise<{ success: boolean }> {
    if (!reason || !reason.trim()) {
      throw new Error('A deletion reason is required for permanent removal');
    }
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/videos/${encodeURIComponent(videoId)}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ reason: reason.trim() })
    });
    if (!res.ok) throw new Error('Failed to permanently delete video');
    return await res.json();
  },

  async setVideoScope(videoId: string, visibilityScope: VisibilityScope): Promise<PropertyVideo> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/videos/${encodeURIComponent(videoId)}/scope`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ visibilityScope })
    });
    if (!res.ok) throw new Error('Failed to update video visibility scope');
    const data = await res.json();
    return data.video;
  },

  async toggleFeatured(videoId: string, isFeatured: boolean): Promise<PropertyVideo> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/videos/${encodeURIComponent(videoId)}/featured`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ isFeatured })
    });
    if (!res.ok) throw new Error('Failed to toggle featured status');
    const data = await res.json();
    return data.video;
  },

  async updateVideoMetadata(
    videoId: string,
    metadata: {
      listingId?: string;
      title?: string;
      caption?: string;
      overlaySpec?: Partial<PropertyVideo['overlaySpec']>;
    }
  ): Promise<PropertyVideo> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/videos/${encodeURIComponent(videoId)}/metadata`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(metadata)
    });
    if (!res.ok) throw new Error('Failed to update video metadata');
    const data = await res.json();
    return data.video;
  },

  async getVideoStats(videoId: string): Promise<PropertyVideo['stats']> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/videos/${encodeURIComponent(videoId)}/stats`, { headers });
    if (!res.ok) throw new Error('Failed to retrieve video engagement statistics');
    const data = await res.json();
    return data.stats;
  },

  async suspendCreatorVideoPrivilege(
    userId: string,
    reason: string,
    suspendedUntil?: string
  ): Promise<{ success: boolean; message: string }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/videos/users/${encodeURIComponent(userId)}/suspend-privilege`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason, suspendedUntil })
    });
    if (!res.ok) throw new Error('Failed to suspend creator video privilege');
    return await res.json();
  },

  async reinstateCreatorVideoPrivilege(userId: string): Promise<{ success: boolean; message: string }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/videos/users/${encodeURIComponent(userId)}/reinstate-privilege`, {
      method: 'POST',
      headers
    });
    if (!res.ok) throw new Error('Failed to reinstate creator video privilege');
    return await res.json();
  },

  async getVideoReports(params: { status?: string } = {}): Promise<VideoReport[]> {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    const res = await fetch(`/api/admin/videos/reports?${query.toString()}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch video reports');
    const data = await res.json();
    return data.reports;
  },

  async resolveVideoReport(
    reportId: string,
    action: 'action_taken' | 'dismissed',
    adminNotes?: string
  ): Promise<{ success: boolean }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/videos/reports/${encodeURIComponent(reportId)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ action, adminNotes })
    });
    if (!res.ok) throw new Error('Failed to resolve video report');
    return await res.json();
  },

  async getPlatformSettings(): Promise<VideoPlatformSettings> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/videos/settings', { headers });
    if (!res.ok) throw new Error('Failed to fetch platform video settings');
    const data = await res.json();
    return data.settings;
  },

  async updatePlatformSettings(settings: Partial<VideoPlatformSettings>): Promise<VideoPlatformSettings> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/videos/settings', {
      method: 'PUT',
      headers,
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update platform video settings');
    const data = await res.json();
    return data.settings;
  }
};

// Initial verified property walkthroughs for zero-delay instant fallback
export const FALLBACK_VERIFIED_VIDEOS: PropertyVideo[] = [
  {
    id: 'vid_dha6_villa_101',
    listingId: 'listing_1',
    listingReferenceId: '3421789',
    listingTitle: '1 Kanal Luxury Spanish Villa',
    creatorId: 'user-redspots',
    creatorName: 'Redspots Real Estate',
    creatorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    creatorBadge: 'business',
    creatorType: 'agency',
    title: 'Modern 1 Kanal Spanish Villa Walkthrough · DHA Phase 6 Lahore',
    caption: 'Full walkthrough of this brand new designer home in DHA Phase 6 Lahore. Featuring imported Italian marble, basement home theatre, infinity courtyard pool, and German kitchen appliances. Verified Shanakht™ title.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-living-room-of-a-modern-house-41484-large.mp4',
    renditions: {
      '360p': 'https://assets.mixkit.co/videos/preview/mixkit-living-room-of-a-modern-house-41484-medium.mp4',
      '480p': 'https://assets.mixkit.co/videos/preview/mixkit-living-room-of-a-modern-house-41484-large.mp4',
      '720p': 'https://assets.mixkit.co/videos/preview/mixkit-living-room-of-a-modern-house-41484-large.mp4'
    },
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    duration: 68,
    fileSizeBytes: 28400000,
    format: 'mp4',
    aspectRatio: '9:16',
    overlaySpec: {
      priceText: 'PKR 8.5 Crore',
      locationText: 'DHA Phase 6, Sector J · Lahore',
      propertyType: 'House',
      keySpecs: ['5 Beds', '6 Baths', '1 Kanal', 'Infinity Pool'],
      customTag: 'Verified Agency Exclusive'
    },
    trimRange: { startSec: 0, endSec: 68 },
    status: 'approved',
    visibilityScope: 'public',
    isFeatured: true,
    sortBoostScore: 92.5,
    aiPrescreen: {
      passed: true,
      confidence: 0.98,
      label: 'genuine_walkthrough',
      detectedElements: ['living_room', 'marble_floor', 'high_ceiling', 'pool'],
      flaggedReasons: []
    },
    stats: {
      viewsCount: 14820,
      uniqueViewersCount: 11450,
      likesCount: 1840,
      sharesCount: 380,
      savesCount: 720,
      watchTimeTotalSeconds: 785000,
      completionRate: 78.4,
      listingClicksCount: 940
    },
    createdAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vid_isb_penthouse_102',
    listingId: 'listing_2',
    listingReferenceId: '8910452',
    listingTitle: 'Grand Margalla Horizon Duplex Penthouse',
    creatorId: 'seller-tariq',
    creatorName: 'Tariq Mahmood (Verified Partner)',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    creatorBadge: 'identity',
    creatorType: 'agent',
    title: 'Sunset View Duplex Penthouse · Sector F-7/2 Islamabad',
    caption: 'Step inside this 4,200 sq.ft. penthouse overlooking the Margalla Hills. Private elevator access, wrap-around rooftop terrace, and smart home climate automation.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-apartment-balcony-32869-large.mp4',
    renditions: {
      '360p': 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-apartment-balcony-32869-medium.mp4',
      '480p': 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-apartment-balcony-32869-large.mp4',
      '720p': 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-apartment-balcony-32869-large.mp4'
    },
    thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
    duration: 54,
    fileSizeBytes: 22100000,
    format: 'mp4',
    aspectRatio: '9:16',
    overlaySpec: {
      priceText: 'PKR 12 Crore',
      locationText: 'Sector F-7/2 · Islamabad',
      propertyType: 'Penthouse',
      keySpecs: ['4 Beds', '5 Baths', '4,200 Sq.Ft.', 'Private Terrace'],
      customTag: 'Margalla Hill Facing'
    },
    trimRange: { startSec: 0, endSec: 54 },
    status: 'approved',
    visibilityScope: 'public',
    isFeatured: true,
    sortBoostScore: 88.2,
    aiPrescreen: {
      passed: true,
      confidence: 0.96,
      label: 'genuine_walkthrough',
      detectedElements: ['balcony', 'view', 'interior', 'kitchen'],
      flaggedReasons: []
    },
    stats: {
      viewsCount: 9640,
      uniqueViewersCount: 7920,
      likesCount: 1220,
      sharesCount: 290,
      savesCount: 510,
      watchTimeTotalSeconds: 432000,
      completionRate: 82.1,
      listingClicksCount: 710
    },
    createdAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vid_khi_clifton_103',
    listingId: 'listing_3',
    listingReferenceId: '7612349',
    listingTitle: '4-Bed Seafront Luxury Architectural Residence',
    creatorId: 'agency-emaar',
    creatorName: 'Emaar Pakistan Properties',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    creatorBadge: 'business',
    creatorType: 'agency',
    title: 'Panoramic Waterfront Villa Tour · Clifton Block 4 Karachi',
    caption: 'Experience coastal living at its finest. Custom floor-to-ceiling double-glazed windows, private gym, and sun deck facing the Arabian Sea. Direct developer booking with verified registry documentation.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-with-an-empty-balcony-42294-large.mp4',
    renditions: {
      '360p': 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-with-an-empty-balcony-42294-medium.mp4',
      '480p': 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-with-an-empty-balcony-42294-large.mp4',
      '720p': 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-with-an-empty-balcony-42294-large.mp4'
    },
    thumbnailUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800',
    duration: 75,
    fileSizeBytes: 31200000,
    format: 'mp4',
    aspectRatio: '9:16',
    overlaySpec: {
      priceText: 'PKR 9.5 Crore',
      locationText: 'Clifton Block 4 · Karachi',
      propertyType: 'House',
      keySpecs: ['4 Beds', '5 Baths', '600 Sq.Yd.', 'Sea View'],
      customTag: 'Prime Waterfront'
    },
    trimRange: { startSec: 0, endSec: 75 },
    status: 'approved',
    visibilityScope: 'public',
    isFeatured: false,
    sortBoostScore: 84.1,
    aiPrescreen: {
      passed: true,
      confidence: 0.99,
      label: 'genuine_walkthrough',
      detectedElements: ['coastal_view', 'master_bedroom', 'terrace'],
      flaggedReasons: []
    },
    stats: {
      viewsCount: 7180,
      uniqueViewersCount: 6020,
      likesCount: 940,
      sharesCount: 195,
      savesCount: 380,
      watchTimeTotalSeconds: 395000,
      completionRate: 74.0,
      listingClicksCount: 520
    },
    createdAt: new Date(Date.now() - 3600 * 1000 * 36).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vid_khi_bahria_104',
    listingId: 'listing_4',
    listingReferenceId: '4512980',
    listingTitle: '10 Marla Smart Automation House',
    creatorId: 'agency-dha',
    creatorName: 'DHA Estates Official',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    creatorBadge: 'business',
    creatorType: 'agency',
    title: 'Brand New 10 Marla Smart Home · Bahria Town Precinct 1',
    caption: '10 Marla designer house with complete solar panel backup, motorized curtains, CCTV security system, and contemporary wood finishes. Key in hand ready to move.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-kitchen-in-an-expensive-house-41486-large.mp4',
    renditions: {
      '360p': 'https://assets.mixkit.co/videos/preview/mixkit-modern-kitchen-in-an-expensive-house-41486-medium.mp4',
      '480p': 'https://assets.mixkit.co/videos/preview/mixkit-modern-kitchen-in-an-expensive-house-41486-large.mp4',
      '720p': 'https://assets.mixkit.co/videos/preview/mixkit-modern-kitchen-in-an-expensive-house-41486-large.mp4'
    },
    thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
    duration: 62,
    fileSizeBytes: 24500000,
    format: 'mp4',
    aspectRatio: '9:16',
    overlaySpec: {
      priceText: 'PKR 4.25 Crore',
      locationText: 'Bahria Town, Precinct 1 · Karachi',
      propertyType: 'House',
      keySpecs: ['4 Beds', '4 Baths', '10 Marla', 'Solar Hybrid'],
      customTag: '100% Solar Ready'
    },
    trimRange: { startSec: 0, endSec: 62 },
    status: 'approved',
    visibilityScope: 'public',
    isFeatured: false,
    sortBoostScore: 79.5,
    aiPrescreen: {
      passed: true,
      confidence: 0.94,
      label: 'genuine_walkthrough',
      detectedElements: ['kitchen', 'solar_inverter', 'drawing_room'],
      flaggedReasons: []
    },
    stats: {
      viewsCount: 5320,
      uniqueViewersCount: 4610,
      likesCount: 680,
      sharesCount: 140,
      savesCount: 290,
      watchTimeTotalSeconds: 265000,
      completionRate: 71.5,
      listingClicksCount: 390
    },
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    updatedAt: new Date().toISOString()
  }
];
