import { Users, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useStore } from '../store';

const mockData = [
    { name: 'Mon', attendance: 3 },
    { name: 'Tue', attendance: 4 },
    { name: 'Wed', attendance: 3 },
    { name: 'Thu', attendance: 4 },
    { name: 'Fri', attendance: 3 },
];

export default function Dashboard() {
    const { students, attendance } = useStore();

    const getTodayAttendance = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = attendance.filter(r => r.timestamp.startsWith(today));

        if (students.length === 0) return { percent: '0.0%', count: 0 };

        const uniqueAttendees = new Set(todayRecords.map(r => r.studentId)).size;
        return {
            percent: (Math.round((uniqueAttendees / students.length) * 100 * 10) / 10).toFixed(1) + '%',
            count: uniqueAttendees
        };
    };

    const todayStats = getTodayAttendance();
    const pendingCount = Math.max(0, students.length - todayStats.count);

    return (
        <div className="space-y-8 max-w-[1200px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1">Intelligence Dashboard</h1>
                    <p className="text-lg text-slate-500 font-medium">Monitoring {students.length} active student profiles.</p>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-full bg-white shadow-sm self-start sm:self-auto">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-500 tracking-wider">LIVE PULSE: ONLINE</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1 */}
                <Card className="rounded-[2.5rem] border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] pl-2 py-2">
                    <CardContent className="p-4 flex items-center space-x-6">
                        <div className="w-[88px] h-[88px] bg-[#2563eb] rounded-[2rem] flex items-center justify-center shrink-0">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Registered Students</p>
                            <p className="text-4xl font-bold text-slate-900">{students.length}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2 */}
                <Card className="rounded-[2.5rem] border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] pl-2 py-2">
                    <CardContent className="p-4 flex items-center space-x-6">
                        <div className="w-[88px] h-[88px] bg-[#059669] rounded-[2rem] flex items-center justify-center shrink-0">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Verified Today</p>
                            <p className="text-4xl font-bold text-slate-900">{todayStats.count}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 3 */}
                <Card className="rounded-[2.5rem] border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] pl-2 py-2">
                    <CardContent className="p-4 flex items-center space-x-6">
                        <div className="w-[88px] h-[88px] bg-[#4f46e5] rounded-[2rem] flex items-center justify-center shrink-0">
                            <Clock className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Attendance Rate</p>
                            <p className="text-4xl font-bold text-slate-900">{todayStats.percent}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 4 */}
                <Card className="rounded-[2.5rem] border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] pl-2 py-2">
                    <CardContent className="p-4 flex items-center space-x-6">
                        <div className="w-[88px] h-[88px] bg-[#f59e0b] rounded-[2rem] flex items-center justify-center shrink-0">
                            <AlertCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Pending</p>
                            <p className="text-4xl font-bold text-slate-900">{pendingCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <Card className="rounded-[2.5rem] border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] pt-2 pb-6 px-4">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center space-x-3">
                            <TrendingUp className="w-6 h-6 text-[#4f46e5]" />
                            <h2 className="text-xl font-bold text-slate-900">Weekly Retention Trend</h2>
                        </div>
                        <div className="px-4 py-1.5 bg-slate-50 text-slate-400 text-xs font-bold tracking-widest rounded-full uppercase">
                            Unique Scans/Day
                        </div>
                    </div>

                    <div className="h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                                    dx={-10}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="attendance"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAttendance)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
