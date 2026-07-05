import { useState } from 'react';
import { useStore } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { Clock, SlidersHorizontal, Settings2 } from 'lucide-react';

export default function Schedule() {
    const { schedule, setSchedule } = useStore();

    // Instead of free-form adding, the mockup shows a timetable generator form.
    const [generator, setGenerator] = useState({
        startTime: '09:20',
        periodCount: '6',
        periodDuration: '50',
    });

    const handleGenerate = () => {
        const count = parseInt(generator.periodCount) || 1;
        const duration = parseInt(generator.periodDuration) || 50;

        let currentMinutes = parseInt(generator.startTime.split(':')[0]) * 60 + parseInt(generator.startTime.split(':')[1]);

        const newSchedule = [];

        for (let i = 0; i < count; i++) {
            const startH = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
            const startM = (currentMinutes % 60).toString().padStart(2, '0');
            const startTimeStr = `${startH}:${startM}`;

            currentMinutes += duration;

            const endH = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
            const endM = (currentMinutes % 60).toString().padStart(2, '0');
            const endTimeStr = `${endH}:${endM}`;

            newSchedule.push({
                id: uuidv4(),
                name: `Period ${i + 1}`,
                startTime: startTimeStr,
                endTime: endTimeStr,
                instructor: ''
            });
        }

        setSchedule(newSchedule);
    };

    return (
        <div className="space-y-8 max-w-[1000px]">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Academic Schedule</h1>
                <p className="text-lg text-slate-500 font-medium">Fine-tune periods, recess slots, and session timings.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100">
                <div className="flex items-center space-x-3 mb-8">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                    <h2 className="text-sm font-extrabold tracking-widest text-primary uppercase">Timetable Generator</h2>
                </div>

                <div className="space-y-6 max-w-2xl">
                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-slate-400 border-none uppercase">Start Time</label>
                        <div className="relative">
                            <input
                                type="time"
                                value={generator.startTime}
                                onChange={e => setGenerator({ ...generator, startTime: e.target.value })}
                                className="w-full bg-[#f8fafc] border-none text-slate-900 font-bold px-6 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg appearance-none"
                            />
                            <Clock className="w-5 h-5 text-slate-900 absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-slate-400 uppercase">Period Count</label>
                        <input
                            type="number"
                            value={generator.periodCount}
                            onChange={e => setGenerator({ ...generator, periodCount: e.target.value })}
                            className="w-full bg-[#f8fafc] border-none text-slate-900 font-bold px-6 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-slate-400 uppercase">Period Duration (Mins)</label>
                        <input
                            type="number"
                            value={generator.periodDuration}
                            onChange={e => setGenerator({ ...generator, periodDuration: e.target.value })}
                            className="w-full bg-[#f8fafc] border-none text-slate-900 font-bold px-6 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                        />
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={handleGenerate}
                            className="w-full py-5 bg-[#0f172a] hover:bg-slate-800 text-white font-extrabold tracking-widest uppercase text-sm rounded-full shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 transition-all flex justify-center items-center"
                        >
                            <Settings2 className="w-5 h-5 mr-3" />
                            Generate Sequence
                        </button>
                    </div>
                </div>
            </div>

            {/* Generated Output Preview */}
            {schedule.length > 0 && (
                <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100">
                    <h2 className="text-sm font-extrabold tracking-widest text-[#0f172a] uppercase mb-8">Generated Sequence</h2>
                    <div className="space-y-4">
                        {schedule.map((period) => (
                            <div key={period.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#f8fafc] p-6 rounded-2xl border border-slate-100">
                                <div className="flex items-center space-x-6">
                                    <div className="px-5 py-2.5 bg-white rounded-xl text-[#0f172a] font-mono text-base font-bold shadow-sm">
                                        {period.startTime} - {period.endTime}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{period.name}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
