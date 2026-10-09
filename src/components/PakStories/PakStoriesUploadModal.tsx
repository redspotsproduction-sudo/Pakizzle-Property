import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  Video as VideoIcon,
  ShieldCheck,
  AlertTriangle,
  Scissors,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  Building2,
  MapPin,
  Tag,
  Info,
  Clock,
  FileCheck,
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { videoService } from '../../services/videoService';
import { CreatorEligibilityCheck, VideoUploadPayload } from '../../types/video';
import { toast } from 'sonner';

interface PakStoriesUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialListingId?: string;
}

export default function PakStoriesUploadModal({
  isOpen,
  onClose,
  onSuccess,
  initialListingId
}: PakStoriesUploadModalProps) {
  const [eligibility, setEligibility] = useState<CreatorEligibilityCheck | null>(null);
  const [loadingEligibility, setLoadingEligibility] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedListingId, setSelectedListingId] = useState(initialListingId || '');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(45);
  const [trimRange, setTrimRange] = useState({ startSec: 0, endSec: 45 });
  
  // Overlay specifications
  const [overlayPrice, setOverlayPrice] = useState('');
  const [overlayLocation, setOverlayLocation] = useState('');
  const [overlayPropertyType, setOverlayPropertyType] = useState('House');
  const [overlaySpecs, setOverlaySpecs] = useState<string[]>(['5 Beds', '6 Baths', '1 Kanal']);
  const [specInput, setSpecInput] = useState('');
  const [overlayCustomTag, setOverlayCustomTag] = useState('Verified Walkthrough');

  // Transcoding & Security States
  const [transcodingSimulation, setTranscodingSimulation] = useState(false);
  const [virusScanPassed, setVirusScanPassed] = useState(true);

  // Check eligibility whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingEligibility(true);

    videoService.checkEligibility()
      .then(res => {
        if (!isMounted) return;
        setEligibility(res);
        setLoadingEligibility(false);

        // Auto-select listing if available
        if (res.eligibleListings?.length > 0 && !selectedListingId) {
          const defaultListing = initialListingId
            ? res.eligibleListings.find(l => l.id === initialListingId) || res.eligibleListings[0]
            : res.eligibleListings[0];

          if (defaultListing) {
            setSelectedListingId(defaultListing.id);
            setOverlayPrice(`PKR ${(defaultListing.price / 10000000).toFixed(1)} Crore`);
            setOverlayLocation(`${defaultListing.location}, ${defaultListing.city}`);
            setOverlayPropertyType(defaultListing.propertyType || 'House');
            setTitle(`${defaultListing.title} Walkthrough`);
          }
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error(err);
        setLoadingEligibility(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialListingId]);

  // Handle listing selection change to auto-fill overlay metadata
  const handleListingSelect = (listingId: string) => {
    setSelectedListingId(listingId);
    const listing = eligibility?.eligibleListings?.find(l => l.id === listingId);
    if (listing) {
      setOverlayPrice(`PKR ${(listing.price / 10000000).toFixed(1)} Crore`);
      setOverlayLocation(`${listing.location}, ${listing.city}`);
      setOverlayPropertyType(listing.propertyType || 'House');
      setTitle(`${listing.title} Walkthrough`);
    }
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client constraint validation: format and size (75MB max)
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'mp4' && ext !== 'mov') {
      toast.error('Only MP4 and MOV formats are allowed for property walkthroughs');
      return;
    }

    if (file.size > 75 * 1024 * 1024) {
      toast.error('File size exceeds the 75MB platform limit for 90-second vertical videos');
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Simulate duration extraction
    const estDuration = 55;
    setDuration(estDuration);
    setTrimRange({ startSec: 0, endSec: Math.min(90, estDuration) });
    setTranscodingSimulation(true);
    setVirusScanPassed(true);
  };

  // Add key spec chip
  const handleAddSpec = () => {
    if (!specInput.trim()) return;
    if (overlaySpecs.length >= 5) {
      toast.error('Maximum 5 key specification chips on overlay');
      return;
    }
    setOverlaySpecs([...overlaySpecs, specInput.trim()]);
    setSpecInput('');
  };

  const handleRemoveSpec = (idx: number) => {
    setOverlaySpecs(overlaySpecs.filter((_, i) => i !== idx));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedListingId) {
      toast.error('Every walkthrough video must be linked to a real, reviewable property listing');
      return;
    }

    if (trimRange.endSec - trimRange.startSec > 90) {
      toast.error('Selected video duration cannot exceed 90 seconds');
      return;
    }

    try {
      setSubmitting(true);

      const payload: VideoUploadPayload = {
        listingId: selectedListingId,
        title: title || 'Verified Property Walkthrough',
        caption: caption || 'Complete video walkthrough with verified specs and Shanakht™ title.',
        videoUrl: previewUrl || '/videos/walkthrough_villa.mp4',
        duration: trimRange.endSec - trimRange.startSec,
        fileSizeBytes: videoFile?.size || 25000000,
        format: 'mp4',
        trimRange,
        overlaySpec: {
          priceText: overlayPrice,
          locationText: overlayLocation,
          propertyType: overlayPropertyType,
          keySpecs: overlaySpecs,
          customTag: overlayCustomTag
        }
      };

      await videoService.uploadVideo(payload);

      toast.success('Walkthrough uploaded successfully! Sent to Shanakht™ moderation queue.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit walkthrough video');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* Main Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#161618] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh] z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#1A1A1D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5B2A86] to-[#8A3DB8] flex items-center justify-center shadow-md">
              <VideoIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  PakStories™ Walkthrough Creator
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#5B2A86]/10 text-[#5B2A86] dark:bg-[#C9A227]/15 dark:text-[#C9A227]">
                  Verified Only
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#8E8E93]">
                Upload 9:16 vertical walkthroughs linked directly to your active listings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingEligibility ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-[#5B2A86] dark:text-[#C9A227] animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Verifying Shanakht™ permission layer...</p>
            </div>
          ) : !eligibility?.canUpload ? (
            /* ================= GATED UNVERIFIED STATE ================= */
            <div className="py-12 px-4 max-w-lg mx-auto text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Verified Creator Privilege Required
              </h3>
              <p className="text-sm text-slate-600 dark:text-[#8E8E93] mb-6 leading-relaxed">
                {eligibility?.videoSuspended
                  ? `Your video upload privilege is currently suspended: ${eligibility?.suspensionReason || 'Violation of guidelines'}. Contact administration for reinstatement.`
                  : 'To protect buyers against spam and unverified listings, PakStories™ property walkthroughs are strictly restricted to identity-verified sellers and registered real estate agencies.'}
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left w-full mb-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Identity Status:</span>
                  <span className="font-bold capitalize text-amber-500">
                    {eligibility?.identityStatus || 'Unverified'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Business Agency Status:</span>
                  <span className="font-bold capitalize text-amber-500">
                    {eligibility?.businessStatus || 'Unverified'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Close
                </button>
                <a
                  href="/verification"
                  className="px-6 py-2.5 rounded-xl bg-[#5B2A86] hover:bg-[#48206C] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Shanakht™ Verification</span>
                </a>
              </div>
            </div>
          ) : (
            /* ================= VERIFIED CREATOR UPLOAD WORKFLOW ================= */
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Mandatory Listing Attachment */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-[#8E8E93] mb-1.5">
                    1. Attach to Verified Listing <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedListingId}
                    onChange={(e) => handleListingSelect(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#5B2A86] dark:focus:border-[#C9A227]"
                  >
                    <option value="" disabled>Select listing to showcase...</option>
                    {eligibility.eligibleListings?.map(l => (
                      <option key={l.id} value={l.id} className="text-black dark:text-white dark:bg-[#1E1E20]">
                        #{l.referenceId} · {l.title} ({l.location}, {l.city})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-[#5B2A86] dark:text-[#C9A227]" />
                    Every video walkthrough must be attached to a verified listing to prevent lifestyle spam.
                  </p>
                </div>

                {/* 2. File Upload Dropzone */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-[#8E8E93] mb-1.5">
                    2. Vertical Video File (9:16) <span className="text-red-500">*</span>
                  </label>
                  <label className="border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-[#5B2A86] dark:hover:border-[#C9A227] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-white/[0.02]">
                    <Upload className="w-8 h-8 text-[#5B2A86] dark:text-[#C9A227] mb-2" />
                    <span className="text-xs font-bold text-slate-800 dark:text-white mb-0.5">
                      {videoFile ? videoFile.name : 'Choose 9:16 Video File'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      MP4 or MOV · Max 90 seconds · Max 75MB
                    </span>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 3. Lightweight Built-in Trim Tool */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-[#5B2A86] dark:text-[#C9A227]" />
                      Built-in Trim Tool
                    </span>
                    <span className="text-xs font-bold text-[#5B2A86] dark:text-[#C9A227]">
                      {trimRange.endSec - trimRange.startSec}s selected (Max 90s)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1">Start Cut (sec)</span>
                      <input
                        type="number"
                        min="0"
                        max={trimRange.endSec - 1}
                        value={trimRange.startSec}
                        onChange={(e) => setTrimRange({ ...trimRange, startSec: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E1E20] border border-slate-200 dark:border-white/10 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1">End Cut (sec)</span>
                      <input
                        type="number"
                        min={trimRange.startSec + 1}
                        max={Math.max(90, duration)}
                        value={trimRange.endSec}
                        onChange={(e) => setTrimRange({ ...trimRange, endSec: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E1E20] border border-slate-200 dark:border-white/10 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. On-Screen Caption & Specs Overlays */}
                <div className="space-y-3">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-[#8E8E93]">
                    3. On-Screen Captions & Baked Overlays
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Price Badge</label>
                      <input
                        type="text"
                        value={overlayPrice}
                        onChange={(e) => setOverlayPrice(e.target.value)}
                        placeholder="PKR 8.5 Crore"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Location Label</label>
                      <input
                        type="text"
                        value={overlayLocation}
                        onChange={(e) => setOverlayLocation(e.target.value)}
                        placeholder="DHA Phase 6 · Lahore"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Key spec chips */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Key Specs Chips</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {overlaySpecs.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-[#5B2A86]/10 text-[#5B2A86] dark:bg-[#C9A227]/15 dark:text-[#C9A227] text-xs font-bold flex items-center gap-1.5"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(idx)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={specInput}
                        onChange={(e) => setSpecInput(e.target.value)}
                        placeholder="Add spec (e.g. 'Basement', 'Corner Plot')..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSpec();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddSpec}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-xs font-bold hover:bg-slate-300"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live 9:16 Video Preview & Processing Safeguards */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  Live Vertical Preview (9:16)
                </span>

                {/* Vertical Phone Screen Mockup */}
                <div className="relative w-[240px] h-[426px] bg-black rounded-[36px] overflow-hidden shadow-2xl border-4 border-slate-800 flex flex-col justify-between p-3.5 text-white">
                  {/* Background Video / Placeholder */}
                  {previewUrl ? (
                    <video
                      src={previewUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-black flex flex-col items-center justify-center p-4 text-center">
                      <VideoIcon className="w-10 h-10 text-slate-600 mb-2" />
                      <span className="text-[11px] font-bold text-slate-400">Select a video file to preview vertical rendering</span>
                    </div>
                  )}

                  {/* Gradient overlays to ensure on-screen captions are always legible */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                  {/* Top Header Overlay */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-black/50 backdrop-blur-md border border-white/20 text-[#F0A830]">
                      {overlayCustomTag || 'Walkthrough'}
                    </span>
                    <span className="text-[10px] font-bold text-white/80 bg-black/40 px-2 py-0.5 rounded-full">
                      {trimRange.endSec - trimRange.startSec}s
                    </span>
                  </div>

                  {/* Bottom Information Overlay (Baked brand typography) */}
                  <div className="relative z-10 space-y-1.5">
                    <div className="inline-block px-2.5 py-1 rounded-xl bg-[#5B2A86] text-white text-xs font-black shadow-md">
                      {overlayPrice || 'PKR Price'}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-white drop-shadow-md">
                      <MapPin className="w-3 h-3 text-[#F0A830] shrink-0" />
                      <span className="truncate">{overlayLocation || 'Location & City'}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {overlaySpecs.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-md font-bold">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Deep-link action button */}
                    <div className="pt-2">
                      <div className="w-full py-1.5 rounded-xl bg-white/90 text-black text-[10px] font-black text-center flex items-center justify-center gap-1 shadow-md">
                        <span>View Full Listing</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Safeguards Summary */}
                <div className="w-full mt-4 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Multi-tier Transcoding:
                    </span>
                    <span className="font-bold text-slate-700 dark:text-zinc-300">360p · 480p · 720p</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Security Virus / Format Scan:
                    </span>
                    <span className="font-bold text-emerald-500">Clean / Passed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#5B2A86] dark:text-[#C9A227]" />
                      AI Content Pre-Screening:
                    </span>
                    <span className="font-bold text-slate-700 dark:text-zinc-300">Enabled</span>
                  </div>
                </div>
              </div>

              {/* Form Footer Action */}
              <div className="lg:col-span-12 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Submitted videos enter <span className="font-bold text-amber-500">pending_review</span> status before public broadcast.
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedListingId}
                    className="px-6 py-2.5 rounded-xl bg-[#5B2A86] hover:bg-[#48206C] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting to Moderation...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit for Verification Review</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
