import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { ScanFace, Settings2, Power, Zap, ShieldAlert } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Type } from '@google/genai';
import { cn } from '../lib/utils';

interface BoundingBox {
  yMin: number;
  xMin: number;
  yMax: number;
  xMax: number;
  label: string;
  color: 'emerald' | 'orange' | 'rose';
}

export default function Scanner() {
  const { config, students, schedule, attendance, setAttendance } = useStore();
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'ACTIVE' | 'ERROR'>('IDLE');
  const [errorMsg, setErrorMsg] = useState('');
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [source, setSource] = useState<'WEBCAM' | 'CCTV'>('WEBCAM');
  const [cctvUrl, setCctvUrl] = useState('http://192.168.1.100:5000/video_feed');

  const videoRef = useRef<HTMLVideoElement>(null);
  const cctvRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);

  const ai = config.geminiApiKey ? new GoogleGenAI({ apiKey: config.geminiApiKey }) : null;

  const startCamera = async () => {
    try {
      if (source === 'WEBCAM') {
        setStatus('ACTIVE'); // Set status active to render the <video> element before assigning stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setErrorMsg('');
        } else {
          // Fallback if ref is not caught immediately
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          }, 100);
        }
      } else {
        // CCTV Source - since CORS and local networking usually blocks direct video element loading,
        // we establish a connection. In a real system, you'd route this via WebRTC or a backend proxy.
        // For demonstration, we'll try to load it into the video tag directly if it's an mjpeg stream,
        // but often it's rendered in an img tag. 
        if (!cctvUrl) {
          setStatus('ERROR');
          setErrorMsg('Please enter a valid CCTV Stream URL.');
          return;
        }

        // As a fallback/demo we will just assume connection success and set status.
        // The URL is held in state. We'll add an img tag in the UI to display the stream.
        setStatus('ACTIVE');
        setErrorMsg('');
      }
    } catch (err: any) {
      console.error("Camera Error:", err);
      setStatus('ERROR');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg('Camera API blocked: Please use HTTPS or localhost to access the camera.');
      } else {
        setErrorMsg(`Camera Error: ${err.message || 'Requested device not found or stream inaccessible'}`);
      }
      setIsScanning(false);
    }
  };

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    setStatus('IDLE');
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    setIsScanning(false);
    setBoxes([]);
  }, []);

  const processFrame = async () => {
    if (!canvasRef.current || !ai || !activePeriod) return;

    if (students.length === 0) {
      setErrorMsg("NO DATA FOUND TO SCAN");
      return;
    }

    const canvas = canvasRef.current;

    let sourceElement: HTMLVideoElement | HTMLImageElement | null = null;
    if (source === 'WEBCAM' && videoRef.current) {
      sourceElement = videoRef.current;
      canvas.width = sourceElement.videoWidth;
      canvas.height = sourceElement.videoHeight;
    } else if (source === 'CCTV' && cctvRef.current) {
      sourceElement = cctvRef.current;
      canvas.width = sourceElement.naturalWidth || sourceElement.width;
      canvas.height = sourceElement.naturalHeight || sourceElement.height;
    }

    if (!sourceElement || canvas.width === 0 || canvas.height === 0) return;

    canvas.getContext('2d')?.drawImage(sourceElement, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    try {
      const promptInstructions = "Analyze the 'Live Frame' and identify any individuals present by matching them against the provided 'Student Reference Images'.\n" +
        "For every match found with a confidence score above 85%, return a JSON object.\n" +
        "Return an array of objects: [{ \"studentId\": \"UUID\", \"confidence\": 0.95, \"box_2d\": [ymin, xmin, ymax, xmax] }].\n" +
        "If no match is found for a face, return studentId: null and label it as 'UNKNOWN'.";

      const requestContents: Array<string | Record<string, unknown>> = [promptInstructions];

      // Add reference photos for Gemini to compare against
      students.forEach(student => {
        if (student.samples && student.samples.length > 0) {
          // Send the first registered sample as a reference
          const sampleBase64 = student.samples[0].includes(',')
            ? student.samples[0].split(',')[1]
            : student.samples[0];

          requestContents.push(`Student Reference Image - UUID: ${student.id}, Name: ${student.firstName} ${student.lastName}, RollNumber: ${student.institutionalId}`);
          requestContents.push({ inlineData: { data: sampleBase64, mimeType: 'image/jpeg' } });
        }
      });

      // Add the actual frame we want to process
      requestContents.push("--- Live Frame ---");
      requestContents.push({ inlineData: { data: base64Image, mimeType: 'image/jpeg' } });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: requestContents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of bounding boxes for detected faces with student matching",
            items: {
              type: Type.OBJECT,
              properties: {
                studentId: {
                  type: Type.STRING,
                  description: "The matched student's UUID, or null if UNKNOWN",
                  nullable: true
                },
                confidence: {
                  type: Type.NUMBER,
                  description: "Confidence score between 0.0 and 1.0"
                },
                box_2d: {
                  type: Type.ARRAY,
                  description: "Bounding box coordinates [ymin, xmin, ymax, xmax] normalized to 1000",
                  items: { type: Type.INTEGER }
                }
              },
              required: ["box_2d", "confidence"]
            }
          }
        }
      });

      const resultText = response.text;
      if (!resultText) return;

      const detections = JSON.parse(resultText);
      const parsedBoxes: BoundingBox[] = [];
      const today = new Date().toISOString().split('T')[0];

      detections.forEach((det: { studentId?: string | null; confidence: number; box_2d: number[] }) => {
        const studentId = det.studentId;
        let color: 'emerald' | 'orange' | 'rose' = 'rose';
        let displayLabel = "UNKNOWN PERSON";

        if (studentId && studentId !== 'null' && studentId.trim() !== '' && studentId !== 'UNKNOWN') {
          const student = students.find(s => s.id === studentId);
          if (student) {
            const alreadyMarked = attendance.find(
              a => a.studentId === student.id &&
                a.periodId === activePeriod &&
                a.timestamp.startsWith(today)
            );

            if (alreadyMarked) {
              color = 'orange';
              displayLabel = "attendance Already marked";
            } else {
              color = 'emerald';
              displayLabel = `Attendance marked ${student.firstName}`;

              setAttendance(prev => [...prev, {
                id: uuidv4(),
                studentId: student.id,
                timestamp: new Date().toISOString(),
                periodId: activePeriod,
                confidenceScore: det.confidence ? Math.round(det.confidence * 100) : 92,
                method: 'Biometric'
              }]);
            }
          }
        }

        parsedBoxes.push({
          yMin: det.box_2d[0],
          xMin: det.box_2d[1],
          yMax: det.box_2d[2],
          xMax: det.box_2d[3],
          label: displayLabel,
          color
        });
      });

      setBoxes(parsedBoxes);

    } catch (err: unknown) {
      console.error("Vision API Error", err);
      // Handle 429 Rate Limit Errors
      const errorStr = String(err);
      const isRateLimit = errorStr.includes('429') || errorStr.includes('quota');

      if (isRateLimit) {
        setErrorMsg("API Rate Limit (429) hit. Pausing scanner for 10 seconds...");
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
        setTimeout(() => {
          setErrorMsg("");
          // Resume if still actively scanning
          if (isScanning && status === 'ACTIVE') {
            intervalRef.current = window.setInterval(processFrame, 3000);
          }
        }, 10000);
      } else {
        setErrorMsg("Verification failed: " + (err instanceof Error ? err.message : "Unknown Error"));
        setTimeout(() => setErrorMsg(""), 3000);
      }
    }
  };

  const toggleScanner = () => {
    if (isScanning) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      setIsScanning(false);
      setBoxes([]);
    } else {
      if (!config.geminiApiKey) {
        setErrorMsg("Gemini API Key is missing. Please configure inside Settings.");
        setStatus('ERROR');
        return;
      }
      if (!activePeriod) {
        setErrorMsg("Please select an active period context before scanning.");
        setStatus('ERROR');
        return;
      }
      setIsScanning(true);
      setErrorMsg('');
      processFrame();
      intervalRef.current = window.setInterval(processFrame, 3000);
    }
  };

  useEffect(() => {
    // Automatically start the scanner upon engaging the process later.
    // We initialize as IDLE by default.
    return () => stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    // Auto-start the scanner if a period is selected, the camera is active, 
    // and we have an API key configured.
    if (activePeriod && status === 'ACTIVE' && !isScanning && config.geminiApiKey) {
      setIsScanning(true);
      setErrorMsg('');
      processFrame();
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(processFrame, 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePeriod, status]);

  return (
    <div className="space-y-8 max-w-[1200px]">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-2">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 rounded-2xl bg-[#e11d48] flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30">
            <ScanFace className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Biometric Presence Matrix</h1>
            <div className="flex items-center space-x-2 text-slate-500 font-medium">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-sm tracking-widest uppercase">
                {status === 'ACTIVE'
                  ? (source === 'CCTV' ? 'CCTV SOURCE LIVE' : 'SENSOR ONLINE')
                  : 'SENSOR OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Period Selector (Not in original mock but required functionally) */}
          <div className="px-5 py-3 border border-slate-200 rounded-full bg-white shadow-sm flex items-center">
            <select
              className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none cursor-pointer"
              value={activePeriod || ''}
              onChange={(e) => setActivePeriod(e.target.value)}
              disabled={isScanning}
            >
              <option value="">Select Period...</option>
              {schedule.map(p => (
                <option key={p.id} value={p.id}>{p.startTime} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="px-5 py-3 border border-slate-200 rounded-full bg-white shadow-sm flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-500 tracking-wider">MANUAL PULSE</span>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-full shadow-sm p-1.5 space-x-1">
            <button
              onClick={() => {
                setSource('WEBCAM');
                stopCamera();
              }}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-bold tracking-wider transition-all",
                source === 'WEBCAM' ? "bg-[#0f172a] text-white" : "text-slate-500 hover:bg-slate-50"
              )}>
              WEBCAM
            </button>
            <button
              onClick={() => {
                setSource('CCTV');
                stopCamera();
              }}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-bold tracking-wider transition-all",
                source === 'CCTV' ? "bg-[#0f172a] text-white" : "text-slate-500 hover:bg-slate-50"
              )}>
              CCTV
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Settings2 className="w-4 h-4" />
            </button>
            <button onClick={stopCamera} className="p-2 text-rose-500 hover:text-rose-600 transition-colors">
              <Power className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CCTV URL Input Area */}
      {source === 'CCTV' && status === 'IDLE' && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col space-y-4">
          <label className="text-xs font-bold tracking-widest text-slate-400 uppercase ml-2">CCTV Stream URL</label>
          <input
            type="text"
            value={cctvUrl}
            onChange={(e) => setCctvUrl(e.target.value)}
            placeholder="http://..."
            className="w-full bg-[#f8fafc] border-none text-slate-900 font-bold px-6 py-5 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
          />
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Matrix Viewfinder */}
      <div className="relative bg-[#0f172a] rounded-[3rem] w-full aspect-video shadow-2xl flex items-center justify-center overflow-hidden border-[12px] border-white">

        {status === 'ACTIVE' && (
          <>
            {source === 'WEBCAM' ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black">
                {/* For IP Cameras, usually MJPEG streams are placed in an img tag */}
                <img
                  ref={cctvRef}
                  src={cctvUrl}
                  alt="CCTV Feed"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If it fails to load directly (likely due to CORS or wrong format in browser)
                    setStatus('ERROR');
                    setErrorMsg("Failed to connect to the CCTV Stream. Ensure the URL is correct and CORS is enabled.");
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* AI Bounding Boxes rendered dynamically via CSS */}
            {boxes.map((box, index) => {
              // Convert 0-1000 normalized coordinates to percentages for CSS
              // Note: Top is xMin, Left is yMin due to AI coordinate format vs standard CSS
              // For Webcams, we mirror the 'left' position.
              const topVal = (box.xMin / 1000) * 100;
              const leftVal = source === 'WEBCAM'
                ? 100 - ((box.yMax / 1000) * 100) // Flip X on webcam
                : (box.yMin / 1000) * 100;

              const widthVal = ((box.yMax - box.yMin) / 1000) * 100;
              const heightVal = ((box.xMax - box.xMin) / 1000) * 100;

              // Compute Theme Classes
              let ringColor = 'border-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.4)]';
              let badgeColor = 'bg-rose-600';

              if (box.color === 'emerald') {
                ringColor = 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]';
                badgeColor = 'bg-emerald-500';
              } else if (box.color === 'orange') {
                ringColor = 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]';
                badgeColor = 'bg-orange-500';
              }

              return (
                <div
                  key={index}
                  className={cn(
                    "absolute border-[3px] rounded-3xl bg-transparent z-40 transition-all duration-300 ease-out",
                    ringColor
                  )}
                  style={{
                    top: `${topVal}%`,
                    left: `${leftVal}%`,
                    width: `${widthVal}%`,
                    height: `${heightVal}%`
                  }}
                >
                  <div
                    className={cn(
                      "absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl text-white font-bold text-sm tracking-wide whitespace-nowrap shadow-lg",
                      badgeColor
                    )}
                  >
                    {box.label}
                  </div>
                </div>
              );
            })}

            <div className="absolute top-8 right-8 z-50">
              <button
                onClick={toggleScanner}
                className={cn(
                  "px-6 py-3 rounded-full font-bold text-sm tracking-wider shadow-xl transition-all border",
                  isScanning
                    ? "bg-rose-500 text-white border-rose-600 hover:bg-rose-600"
                    : "bg-white text-slate-900 border-white hover:bg-slate-50"
                )}
              >
                {isScanning ? 'HALT SCANNER' : 'ACTIVATE AI SCANNER'}
              </button>
            </div>
          </>
        )}

        {status !== 'ACTIVE' && (
          <div className="bg-white rounded-[2.5rem] p-12 w-[400px] text-center shadow-2xl flex flex-col items-center">
            <Power className="w-12 h-12 text-slate-300 mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Biometric Standby</h3>
            <p className="text-slate-500 mb-10 font-medium">
              {status === 'ERROR' ? errorMsg : 'System awaiting manual override to begin capture.'}
            </p>
            <button
              onClick={startCamera}
              className="px-8 py-4 bg-[#0f172a] text-white rounded-full font-bold text-sm tracking-widest uppercase hover:bg-slate-800 transition-colors w-full"
            >
              Initialize Matrix
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
