import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Camera, Upload, Trash2, X, CheckCircle, Image as ImageIcon, UserPlus, ShieldAlert } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';

export default function StudentEnrollment() {
  const { students, setStudents } = useStore();

  // Form State
  const [name, setName] = useState('');
  const [institutionalId, setInstitutionalId] = useState('');
  const [samples, setSamples] = useState<string[]>([]);

  // UI State
  const [captureMode, setCaptureMode] = useState<'idle' | 'webcam' | 'upload'>('idle');
  const [error, setError] = useState('');
  const [isFlashing, setIsFlashing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SAMPLES = 8;

  // Real-time validation
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length <= 10) setInstitutionalId(val);
  };

  const isDuplicateId = useMemo(() => {
    return students.some(s => s.institutionalId === institutionalId);
  }, [institutionalId, students]);

  const isInvalid = useMemo(() => {
    return name.trim().length === 0 || institutionalId.length === 0 || isDuplicateId || samples.length === 0;
  }, [name, institutionalId, isDuplicateId, samples]);

  // Camera Handling
  const startCamera = async () => {
    setCaptureMode('webcam');
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera Error:", err);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera API blocked: Please use HTTPS or localhost.');
      } else {
        setError(`Camera Error: ${err.message || 'Camera access denied or device not found.'}`);
      }
      setCaptureMode('idle');
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const abortWebcam = () => {
    stopCamera();
    setCaptureMode('idle');
  };

  // Cleanup on unmount or mode change
  useEffect(() => {
    if (captureMode !== 'webcam') {
      stopCamera();
    }
    return () => stopCamera();
  }, [captureMode, stopCamera]);

  // Capture processing
  const captureSample = () => {
    if (samples.length >= MAX_SAMPLES) return;
    if (!videoRef.current || !canvasRef.current || captureMode !== 'webcam') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // 1:1 square crop from center
    const size = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, startX, startY, size, size, 0, 0, 640, 640);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setSamples(prev => [...prev, imageDataUrl]);
    }

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);
  };

  // File Upload Handling
  const handleUploadClick = () => {
    setCaptureMode('upload');
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_SAMPLES - samples.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSamples(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSample = (index: number) => {
    setSamples(prev => prev.filter((_, i) => i !== index));
  };

  // Submit & Remove handlers
  const onAddStudent = () => {
    if (isInvalid) return;

    const trimmedName = name.trim();
    const nameParts = trimmedName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const newStudent = {
      id: uuidv4(),
      firstName,
      lastName,
      institutionalId,
      enrolledAt: new Date().toISOString(),
      samples
    };

    setStudents([newStudent, ...students]);

    // Reset Form
    setName('');
    setInstitutionalId('');
    setSamples([]);
    setCaptureMode('idle');
    setError('');
  };

  const onRemoveStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  return (
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in duration-500">

      {/* LEFT COLUMN: Registration Form */}
      <div className="xl:col-span-7 bg-white rounded-[3.5rem] p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Registration Form</h1>
          <p className="text-lg text-slate-500 font-medium">Provision new biological subjects into the biometric matrix.</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-[1.5rem] flex items-center text-rose-600 font-medium text-sm animate-in fade-in zoom-in-95">
            <ShieldAlert className="w-5 h-5 mr-3 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Input Fields */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Student Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-none text-slate-900 placeholder:text-slate-400 font-bold px-6 py-5 rounded-[2rem] outline-none focus:ring-2 focus:ring-slate-900/10 transition-all text-lg"
            />

            <div className="relative">
              <input
                type="text"
                placeholder="Institutional ID (Max 10, Alphanumeric)"
                maxLength={10}
                value={institutionalId}
                onChange={handleIdChange}
                className={cn(
                  "w-full bg-slate-50 border-2 text-slate-900 placeholder:text-slate-400 font-bold px-6 py-5 rounded-[2rem] outline-none focus:ring-slate-900/10 transition-all text-lg uppercase font-mono",
                  isDuplicateId ? "border-rose-300 focus:ring-rose-500/20" : "border-transparent"
                )}
              />
              {isDuplicateId && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-rose-500 flex items-center bg-rose-50 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase animate-in fade-in zoom-in">
                  Duplicate ID
                </div>
              )}
            </div>
          </div>

          {/* Core Biometric Capture System */}
          <div className="pt-2">
            <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4 ml-2">Capture Matrix</h3>

            <div className="min-h-[300px] flex flex-col justify-center">
              {/* IDLE MODE */}
              {captureMode === 'idle' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
                  <button onClick={handleUploadClick} className="flex flex-col items-center justify-center p-10 rounded-[3rem] bg-slate-50 border-2 border-transparent hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all text-slate-500 hover:text-slate-900 group">
                    <Upload className="w-10 h-10 mb-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="font-bold tracking-widest uppercase text-sm">Import</span>
                  </button>
                  <button onClick={startCamera} className="flex flex-col items-center justify-center p-10 rounded-[3rem] bg-slate-50 border-2 border-transparent hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all text-slate-500 hover:text-slate-900 group">
                    <Camera className="w-10 h-10 mb-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    <span className="font-bold tracking-widest uppercase text-sm">Webcam</span>
                  </button>
                </div>
              )}

              {/* WEBCAM MODE */}
              {captureMode === 'webcam' && (
                <div className="w-full flex justify-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="relative w-full max-w-[640px] aspect-square bg-slate-900 rounded-[3rem] overflow-hidden flex items-center justify-center shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

                    <div className={cn(
                      "absolute inset-0 z-20 bg-white pointer-events-none transition-opacity duration-150",
                      isFlashing ? "opacity-100" : "opacity-0"
                    )} />

                    <div className="absolute top-6 right-6 z-30">
                      <button onClick={abortWebcam} className="p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all shadow-lg hover:rotate-90">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-30">
                      <button
                        onClick={captureSample}
                        disabled={samples.length >= MAX_SAMPLES}
                        className="px-8 py-4 bg-white text-slate-900 rounded-[2rem] font-extrabold tracking-widest uppercase text-sm shadow-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                      >
                        Capture Frame
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* UPLOAD MODE */}
              {captureMode === 'upload' && (
                <div className="flex justify-center max-w-[640px] mx-auto w-full animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 w-full relative">
                    <div className="absolute top-6 right-6">
                      <button onClick={abortWebcam} className="p-3 bg-white shadow-sm hover:shadow-md rounded-full text-slate-400 hover:text-slate-900 transition-all">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <ImageIcon className="w-16 h-16 text-slate-300 mb-6" />
                    <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                    <button
                      onClick={triggerFileSelect}
                      disabled={samples.length >= MAX_SAMPLES}
                      className="px-8 py-4 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-[2rem] font-bold uppercase tracking-widest text-sm hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Select Files
                    </button>
                    <p className="mt-4 text-slate-400 text-sm font-medium">Supports JPG/PNG. Up to {MAX_SAMPLES} files.</p>
                  </div>
                </div>
              )}

              {/* Hidden canvas for cropping */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {/* Sample Gallery */}
          {samples.length > 0 && (
            <div className="pt-2 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Acquired Samples</h4>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{samples.length} / {MAX_SAMPLES}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {samples.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-[1.25rem] overflow-hidden group shadow-sm bg-slate-100 border border-slate-200 animate-in zoom-in">
                    <img src={src} alt={`Sample ${i}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeSample(i)}
                      className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4">
            <button
              onClick={onAddStudent}
              disabled={isInvalid}
              className={cn(
                "w-full py-5 rounded-[2rem] text-sm font-extrabold tracking-widest uppercase transition-all flex justify-center items-center shadow-xl",
                !isInvalid
                  ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10 hover:-translate-y-0.5"
                  : "bg-slate-100 text-slate-400 shadow-transparent cursor-not-allowed"
              )}
            >
              <UserPlus className="w-5 h-5 mr-3" />
              Synchronize Entity
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Live Registry */}
      <div className="xl:col-span-5 bg-white rounded-[3.5rem] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 h-[calc(100vh-6rem)] min-h-[700px] flex flex-col xl:sticky xl:top-8">
        <div className="mb-8 px-2 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Live Registry</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Recently synchronized profiles</p>
          </div>
          <div className="bg-indigo-50 text-indigo-600 px-4 py-2 text-xs font-bold rounded-full tracking-widest uppercase">
            {students.length} Total
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100">
                <CheckCircle className="w-8 h-8 opacity-40 text-slate-500" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">Registry Empty</span>
            </div>
          ) : (
            students.map(student => (
              <div key={student.id} className="group flex items-center justify-between p-4 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden bg-white shadow-sm shrink-0 border border-slate-100">
                    {student.samples[0] ? (
                      <img src={student.samples[0]} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <UserPlus className="w-6 h-6 text-slate-300 mx-auto mt-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight">{student.firstName} {student.lastName}</h3>
                    <div className="text-xs font-mono font-bold text-indigo-500 mt-1 uppercase tracking-wider">{student.institutionalId}</div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveStudent(student.id)}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  title="Purge Record"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
