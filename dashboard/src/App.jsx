import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';

import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import WalletManager from './pages/WalletManager';
import Configurator from './pages/Configurator';

const socket = io(window.location.origin);

export const AppContext = React.createContext(null);

function App() {
  const [accounts, setAccounts] = useState([]);
  const [runners, setRunners] = useState({});
  const [nodeHealth, setNodeHealth] = useState({});
  const [settings, setSettings] = useState({});
  const [rescuedWallets, setRescuedWallets] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalEarned: 0, activeCount: 0 });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    socket.on('init', (data) => {
      setAccounts(data.accounts || []);
      const runnerMap = {};
      (data.runners || []).forEach(r => runnerMap[r.name] = r);
      setRunners(runnerMap);
      if (data.nodeHealth) setNodeHealth(data.nodeHealth);
      if (data.settings) setSettings(data.settings);
      if (data.rescued) {
        setRescuedWallets(data.rescued.wallets || []);
      }
    });

    socket.on('settings-updated', (s) => setSettings(s));

    socket.on('runner-status', ({ name, status }) => {
      setRunners(prev => ({ ...prev, [name]: { ...prev[name], status } }));
    });

    socket.on('runner-removed', (name) => {
      setRunners(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      setAccounts(prev => prev.filter(a => a.name !== name));
    });

    socket.on('sync-state', ({ earnings, proxyWallets, logs: newLogs }) => {
      setAccounts(prev => prev.map(a => {
        if (earnings[a.name] !== undefined) return { ...a, earnings: earnings[a.name] };
        return a;
      }));
      setRunners(prev => {
        const next = { ...prev };
        Object.keys(proxyWallets || {}).forEach(name => {
          if (next[name]) next[name].proxyWallet = proxyWallets[name];
        });
        return next;
      });

      if (newLogs && newLogs.length > 0) {
        setLogs(prev => {
          const combined = [...prev, ...newLogs];
          return combined.slice(-100);
        });
      }
    });

    socket.on('rescue-updated', (data) => {
      setRescuedWallets(data.wallets || []);
    });

    socket.on('rescue-status', ({ seed, status }) => {
      setRescuedWallets(prev => prev.map(w => w.seed === seed ? { ...w, status } : w));
    });

    return () => socket.off();
  }, []);

  useEffect(() => {
    let earned = 0;
    let active = Object.values(runners).filter(r => r.status === 'running' || r.status === 'consolidating').length;
    accounts.forEach(a => earned += (parseFloat(a.earnings) || 0));
    setGlobalStats({ totalEarned: earned, activeCount: active });
  }, [runners, accounts]);

  const globalContext = {
    socket,
    accounts,
    runners,
    nodeHealth,
    settings,
    rescuedWallets,
    globalStats,
    logs
  };

  return (
    <AppContext.Provider value={globalContext}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="wallet" element={<WalletManager />} />
            <Route path="config" element={<Configurator />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
