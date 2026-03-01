import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { Settings, Save, Server, GlobeLock, Cpu } from 'lucide-react';

export default function Configurator() {
    const { settings, socket } = useContext(AppContext);
    const [localConfig, setLocalConfig] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Sync inputs with global state initially
    useEffect(() => {
        setLocalConfig(settings);
        setHasChanges(false);
    }, [settings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLocalConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked || false) : (value || '')
        }));
        setHasChanges(true); // Always trip hasChanges when a stroke occurs
    };

    const handleSave = () => {
        setIsSaving(true);
        socket.emit('save-settings', localConfig);
        setTimeout(() => {
            setIsSaving(false);
            setHasChanges(false);
        }, 800);
    };

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Settings className="text-blue-400" />
                    Engine Configuration
                </h1>
                <p className="text-slate-400 mt-2">Tune network bypasses, withdrawal rules, and core fleet operations.</p>
            </div>

            {/* Fleet Logic Rules */}
            <section>
                <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <Cpu className="text-blue-400" size={20} />
                    Operational Rules
                </h2>
                <div className="glass-panel space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 uppercase tracking-widest">Master Vault Address</label>
                            <input
                                name="mainWalletAddress"
                                value={localConfig.mainWalletAddress || ''}
                                onChange={handleChange}
                                placeholder="nano_123xyz..."
                                className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 uppercase tracking-widest">Referral Code</label>
                            <input
                                name="referralCode"
                                value={localConfig.referralCode || ''}
                                onChange={handleChange}
                                placeholder="OpcZ..."
                                className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <input type="checkbox" name="referralEnabled" checked={localConfig.referralEnabled || false} onChange={handleChange} className="w-4 h-4 rounded text-blue-500 bg-slate-800 border-slate-600" />
                                <span className="text-xs text-slate-400">Enable Referral Injection</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Network & Identity Evastion */}
            <section>
                <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <GlobeLock className="text-emerald-400" size={20} />
                    Identity Evasion
                </h2>
                <div className="glass-panel space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-800/20 rounded-lg border border-slate-700/50">
                        <div>
                            <h3 className="font-semibold text-emerald-400">Randomized IP Spoofing</h3>
                            <p className="text-xs text-slate-400 mt-1">Inject dynamic X-Forwarded-For headers to bypass Cloudflare rate-limits globally.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="useFakeIp" checked={localConfig.useFakeIp || false} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-800/50">
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest">Proxy Integration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="proxyHost" value={localConfig.proxyHost || ''} onChange={handleChange} placeholder="Host (e.g. zproxy.lum-superproxy.io)" className="bg-[#0a0f1c] border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 w-full" />
                            <input name="proxyPort" value={localConfig.proxyPort || ''} onChange={handleChange} placeholder="Port (e.g. 22225)" className="bg-[#0a0f1c] border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 w-full" />
                            <input name="proxyUser" value={localConfig.proxyUser || ''} onChange={handleChange} placeholder="Username" className="bg-[#0a0f1c] border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 w-full" />
                            <input name="proxyPass" type="password" value={localConfig.proxyPass || ''} onChange={handleChange} placeholder="Password" className="bg-[#0a0f1c] border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 w-full" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Network Internals */}
            <section>
                <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <Server className="text-purple-400" size={20} />
                    Internal Interfaces
                </h2>
                <div className="glass-panel">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 uppercase tracking-widest">Turnstile Solver URL</label>
                        <input
                            name="turnstileSolverUrl"
                            value={localConfig.turnstileSolverUrl || ''}
                            onChange={handleChange}
                            placeholder="http://localhost:3000"
                            className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600"
                        />
                        <p className="text-xs text-slate-500">The HTTP bridge routing address for the Puppeteer evasion orchestrator.</p>
                    </div>
                </div>
            </section>

            {/* Persistent Save Banner */}
            <div className={`fixed bottom-0 md:bottom-6 left-0 right-0 md:left-64 mx-auto max-w-3xl transform transition-transform duration-300 z-50 p-4 md:p-0 ${hasChanges ? 'translate-y-0' : 'translate-y-[150%]'}`}>
                <div className="glass-panel bg-[#1e293b]/95 border-blue-500/30 flex items-center justify-between p-4 shadow-2xl shadow-black">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></div>
                        <span className="text-sm font-medium text-slate-200">Unsaved configuration changes.</span>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/20"
                    >
                        {isSaving ? 'Synching...' : <><Save size={18} /> Apply Config</>}
                    </button>
                </div>
            </div>

        </div>
    );
}
