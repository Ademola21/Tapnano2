import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../App';
import { Activity, Server, Users, Zap, Terminal, Play, Pause, Square, Power } from 'lucide-react';

export default function Dashboard() {
    const { globalStats, nodeHealth, runners, logs, socket, settings } = useContext(AppContext);
    const terminalEndRef = useRef(null);
    const terminalContainerRef = useRef(null);
    const [targetSize, setTargetSize] = useState(settings?.activeFleet?.targetSize || 1);

    // Sync local target size with settings if it changes externally
    useEffect(() => {
        if (settings?.activeFleet?.targetSize) {
            setTargetSize(settings.activeFleet.targetSize);
        }
    }, [settings?.activeFleet?.targetSize]);

    // Optimize terminal scrolling to avoid lag
    // Only auto-scroll if the user is already at or very near the bottom
    useEffect(() => {
        const container = terminalContainerRef.current;
        if (container) {
            const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
            if (isAtBottom && terminalEndRef.current) {
                // Use 'auto' instead of 'smooth' to prevent rendering lag on high-frequency logs
                terminalEndRef.current.scrollIntoView({ behavior: 'auto' });
            }
        }
    }, [logs]);

    const healthyNodes = Object.values(nodeHealth).filter(n => n.healthy).length;
    const totalNodes = Object.keys(nodeHealth).length;

    const handleStartFleet = () => {
        socket.emit('start-fleet', {
            targetSize: parseInt(targetSize) || 1,
            autoWithdrawEnabled: settings?.activeFleet?.autoWithdraw || false,
            withdrawLimit: settings?.activeFleet?.withdrawLimit || 0,
            mainWalletAddress: settings?.mainWalletAddress
        });
    };

    const handleStopFleet = () => {
        socket.emit('stop-fleet');
        setTargetSize(0);
    };

    const handlePauseFleet = () => socket.emit('pause-fleet');
    const handleResumeFleet = () => socket.emit('resume-fleet');

    const isPaused = settings?.fleetPaused;
    const isRunning = Object.keys(runners).length > 0;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Activity className="text-blue-400" />
                    Fleet Telemetry
                </h1>
                <p className="text-slate-400 mt-2">Real-time monitoring and control of your Tapnano infrastructure.</p>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

            {/* Fleet Command Section */}
            <div className="glass-panel p-6 border-blue-500/20">
                <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
                    <Power size={20} className="text-blue-400" />
                    Fleet Command
                </h2>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-full md:w-1/3 flex flex-col space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Workers</label>
                        <input
                            type="number"
                            min="0"
                            value={targetSize}
                            onChange={(e) => setTargetSize(e.target.value)}
                            className="bg-[#0a0f1c] border border-slate-700/80 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full"
                        />
                    </div>

                    <div className="w-full md:w-2/3 flex flex-wrap gap-3 mt-2 md:mt-6">
                        {!isRunning || (isRunning && targetSize != Object.keys(runners).length && targetSize > 0) ? (
                            <button
                                onClick={handleStartFleet}
                                className="flex-1 min-w-[120px] py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all border border-emerald-500/50"
                            >
                                <Play size={18} /> {isRunning ? 'Update Fleet' : 'Start Mining'}
                            </button>
                        ) : null}

                        {isRunning && (
                            <>
                                {isPaused ? (
                                    <button
                                        onClick={handleResumeFleet}
                                        className="flex-1 min-w-[120px] py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all border border-blue-500/50"
                                    >
                                        <Play size={18} /> Resume
                                    </button>
                                ) : (
                                    <button
                                        onClick={handlePauseFleet}
                                        className="flex-1 min-w-[120px] py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition-all border border-yellow-500/50"
                                    >
                                        <Pause size={18} /> Pause
                                    </button>
                                )}

                                <button
                                    onClick={handleStopFleet}
                                    className="flex-1 min-w-[120px] py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all border border-red-500/50"
                                >
                                    <Square size={18} /> Stop All
                                </button>
                            </>
                        )}
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
                    <div ref={terminalContainerRef} className="p-4 h-[400px] overflow-y-auto custom-scrollbar font-mono text-sm">
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
                        {/* Empty div to anchor auto-scroll */}
                        <div ref={terminalEndRef} />
                    </div>
                </div>
            </div>

        </div>
    );
}
