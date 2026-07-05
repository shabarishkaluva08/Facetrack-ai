import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    ScanFace,
    UserPlus,
    History,
    BarChart2,
    Calendar,
    FolderHeart,
    GraduationCap,
    Settings
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
    const navigation = [
        { name: 'Intelligence Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Biometric Presence Matrix', href: '/scanner', icon: ScanFace },
        { name: 'Register Student', href: '/students/new', icon: UserPlus },
        { name: 'Temporal Registry', href: '/history', icon: History },
        { name: 'Attendance Intelligence', href: '/reports', icon: BarChart2 },
        { name: 'Academic Schedule', href: '/schedule', icon: Calendar },
        { name: 'Student Directory', href: '/students', icon: FolderHeart },
        { name: 'System Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-background text-foreground font-sans">
            {/* Sidebar */}
            <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col shrink-0">
                <div className="p-6 flex items-center space-x-4 mb-2">
                    <div className="w-10 h-10 rounded-[14px] bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">FaceTrack AI</span>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-medium text-[15px]',
                                    isActive
                                        ? 'bg-[#eff2fe] text-primary'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                )
                            }
                        >
                            <item.icon className={cn("w-[22px] h-[22px]", "stroke-[2px]")} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-5 mt-auto">
                    <div className="bg-[#0f172a] rounded-[20px] p-5 shadow-xl">
                        <p className="text-xs text-slate-400 font-medium tracking-wide mb-2.5">System Status</p>
                        <div className="flex items-center space-x-2 text-[13px] font-bold text-white tracking-wide">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                            <span>NEURAL CORE ONLINE</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-[#f8fafc]">
                <div className="h-full p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
