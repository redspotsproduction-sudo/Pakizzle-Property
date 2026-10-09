/**
 * Pakizzle Listing Freshness & Auto-Expiry Automation Engine
 * 
 * Directly addresses Zameen's #1 user complaint: stale, ghost, and phantom listings.
 * 
 * Rules:
 * 1. Tracks separate `last_confirmed_active` timestamp (independent of `createdAt`).
 * 2. At 60 days without seller confirmation: flags listing and issues "Still Available?" prompt.
 * 3. 7-day grace period: if seller doesn't confirm within 7 days (>67 days), status transitions to 'expired'.
 * 4. Expired listings are delisted from marketplace searches and maps, but remain accessible at direct canonical URL
 *    with an authentic "May no longer be available — last confirmed X days ago" banner.
 * 5. 1-click reactivation by seller instantly resets freshness clock to current timestamp.
 * 6. Admin dashboard widget monitors platform health and aging inventory counts.
 */

import { Property } from "../types";
import { db } from "../firebase";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";

export interface FreshnessInfo {
  daysSinceConfirmed: number;
  daysSinceListed: number;
  lastConfirmedDate: Date;
  createdDate: Date;
  status: 'fresh' | 'approaching_stale' | 'stale_pending_confirmation' | 'expired';
  isApproachingThreshold: boolean; // 50-59 days
  isPromptDue: boolean; // >= 60 days
  isGracePeriod: boolean; // 60-67 days
  isExpired: boolean; // >= 67 days or property.status === 'expired'
  displayText: string; // e.g. "Confirmed active 2 days ago" or "Listed 3 days ago"
  badgeColor: string;
}

export interface StaleListingsAudit {
  totalListings: number;
  freshCount: number;
  approachingCount: number; // 50 - 59 days
  pendingConfirmationCount: number; // 60 - 66 days
  expiredCount: number; // >= 67 days
  freshnessHealthRate: number; // percentage (e.g. 96.5%)
  attentionRequiredListings: {
    property: Property;
    freshness: FreshnessInfo;
    suggestedAction: 'send_prompt' | 'auto_expire' | 'review';
  }[];
}

class ListingFreshnessService {
  /**
   * Calculate precise freshness metrics for any listing
   */
  public getFreshness(property: Property): FreshnessInfo {
    const now = Date.now();
    const createdDate = property.createdAt ? new Date(property.createdAt) : new Date();
    const lastConfirmedDate = property.last_confirmed_active 
      ? new Date(property.last_confirmed_active) 
      : createdDate;

    const msPerDay = 86400000;
    const daysSinceConfirmed = Math.max(0, Math.floor((now - lastConfirmedDate.getTime()) / msPerDay));
    const daysSinceListed = Math.max(0, Math.floor((now - createdDate.getTime()) / msPerDay));

    const isExplicitlyExpired = property.status === 'expired';
    const isPastGracePeriod = daysSinceConfirmed >= 67;
    const isExpired = isExplicitlyExpired || isPastGracePeriod;
    const isGracePeriod = !isExpired && daysSinceConfirmed >= 60;
    const isApproachingThreshold = !isExpired && !isGracePeriod && daysSinceConfirmed >= 50;

    let status: FreshnessInfo['status'] = 'fresh';
    let badgeColor = 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';

    if (isExpired) {
      status = 'expired';
      badgeColor = 'text-rose-600 bg-rose-500/10 border-rose-500/20';
    } else if (isGracePeriod) {
      status = 'stale_pending_confirmation';
      badgeColor = 'text-amber-600 bg-amber-500/10 border-amber-500/20';
    } else if (isApproachingThreshold) {
      status = 'approaching_stale';
      badgeColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }

    let displayText = "";
    if (property.last_confirmed_active) {
      if (daysSinceConfirmed === 0) displayText = "Confirmed active today";
      else if (daysSinceConfirmed === 1) displayText = "Confirmed active yesterday";
      else displayText = `Confirmed active ${daysSinceConfirmed} days ago`;
    } else {
      if (daysSinceListed === 0) displayText = "Listed today";
      else if (daysSinceListed === 1) displayText = "Listed yesterday";
      else displayText = `Listed ${daysSinceListed} days ago`;
    }

    return {
      daysSinceConfirmed,
      daysSinceListed,
      lastConfirmedDate,
      createdDate,
      status,
      isApproachingThreshold,
      isPromptDue: daysSinceConfirmed >= 60,
      isGracePeriod,
      isExpired,
      displayText,
      badgeColor
    };
  }

