import React, { useState, useEffect } from 'react';
import {
    Layout, Monitor, Maximize, Minimize,
    Grid, Layers, RefreshCcw, Save,
    Smartphone, MonitorSmartphone, Check, Loader
} from 'lucide-react';

const WindowManagement = () => {
    const defaultSettings = {
        layoutMode: 'Comfortable',
        animations: true,
        stickyToolbar: true,
        compactSidebar: false,
        autoHideTaskbar: false,
        highContrast: false
    };

    const [settings, setSettings] = useState(defaultSettings);
    const [saveStatus, setSaveStatus] = useState('idle');

    // Load settings from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('hrm_window_settings');
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleReset = () => {
        setSettings(defaultSettings);
        localStorage.removeItem('hrm_window_settings');
        // Visual feedback for the user
        const btn = document.getElementById('reset-btn');
        if (btn) {
            btn.classList.add('bg-green-100', 'text-green-700');
            setTimeout(() => {
                btn.classList.remove('bg-green-100', 'text-green-700');
            }, 500);
        }
    };

    const handleSave = () => {
        setSaveStatus('saving');
        localStorage.setItem('hrm_window_settings', JSON.stringify(settings));

        setTimeout(() => {
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 800);
    };

    const handleTerminate = () => {
        if (confirm('Are you sure you want to terminate all sessions and logout?')) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('selectedCompany');
            window.location.reload(); // Force reload to trigger App.jsx state initialization
        }
    };

    const activeSessions = [
        { id: 1, device: 'Current Session', ip: '192.168.1.1', time: 'Active Now', icon: <Monitor className="text-blue-600" /> },
        { id: 2, device: 'Mobile Terminal', ip: '10.0.0.45', time: '2 mins ago', icon: <Smartphone className="text-gray-400" /> },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] bg-[#EBE9D8] font-sans">
            {/* Header */}
            <div className="bg-[#EBE9D8] border-b border-white p-4 shadow-sm shrink-0">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-indigo-600 p-2 rounded text-white shadow-sm">
                        <Layout size={20} />
                    </div>
                    <div>
                        <h1 className="text-indigo-800 font-black text-xl uppercase tracking-wider">Window Management</h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Workspace & Viewport Configuration</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">

                    {/* Display Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-300 shadow-sm p-6 rounded-sm">
                            <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Interface Preferences</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => setSettings(prev => ({ ...prev, layoutMode: 'Comfortable' }))}
                                    className={`border-2 p-4 rounded cursor-pointer transition-all ${settings.layoutMode === 'Comfortable' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'} `}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Layers size={18} className={settings.layoutMode === 'Comfortable' ? 'text-blue-600' : 'text-gray-400'} />
                                        <span className="font-bold text-xs uppercase">Comfortable</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-tight">Standard spacing with optimized readability for desktop displays.</p>
                                </div>

                                <div
                                    onClick={() => setSettings(prev => ({ ...prev, layoutMode: 'Compact' }))}
                                    className={`border-2 p-4 rounded cursor-pointer transition-all ${settings.layoutMode === 'Compact' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'} `}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Grid size={18} className={settings.layoutMode === 'Compact' ? 'text-blue-600' : 'text-gray-400'} />
                                        <span className="font-bold text-xs uppercase">Compact Density</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-tight">High-density data grids and reduced padding for power users.</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <Minimize size={16} className="text-gray-500" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-700 uppercase">Enable UI Animations</p>
                                            <p className="text-[10px] text-gray-400">Smooth transitions between windows.</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" checked={settings.animations} onChange={() => handleToggle('animations')} className="w-4 h-4" />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <Layout size={16} className="text-gray-500" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-700 uppercase">Sticky Top Bar</p>
                                            <p className="text-[10px] text-gray-400">Keep navigation visible when scrolling.</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" checked={settings.stickyToolbar} onChange={() => handleToggle('stickyToolbar')} className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Reset Actions */}
                        <div className="bg-white border border-gray-300 shadow-sm p-6 rounded-sm">
                            <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-4">Workspace Actions</h2>
                            <div className="flex gap-3">
                                <button
                                    id="reset-btn"
                                    onClick={handleReset}
                                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    <RefreshCcw size={14} /> Reset Layout
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saveStatus !== 'idle'}
                                    className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all min-w-[140px] justify-center ${saveStatus === 'success'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-[#0B4FD7] hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    {saveStatus === 'success' ? (
                                        <> <Check size={14} /> Saved! </>
                                    ) : saveStatus === 'saving' ? (
                                        <> <Loader size={14} className="animate-spin" /> Saving... </>
                                    ) : (
                                        <> <Save size={14} /> Save Preference </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sessions */}
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-300 shadow-sm p-6 rounded-sm h-full">
                            <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-4">Active Viewports</h2>
                            <p className="text-[10px] text-gray-500 mb-4">Manage active sessions connected to your workspace.</p>

                            <div className="space-y-3">
                                {activeSessions.map(session => (
                                    <div key={session.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded bg-gray-50">
                                        <div className="p-2 bg-white rounded border border-gray-200">
                                            {session.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-gray-800 uppercase">{session.device}</p>
                                            <p className="text-[10px] font-mono text-gray-400">{session.ip}</p>
                                        </div>
                                        <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 uppercase">
                                            {session.time}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleTerminate}
                                className="w-full mt-6 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                Terminate Remote Sessions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WindowManagement;
