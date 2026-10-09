/**
 * Scheduled Freshness Function Implementation
 * 
 * Runs as a background service task and scheduled Cloud Function:
 * 1. Day-60 prompt: Flags active listings unconfirmed for >= 60 days with
 *    freshness_status = 'stale_pending_confirmation', sets confirmation_prompt_sent_at,
 *    and writes an urgent notification to the seller in Firestore.
 * 2. Expiry 7 days after prompt: If seller does not confirm availability within
 *    7 days of the prompt (confirmation_prompt_sent_at + 7 days, or >= 67 days total),
 *    the function transitions status = 'expired' and freshness_status = 'expired',
 *    and writes an expiration notification to the seller in Firestore.
 */

import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";

export async function runScheduledFreshnessSweep(): Promise<{
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

  try {
    const colls = ['properties', 'vehicles'];

    for (const collName of colls) {
      const snap = await getDocs(collection(db, collName));

      for (const d of snap.docs) {
        processed++;
        const data = d.data();

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

        // Rule 1: Expire 7 days after the prompt was sent (or >= 67 days unconfirmed)
        const shouldExpire = (daysSincePrompt !== null && daysSincePrompt >= 7) || daysSinceConfirmed >= 67;

        if (shouldExpire && data.status !== 'expired') {
          expirations++;
          const timestamp = new Date().toISOString();

          await updateDoc(doc(db, collName, d.id), {
            status: 'expired',
            freshness_status: 'expired',
            expired_at: timestamp,
            updatedAt: timestamp
          });

          await addDoc(collection(db, 'notifications'), {
            userId: sellerUid,
            type: 'listing_expired',
            title: 'Listing Expired: Inactive for 67 Days',
            message: `Your listing "${listingTitle}" has expired because availability was not confirmed within the 7-day grace period. Reactivate it anytime from your dashboard.`,
            propertyId: d.id,
            createdAt: timestamp,
            read: false
          });

          continue;
        }

        // Rule 2: Day-60 prompt
        const shouldPrompt = daysSinceConfirmed >= 60 && !shouldExpire && data.freshness_status !== 'stale_pending_confirmation';

        if (shouldPrompt) {
          promptsIssued++;
          const timestamp = new Date().toISOString();

          await updateDoc(doc(db, collName, d.id), {
            freshness_status: 'stale_pending_confirmation',
            confirmation_prompt_sent_at: timestamp,
            updatedAt: timestamp
          });

          await addDoc(collection(db, 'notifications'), {
            userId: sellerUid,
            type: 'freshness_prompt',
            title: 'Still Available? 7-Day Availability Confirmation Required',
            message: `Your listing "${listingTitle}" has been active for 60 days. Please confirm it is still available within 7 days to avoid automatic delisting.`,
            propertyId: d.id,
            actionRequired: true,
            expiresInDays: 7,
            createdAt: timestamp,
            read: false
          });

          continue;
        }

        // Rule 3: Approaching stale (50-59 days)
        if (daysSinceConfirmed >= 50 && daysSinceConfirmed < 60 && data.freshness_status !== 'approaching_stale' && data.status === 'active') {
          approachingStale++;
          await updateDoc(doc(db, collName, d.id), {
            freshness_status: 'approaching_stale',
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
  } catch (err) {
    console.error("Scheduled freshness sweep error:", err);
  }

  return {
    promptsIssued,
    expirations,
    approachingStale,
    processed
  };
}
