import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Activity, Wallet, Settings } from 'lucide-react';

export default function MainLayout() {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: <Activity size={24} />, label: 'Dashboard' },
        { path: '/wallet', icon: <Wallet size={24} />, label: 'Wallet & Nodes' },
        { path: '/config', icon: <Settings size={24} />, label: 'Configure' },
    ];

    return (
        <div className="flex h-screen bg-[#0a0f1c] text-slate-300 font-sans selection:bg-blue-500/30">

            {/* Desktop Sidebar (hidden on mobile) */}
            <aside className="hidden md:flex flex-col w-64 bg-[#0f172a] border-r border-slate-800">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent tracking-tight">Tapnano</h1>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Fintech Edition</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-blue-500/10 text-blue-400 font-medium'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                    }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        System Online
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <div className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-0">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation (hidden on desktop) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0f172a]/90 backdrop-blur-md border-t border-slate-800 flex justify-around items-center z-50">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {item.icon}
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

        </div>
    );
}
