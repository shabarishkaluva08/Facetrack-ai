import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Search, Plus, Trash2, GraduationCap, CheckSquare, Square, Folder, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Student } from '../types';

export default function StudentDirectory() {
    const { students, setStudents } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

    const activeStudent = students.find(s => s.id === editingStudentId);

    const filteredStudents = students.filter(s =>
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.institutionalId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedStudents(newSelected);
    };

    const deleteSelected = () => {
        if (confirm(`Are you sure you want to delete ${selectedStudents.size} students?`)) {
            setStudents(students.filter(s => !selectedStudents.has(s.id)));
            setSelectedStudents(new Set());
        }
    };

    const toggleSelectAll = () => {
        if (selectedStudents.size === filteredStudents.length) {
            setSelectedStudents(new Set()); // Deselect all
        } else {
            setSelectedStudents(new Set(filteredStudents.map(s => s.id))); // Select all
        }
    };

    return (
        <div className="space-y-8 max-w-[1400px] mb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Student Directory</h1>
                    <p className="text-lg text-slate-500 font-medium">Manage enrolled biometric profiles and datasets</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/students/new">
                        <button className="px-6 py-3.5 bg-[#0f172a] hover:bg-slate-800 text-white rounded-full font-bold text-sm tracking-widest uppercase transition-all shadow-xl shadow-slate-900/10 flex items-center space-x-2 shrink-0 active:scale-95">
                            <Plus className="w-4 h-4" />
                            <span>Enroll Student</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Sub Nav / Search & Actions */}
            <div className="bg-white rounded-[2.5rem] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        placeholder="Search by ID or Name..."
                        className="w-full bg-[#f8fafc] border-none text-slate-900 placeholder:text-slate-400 font-bold px-14 py-4 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    onClick={toggleSelectAll}
                    disabled={filteredStudents.length === 0}
                    className="px-6 py-4 bg-[#f8fafc] hover:bg-slate-100 text-slate-600 rounded-3xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center space-x-2 shrink-0 md:w-auto w-full disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
                >
                    {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? (
                        <>
                            <CheckSquare className="w-5 h-5 text-emerald-500" />
                            <span className="text-emerald-600">Deselect All</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5 text-slate-400" />
                            <span>Select All</span>
                        </>
                    )}
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredStudents.map((student) => (
                    <div
                        key={student.id}
                        onClick={() => setEditingStudentId(student.id)}
                        className="bg-white rounded-b-[3.5rem] rounded-tr-[3.5rem] rounded-tl-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-100 group relative transition-all hover:-translate-y-2 hover:shadow-xl hover:border-emerald-500/20 cursor-pointer"
                    >

                        <div className="w-full aspect-square rounded-[2.5rem] overflow-hidden bg-slate-50 relative mb-5">
                            {student.samples[0] ? (
                                <img src={student.samples[0]} alt={student.firstName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <GraduationCap className="w-16 h-16 opacity-40" />
                                </div>
                            )}

                            {/* Checkbox Overlay */}
                            <div
                                className="absolute top-4 right-4 z-10 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelect(student.id);
                                }}
                            >
                                {selectedStudents.has(student.id) ? (
                                    <div className="bg-white rounded-xl shadow-lg p-1 animate-in zoom-in-50">
                                        <CheckSquare className="w-7 h-7 text-emerald-500" />
                                    </div>
                                ) : (
                                    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                                        <Square className="w-7 h-7 text-slate-400 hover:text-emerald-500 transition-colors" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-3 pb-3">
                            <div className="flex flex-col mb-4">
                                <h3 className="font-extrabold text-[#0f172a] tracking-tight text-xl mb-0.5 truncate">{student.firstName} {student.lastName}</h3>
                                <div className="font-mono text-sm font-bold text-slate-400 truncate">ID: {student.institutionalId}</div>
                            </div>

                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl w-fit">
                                <Folder className="w-4 h-4 text-emerald-500" />
                                <span>{student.samples.length} Samples</span>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredStudents.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-[2rem] mb-6 border border-slate-100">
                            <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-[#0f172a] mb-2 tracking-tight">Zero Results</h3>
                        <p className="text-slate-500 font-medium">
                            {searchTerm ? "No biometric subjects match your search protocol." : "The directory is empty. Route to biometric enrollment to add subjects."}
                        </p>
                    </div>
                )}
            </div>

            {/* Floating Action Bar */}
            {selectedStudents.size > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-[2rem] shadow-2xl flex items-center space-x-6 backdrop-blur-xl bg-slate-900/90">
                        <div className="pl-5 flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <span className="text-emerald-400 font-bold text-sm">{selectedStudents.size}</span>
                            </div>
                            <span className="text-white font-medium text-sm tracking-wide">Subjects Selected</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setSelectedStudents(new Set())}
                                className="px-5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-bold text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteSelected}
                                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm tracking-wide transition-colors flex items-center space-x-2 shadow-lg shadow-rose-500/20"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Detail Slide-Out */}
            {activeStudent && (
                <ProfileSlideOut
                    student={activeStudent}
                    onClose={() => setEditingStudentId(null)}
                />
            )}
        </div>
    );
}

// Nested Component for Profile Editing
function ProfileSlideOut({ student, onClose }: { student: Student, onClose: () => void }) {
    const { students, setStudents, attendance } = useStore();
    const [formData, setFormData] = useState({ firstName: student.firstName, lastName: student.lastName, institutionalId: student.institutionalId });

    // Save Basic Details
    const handleSave = () => {
        setStudents(students.map(s => s.id === student.id ? { ...s, ...formData } : s));
    };

    // Delete Single Sample
    const deleteSample = (indexToRemove: number) => {
        if (confirm("Permanently delete this biometric sample?")) {
            setStudents(students.map(s => {
                if (s.id === student.id) {
                    return { ...s, samples: s.samples.filter((_, i) => i !== indexToRemove) };
                }
                return s;
            }));
        }
    };

    const studentAttendance = attendance.filter(a => a.studentId === student.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Webcam Logic for adding a new sample
    const [isCapturing, setIsCapturing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [flash, setFlash] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const startCamera = async () => {
        setIsCapturing(true);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err: any) {
            console.error("Camera error:", err);
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert("Camera API blocked: Please use HTTPS or localhost to access the camera.");
            } else {
                alert(`Camera error: ${err.message || 'Unable to access camera.'}`);
            }
            setIsCapturing(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
        setIsCapturing(false);
    };

    const takeSnapshot = () => {
        if (!videoRef.current) return;

        // Flash Animation
        setFlash(true);
        setTimeout(() => setFlash(false), 300);

        // 1:1 Square Cropping Logic
        const canvas = document.createElement('canvas');
        const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const startX = (videoRef.current.videoWidth - size) / 2;
        const startY = (videoRef.current.videoHeight - size) / 2;

        ctx.translate(size, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, startX, startY, size, size, 0, 0, size, size);

        const base64Image = canvas.toDataURL('image/jpeg', 0.9);

        // Save to student profile
        setStudents(students.map(s => {
            if (s.id === student.id) {
                return { ...s, samples: [...s.samples, base64Image] };
            }
            return s;
        }));

        stopCamera();
    };

    useEffect(() => {
        return () => stopCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stream]); // Cleanup on unmount

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Biometric Profile</h2>
                        <p className="text-slate-500 font-medium text-sm">UUID: {student.id}</p>
                    </div>
                    <button
                        onClick={() => {
                            stopCamera();
                            onClose();
                        }}
                        className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
                    >
                        <Search className="w-5 h-5 text-slate-600 rotate-45" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-12">

                    {/* Identification Data */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Identification</h3>
                            <button onClick={handleSave} className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Save Changes</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                                <input
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full bg-slate-50 border-none px-5 py-4 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                                <input
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full bg-slate-50 border-none px-5 py-4 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>
                            <div className="col-span-2 space-y-2 mt-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Institutional ID / Roll No</label>
                                <input
                                    value={formData.institutionalId}
                                    onChange={e => setFormData({ ...formData, institutionalId: e.target.value })}
                                    className="w-full bg-slate-50 border-none px-5 py-4 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Biometric Samples Grid */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Facial Datasets ({student.samples.length}/8)</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {student.samples.map((img: string, i: number) => (
                                <div key={i} className="aspect-square bg-slate-100 rounded-[2rem] relative overflow-hidden group">
                                    <img src={img} alt="Sample" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-rose-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button
                                            onClick={() => deleteSample(i)}
                                            className="w-12 h-12 bg-white text-rose-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {student.samples.length < 8 && !isCapturing && (
                                <div
                                    onClick={startCamera}
                                    className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-50 transition-colors cursor-pointer group"
                                >
                                    <Plus className="w-8 h-8 mb-2 group-active:scale-90 transition-transform" />
                                    <span className="text-xs font-bold">Add Sample</span>
                                </div>
                            )}

                            {isCapturing && (
                                <div className="aspect-square bg-slate-900 rounded-[2rem] relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                                    />
                                    <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-300 ${flash ? 'opacity-100' : 'opacity-0'}`} />
                                    <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] pointer-events-none" />

                                    <button
                                        onClick={takeSnapshot}
                                        className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md border-[3px] border-white rounded-full mt-auto mb-6 hover:bg-white hover:scale-110 active:scale-95 transition-all outline-none"
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); stopCamera(); }}
                                        className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-rose-500 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
                                    >
                                        <Search className="w-4 h-4 rotate-45" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Temporal Log */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Verification History</h3>
                        </div>
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 max-h-[300px] overflow-y-auto">
                            {studentAttendance.length === 0 ? (
                                <p className="text-center text-slate-400 text-sm font-medium py-4">No verifications logged yet.</p>
                            ) : (
                                studentAttendance.map((log) => (
                                    <div key={log.id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{new Date(log.timestamp).toLocaleDateString()}</span>
                                            <span className="text-xs font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                            {log.confidenceScore}% Match
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
