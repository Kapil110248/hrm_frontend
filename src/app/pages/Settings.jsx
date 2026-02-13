import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, Settings as SettingsIcon, Shield, Globe, Bell, Database, User, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const Settings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);

    // Default settings
    const defaultSettings = {
        systemName: 'HRM Payroll Pro',
        language: 'English (US)',
        timezone: 'GMT-5 (Jamaica)',
        dateFormat: 'DD/MM/YYYY',
        currency: 'JMD',
        enableNotifications: true,
        autoBackup: true,
        backupFrequency: 'Daily',
        theme: 'Classic Win98',
        sessionTimeout: '30',
        loginSecurity: 'High',
        passwordExpiry: '90',
        allowMultiFactor: false,
        emailAlerts: true,
        desktopAlerts: true
    };

    // Global state
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const response = await api.fetchSystemSettings();
                if (response.success && response.data) {
                    setSettings({ ...defaultSettings, ...response.data });
                    // Apply theme if it was saved
                    if (response.data.theme === 'Dark Mode (Night Owl)') {
                        document.body.classList.add('dark-theme');
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleInputChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const response = await api.updateSystemSettings(settings);
            if (response.success) {
                // Apply theme if changed
                if (settings.theme === 'Dark Mode (Night Owl)') {
                    document.body.classList.add('dark-theme');
                } else {
                    document.body.classList.remove('dark-theme');
                }
                alert('Settings saved successfully!');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save settings.');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General Settings', icon: <SettingsIcon size={16} /> },
        { id: 'security', label: 'Security & Access', icon: <Shield size={16} /> },
        { id: 'localization', label: 'Localization', icon: <Globe size={16} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
        { id: 'database', label: 'Database & Backup', icon: <Database size={16} /> }
    ];

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            {/* Header */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 py-1 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <SettingsIcon size={14} className="text-gray-700" />
                    <span className="font-bold text-gray-700">System Configuration & Settings</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-2 md:p-4 flex flex-col md:flex-row gap-4 overflow-auto">
                {/* Left Sidebar Tabs */}
                <div className="w-full md:w-48 bg-[#D4D0C8] border border-gray-400 flex flex-row md:flex-col overflow-x-auto shrink-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3 py-2 text-left border-b border-gray-300 transition-none ${activeTab === tab.id
                                ? 'bg-[#316AC5] text-white font-bold border-r-4 border-r-yellow-400'
                                : 'text-black hover:bg-gray-300'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                    <div className="flex-1 min-h-[10px]"></div>
                    <div className="p-2 border-t border-gray-400 bg-gray-200">
                        <div className="text-[10px] font-bold text-gray-500 uppercase italic">Version 4.0.2</div>
                    </div>
                </div>

                {/* Right Tab Content */}
                <div className="flex-1 bg-white border border-gray-400 shadow-inner p-6 overflow-auto">
                    {activeTab === 'general' && (
                        <div className="max-w-2xl animate-in fade-in duration-300">
                            <h2 className="text-sm font-bold border-b border-gray-300 pb-2 mb-6 text-blue-800">General System Preferences</h2>

                            <div className="grid grid-cols-[150px_1fr] gap-6 items-center text-xs">
                                <label className="font-bold text-gray-600 text-right">System Display Name</label>
                                <input
                                    type="text"
                                    value={settings.systemName}
                                    onChange={(e) => handleInputChange('systemName', e.target.value)}
                                    className="p-1.5 border border-gray-400 shadow-inner focus:outline-blue-500 font-bold"
                                />

                                <label className="font-bold text-gray-600 text-right">UI Theme Style</label>
                                <select
                                    value={settings.theme}
                                    onChange={(e) => handleInputChange('theme', e.target.value)}
                                    className="p-1.5 border border-gray-400 shadow-inner focus:outline-blue-500 font-bold"
                                >
                                    <option>Classic Win98</option>
                                    <option>Modern Professional</option>
                                    <option>Dark Mode (Night Owl)</option>
                                    <option>High Contrast</option>
                                </select>

                                <label className="font-bold text-gray-600 text-right">Session Timeout (m)</label>
                                <input
                                    type="number"
                                    value={settings.sessionTimeout}
                                    onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                                    className="p-1.5 border border-gray-400 shadow-inner w-32 font-bold"
                                />

                                <div className="col-start-2 pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={settings.enableNotifications}
                                            onChange={(e) => handleInputChange('enableNotifications', e.target.checked)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                        <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Enable In-App System Alerts & Notifications</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="max-w-2xl animate-in fade-in duration-300">
                            <h2 className="text-sm font-bold border-b border-gray-300 pb-2 mb-6 text-amber-800">Security & Access Control</h2>

                            <div className="grid grid-cols-[150px_1fr] gap-6 items-center text-xs">
                                <label className="font-bold text-gray-600 text-right">Minimum Security Level</label>
                                <select
                                    value={settings.loginSecurity}
                                    onChange={(e) => handleInputChange('loginSecurity', e.target.value)}
                                    className="p-1.5 border border-gray-400 font-bold"
                                >
                                    <option>Standard</option>
                                    <option>High</option>
                                    <option>Strict (Locked Down)</option>
                                </select>

                                <label className="font-bold text-gray-600 text-right">Password Expiry (Days)</label>
                                <input
                                    type="number"
                                    value={settings.passwordExpiry}
                                    onChange={(e) => handleInputChange('passwordExpiry', e.target.value)}
                                    className="p-1.5 border border-gray-400 font-bold w-32"
                                />

                                <div className="col-start-2 flex flex-col gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.allowMultiFactor}
                                            onChange={(e) => handleInputChange('allowMultiFactor', e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <span className="font-bold text-gray-700">Enforce Multi-Factor Authentication (MFA)</span>
                                    </label>
                                    <p className="text-[10px] text-gray-400 italic ml-6">Requires valid email server integration for SMS/OTP codes.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'localization' && (
                        <div className="max-w-2xl animate-in fade-in duration-300">
                            <h2 className="text-sm font-bold border-b border-gray-300 pb-2 mb-6 text-blue-800">Regional & Language Settings</h2>

                            <div className="grid grid-cols-[150px_1fr] gap-6 items-center text-xs">
                                <label className="font-bold text-gray-600 text-right">System Language</label>
                                <select
                                    value={settings.language}
                                    onChange={(e) => handleInputChange('language', e.target.value)}
                                    className="p-1.5 border border-gray-400 shadow-inner font-bold"
                                >
                                    <option>English (US)</option>
                                    <option>English (UK)</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>

                                <label className="font-bold text-gray-600 text-right">Time Zone</label>
                                <select
                                    value={settings.timezone}
                                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                                    className="p-1.5 border border-gray-400 shadow-inner font-bold"
                                >
                                    <option>GMT-5 (Jamaica)</option>
                                    <option>GMT-4 (Eastern)</option>
                                    <option>GMT+0 (London)</option>
                                    <option>GMT+5:30 (India)</option>
                                </select>

                                <label className="font-bold text-gray-600 text-right">Date Format</label>
                                <select
                                    value={settings.dateFormat}
                                    onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                                    className="p-1.5 border border-gray-400 shadow-inner font-bold"
                                >
                                    <option>DD/MM/YYYY</option>
                                    <option>MM/DD/YYYY</option>
                                    <option>YYYY-MM-DD</option>
                                </select>

                                <label className="font-bold text-gray-600 text-right">Default Currency</label>
                                <input
                                    type="text"
                                    value={settings.currency}
                                    onChange={(e) => handleInputChange('currency', e.target.value)}
                                    className="p-1.5 border border-gray-400 shadow-inner w-32 font-bold"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="max-w-2xl animate-in fade-in duration-300">
                            <h2 className="text-sm font-bold border-b border-gray-300 pb-2 mb-6 text-green-800">Notification Channels</h2>

                            <div className="space-y-4 text-xs">
                                <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded cursor-pointer hover:bg-white group">
                                    <input
                                        type="checkbox"
                                        checked={settings.emailAlerts}
                                        onChange={(e) => handleInputChange('emailAlerts', e.target.checked)}
                                        className="w-5 h-5"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-800 uppercase">Enable Email Alerts</p>
                                        <p className="text-[10px] text-gray-500">Send critical system events to administrator email address.</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded cursor-pointer hover:bg-white group">
                                    <input
                                        type="checkbox"
                                        checked={settings.desktopAlerts}
                                        onChange={(e) => handleInputChange('desktopAlerts', e.target.checked)}
                                        className="w-5 h-5"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-800 uppercase">Browser Notifications</p>
                                        <p className="text-[10px] text-gray-500">Show desktop push notifications for status updates and tasks.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'database' && (
                        <div className="max-w-2xl animate-in fade-in duration-300">
                            <h2 className="text-sm font-bold border-b border-gray-300 pb-2 mb-6 text-blue-800">Data Management & Backups</h2>

                            <div className="grid grid-cols-[150px_1fr] gap-6 items-center text-xs">
                                <div className="col-start-2">
                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={settings.autoBackup}
                                            onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                        Enable Autonomous Database Backups
                                    </label>
                                </div>

                                <label className="font-bold text-gray-600 text-right">Backup Frequency</label>
                                <select
                                    value={settings.backupFrequency}
                                    onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                                    className="p-1.5 border border-gray-400 shadow-inner font-bold"
                                    disabled={!settings.autoBackup}
                                >
                                    <option>Every Hour</option>
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                </select>

                                <div className="col-start-2 pt-6 flex gap-4">
                                    <button
                                        onClick={() => alert("BACKUP INITIALIZED: System snapshot is being synchronized...")}
                                        className="px-4 py-2 bg-blue-600 text-white font-bold border border-blue-800 shadow-[2px_2px_0_rgba(0,0,0,0.2)] active:translate-y-0.5"
                                    >
                                        Run Manual Backup Now
                                    </button>
                                    <button
                                        onClick={() => alert("SYSTEM PURGE: Old logs have been cleared from disk.")}
                                        className="px-4 py-2 border border-red-500 text-red-600 font-bold bg-white shadow-[2px_2px_0_rgba(0,0,0,0.1)] active:translate-y-0.5"
                                    >
                                        Purge Old Log Files
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Vertical/Horizontal Buttons */}
                <div className="flex flex-row md:flex-col gap-2 w-full md:w-20 shrink-0 justify-end md:justify-start relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/20 z-10 flex items-center justify-center">
                            <Loader2 className="animate-spin text-blue-600" size={24} />
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`flex flex-col items-center justify-center p-2 border border-gray-400 border-b-2 border-r-2 border-gray-500 bg-[#E0DCCF] hover:bg-gray-200 active:border-0 active:translate-y-0.5 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Save className="text-blue-600 mb-1" size={20} />
                        <span className="font-bold text-[10px]">{loading ? 'SAVING...' : 'SAVE ALL'}</span>
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex flex-col items-center justify-center p-2 border border-gray-400 border-b-2 border-r-2 border-gray-500 bg-[#E0DCCF] hover:bg-gray-200 active:border-0 active:translate-y-0.5"
                    >
                        <LogOut className="text-red-600 mb-1" size={20} />
                        <span className="font-bold text-[10px]">CLOSE</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
