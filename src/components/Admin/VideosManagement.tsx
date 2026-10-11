import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Film,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  Eye,
  Sliders,
  SlidersHorizontal,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  ExternalLink,
  Edit3,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Check,
  Building2,
  UserX,
  UserCheck,
  Pin,
  Globe,
  Lock,
  Layers,
  FileText,
  Clock,
  ChevronRight,
  TrendingUp,
  MousePointerClick,
  Percent,
  X
} from 'lucide-react';
import { PropertyVideo, VideoPlatformSettings, VideoReport } from '../../types/video';
import { videoService } from '../../services/videoService';
import { toast } from 'sonner';

export default function VideosManagement() {
  const [activeTab, setActiveTab] = useState<'moderation' | 'all' | 'reports' | 'settings' | 'audit'>('moderation');
  
  // Data States
  const [videos, setVideos] = useState<PropertyVideo[]>([]);
  const [reports, setReports] = useState<VideoReport[]>([]);
  const [settings, setSettings] = useState<VideoPlatformSettings | null>(null);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    deactivated: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_review' | 'approved' | 'rejected' | 'deactivated'>('all');
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

  // Modals & Drawers
  const [previewVideo, setPreviewVideo] = useState<PropertyVideo | null>(null);
  const [rejectModalVideo, setRejectModalVideo] = useState<PropertyVideo | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteModalVideo, setDeleteModalVideo] = useState<PropertyVideo | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [statsModalVideo, setStatsModalVideo] = useState<PropertyVideo | null>(null);
  const [metadataModalVideo, setMetadataModalVideo] = useState<PropertyVideo | null>(null);
  const [editListingId, setEditListingId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [suspendModalUser, setSuspendModalUser] = useState<{ id: string; name: string } | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  // Settings Save State
  const [savingSettings, setSavingSettings] = useState(false);

  // Audit Logs (Real-time admin action logs)
  const [auditLogs, setAuditLogs] = useState<any[]>([
    {
      id: 'log_1',
      action: 'video_approve',
      targetId: 'vid_dha6_villa_101',
      admin: 'admin@pakizzle.com',
      details: 'Approved 1 Kanal Villa walkthrough with Shanakht™ verified title',
      timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
    },
    {
      id: 'log_2',
      action: 'video_featured_toggle',
      targetId: 'vid_isb_penthouse_102',
      admin: 'admin@pakizzle.com',
      details: 'Pinned Sector F-7/2 Penthouse to discovery feed top',
      timestamp: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
    }
  ]);

  // Load all videos & counts
  const loadVideos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await videoService.getAdminVideos({
        status: activeTab === 'moderation' ? 'pending_review' : statusFilter,
        search: searchQuery
      });
      setVideos(res.videos);
      setCounts(res.counts);
    } catch (e: any) {
      toast.error('Failed to load videos: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, searchQuery]);

  // Load reports
  const loadReports = useCallback(async () => {
    try {
      const list = await videoService.getVideoReports();
      setReports(list);
    } catch (e: any) {
      console.warn('Reports load fallback:', e);
    }
  }, []);

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      const cfg = await videoService.getPlatformSettings();
      setSettings(cfg);
    } catch (e: any) {
      console.warn('Settings load fallback:', e);
    }
  }, []);

  useEffect(() => {
    loadVideos();
    loadReports();
    loadSettings();
  }, [loadVideos, loadReports, loadSettings]);

  // 1. Approve Video
  const handleApprove = async (video: PropertyVideo) => {
    try {
      await videoService.approveVideo(video.id);
      toast.success(`Walkthrough approved and published to PakStories feed`);
      logLocalAction('video_approve', video.id, `Approved walkthrough: ${video.title}`);
      loadVideos();
    } catch (e: any) {
      toast.error(e.message || 'Failed to approve');
    }
  };

  // 2. Reject Video (Requires reason)
  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalVideo || !rejectReason.trim()) {
      toast.error('Rejection reason is strictly required');
      return;
    }

    try {
      await videoService.rejectVideo(rejectModalVideo.id, rejectReason.trim());
      toast.success('Video rejected with formal notice logged');
      logLocalAction('video_reject', rejectModalVideo.id, `Rejected reason: ${rejectReason}`);
      setRejectModalVideo(null);
      setRejectReason('');
      loadVideos();
    } catch (e: any) {
      toast.error(e.message || 'Failed to reject');
    }
  };

  // 3. Bulk Approve
  const handleBulkApprove = async () => {
    if (selectedVideoIds.length === 0) return;
    try {
      const res = await videoService.bulkApproveVideos(selectedVideoIds);
      toast.success(`Bulk approved ${res.approvedCount} video walkthroughs`);
      logLocalAction('video_bulk_approve', 'multiple', `Approved ${res.approvedCount} videos`);
      setSelectedVideoIds([]);
      loadVideos();
    } catch (e: any) {
      toast.error(e.message || 'Failed bulk approve');
    }
  };

  // 4. Activate / Deactivate Toggle
  const handleToggleStatus = async (video: PropertyVideo) => {
    const newStatus = video.status === 'approved' ? 'deactivated' : 'approved';
    try {
      await videoService.toggleVideoStatus(video.id, newStatus, 'Admin quick toggle');
      toast.success(`Video marked as ${newStatus}`);
      logLocalAction('video_status_toggle', video.id, `Status set to ${newStatus}`);
      loadVideos();
    } catch (e: any) {
      toast.error(e.message || 'Failed status toggle');
    }
  };

  // 5. Delete Permanent
  const handleDeleteConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteModalVideo || !deleteReason.trim()) {
      toast.error('Deletion reason is required for permanent audit trail');
      return;
    }

    try {
      await videoService.deleteVideo(deleteModalVideo.id, deleteReason.trim());
      toast.success('Video permanently removed');
      logLocalAction('video_delete', deleteModalVideo.id, `Deleted permanently: ${deleteReason}`);
      setDeleteModalVideo(null);
      setDeleteReason('');
      loadVideos();
    } catch (e: any) {
      toast.error(e.message || 'Failed deletion');
    }
  };

  // 6. Visibility Scope Toggle (Public vs Listing Only)
  const handleToggleScope = async (video: PropertyVideo) => {
    const newScope = video.visibilityScope === 'public' ? 'listing_only' : 'public';
    try {
      await videoService.setVideoScope(video.id, newScope);
      toast.success(`Visibility set to: ${newScope === 'listing_only' ? 'Listing Page Only' : 'Public Discovery Feed'}`);
      logLocalAction('video_scope_change', video.id, `Scope changed to ${newScope}`);
      loadVideos();
    } catch (e: any) {
      toast.error(e.message || 'Failed scope toggle');
    }
  };

  // 7. Manual Pin / Feature Toggle
  const handleToggleFeatured = async (video: PropertyVideo) => {
    try {
      await videoService.toggleFeatured(video.id, !video.isFeatured);
      toast.success(video.isFeatured ? 'Removed from featured pin' : 'Pinned as featured walkthrough at top of discovery feed');
      logLocalAction('video_featured_toggle', video.id, `Featured set to ${!video.isFeatured}`);
      loadVideos();
    } catch (e: any) {
      toast.error(e.message || 'Failed to toggle featured');
    }
  };

  // 8. Edit Metadata (Listing re-assignment & overlay captions)
  const handleMetadataSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metadataModalVideo) return;

    try {
      await videoService.updateVideoMetadata(metadataModalVideo.id, {
        listingId: editListingId,
        title: editTitle,
        caption: editCaption
      });
      toast.success('Metadata updated cleanly without requiring seller re-upload');
      logLocalAction('video_metadata_edit', metadataModalVideo.id, `Reassigned to listing: ${editListingId}`);
      setMetadataModalVideo(null);
      loadVideos();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update metadata');
    }
  };

  // 9. Account-Level Video Suspension
  const handleSuspendUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendModalUser || !suspendReason.trim()) {
      toast.error('Suspension reason is required');
      return;
    }

    try {
      await videoService.suspendCreatorVideoPrivilege(suspendModalUser.id, suspendReason.trim());
      toast.success(`Video upload privileges suspended for ${suspendModalUser.name}`);
      logLocalAction('video_creator_suspend', suspendModalUser.id, `Suspended: ${suspendReason}`);
      setSuspendModalUser(null);
      setSuspendReason('');
    } catch (e: any) {
      toast.error(e.message || 'Failed suspension');
    }
  };

  // 10. Platform Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSavingSettings(true);
      const updated = await videoService.updatePlatformSettings(settings);
      setSettings(updated);
      toast.success('Platform video configuration updated');
      logLocalAction('video_settings_update', 'platform', 'Updated constraints and ranking weights');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // 11. Report Resolution
  const handleReportAction = async (reportId: string, action: 'action_taken' | 'dismissed') => {
    try {
      await videoService.resolveVideoReport(reportId, action, 'Handled by administration');
      toast.success(`Report marked as ${action}`);
      logLocalAction('video_report_resolve', reportId, `Report resolved: ${action}`);
      loadReports();
    } catch (e: any) {
      toast.error(e.message || 'Failed report action');
    }
  };

  const logLocalAction = (action: string, targetId: string, details: string) => {
    const entry = {
      id: `log_${Date.now()}`,
      action,
      targetId,
      admin: 'admin@pakizzle.com',
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-apple-border dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-[#8A3DB8] flex items-center justify-center text-white shadow-md">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-apple-text dark:text-white flex items-center gap-2">
                <span>PakStories™ Video Control Center</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-apple-green/10 text-apple-green dark:text-apple-green font-bold border border-apple-green/20">
                  Phase 1 Active
                </span>
              </h1>
              <p className="text-xs text-apple-text-muted dark:text-[#8E8E93]">
                Full lifecycle governance: moderation queue, per-video controls, account-level privileges & ranking parameters
              </p>
            </div>
          </div>
        </div>

        {/* Global Feature Flag Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-apple-gray dark:bg-white/5 border border-apple-border dark:border-white/10 text-xs font-bold">
            <span className={`w-2 h-2 rounded-full ${settings?.featureEnabled ? 'bg-apple-green animate-pulse' : 'bg-apple-red'}`} />
            <span>Feature Status: {settings?.featureEnabled ? 'Broadcast Online' : 'Paused Platform-wide'}</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div 
          onClick={() => { setActiveTab('moderation'); setStatusFilter('all'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'moderation' 
              ? 'bg-[var(--accent)]/10 border-[var(--accent)] shadow-sm' 
              : 'bg-white dark:bg-[#1A1A1D] border-apple-border dark:border-white/10 hover:border-apple-border'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-apple-text-muted mb-1">
            <span>Pending Review</span>
            <AlertTriangle className="w-4 h-4 text-gold-decoration" />
          </div>
          <div className="text-2xl font-black text-gold-decoration">{counts.pending}</div>
          <span className="text-[10px] text-apple-text-muted">Requires review</span>
        </div>

        <div 
          onClick={() => { setActiveTab('all'); setStatusFilter('approved'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'all' && statusFilter === 'approved'
              ? 'bg-[var(--accent)]/10 border-[var(--accent)] shadow-sm' 
              : 'bg-white dark:bg-[#1A1A1D] border-apple-border dark:border-white/10 hover:border-apple-border'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-apple-text-muted mb-1">
            <span>Live Approved</span>
            <CheckCircle2 className="w-4 h-4 text-apple-green" />
          </div>
          <div className="text-2xl font-black text-apple-green">{counts.approved}</div>
          <span className="text-[10px] text-apple-text-muted">Publicly visible</span>
        </div>

        <div 
          onClick={() => { setActiveTab('all'); setStatusFilter('deactivated'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'all' && statusFilter === 'deactivated'
              ? 'bg-[var(--accent)]/10 border-[var(--accent)] shadow-sm' 
              : 'bg-white dark:bg-[#1A1A1D] border-apple-border dark:border-white/10 hover:border-apple-border'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-apple-text-muted mb-1">
            <span>Deactivated</span>
            <Lock className="w-4 h-4 text-apple-text-muted" />
          </div>
          <div className="text-2xl font-black text-apple-text-muted dark:text-apple-text-muted">{counts.deactivated}</div>
          <span className="text-[10px] text-apple-text-muted">Pulled from view</span>
        </div>

        <div 
          onClick={() => { setActiveTab('reports'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-[var(--accent)]/10 border-[var(--accent)] shadow-sm' 
              : 'bg-white dark:bg-[#1A1A1D] border-apple-border dark:border-white/10 hover:border-apple-border'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-apple-text-muted mb-1">
            <span>Flagged Reports</span>
            <ShieldAlert className="w-4 h-4 text-apple-red" />
          </div>
          <div className="text-2xl font-black text-apple-red">{reports.filter(r => r.status === 'pending').length}</div>
          <span className="text-[10px] text-apple-text-muted">User flagged</span>
        </div>

        <div 
          onClick={() => { setActiveTab('all'); setStatusFilter('all'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'all' && statusFilter === 'all'
              ? 'bg-[var(--accent)]/10 border-[var(--accent)] shadow-sm' 
              : 'bg-white dark:bg-[#1A1A1D] border-apple-border dark:border-white/10 hover:border-apple-border'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-apple-text-muted mb-1">
            <span>Total Catalog</span>
            <Layers className="w-4 h-4 text-[var(--accent)] dark:text-[#C9A227]" />
          </div>
          <div className="text-2xl font-black text-apple-text dark:text-white">{counts.total}</div>
          <span className="text-[10px] text-apple-text-muted">All walkthroughs</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-apple-border dark:border-white/10 overflow-x-auto pb-1">
        {[
          { id: 'moderation', label: `Moderation Queue (${counts.pending})`, icon: AlertTriangle },
          { id: 'all', label: 'All Videos & Per-Video Controls', icon: Film },
          { id: 'reports', label: `Video Reports (${reports.filter(r => r.status === 'pending').length})`, icon: ShieldAlert },
          { id: 'settings', label: 'Platform Constraints & Ranking Formula', icon: SlidersHorizontal },
          { id: 'audit', label: 'Admin Action Audit Trail', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-apple-text-muted dark:text-[#8E8E93] hover:text-apple-text dark:hover:text-white hover:bg-apple-gray dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1 & 2: MODERATION QUEUE & FULL VIDEOS TABLE */}
      {(activeTab === 'moderation' || activeTab === 'all') && (
        <div className="space-y-4">
          {/* Search, Filter & Bulk Actions Bar */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-apple-border dark:border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-apple-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, listing ref, creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10 text-xs font-semibold outline-none focus:border-[var(--accent)]"
                />
              </div>

              {activeTab === 'all' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10 text-xs font-bold text-apple-text-muted dark:text-white outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="approved">Approved / Live</option>
                  <option value="rejected">Rejected</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              )}
            </div>

            {/* Bulk Action Controls */}
            {selectedVideoIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--accent)] dark:text-[#C9A227]">
                  {selectedVideoIds.length} selected
                </span>
                <button
                  onClick={handleBulkApprove}
                  className="px-3.5 py-1.5 rounded-xl bg-apple-green hover:bg-apple-green text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bulk Approve</span>
                </button>
              </div>
            )}
          </div>

          {/* Videos Table */}
          {loading ? (
            <div className="p-16 text-center text-apple-text-muted flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[var(--accent)]" />
              <span className="text-xs font-semibold">Loading video catalog...</span>
            </div>
          ) : videos.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-[#1A1A1D] rounded-2xl border border-apple-border dark:border-white/10">
              <Film className="w-10 h-10 text-apple-text-muted mx-auto mb-2" />
              <h4 className="text-sm font-bold text-apple-surface dark:text-white">
                {activeTab === 'moderation' ? 'No pending videos in moderation queue' : 'No walkthrough videos match your filter'}
              </h4>
              <p className="text-xs text-apple-text-muted mt-1">All verified submissions have been processed.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1A1A1D] rounded-2xl border border-apple-border dark:border-white/10 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-apple-surface dark:bg-white/5 border-b border-apple-border dark:border-white/10 text-apple-text-muted dark:text-[#8E8E93] font-black uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedVideoIds.length === videos.length && videos.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedVideoIds(videos.map(v => v.id));
                            else setSelectedVideoIds([]);
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="p-3.5">Video & Details</th>
                      <th className="p-3.5">Attached Listing</th>
                      <th className="p-3.5">Creator & Shanakht™</th>
                      <th className="p-3.5">AI Pre-screen</th>
                      <th className="p-3.5">Scope & Pin</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">CTR / Views</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-apple-gray dark:divide-white/5 font-medium">
                    {videos.map(video => {
                      const isSelected = selectedVideoIds.includes(video.id);
                      return (
                        <tr key={video.id} className="hover:bg-apple-surface/70 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedVideoIds([...selectedVideoIds, video.id]);
                                else setSelectedVideoIds(selectedVideoIds.filter(id => id !== video.id));
                              }}
                              className="rounded"
                            />
                          </td>

                          {/* Video Thumbnail + Preview trigger */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => setPreviewVideo(video)}
                                className="relative w-12 h-16 rounded-xl overflow-hidden bg-black shrink-0 cursor-pointer group shadow-sm"
                              >
                                <img
                                  src={video.thumbnailUrl}
                                  alt={video.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <Play className="w-4 h-4 text-white fill-white" />
                                </div>
                                <span className="absolute bottom-1 right-1 text-[8px] font-black bg-black/70 text-white px-1 rounded">
                                  {video.duration}s
                                </span>
                              </div>

                              <div className="max-w-[200px]">
                                <div className="font-extrabold text-apple-text dark:text-white truncate">
                                  {video.title}
                                </div>
                                <div className="text-[11px] text-apple-text-muted truncate">
                                  {video.overlaySpec?.priceText} · {video.overlaySpec?.locationText}
                                </div>
                                <div className="text-[10px] text-apple-text-muted mt-0.5">
                                  {video.format.toUpperCase()} · 9:16 vertical · {(video.fileSizeBytes / (1024 * 1024)).toFixed(1)}MB
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Attached Listing */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                              <div className="truncate max-w-[140px]">
                                <span className="font-bold text-apple-surface dark:text-white block truncate">
                                  {video.listingTitle || 'Listing'}
                                </span>
                                <span className="text-[10px] text-[var(--accent)] dark:text-[#C9A227] font-semibold">
                                  Ref #{video.listingReferenceId || video.listingId}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Creator & Verification */}
                          <td className="p-3.5">
                            <div>
                              <div className="font-bold text-apple-surface dark:text-white truncate max-w-[130px]">
                                {video.creatorName}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  <span>{video.creatorBadge.toUpperCase()}</span>
                                </span>
                                <button
                                  onClick={() => setSuspendModalUser({ id: video.creatorId, name: video.creatorName })}
                                  className="text-[9px] text-red-500 hover:underline"
                                  title="Suspend video upload rights for this user"
                                >
                                  Suspend
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* AI Pre-Screening Result */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1 text-[11px]">
                              {video.aiPrescreen?.passed ? (
                                <span className="px-2 py-0.5 rounded-full bg-apple-green/10 text-apple-green dark:text-apple-green font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Genuine ({(video.aiPrescreen.confidence * 100).toFixed(0)}%)</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-apple-red/10 text-apple-red font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Flagged</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Scope & Pin */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              {/* Scope Toggle Button */}
                              <button
                                onClick={() => handleToggleScope(video)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                                  video.visibilityScope === 'public'
                                    ? 'bg-apple-gray dark:bg-white/5 border-apple-border dark:border-white/10 text-apple-text-muted dark:text-apple-border'
                                    : 'bg-gold-decoration/10 border-gold-decoration/30 text-gold-decoration'
                                }`}
                                title="Click to toggle between Public discovery feed and Listing-only"
                              >
                                {video.visibilityScope === 'public' ? 'Public Feed' : 'Listing Only'}
                              </button>

                              {/* Featured Pin Toggle */}
                              <button
                                onClick={() => handleToggleFeatured(video)}
                                className={`p-1 rounded-lg border ${
                                  video.isFeatured
                                    ? 'bg-gold-decoration text-white border-gold-decoration shadow-xs'
                                    : 'text-apple-text-muted hover:text-apple-text-muted dark:hover:text-white border-apple-border dark:border-white/10'
                                }`}
                                title={video.isFeatured ? 'Pinned featured at top' : 'Click to pin featured'}
                              >
                                <Pin className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              video.status === 'approved'
                                ? 'bg-apple-green/10 text-apple-green dark:text-apple-green border border-apple-green/20'
                                : video.status === 'pending_review'
                                ? 'bg-gold-decoration/10 text-gold-decoration dark:text-gold-decoration border border-gold-decoration/20 animate-pulse'
                                : video.status === 'rejected'
                                ? 'bg-apple-red/10 text-apple-red dark:text-rose-400 border border-apple-red/20'
                                : 'bg-apple-text-muted/10 text-apple-text-muted border border-apple-text-muted/20'
                            }`}>
                              {video.status.replace('_', ' ')}
                            </span>
                          </td>

                          {/* Engagement & CTR */}
                          <td className="p-3.5">
                            <div>
                              <div className="font-extrabold text-apple-surface dark:text-white flex items-center gap-1">
                                <MousePointerClick className="w-3 h-3 text-[var(--accent)]" />
                                <span>{video.stats?.listingClicksCount || 0} clicks</span>
                              </div>
                              <span className="text-[10px] text-apple-text-muted">
                                {video.stats?.viewsCount || 0} views ({video.stats?.completionRate || 0}% compl.)
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {video.status === 'pending_review' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(video)}
                                    className="p-1.5 rounded-lg bg-apple-green hover:bg-apple-green text-white"
                                    title="Approve walkthrough"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectModalVideo(video);
                                      setRejectReason('');
                                    }}
                                    className="p-1.5 rounded-lg bg-apple-red hover:bg-rose-700 text-white"
                                    title="Reject walkthrough (requires reason)"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              {/* Activate/Deactivate Toggle */}
                              <button
                                onClick={() => handleToggleStatus(video)}
                                className="p-1.5 rounded-lg border border-apple-border dark:border-white/10 text-apple-text-muted dark:text-apple-border hover:bg-apple-gray dark:hover:bg-white/5"
                                title={video.status === 'approved' ? 'Deactivate (pull from view)' : 'Re-activate'}
                              >
                                {video.status === 'approved' ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                              </button>

                              {/* Stats Modal */}
                              <button
                                onClick={() => setStatsModalVideo(video)}
                                className="p-1.5 rounded-lg border border-apple-border dark:border-white/10 text-apple-text-muted dark:text-apple-border hover:bg-apple-gray dark:hover:bg-white/5"
                                title="View detailed engagement stats & CTR"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Metadata */}
                              <button
                                onClick={() => {
                                  setMetadataModalVideo(video);
                                  setEditListingId(video.listingId);
                                  setEditTitle(video.title);
                                  setEditCaption(video.caption || '');
                                }}
                                className="p-1.5 rounded-lg border border-apple-border dark:border-white/10 text-apple-text-muted dark:text-apple-border hover:bg-apple-gray dark:hover:bg-white/5"
                                title="Edit metadata & attached listing"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Permanent Delete */}
                              <button
                                onClick={() => {
                                  setDeleteModalVideo(video);
                                  setDeleteReason('');
                                }}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/30 text-apple-red hover:bg-apple-red/10 dark:hover:bg-rose-950/20"
                                title="Permanently delete walkthrough"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER REPORTS QUEUE */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-apple-border dark:border-white/10">
            <h3 className="text-sm font-bold text-apple-text dark:text-white mb-1">
              Video Community Reports Queue
            </h3>
            <p className="text-xs text-apple-text-muted">
              Users can flag misleading walkthroughs, unapproved society details, or spam watermarks.
            </p>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#1A1A1D] rounded-2xl border border-apple-border dark:border-white/10">
              <ShieldCheck className="w-10 h-10 text-apple-green mx-auto mb-2" />
              <h4 className="text-sm font-bold text-apple-surface dark:text-white">Clean Queue</h4>
              <p className="text-xs text-apple-text-muted">No unresolved video reports.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(rep => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-apple-border dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-apple-red/10 text-apple-red dark:text-rose-400">
                        {rep.reason.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-apple-surface dark:text-white">
                        Reported Video: #{rep.videoId}
                      </span>
                      <span className="text-[10px] text-apple-text-muted">
                        {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-apple-text-muted dark:text-apple-border">
                      "{rep.description}"
                    </p>
                    <span className="text-[11px] text-apple-text-muted">
                      Reporter: {rep.reporterEmail || 'Anonymous buyer'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReportAction(rep.id, 'action_taken')}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                    >
                      Deactivate Video & Resolve
                    </button>
                    <button
                      onClick={() => handleReportAction(rep.id, 'dismissed')}
                      className="px-3.5 py-1.5 rounded-xl bg-apple-gray dark:bg-white/10 hover:bg-apple-border text-xs font-bold text-apple-text-muted dark:text-white"
                    >
                      Dismiss Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PLATFORM CONSTRAINTS & RANKING FORMULA */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
          {/* Global Feature Flag Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-apple-border dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-apple-text dark:text-white">
                  Platform-wide Feature Switch
                </h3>
                <p className="text-xs text-apple-text-muted">
                  Instantly toggle PakStories on or off without redeploying code.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.featureEnabled}
                  onChange={(e) => setSettings({ ...settings, featureEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-apple-border peer-focus:outline-none rounded-full peer dark:bg-apple-text-muted peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-apple-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]" />
              </label>
            </div>
          </div>

          {/* Constraints Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-apple-border dark:border-white/10 space-y-4">
            <h3 className="text-sm font-extrabold text-apple-text dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--accent)]" />
              <span>Upload Constraints & Security Guardrails</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-apple-text-muted dark:text-[#8E8E93] block mb-1">
                  Max Video Duration (seconds)
                </label>
                <input
                  type="number"
                  min="30"
                  max="180"
                  value={settings.maxDurationSeconds}
                  onChange={(e) => setSettings({ ...settings, maxDurationSeconds: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10 text-xs font-bold"
                />
                <span className="text-[10px] text-apple-text-muted mt-1 block">Default: 90 seconds</span>
              </div>

              <div>
                <label className="text-xs font-bold text-apple-text-muted dark:text-[#8E8E93] block mb-1">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  min="20"
                  max="200"
                  value={settings.maxFileSizeMb}
                  onChange={(e) => setSettings({ ...settings, maxFileSizeMb: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10 text-xs font-bold"
                />
                <span className="text-[10px] text-apple-text-muted mt-1 block">Protects bandwidth on slow connections</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-apple-gray dark:border-white/5">
              <div>
                <span className="text-xs font-bold text-apple-surface dark:text-white block">
                  AI Pre-Screening Requirement
                </span>
                <span className="text-[11px] text-apple-text-muted">
                  Pre-scans property walkthrough elements before admin review
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.aiPrescreenRequired}
                onChange={(e) => setSettings({ ...settings, aiPrescreenRequired: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--accent)]"
              />
            </div>
          </div>

          {/* Explainable Ranking Formula Tuning Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-apple-border dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-apple-text dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#F0A830]" />
                  <span>Explainable Engagement Ranking Formula Weights</span>
                </h3>
                <p className="text-xs text-apple-text-muted">
                  Tuning parameters for the Phase 1 discovery feed sort score.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[var(--accent)] dark:text-[#C9A227]">
                Total: {(
                  settings.rankingWeights.recencyWeight + 
                  settings.rankingWeights.engagementWeight + 
                  settings.rankingWeights.ctrWeight
                ).toFixed(2)} / 1.00
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Recency Weight ({Math.round(settings.rankingWeights.recencyWeight * 100)}%)</span>
                  <span className="text-apple-text-muted">Promotes newest property walkthroughs</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={settings.rankingWeights.recencyWeight}
                  onChange={(e) => setSettings({
                    ...settings,
                    rankingWeights: { ...settings.rankingWeights, recencyWeight: Number(e.target.value) }
                  })}
                  className="w-full accent-[var(--accent)]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Engagement Weight ({Math.round(settings.rankingWeights.engagementWeight * 100)}%)</span>
                  <span className="text-apple-text-muted">Likes, shares, and watch completion rate</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={settings.rankingWeights.engagementWeight}
                  onChange={(e) => setSettings({
                    ...settings,
                    rankingWeights: { ...settings.rankingWeights, engagementWeight: Number(e.target.value) }
                  })}
                  className="w-full accent-[var(--accent)]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Click-Through Rate (CTR) Weight ({Math.round(settings.rankingWeights.ctrWeight * 100)}%)</span>
                  <span className="text-apple-text-muted">Direct inquiries driven to real property listing</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.6"
                  step="0.05"
                  value={settings.rankingWeights.ctrWeight}
                  onChange={(e) => setSettings({
                    ...settings,
                    rankingWeights: { ...settings.rankingWeights, ctrWeight: Number(e.target.value) }
                  })}
                  className="w-full accent-[var(--accent)]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Admin Featured Pin Bonus (+{settings.rankingWeights.featuredBoost} pts)</span>
                  <span className="text-apple-text-muted">Score boost granted to manually pinned walkthroughs</span>
                </div>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={settings.rankingWeights.featuredBoost}
                  onChange={(e) => setSettings({
                    ...settings,
                    rankingWeights: { ...settings.rankingWeights, featuredBoost: Number(e.target.value) }
                  })}
                  className="w-32 px-3 py-1.5 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="px-6 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[#48206C] text-white text-xs font-extrabold shadow-md flex items-center gap-2"
          >
            {savingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Save Platform Configuration</span>
          </button>
        </form>
      )}

      {/* TAB 5: AUDIT TRAIL LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-apple-border dark:border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-apple-text dark:text-white">
                Admin Action Audit Trail (admin_actions_logs)
              </h3>
              <p className="text-xs text-apple-text-muted">
                Every moderation approval, rejection, deactivation, delete, and parameter update is logged immutably.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-apple-green/10 text-apple-green border border-apple-green/20">
              Zero Exceptions Policy
            </span>
          </div>

          <div className="bg-white dark:bg-[#1A1A1D] rounded-2xl border border-apple-border dark:border-white/10 overflow-hidden shadow-xs">
            <div className="divide-y divide-apple-gray dark:divide-white/5">
              {auditLogs.map(log => (
                <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[var(--accent)]/10 text-[var(--accent)] dark:bg-[#C9A227]/15 dark:text-[#C9A227]">
                        {log.action}
                      </span>
                      <span className="font-bold text-apple-surface dark:text-white">
                        Target: {log.targetId}
                      </span>
                    </div>
                    <p className="text-apple-text-muted dark:text-apple-border">
                      {log.details}
                    </p>
                  </div>
                  <div className="text-right text-apple-text-muted font-mono text-[10px]">
                    <div>{log.admin}</div>
                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: INLINE VIDEO PREVIEW ================= */}
      <AnimatePresence>
        {previewVideo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewVideo(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm h-[75vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col z-10"
            >
              <button
                onClick={() => setPreviewVideo(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
              <video
                src={previewVideo.videoUrl}
                controls
                autoPlay
                playsInline
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src && !target.src.includes('/videos/walkthrough_')) {
                    target.src = '/videos/walkthrough_villa.mp4';
                  }
                }}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: REJECT WITH REQUIRED REASON ================= */}
      <AnimatePresence>
        {rejectModalVideo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectModalVideo(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-[var(--bg-raised)] rounded-3xl p-6 border border-apple-border dark:border-white/10 shadow-2xl z-10"
            >
              <div className="flex items-center gap-2 mb-3 text-apple-red font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>Reject Video Walkthrough</span>
              </div>
              <p className="text-xs text-apple-text-muted dark:text-[#8E8E93] mb-4">
                Platform policy strictly mandates a formal rejection reason before turning down any verified seller submission.
              </p>

              <form onSubmit={handleRejectConfirm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-apple-text-muted dark:text-apple-border mb-1">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="E.g., Society name mentioned in audio does not match listing registry; video quality below 480p standard; watermark of another portal present."
                    className="w-full px-3 py-2 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10 text-xs outline-none focus:border-apple-red"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalVideo(null)}
                    className="px-4 py-2 rounded-xl bg-apple-gray dark:bg-white/10 text-xs font-bold hover:bg-apple-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-apple-red hover:bg-rose-700 text-white text-xs font-bold"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: DETAILED STATS & CTR ================= */}
      <AnimatePresence>
        {statsModalVideo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatsModalVideo(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-[var(--bg-raised)] rounded-3xl p-6 border border-apple-border dark:border-white/10 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-apple-border dark:border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[var(--accent)] dark:text-[#C9A227]" />
                  <h3 className="text-sm font-bold text-apple-text dark:text-white">
                    Engagement & Inquiries Analytics: #{statsModalVideo.id}
                  </h3>
                </div>
                <button onClick={() => setStatsModalVideo(null)} className="text-apple-text-muted hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10">
                  <span className="text-[10px] font-bold text-apple-text-muted block mb-1">Click-Through Rate (CTR)</span>
                  <div className="text-xl font-black text-[var(--accent)] dark:text-[#C9A227]">
                    {statsModalVideo.stats?.viewsCount ? ((statsModalVideo.stats.listingClicksCount / statsModalVideo.stats.viewsCount) * 100).toFixed(1) : 0}%
                  </div>
                  <span className="text-[10px] text-apple-text-muted">{statsModalVideo.stats?.listingClicksCount || 0} direct inquiries</span>
                </div>

                <div className="p-3 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10">
                  <span className="text-[10px] font-bold text-apple-text-muted block mb-1">Completion Rate</span>
                  <div className="text-xl font-black text-apple-green">
                    {statsModalVideo.stats?.completionRate || 0}%
                  </div>
                  <span className="text-[10px] text-apple-text-muted">{Math.round((statsModalVideo.stats?.watchTimeTotalSeconds || 0) / 60)} mins watched</span>
                </div>

                <div className="p-3 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10">
                  <span className="text-[10px] font-bold text-apple-text-muted block mb-1">Total Views</span>
                  <div className="text-xl font-black text-apple-text dark:text-white">
                    {statsModalVideo.stats?.viewsCount || 0}
                  </div>
                  <span className="text-[10px] text-apple-text-muted">{statsModalVideo.stats?.uniqueViewersCount || 0} unique viewers</span>
                </div>

                <div className="p-3 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10">
                  <span className="text-[10px] font-bold text-apple-text-muted block mb-1">Likes & Shares</span>
                  <div className="text-xl font-black text-apple-text dark:text-white">
                    {statsModalVideo.stats?.likesCount || 0} / {statsModalVideo.stats?.sharesCount || 0}
                  </div>
                  <span className="text-[10px] text-apple-text-muted">{statsModalVideo.stats?.savesCount || 0} bookmarks</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-600 dark:text-blue-300">
                💡 <strong>Business Insight:</strong> Click-through rate (CTR) is prioritized at 20% weight in the discovery feed algorithm to ensure video walkthroughs convert into genuine listing inquiries.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: EDIT METADATA & REASSIGN LISTING ================= */}
      <AnimatePresence>
        {metadataModalVideo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMetadataModalVideo(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-[var(--bg-raised)] rounded-3xl p-6 border border-apple-border dark:border-white/10 shadow-2xl z-10"
            >
              <div className="flex items-center gap-2 mb-3 text-apple-text dark:text-white font-bold text-sm">
                <Edit3 className="w-5 h-5 text-[var(--accent)]" />
                <span>Edit Metadata & Reassign Listing</span>
              </div>

              <form onSubmit={handleMetadataSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-apple-text-muted dark:text-apple-border mb-1">
                    Attached Listing ID
                  </label>
                  <input
                    type="text"
                    required
                    value={editListingId}
                    onChange={(e) => setEditListingId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10 text-xs font-bold"
                  />
                  <span className="text-[10px] text-apple-text-muted">Reassigning fixes any uploader attachment errors</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-apple-text-muted dark:text-apple-border mb-1">
                    Display Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-apple-text-muted dark:text-apple-border mb-1">
                    Caption Text
                  </label>
                  <textarea
                    rows={2}
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMetadataModalVideo(null)}
                    className="px-4 py-2 rounded-xl bg-apple-gray dark:bg-white/10 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[#48206C] text-white text-xs font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: SUSPEND USER PRIVILEGE ================= */}
      <AnimatePresence>
        {suspendModalUser && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuspendModalUser(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-[var(--bg-raised)] rounded-3xl p-6 border border-apple-border dark:border-white/10 shadow-2xl z-10"
            >
              <div className="flex items-center gap-2 mb-3 text-red-500 font-bold text-sm">
                <UserX className="w-5 h-5" />
                <span>Suspend Video Upload Privilege</span>
              </div>
              <p className="text-xs text-apple-text-muted dark:text-[#8E8E93] mb-4">
                This suspends video creation rights for <strong>{suspendModalUser.name}</strong> while allowing their normal verified listings to remain active.
              </p>

              <form onSubmit={handleSuspendUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-apple-text-muted dark:text-apple-border mb-1">
                    Suspension Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="E.g., Repeated upload of low-resolution non-walkthrough videos."
                    className="w-full px-3 py-2 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10 text-xs outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSuspendModalUser(null)}
                    className="px-4 py-2 rounded-xl bg-apple-gray dark:bg-white/10 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                  >
                    Suspend Privilege
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: PERMANENT DELETE CONFIRM ================= */}
      <AnimatePresence>
        {deleteModalVideo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalVideo(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-[var(--bg-raised)] rounded-3xl p-6 border border-apple-border dark:border-white/10 shadow-2xl z-10"
            >
              <div className="flex items-center gap-2 mb-3 text-red-600 font-bold text-sm">
                <Trash2 className="w-5 h-5" />
                <span>Confirm Permanent Removal</span>
              </div>
              <p className="text-xs text-apple-text-muted mb-4">
                Permanent deletion cannot be undone. Please specify a reason for the audit trail.
              </p>

              <form onSubmit={handleDeleteConfirm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-apple-text-muted dark:text-apple-border mb-1">
                    Deletion Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Reason for permanent deletion..."
                    className="w-full px-3 py-2 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteModalVideo(null)}
                    className="px-4 py-2 rounded-xl bg-apple-gray dark:bg-white/10 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                  >
                    Delete Permanently
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
