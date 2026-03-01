import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { Wallet, Download, ArrowRightLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function WalletManager() {
    const { globalStats, rescuedWallets, settings, socket, nodeHealth } = useContext(AppContext);
    const [isSweeping, setIsSweeping] = useState(false);
    const [isRescuing, setIsRescuing] = useState(false);
    const [newNodeUrl, setNewNodeUrl] = useState('');
    const [localMasterWallet, setLocalMasterWallet] = useState(settings?.mainWalletAddress || '');
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        setLocalMasterWallet(settings?.mainWalletAddress || '');
    }, [settings?.mainWalletAddress]);

    const totalRescued = rescuedWallets.reduce((acc, wallet) => acc + (wallet.balance || 0), 0);
    const unwithdrawnTotal = globalStats?.totalEarned || 0;

    const handleSaveMasterWallet = () => {
        socket.emit('save-settings', { ...settings, mainWalletAddress: localMasterWallet });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    const handleSweepFleet = () => {
        setIsSweeping(true);
        socket.emit('sweep-active');
        setTimeout(() => setIsSweeping(false), 3000);
    };

    const handleRescueStuck = () => {
        setIsRescuing(true);
        socket.emit('rescue-stale-sessions');
        setTimeout(() => setIsRescuing(false), 3000);
    };

    const handleAddNode = () => {
        if (!newNodeUrl || !newNodeUrl.startsWith('http')) return;
        const currentNodes = settings.nodes || [];
        if (!currentNodes.includes(newNodeUrl)) {
            socket.emit('save-settings', { ...settings, nodes: [...currentNodes, newNodeUrl] });
            setNewNodeUrl('');
        }
    };

    const handleRemoveNode = (urlToRemove) => {
        const currentNodes = settings.nodes || [];
        socket.emit('save-settings', { ...settings, nodes: currentNodes.filter(n => n !== urlToRemove) });
    };

    const handleCheckNode = (url) => {
        socket.emit('check-node-status', url);
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Wallet className="text-blue-400" />
                    Fintech Wallet
                </h1>
                <p className="text-slate-400 mt-2">Manage your master bank, sweep worker yields, and configure backend nodes.</p>
            </div>

            {/* Hero Balances Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Unwithdrawn Fleet Balance (Actionable) */}
                <div className="glass-panel relative overflow-hidden group border-blue-500/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Download size={64} className="text-blue-400" />
                    </div>

                    <span className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-2 block">Pending Fleet Yield</span>
                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-5xl font-extrabold text-white tracking-tighter">Ӿ {unwithdrawnTotal.toFixed(6)}</span>
                    </div>

                    <button
                        onClick={handleSweepFleet}
                        disabled={isSweeping || unwithdrawnTotal === 0}
                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-300 ${isSweeping || unwithdrawnTotal === 0
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                            }`}
                    >
                        {isSweeping ? <span className="animate-pulse">Sweeping Active Workers...</span> : (
                            <>
                                <Download size={18} /> Force Sweep to Bank
                            </>
                        )}
                    </button>
                </div>

                {/* Master Bank Card (Editable) */}
                <div className="glass-panel bg-gradient-to-br from-[#0f172a] to-[#0a0f1c] relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Master Vault</span>
                            <div className="h-8 w-12 rounded bg-slate-800/80 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border-2 border-emerald-500"></div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <label className="text-xs text-slate-500 uppercase font-semibold">Receiving Address</label>
                            <input
                                value={localMasterWallet}
                                onChange={e => setLocalMasterWallet(e.target.value)}
                                placeholder="nano_123xyz..."
                                className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-3 text-sm font-mono text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleSaveMasterWallet}
                            className={`w-full py-3 rounded-lg font-medium text-sm transition-all duration-300 ${saveSuccess
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                                }`}
                        >
                            {saveSuccess ? 'Saved successfully!' : 'Save Master Wallet'}
                        </button>
                    </div>
                </div>
            </div>

            {/* RPC Network Nodes Manager */}
            <div className="mt-12 mb-8">
                <h2 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
                    Network Operations Endpoints
                </h2>
                <div className="glass-panel overflow-hidden p-0">
                    <div className="p-4 bg-slate-800/20 border-b border-slate-700/50 flex flex-col md:flex-row gap-3">
                        <input
                            value={newNodeUrl}
                            onChange={e => setNewNodeUrl(e.target.value)}
                            placeholder="https://new-nano-node.com/api"
                            className="flex-1 bg-[#0a0f1c] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
                        />
                        <button onClick={handleAddNode} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shadow-lg shadow-blue-500/20">
                            Add Custom RPC
                        </button>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {(settings?.nodes || []).map((nodeUrl, idx) => {
                            const health = nodeHealth[nodeUrl] || { status: 'unknown' };
                            return (
                                <div key={idx} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-slate-800/30 transition-colors gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-slate-200 font-medium font-mono text-sm break-all">{nodeUrl}</span>
                                        <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                                            Capabilities:
                                            <span className={`mx-1 ${health.pow === true ? 'text-emerald-500' : health.pow === false ? 'text-red-500' : 'text-slate-500'} font-bold`}>PoW</span>
                                            <span className={`${health.transfers === true ? 'text-emerald-500' : health.transfers === false ? 'text-red-500' : 'text-slate-500'} font-bold`}>Transfer</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 align-self-end md:align-self-auto w-full md:w-auto justify-between md:justify-end">
                                        <div className="flex items-center gap-2 bg-[#0a0f1c] px-3 py-1.5 rounded-md border border-slate-800">
                                            {health.healthy ? (
                                                <><div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></div><span className="text-sm text-emerald-400 font-mono">{health.latency}ms</span></>
                                            ) : (
                                                <><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-sm text-red-500 font-mono font-medium">Offline</span></>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleCheckNode(nodeUrl)} className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/10 transition">
                                                Test
                                            </button>
                                            <button onClick={() => handleRemoveNode(nodeUrl)} className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition">
                                                Revoke
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {!(settings?.nodes?.length > 0) && (
                            <div className="p-6 text-center text-sm text-slate-500">
                                No backend RPC nodes configured. System relying on internal defaults.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Safety Vault (Stuck Balances) */}
            <div className="mt-12 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                        <ShieldAlert className="text-yellow-400" />
                        Safety Rescue Vault
                    </h2>
                    <button
                        onClick={handleRescueStuck}
                        disabled={isRescuing}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                    >
                        {isRescuing ? 'Scanning...' : 'Scan Dead Workers'}
                    </button>
                </div>

                {rescuedWallets.length === 0 ? (
                    <div className="glass-panel flex flex-col items-center justify-center py-12 text-slate-500 border-dashed border-slate-700">
                        <CheckCircle2 size={48} className="mb-4 opacity-50 text-emerald-500" />
                        <p className="text-lg">No stuck Nano detected.</p>
                        <p className="text-sm">All worker funds have been successfully swept or are actively mining.</p>
                    </div>
                ) : (
                    <div className="glass-panel p-0 overflow-hidden">
                        <div className="p-6 bg-yellow-500/10 border-b border-yellow-500/20">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-yellow-400 font-bold text-lg">Orphaned Balances Found</h3>
                                    <p className="text-yellow-500/70 text-sm">Wallets belonging to crashed/dead workers.</p>
                                </div>
                                <div className="text-3xl font-bold text-yellow-400">Ӿ {totalRescued.toFixed(6)}</div>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-800/50 max-h-[400px] overflow-y-auto">
                            {rescuedWallets.map((wallet, idx) => (
                                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-slate-200 font-medium">{wallet.name || 'Unknown Worker'}</span>
                                        <span className="text-xs font-mono text-slate-500">{wallet.address.slice(0, 15)}...</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-bold text-emerald-400">Ӿ {wallet.balance}</span>
                                        <button className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-sm font-medium transition-colors">
                                            Force Payout
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
