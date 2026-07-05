import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Search, Download, History, RefreshCw, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function AttendanceHistory() {
    const { attendance, setAttendance, students } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Refresh Controls State
    const [showRefreshMenu, setShowRefreshMenu] = useState(false);
    const [refreshType, setRefreshType] = useState<'all' | 'date'>('all');
    const [refreshDate, setRefreshDate] = useState<string>('');

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
                    status: 'Present', // Assuming all recorded entries are "Present" for now, or you can add logic to infer "Late" based on time
                    confidence: record.confidenceScore || 100,
                };
            })
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort newest first
    }, [attendance, students]);

    // Apply Filters
    const filteredRecords = useMemo(() => {
        return enrichedRecords.filter(record => {
            // Search filter
            const searchMatch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.studentId.toLowerCase().includes(searchTerm.toLowerCase());

            // Date filter
            let dateMatch = true;
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (record.timestamp < start) dateMatch = false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (record.timestamp > end) dateMatch = false;
            }

            return searchMatch && dateMatch;
        });
    }, [enrichedRecords, searchTerm, startDate, endDate]);

    const handleExportCSV = () => {
        if (filteredRecords.length === 0) return;

        // Headers
        const headers = ['Date', 'Time', 'Student Name', 'Student ID', 'Status', 'Confidence'];

        // Rows
        const rows = filteredRecords.map(record => [
            format(record.timestamp, 'yyyy-MM-dd'),
            format(record.timestamp, 'HH:mm:ss'),
            `"${record.studentName}"`, // Escape commas in names
            `"${record.studentId}"`,
            record.status,
            `${record.confidence.toFixed(1)}%`
        ]);

        // Combine
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        // Note: \ufeff is the UTF-8 BOM to ensure Excel opens it correctly with special chars
        const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `FaceTrack_Temporal_Registry_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRefresh = () => {
        if (attendance.length === 0) {
            alert('No attendance records to clear.');
            return;
        }

        if (refreshType === 'all') {
            const confirmed = window.confirm('Are you sure you want to clear ALL attendance history? This action cannot be undone.');
            if (confirmed) {
                setAttendance([]);
                setShowRefreshMenu(false);
            }
        } else if (refreshType === 'date' && refreshDate) {
            const [year, month, day] = refreshDate.split('-').map(Number);
            const displayDate = new Date(year, month - 1, day);
            const confirmed = window.confirm(`Are you sure you want to clear attendance history for ${format(displayDate, 'MMM dd, yyyy')}? This action cannot be undone.`);
            
            if (confirmed) {
                const targetDate = new Date(year, month - 1, day);
                targetDate.setHours(0, 0, 0, 0);
                const nextDate = new Date(targetDate);
                nextDate.setDate(nextDate.getDate() + 1);

                const newAttendance = attendance.filter(record => {
                    const recordDate = new Date(record.timestamp);
                    return recordDate < targetDate || recordDate >= nextDate;
                });
                setAttendance(newAttendance);
                setShowRefreshMenu(false);
            }
        } else {
            alert('Please select a valid date or choose "Select All".');
        }
    };

    const getRefreshDateDisplay = () => {
        if (refreshType === 'all') return 'All Time';
        if (!refreshDate) return 'Select Date';
        try {
            const [year, month, day] = refreshDate.split('-').map(Number);
            return format(new Date(year, month - 1, day), 'MMM dd, yyyy');
        } catch (e) {
            return refreshDate;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Temporal Registry</h1>
                    <p className="text-lg text-slate-500 font-medium">Immutable log of all biometric attendance verification events.</p>
                </div>

                <button
                    onClick={handleExportCSV}
                    disabled={filteredRecords.length === 0}
                    className="flex items-center justify-center px-6 py-3 bg-[#0f172a] hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold tracking-wide transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                >
                    <Download className="w-5 h-5 mr-2" />
                    Export CSV
                </button>
            </div>

            <div className="bg-white rounded-[3.5rem] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
                {/* Control Bar */}
                <div className="flex flex-col xl:flex-row gap-4 mb-8 justify-between">
                    <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 lg:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by student identity..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-[1.25rem] text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                            />
                        </div>

                        {/* Date Filters */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="block w-full pl-4 pr-4 py-3 bg-slate-50 border-transparent rounded-[1.25rem] text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                                />
                            </div>
                            <span className="text-slate-400 font-bold">to</span>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="block w-full pl-4 pr-4 py-3 bg-slate-50 border-transparent rounded-[1.25rem] text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Refresh Controls */}
                    <div className="flex items-center gap-2 border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0">
                        <div className="relative">
                            <button
                                onClick={() => setShowRefreshMenu(!showRefreshMenu)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 bg-slate-50 border border-transparent rounded-[1.25rem] text-slate-700 font-bold hover:bg-slate-100 transition-all",
                                    showRefreshMenu && "ring-4 ring-emerald-500/10 border-emerald-500 bg-white"
                                )}
                            >
                                <Calendar className="w-5 h-5 text-emerald-600" />
                                <span className="w-24 text-left truncate">
                                    {getRefreshDateDisplay()}
                                </span>
                            </button>

                            {showRefreshMenu && (
                                <div className="absolute right-0 xl:right-auto xl:left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-3 z-10 animate-in fade-in zoom-in-95">
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => { setRefreshType('all'); setShowRefreshMenu(false); }}
                                            className={cn(
                                                "w-full text-left px-4 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors",
                                                refreshType === 'all' && "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                            )}
                                        >
                                            Select All (All Time)
                                        </button>
                                        <div className="h-px w-full bg-slate-100 my-1"></div>
                                        <div className="px-3 pb-1 pt-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Specific Date</div>
                                        <input
                                            type="date"
                                            value={refreshType === 'date' ? refreshDate : ''}
                                            onChange={(e) => {
                                                setRefreshType('date');
                                                setRefreshDate(e.target.value);
                                                setShowRefreshMenu(false);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="block w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleRefresh}
                            className="flex items-center justify-center px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-[1.25rem] font-bold tracking-wide transition-all active:scale-95 group"
                            title="Clear Attendance"
                        >
                            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
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
                                                    <div className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
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
                                                    <div className="font-mono font-bold text-slate-700">
                                                        {record.confidence.toFixed(1)}%
                                                    </div>
                                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full"
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
                            <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-[2rem] mb-6 border border-slate-100">
                                <History className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-[#0f172a] mb-2 tracking-tight">Zero Matches</h3>
                            <p className="text-slate-500 font-medium max-w-sm">
                                {attendance.length === 0
                                    ? "No attendance records have been generated. Run a biometric scan to begin."
                                    : "No records found matching your current filter criteria."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
