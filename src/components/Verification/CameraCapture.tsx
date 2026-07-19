import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { verifyIdentityDocument, verifyBusinessDocument } from '../../services/geminiService';

interface CameraCaptureProps {
  label: string;
  expectedName: string;
  type: 'identity' | 'business';
  onVerified: (data: any) => void;
  onSideComplete?: (side: 'front' | 'back') => void;
}

export default function CameraCapture({ label, expectedName, type, onVerified, onSideComplete }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'matched' | 'correction_needed'>('idle');
  const [aiLog, setAiLog] = useState<string[]>([]);
  const [isFocusing, setIsFocusing] = useState(false);

  const captureStreamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (captureStreamRef.current) {
      captureStreamRef.current.getTracks().forEach(track => track.stop());
      captureStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
  };

  const startCamera = async () => {
    try {
      setIsVerifying(false);
      setStatus('idle');
      setError(null);
      setIsFocusing(true);
      
      stopCamera();

      addLog("POWERING UP NEURAL SENSORS...");
      
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', 
          width: { ideal: 3840 }, // Aim for 4K if possible
          height: { ideal: 2160 },
          frameRate: { ideal: 60 }
        } 
      });
      
      // Try to apply advanced constraints if supported
      const track = s.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      if (capabilities.focusMode) {
        await track.applyConstraints({
          advanced: [{ focusMode: 'continuous' } as any]
        });
      }
      
      setStream(s);
      captureStreamRef.current = s;
      
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.onloadedmetadata = () => {
          addLog("OPTICAL MATRIX ONLINE");
          setTimeout(() => setIsFocusing(false), 2000);
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError("Unable to access optical sensors. Please verify permissions.");
      addLog("ERROR: SENSOR OFFLINE");
      setIsFocusing(false);
    }
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAiLog(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 5));
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [label]); // Restart if we switch sides

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsVerifying(true);
    setStatus('scanning');
    addLog(`PHASE 1: FORENSIC ${type.toUpperCase()} ACQUISITION...`);

    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
      
      addLog("PHASE 2: NEURAL EXTRACTION...");
      const result = type === 'identity' 
        ? await verifyIdentityDocument(base64Image, expectedName)
        : await verifyBusinessDocument(base64Image, expectedName);
      
      if (result) {
        addLog(`MATCH: ${result.isNameMatch ? 'POSITIVE' : 'NEGATIVE'}`);
        addLog(`ORIGINALITY: ${result.authenticityScore || 0}%`);
        
        if (result.recommendation === 'APPROVE') {
          setStatus('matched');
          onVerified(result);
          if (onSideComplete) onSideComplete(label.toLowerCase().includes('front') ? 'front' : 'back' as any);
        } else if (result.recommendation === 'NEED_CORRECTION') {
          setStatus('correction_needed');
          setError(result.correctionReason || "Optical alignment mismatch. Ensure image is clear and not blurry.");
        } else {
          setError(result.fraudFlags?.join(', ') || result.correctionReason || "Automated analysis rejected capture. Please retry with a clear, well-lit image.");
        }
      } else {
        setError("AI Synthesis module failed to respond. Please check connectivity and retry.");
      }
    }
    setIsVerifying(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <label className="text-[10px] font-black text-apple-text-muted uppercase tracking-[0.2em]">{label}</label>
        <div className="flex items-center gap-2">
           <Cpu className="w-3 h-3 text-apple-blue animate-pulse" />
           <span className="text-[8px] font-black text-apple-blue uppercase tracking-widest leading-none">Live AI Monitor Active</span>
        </div>
      </div>

      <div className="relative aspect-[1.6/1] rounded-[32px] overflow-hidden bg-black shadow-2xl border border-apple-border group">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-apple-bg">
            <AlertCircle className="w-12 h-12 text-apple-red mb-4" />
            <p className="text-sm font-bold text-apple-text mb-4">{error}</p>
            <button 
              onClick={startCamera}
              className="px-6 py-2 bg-apple-blue text-white rounded-full text-xs font-bold"
            >
              Retry Camera
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className={cn(
                "w-full h-full object-cover transition-all duration-1000",
                isVerifying ? "opacity-40 scale-105 blur-sm" : "opacity-100 scale-100"
              )}
            />
            
            {/* Apple-style High Fidelity Overlays */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Viewfinder Corners */}
              <div className="absolute inset-10 border border-white/5 rounded-[2.5rem]">
                <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-white/80 rounded-tl-2xl shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-white/80 rounded-tr-2xl shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-white/80 rounded-bl-2xl shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-white/80 rounded-br-2xl shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
              </div>

              {/* Simulated Focus Frame */}
              <AnimatePresence>
                {isFocusing && (
                  <motion.div 
                    initial={{ scale: 1.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-[0.5px] border-blue-400/40 rounded-2xl flex items-center justify-center bg-blue-400/5 backdrop-blur-[2px]"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                    <div className="absolute inset-1 border-[0.5px] border-blue-400/20 rounded-xl animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scanning Beam (Laser pulse style) */}
              <motion.div 
                animate={{ 
                  top: ['15%', '85%', '15%'],
                  opacity: isVerifying ? 1 : 0.4
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-blue-500/80 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.6)] z-20"
              />

              {/* Technical Metadata info - Top left */}
              <div className="absolute top-12 left-14 space-y-1">
                 <div className="flex items-center gap-1.5">
                   <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse shadow-[0_0_5px_#3b82f6]" />
                   <span className="text-[9px] font-black text-white/90 uppercase tracking-[0.25em] drop-shadow-md">Matrix V4.2</span>
                 </div>
                 <div className="text-[7px] font-black text-white/40 uppercase tracking-[0.3em] font-mono">
                   Focal Length: {isFocusing ? "Adjusting..." : "Fixed @ 24mm"}
                 </div>
              </div>

              {/* Advanced Controls Status - Top right */}
              <div className="absolute top-12 right-14 flex flex-col items-end gap-1.5">
                 <div className="px-2.5 py-0.5 bg-white/5 backdrop-blur-md rounded border border-white/10 text-[7px] font-black text-white/60 uppercase tracking-widest">
                   AUTO-EXPOSURE: ON
                 </div>
                 <div className="px-2.5 py-0.5 bg-blue-500/10 backdrop-blur-md rounded border border-blue-500/20 text-[7px] font-black text-blue-400 uppercase tracking-widest">
                   Neural AF Active
                 </div>
              </div>
            </div>

            {/* AI Real-time Logs - Bottom Bar */}
            <div className="absolute bottom-8 left-14 right-14">
               <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 space-y-1.5 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                  {aiLog.map((log, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: i === 0 ? 1 : 0.3, x: 0 }}
                      className={cn(
                        "text-[8px] font-black tracking-wide font-mono uppercase transition-all duration-300",
                        i === 0 ? "text-blue-400" : "text-white"
                      )}
                    >
                      {log}
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
               {status === 'matched' && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="absolute inset-0 flex items-center justify-center bg-apple-green/20 backdrop-blur-sm"
                 >
                    <div className="p-6 rounded-full bg-apple-green text-white shadow-2xl">
                       <CheckCircle2 className="w-12 h-12" />
                    </div>
                 </motion.div>
               )}

               {status === 'correction_needed' && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="absolute inset-0 flex flex-col items-center justify-center bg-apple-red/10 backdrop-blur-md p-6 text-center"
                 >
                    <div className="p-4 rounded-full bg-apple-red text-white shadow-2xl mb-4">
                       <RefreshCw className="w-8 h-8 animate-spin-slow" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Refinement Required</h3>
                    <p className="text-[10px] text-white/80 max-w-[200px] mb-6 font-bold">{error}</p>
                    <button 
                      onClick={startCamera}
                      className="px-8 py-3 bg-white text-apple-red rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                    >
                      Restart Matrix Scan
                    </button>
                 </motion.div>
               )}
            </AnimatePresence>

            {/* CAPTURE BUTTON */}
            {status !== 'matched' && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={captureAndVerify}
                  disabled={isVerifying}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-md hover:scale-110 transition-transform active:scale-95 disabled:opacity-50"
                >
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                    {isVerifying ? <Loader2 className="w-8 h-8 text-apple-blue animate-spin" /> : <Camera className="w-8 h-8 text-apple-text" />}
                  </div>
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
