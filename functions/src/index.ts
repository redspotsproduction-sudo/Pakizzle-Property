/**
 * Scheduled Cloud Function for Pakizzle Listing Freshness & Auto-Expiry
 * 
 * Rules:
 * 1. Day-60 prompt: Flags active listings unconfirmed for >= 60 days with
 *    freshness_status = 'stale_pending_confirmation', sets confirmation_prompt_sent_at,
 *    and writes an urgent notification to the seller.
 * 2. Expiry 7 days after prompt: If seller does not confirm availability within
 *    7 days of the prompt (confirmation_prompt_sent_at + 7 days, or >= 67 days total),
 *    the function transitions status = 'expired' and freshness_status = 'expired',
 *    and writes an expiration notification to the seller.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const checkListingFreshnessScheduled = onSchedule("every 24 hours", async (event) => {
  const result = await runFreshnessSweepJob();
  console.log("Scheduled freshness sweep completed:", result);
});

export async function runFreshnessSweepJob(): Promise<{
  promptsIssued: number;
  expirations: number;
  approachingStale: number;
  processed: number;
}> {
  const now = Date.now();
  const msPerDay = 86400000;

  let promptsIssued = 0;
  let expirations = 0;
  let approachingStale = 0;
  let processed = 0;

  // Query all non-expired listings across 'properties' and legacy 'vehicles'
  const collectionsToAudit = ['properties', 'vehicles'];

  for (const collName of collectionsToAudit) {
    const snapshot = await db.collection(collName).get();

    for (const doc of snapshot.docs) {
      processed++;
      const data = doc.data();

      // Skip already rejected or draft items
      if (data.status === 'draft' || data.status === 'rejected') {
        continue;
      }

      const createdDate = data.createdAt ? new Date(data.createdAt) : new Date();
      const lastConfirmedDate = data.last_confirmed_active 
        ? new Date(data.last_confirmed_active) 
        : createdDate;

      const daysSinceConfirmed = Math.max(0, Math.floor((now - lastConfirmedDate.getTime()) / msPerDay));
      const promptSentAt = data.confirmation_prompt_sent_at 
        ? new Date(data.confirmation_prompt_sent_at).getTime() 
        : null;

      const daysSincePrompt = promptSentAt 
        ? Math.max(0, Math.floor((now - promptSentAt) / msPerDay)) 
        : null;

      const sellerUid = data.seller?.uid || data.userId || 'seller';
      const listingTitle = data.model || data.title || `${data.make || 'Property'} in ${data.city || 'Pakistan'}`;

      // Condition 1: 7 days after prompt was sent (or >= 67 days unconfirmed) -> Expire listing
      const shouldExpire = (daysSincePrompt !== null && daysSincePrompt >= 7) || daysSinceConfirmed >= 67;

      if (shouldExpire && data.status !== 'expired') {
        expirations++;
        const timestamp = new Date().toISOString();

        // 1. Write status='expired' and freshness_status='expired' to Firestore
        await doc.ref.update({
          status: 'expired',
          freshness_status: 'expired',
          expired_at: timestamp,
          updatedAt: timestamp
        });

        // 2. Create notification in Firestore
        await db.collection('notifications').add({
          userId: sellerUid,
          type: 'listing_expired',
          title: 'Listing Expired: Inactive for 67 Days',
          message: `Your listing "${listingTitle}" has expired because availability was not confirmed within the 7-day grace period. Reactivate it anytime from your dashboard.`,
          propertyId: doc.id,
          createdAt: timestamp,
          read: false
        });

        continue;
      }

      // Condition 2: Day-60 Prompt (>= 60 days unconfirmed without active prompt)
      const shouldPrompt = daysSinceConfirmed >= 60 && !shouldExpire && data.freshness_status !== 'stale_pending_confirmation';

      if (shouldPrompt) {
        promptsIssued++;
        const timestamp = new Date().toISOString();

        // 1. Write freshness_status and confirmation_prompt_sent_at to Firestore
        await doc.ref.update({
          freshness_status: 'stale_pending_confirmation',
          confirmation_prompt_sent_at: timestamp,
          updatedAt: timestamp
        });

        // 2. Create day-60 prompt notification in Firestore
        await db.collection('notifications').add({
          userId: sellerUid,
          type: 'freshness_prompt',
          title: 'Still Available? 7-Day Availability Confirmation Required',
          message: `Your listing "${listingTitle}" has been active for 60 days. Please confirm it is still available within 7 days to avoid automatic delisting.`,
          propertyId: doc.id,
          actionRequired: true,
          expiresInDays: 7,
          createdAt: timestamp,
          read: false
        });

        continue;
      }

      // Condition 3: Approaching Stale warning (50-59 days)
      if (daysSinceConfirmed >= 50 && daysSinceConfirmed < 60 && data.freshness_status !== 'approaching_stale' && data.status === 'active') {
        approachingStale++;
        await doc.ref.update({
          freshness_status: 'approaching_stale',
          updatedAt: new Date().toISOString()
        });
      }
    }
  }

  return {
    promptsIssued,
    expirations,
    approachingStale,
    processed
  };
}
