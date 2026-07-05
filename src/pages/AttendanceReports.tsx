import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Search, Calendar, Download, Filter, BrainCircuit, History } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function AttendanceReports() {
    const { students, attendance } = useStore();
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('2026-01-30');
    const [dateTo, setDateTo] = useState('2026-03-01');
    const [minConfidence, setMinConfidence] = useState(80);

    // Combine and format the data
    const enrichedRecords = useMemo(() => {
        return attendance
            .map(record => {
                const student = students.find(s => s.id === record.studentId);
                return {
                    id: record.id,
                    studentId: student?.institutionalId || 'N/A',
                    studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
                    timestamp: new Date(record.timestamp),
                    status: 'Present',
                    confidence: record.confidenceScore || 100,
                };
            })
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [attendance, students]);

    // Apply Filters
    const filteredRecords = useMemo(() => {
        return enrichedRecords.filter(record => {
            // Search filter
            const searchMatch = record.studentName.toLowerCase().includes(search.toLowerCase()) ||
                record.studentId.toLowerCase().includes(search.toLowerCase());

            // Date filter
            let dateMatch = true;
            if (dateFrom) {
                const start = new Date(dateFrom);
                start.setHours(0, 0, 0, 0);
                if (record.timestamp < start) dateMatch = false;
            }
            if (dateTo) {
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);
                if (record.timestamp > end) dateMatch = false;
            }

            // Confidence Level Filter
            const confidenceMatch = record.confidence >= minConfidence;

            return searchMatch && dateMatch && confidenceMatch;
        });
    }, [enrichedRecords, search, dateFrom, dateTo, minConfidence]);

    const handleExportCSV = () => {
        if (filteredRecords.length === 0) return;

        // Headers
        const headers = ['Date', 'Time', 'Student Name', 'Student ID', 'Status', 'Confidence'];

        // Rows
        const rows = filteredRecords.map(record => [
            format(record.timestamp, 'yyyy-MM-dd'),
            format(record.timestamp, 'HH:mm:ss'),
            `"${record.studentName}"`,
            `"${record.studentId}"`,
            record.status,
            `${record.confidence.toFixed(1)}%`
        ]);

        // Combine
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Neural_Audit_Export_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 max-w-[1200px]">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 text-[#4f46e5] font-bold tracking-widest text-xs uppercase mb-3">
                        <BrainCircuit className="w-4 h-4" />
                        <span>Biometric Intel Core V2.5</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Attendance Intelligence</h1>
                    <p className="text-lg text-slate-500 font-medium">Processing {attendance.length} neural logs across {students.length} active subjects.</p>
                </div>

                <button
                    onClick={handleExportCSV}
                    disabled={filteredRecords.length === 0}
                    className="px-6 py-3.5 bg-[#0f172a] text-white rounded-full font-bold text-sm tracking-widest uppercase hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-900/10 flex items-center shrink-0"
                >
                    <Download className="w-4 h-4 mr-3" />
                    Neural Audit Export
                </button>
            </div>

            {/* Filter Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 space-y-6">

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search subject identity..."
                        className="w-full bg-[#f8fafc] border-none text-slate-900 placeholder:text-slate-400 font-bold px-14 py-5 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-base"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4f46e5]" />
                        <input
                            type="date"
                            className="w-full bg-[#f8fafc] border-none text-slate-900 font-bold px-14 py-5 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-base appearance-none"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4f46e5]" />
                        <input
                            type="date"
                            className="w-full bg-[#f8fafc] border-none text-slate-900 font-bold px-14 py-5 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-base appearance-none"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                        />
                    </div>
                </div>

                {/* Confidence Range Slider */}
                <div className="bg-[#f8fafc] p-6 rounded-3xl relative">
                    <div className="flex items-center space-x-2 mb-4">
                        <Filter className="w-4 h-4 text-[#4f46e5]" />
                        <span className="text-xs font-bold tracking-widest text-[#4f46e5] uppercase">Min Confidence</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={minConfidence}
                        onChange={e => setMinConfidence(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4f46e5]"
                    />
                    <div className="mt-2 text-right">
                        <span className="text-sm font-bold text-slate-600">{minConfidence}%</span>
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                {filteredRecords.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-slate-500 text-sm font-bold uppercase tracking-wider border-b border-slate-100">
                                    <th className="px-8 py-5 rounded-tl-[2.5rem]">Identity</th>
                                    <th className="px-8 py-5">Timestamp</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 rounded-tr-[2.5rem]">AI Confidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div>
                                                <div className="text-lg font-black text-slate-900 group-hover:text-[#4f46e5] transition-colors">
                                                    {record.studentName}
                                                </div>
                                                <div className="text-sm font-mono text-slate-500 mt-0.5">
                                                    ID: {record.studentId}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-bold">{format(record.timestamp, 'MM/dd/yyyy')}</span>
                                                <span className="text-slate-500 text-sm font-mono mt-0.5">{format(record.timestamp, 'HH:mm:ss')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-full text-sm font-bold",
                                                record.status === 'Present'
                                                    ? "bg-emerald-100/50 text-emerald-700"
                                                    : "bg-amber-100/50 text-amber-700"
                                            )}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="font-mono font-bold text-slate-700 w-12">
                                                    {record.confidence.toFixed(1)}%
                                                </div>
                                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-500",
                                                            record.confidence >= 90 ? "bg-emerald-500" :
                                                            record.confidence >= 75 ? "bg-amber-500" : "bg-rose-500"
                                                        )}
                                                        style={{ width: `${record.confidence}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                            <History className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Zero Matches Found</h3>
                        <p className="text-slate-500 font-medium max-w-sm">
                            {attendance.length === 0
                                ? "No attendance neuro-logs have been generated. System awaits biometric input."
                                : "No records found matching your active intelligence filters and threshold."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
