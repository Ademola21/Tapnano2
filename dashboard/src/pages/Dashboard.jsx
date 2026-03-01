import React, { useContext, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { Activity, Server, Users, Zap, Terminal } from 'lucide-react';

export default function Dashboard() {
    const { globalStats, nodeHealth, runners, logs } = useContext(AppContext);
    const terminalEndRef = useRef(null);

    // Auto-scroll terminal smoothly
    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const healthyNodes = Object.values(nodeHealth).filter(n => n.healthy).length;
    const totalNodes = Object.keys(nodeHealth).length;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Activity className="text-blue-400" />
                    Fleet Telemetry
                </h1>
                <p className="text-slate-400 mt-2">Real-time monitoring of your Tapnano infrastructure.</p>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Earnings Card */}
                <div className="glass-panel relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={48} className="text-emerald-400" />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Unwithdrawn Yield</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">Ӿ {globalStats.totalEarned.toFixed(6)}</span>
                        </div>
                    </div>
                    <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 w-full animate-pulse"></div>
                    </div>
                </div>

                {/* Active Workers Card */}
                <div className="glass-panel relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={48} className="text-blue-400" />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Workers</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{globalStats.activeCount}</span>
                            <span className="text-sm text-slate-500">/ {Object.keys(runners).length} Deployed</span>
                        </div>
                    </div>
                </div>

                {/* Node Health Card */}
                <div className="glass-panel relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Server size={48} className="text-purple-400" />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Network Health</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{healthyNodes}</span>
                            <span className="text-sm text-slate-500">/ {totalNodes || 4} Nodes Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Terminal Output */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <Terminal size={20} className="text-slate-400" />
                    Live Server Console
                </h2>

                <div className="glass-panel p-0 overflow-hidden border-slate-700/50 bg-[#060913]">
                    {/* Terminal Header */}
                    <div className="bg-[#0f172a] px-4 py-2 border-b border-slate-700/50 flex items-center justify-between">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <span className="text-xs font-mono text-slate-500">server.js ~ runtime</span>
                    </div>

                    {/* Terminal Body */}
                    <div className="p-4 h-[400px] overflow-y-auto custom-scrollbar font-mono text-sm">
                        {logs.length === 0 ? (
                            <div className="text-slate-600 italic">Waiting for incoming telemetry...</div>
                        ) : (
                            logs.map((log, index) => {
                                // Colorize log levels dynamically
                                let colorClass = 'text-slate-300';
                                if (log.msg.includes('[SUCCESS]')) colorClass = 'text-emerald-400';
                                else if (log.msg.includes('[INFO]') || log.msg.includes('[FLEET]')) colorClass = 'text-blue-300';
                                else if (log.msg.includes('[ERROR]') || log.msg.includes('[FATAL]')) colorClass = 'text-red-400';
                                else if (log.msg.includes('[WARN]')) colorClass = 'text-yellow-400';

                                return (
                                    <div key={index} className={`mb-1 break-all ${colorClass}`}>
                                        <span className="text-slate-600 mr-2">{new Date().toLocaleTimeString(undefined, { hour12: false })}</span>
                                        {log.name && <span className="text-purple-400 font-semibold mr-2">[{log.name}]</span>}
                                        {log.msg}
                                    </div>
                                );
                            })
                        )}
                        <div ref={terminalEndRef} />
                    </div>
                </div>
            </div>

        </div>
    );
}