  /**
   * Perform automated sweep over listings:
   * Returns listings with updated freshness states
   */
  public runFreshnessAuditSweep(properties: Property[]): {
    updatedProperties: Property[];
    newPromptsIssued: number;
    newExpirations: number;
  } {
    let newPromptsIssued = 0;
    let newExpirations = 0;

    const updatedProperties = properties.map(property => {
      const freshness = this.getFreshness(property);

      // Auto-expire rule: >67 days without confirmation
      if (freshness.isExpired && property.status !== 'expired') {
        newExpirations++;
        return {
          ...property,
          status: 'expired' as const,
          freshness_status: 'expired' as const
        };
      }

      // 60-day prompt rule: >=60 days but <67 days
      if (freshness.isGracePeriod && property.freshness_status !== 'stale_pending_confirmation') {
        newPromptsIssued++;
        return {
          ...property,
          freshness_status: 'stale_pending_confirmation' as const,
          confirmation_prompt_sent_at: property.confirmation_prompt_sent_at || new Date().toISOString()
        };
      }

      if (freshness.isApproachingThreshold && property.freshness_status !== 'approaching_stale') {
        return {
          ...property,
          freshness_status: 'approaching_stale' as const
        };
      }

      return property;
    });

    return {
      updatedProperties,
      newPromptsIssued,
      newExpirations
    };
  }

  /**
   * One-tap Confirmation: Seller confirms the listing is still available
   */
  public async confirmActive(propertyId: string, sellerUid?: string): Promise<Partial<Property>> {
    const timestamp = new Date().toISOString();
    const updates: Partial<Property> = {
      last_confirmed_active: timestamp,
      status: 'active',
      freshness_status: 'fresh',
      updatedAt: timestamp
    };

    try {
      const propRef = doc(db, 'properties', propertyId);
      await updateDoc(propRef, updates);
    } catch {
      // In offline/mock mode, changes remain in local state
    }

    // Log notification in Firestore
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: sellerUid || 'seller',
        type: 'listing_confirmed',
        title: 'Listing Freshness Confirmed',
        message: 'Your listing freshness has been verified and active badge updated across Pakizzle.',
        propertyId,
        createdAt: timestamp,
        read: false
      });
    } catch {
      // Fail safely
    }

    return updates;
  }

  /**
   * One-click Reactivation: Seller reactivates an expired listing
   */
  public async reactivateExpiredListing(propertyId: string, sellerUid?: string): Promise<Partial<Property>> {
    const timestamp = new Date().toISOString();
    const updates: Partial<Property> = {
      last_confirmed_active: timestamp,
      reactivated_at: timestamp,
      status: 'active',
      freshness_status: 'fresh',
      updatedAt: timestamp
    };

    try {
      const propRef = doc(db, 'properties', propertyId);
      await updateDoc(propRef, updates);
    } catch {
      // Fail safely
    }

    try {
      await addDoc(collection(db, 'notifications'), {
        userId: sellerUid || 'seller',
        type: 'listing_reactivated',
        title: 'Listing Reactivated Successfully',
        message: 'Your listing is now restored to marketplace search, map, and recommendations.',
        propertyId,
        createdAt: timestamp,
        read: false
      });
    } catch {
      // Fail safely
    }

    return updates;
  }

  /**
   * Generate comprehensive platform audit report for Admin Console
   */
  public generatePlatformAudit(properties: Property[]): StaleListingsAudit {
    let freshCount = 0;
    let approachingCount = 0;
    let pendingConfirmationCount = 0;
    let expiredCount = 0;

    const attentionRequiredListings: StaleListingsAudit['attentionRequiredListings'] = [];

    properties.forEach(p => {
      const f = this.getFreshness(p);
      if (f.isExpired) {
        expiredCount++;
        attentionRequiredListings.push({
          property: p,
          freshness: f,
          suggestedAction: 'auto_expire'
        });
      } else if (f.isGracePeriod) {
        pendingConfirmationCount++;
        attentionRequiredListings.push({
          property: p,
          freshness: f,
          suggestedAction: 'send_prompt'
        });
      } else if (f.isApproachingThreshold) {
        approachingCount++;
        attentionRequiredListings.push({
          property: p,
          freshness: f,
          suggestedAction: 'review'
        });
      } else {
        freshCount++;
      }
    });

    const totalListings = properties.length;
    const activeHealthyCount = freshCount + approachingCount;
    const freshnessHealthRate = totalListings > 0 
      ? Math.round((activeHealthyCount / totalListings) * 1000) / 10 
      : 100;

    return {
      totalListings,
      freshCount,
      approachingCount,
      pendingConfirmationCount,
      expiredCount,
      freshnessHealthRate,
      attentionRequiredListings
    };
  }
}

export const listingFreshnessService = new ListingFreshnessService();
export default listingFreshnessService;
