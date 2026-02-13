import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Server, Users, Activity, Settings,
    Database, Lock, AlertTriangle, FileText, Globe, ArrowRight
} from 'lucide-react';
import { api } from '../../../services/api';

const AdminDashboard = () => {
    console.log("AdminDashboard: Rendering...");
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { label: 'System Status', value: '...', sub: 'Loading...' },
        { label: 'Active Users', value: '...', sub: 'Loading...' },
        { label: 'Employees', value: '...', sub: 'Loading...' },
        { label: 'Database Health', value: '...', sub: 'Loading...' },
        { label: 'Processing Output', value: '...', sub: 'Loading...' },
        { label: 'Audit Logs', value: '...', sub: 'Loading...' },
    ]);
    const [logs, setLogs] = useState([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState({});

    useEffect(() => {
        console.log("AdminDashboard: Component Mounted. API:", api);
        
        let companyId = undefined;
        try {
            const companyStr = localStorage.getItem('selectedCompany');
            if (companyStr) {
                const parsed = JSON.parse(companyStr);
                companyId = parsed?.id;
                setSelectedCompany(parsed);
                console.log("AdminDashboard: Selected Company ID:", companyId);
            }
        } catch (e) {
            console.error("AdminDashboard: Error parsing selectedCompany from localStorage", e);
        }

        const fetchDashboardData = async () => {
            console.log("AdminDashboard: Fetching data...");
            try {
                if (!api || typeof api.fetchAdminStats !== 'function') {
                    console.error("AdminDashboard: API fetchAdminStats is not available!", api);
                    return;
                }

                const [statsRes, logsRes] = await Promise.all([
                    api.fetchAdminStats(companyId).catch(err => {
                        console.error("Fetch Admin Stats Error:", err);
                        return { success: false };
                    }),
                    api.fetchAuditLogs(6).catch(err => {
                        console.error("Fetch Audit Logs Error:", err);
                        return { success: false };
                    })
                ]);

                console.log("AdminDashboard: Stats Response:", statsRes);
                console.log("AdminDashboard: Logs Response:", logsRes);

                if (statsRes?.success && Array.isArray(statsRes.data)) {
                    setStats(statsRes.data);
                }
                if (logsRes?.success && Array.isArray(logsRes.data)) {
                    setLogs(logsRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setIsLoadingLogs(false);
            }
        };
        fetchDashboardData();
    }, []);

    const formatAction = (action) => {
        if (!action) return 'UNKNOWN ACTION';
        try {
            return String(action).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        } catch (e) {
            console.error("Error formatting action:", action, e);
            return 'ERROR';
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'INVALID DATE';
            
            const now = new Date();
            const diffInMs = now - date;
            const diffInMins = Math.floor(diffInMs / (1000 * 60));
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

            if (diffInMins < 1) return 'JUST NOW';
            if (diffInMins < 60) return `${diffInMins} MINS AGO`;
            if (diffInHours < 24) return `${diffInHours} HOURS AGO`;
            return `${diffInDays} DAYS AGO`;
        } catch (e) {
            console.error("Error formatting time:", dateStr, e);
            return 'ERROR';
        }
    };

    const quickActions = [
        { label: 'Company Setup', icon: <Settings size={18} />, path: '/company/setup', desc: 'Master Organization Details' },
        { label: 'User Provisioning', icon: <Users size={18} />, path: '/tools', desc: 'Create/Edit System Users' },
        { label: 'Backup & Restore', icon: <Database size={18} />, path: '/files', desc: 'Data Management' },
        { label: 'System Logs', icon: <FileText size={18} />, path: '/tools', desc: 'View Audit Trails' },
        { label: 'System Configuration', icon: <Globe size={18} />, path: '/company/system-settings', desc: 'Regional & Security Prefs' },
        { label: 'Preference Config', icon: <Lock size={18} />, path: '/company/settings', desc: 'Payroll & UI Preferences' },
    ];

    if (!Array.isArray(stats)) {
        console.error("AdminDashboard: Stats is not an array!", stats);
        return <div className="p-4 text-red-500">Error: Stats data corrupted.</div>;
    }

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F5F7] font-sans p-4 md:p-6 overflow-y-auto">
            {/* Header */}
            <div className="border-b border-gray-300 pb-4 mb-6">
                <h1 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
                    System Administration Console
                </h1>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Status: Restricted Administrative Access</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-3 border border-gray-300 rounded shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                            <span className="text-lg font-bold text-gray-800 tracking-tight">{stat.value}</span>
                            <span className="text-[8px] font-medium text-gray-400 uppercase">{stat.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Quick Action Desk */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 pb-1">
                        Control Operations
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(action.path)}
                                className="bg-white p-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-left flex items-center gap-3 group"
                            >
                                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                                    {action.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">{action.label}</span>
                                    <span className="text-[9px] text-gray-400 font-medium">{action.desc}</span>
                                </div>
                                <ArrowRight className="ml-auto text-gray-300 transition-colors" size={14} />
                            </button>
                        ))}
                    </div>

                    {/* Pending Tasks / Alerts */}
                    <div className="mt-4 bg-gray-100 border border-gray-300 p-4 rounded flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-gray-500">
                                <AlertTriangle size={16} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">System Advisory</h4>
                                <p className="text-xs font-medium text-gray-700">Database maintenance scheduled for 02:00 AM.</p>
                            </div>
                        </div>
                        <button className="bg-gray-700 text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-gray-800 transition-colors">Acknowledge</button>
                    </div>
                </div>

                {/* Right: Activity & Analytics */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 pb-1">
                        System Logs
                    </h3>
                    <div className="bg-white border border-gray-300 rounded p-4 flex-1 shadow-sm">
                        <div className="flex flex-col gap-4">
                            {isLoadingLogs ? (
                                <div className="flex flex-col items-center justify-center p-8 opacity-40">
                                    <Activity size={24} className="animate-pulse mb-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading Logs...</span>
                                </div>
                            ) : Array.isArray(logs) && logs.length > 0 ? (
                                logs.map((log, i) => (
                                    <div key={i} className="flex gap-4 items-start border-l-2 border-gray-200 pl-4 py-1 hover:border-blue-400 transition-colors">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-800">{log.username || 'System'}</span>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold bg-blue-50 text-blue-600`}>{log.entity || 'LOG'}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium">{formatAction(log.action)}</p>
                                            <span className="text-[8px] text-gray-400 font-bold uppercase">{formatTime(log.createdAt)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 italic text-[10px] font-bold uppercase">No activity recorded.</div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/tools')}
                            className="w-full mt-6 py-2 border border-gray-200 text-gray-400 text-[9px] font-bold uppercase hover:bg-gray-50 transition-all"
                        >
                            Full Audit Trail
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
