import React, { useState, useRef } from "react";
import { 
  Camera, 
  UploadCloud, 
  Trash2, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";
import { ListingWizardState, UploadedPhoto } from "../types";

interface StepPhotosProps {
  state: ListingWizardState;
  updateState: (updates: Partial<ListingWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepPhotos: React.FC<StepPhotosProps> = ({
  state,
  updateState,
  onNext,
  onBack,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload handler for multiple selected files
  const handleFiles = async (files: FileList | File[]) => {
    const validFiles: File[] = [];
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    setUploadError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedMimes.includes(file.type.toLowerCase())) {
        toast.error(`"${file.name}" rejected: Only JPG, PNG, and WebP are supported.`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`"${file.name}" rejected: Exceeds 10MB maximum limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create optimistic staging items
    const newStagedPhotos: UploadedPhoto[] = validFiles.map((file, idx) => ({
      id: `temp_${Date.now()}_${idx}`,
      url: URL.createObjectURL(file), // Local preview while uploading
      isCover: state.photos.length === 0 && idx === 0,
      status: "uploading",
      progress: 15,
      fileName: file.name,
    }));

    const updatedList = [...state.photos, ...newStagedPhotos];
    updateState({ photos: updatedList });

    // Upload each file individually to server-side Cloudinary / EXIF stripping pipeline
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const stagedId = newStagedPhotos[i].id;
      const formData = new FormData();
      formData.append("photo", file);

      try {
        // Simulate progressive upload ticks for responsive UX
        const progressInterval = setInterval(() => {
          updateState({
            photos: state.photos.map((p) =>
              p.id === stagedId && p.progress < 90
                ? { ...p, progress: p.progress + 15 }
                : p
            ),
          });
        }, 120);

        const response = await fetch("/api/listings/upload-photo", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error("Server rejected image processing");
        }

        const data = await response.json();

        // Update photo status with verified remote URL
        updateState({
          photos: state.photos.map((p) =>
            p.id === stagedId
              ? {
                  ...p,
                  url: data.url,
                  publicId: data.publicId,
                  status: "complete",
                  progress: 100,
                }
              : p
          ),
        });

        toast.success(`"${file.name}" uploaded & EXIF metadata sanitized`);
      } catch (err: any) {
        console.error("Upload error:", err);
        updateState({
          photos: state.photos.map((p) =>
            p.id === stagedId
              ? {
                  ...p,
                  status: "error",
                  errorMessage: "Upload failed. Click to retry.",
                }
              : p
          ),
        });
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = state.photos.filter((p) => p.id !== id);
    // If we removed the cover, appoint the first remaining photo as cover
    if (filtered.length > 0 && !filtered.some((p) => p.isCover)) {
      filtered[0].isCover = true;
    }
    updateState({ photos: filtered });
  };

  const handleSetCover = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = state.photos.map((p) => ({
      ...p,
      isCover: p.id === id,
    }));
    updateState({ photos: updated });
    toast.info("Cover photo updated for live preview card");
  };

  const handleContinue = () => {
    if (state.photos.length === 0) {
      setUploadError("Please upload at least 1 photo to publish your listing.");
      return;
    }
    const hasUploading = state.photos.some((p) => p.status === "uploading");
    if (hasUploading) {
      toast.warning("Please wait for all photos to finish uploading.");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-apple-text tracking-tight mb-2">
          Property Visuals & Photography
        </h2>
        <p className="text-sm text-apple-text-muted leading-relaxed">
          High-resolution photos increase buyer inquiries by over 240%. GPS and camera EXIF metadata are stripped automatically for privacy.
        </p>
      </div>

      {/* 1. Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3",
          isDragging
            ? "border-[#5B2A86] bg-[#5B2A86]/10 scale-[1.01]"
            : "border-apple-border/60 hover:border-[#5B2A86]/60 bg-white/40 dark:bg-white/5 hover:bg-[#5B2A86]/5"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-[#5B2A86]/10 dark:bg-white/10 flex items-center justify-center text-[#5B2A86] dark:text-[#FAF3E6] shadow-sm mb-1">
          <UploadCloud className="w-8 h-8 stroke-[1.8]" />
        </div>

        <div>
          <span className="text-base font-bold text-apple-text block">
            Click to upload or drag & drop photos here
          </span>
          <span className="text-xs text-apple-text-muted mt-1 block">
            JPG, PNG, WebP up to 10MB each (Minimum 5 photos recommended for max LQI score)
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="h-10 px-5 rounded-full pakizzle-button-primary text-xs font-bold shadow-md cursor-pointer mt-2"
        >
          Select Photos from Device
        </button>
      </div>

      {uploadError && (
        <p className="text-xs font-semibold text-[#D93A45] flex items-center gap-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {uploadError}
        </p>
      )}

      {/* 2. Photo Thumbnail Grid */}
      {state.photos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
              Uploaded Gallery ({state.photos.length} Photos)
            </label>
            <span className="text-xs text-[#5B2A86] dark:text-[#F0A830] font-semibold">
              First photo serves as cover image
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {state.photos.map((photo, index) => {
              const isCover = photo.isCover || index === 0;

              return (
                <div
                  key={photo.id}
                  className={cn(
                    "group relative aspect-[4/3] rounded-2xl overflow-hidden border bg-black/5 dark:bg-white/5 transition-all shadow-sm",
                    isCover
                      ? "ring-2 ring-[#5B2A86] dark:ring-[#C9A227] border-transparent"
                      : "border-apple-border/40 hover:border-apple-border"
                  )}
                >
                  <img
                    src={photo.url}
                    alt={`Listing photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Uploading progress overlay */}
                  {photo.status === "uploading" && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#F0A830] mb-2" />
                      <span className="text-[10px] font-mono font-bold">
                        {photo.progress}%
                      </span>
                    </div>
                  )}

                  {/* Error state overlay */}
                  {photo.status === "error" && (
                    <div className="absolute inset-0 bg-[#D93A45]/85 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2 text-center">
                      <AlertCircle className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-semibold">Upload Failed</span>
                    </div>
                  )}

                  {/* Cover Photo Badge */}
                  {isCover && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#5B2A86] text-white text-[9px] font-bold shadow-md">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>Cover</span>
                    </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => handleRemovePhoto(photo.id, e)}
                        className="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {!isCover && photo.status === "complete" && (
                      <button
                        type="button"
                        onClick={(e) => handleSetCover(photo.id, e)}
                        className="w-full py-1 rounded-lg bg-white/90 dark:bg-black/90 text-apple-text text-[10px] font-bold hover:bg-white shadow-sm cursor-pointer"
                      >
                        Set as Cover
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick Add More Tile */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/3] rounded-2xl border-2 border-dashed border-apple-border/50 hover:border-[#5B2A86] flex flex-col items-center justify-center gap-1.5 text-apple-text-muted hover:text-[#5B2A86] dark:hover:text-[#FAF3E6] bg-black/[0.02] hover:bg-[#5B2A86]/5 transition-all cursor-pointer"
            >
              <Plus className="w-6 h-6" />
              <span className="text-[11px] font-bold">Add More</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Photo Quality Guidelines */}
      <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-apple-border/30 text-xs space-y-1.5 text-apple-text-muted">
        <span className="font-bold text-apple-text block mb-1">
          Pro Tips for Maximum Buyer Engagement:
        </span>
        <p>• Include front architectural elevation, master bedroom, main salon, and kitchen.</p>
        <p>• Daytime photography with natural lighting receives 3x higher inquiries.</p>
        <p>• Avoid screenshots with third-party watermarks (stolen photos trigger fraud quarantine).</p>
      </div>

      {/* Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-6 rounded-full border border-apple-border hover:bg-black/5 dark:hover:bg-white/5 font-semibold text-xs text-apple-text transition-all cursor-pointer"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="h-12 px-8 rounded-full pakizzle-button-primary font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          Continue to Pricing →
        </button>
      </div>
    </div>
  );
};

export default StepPhotos;
