import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPeriod } from '../../../utils/formatters';
import {
    User, Calendar, Clock, DollarSign, FileText,
    Download, ArrowRight, Shield, Award, Loader2
} from 'lucide-react';
import { api } from '../../../services/api';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { label: 'Next Pay Date', value: '...', icon: null, sub: 'Loading...' },
        { label: 'Leave Balance', value: '...', icon: null, sub: 'Loading...' },
        { label: 'Net Pay (Last)', value: '...', icon: null, sub: 'Loading...' },
        { label: 'Tax Status', value: '...', icon: null, sub: 'Loading...' },
    ]);
    const [recentDocuments, setRecentDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.fetchEmployeeDashboardStats();
            if (response.success) {
                setStats(response.data.stats);
                setRecentDocuments(response.data.recentDocuments || []);
            }
        } catch (error) {
            console.error('Failed to fetch employee stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const quickActions = [
        { label: 'My Payslips', icon: <FileText size={18} />, path: '/employee/payslips', desc: 'View & Download History' },
        { label: 'Request Leave', icon: <Calendar size={18} />, path: '/leave/request', desc: 'Submit Vacation Request' },
        { label: 'Tax Documents', icon: <FileText size={18} />, path: '/employee/documents', desc: 'P24 & P45 Forms' },
        { label: 'Update Profile', icon: <User size={18} />, path: '/employee/profile', desc: 'Address & Banking Info' },
    ];

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F5F7] font-sans p-4 md:p-6 overflow-y-auto">
            {/* Header */}
            {/* Header */}
            <div className="border-b border-gray-300 pb-4 mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
                        Employee Self-Service Portal
                    </h1>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Personnel Record Management</p>
                </div>
                <div className="bg-white px-3 py-1.5 border border-gray-300 rounded shadow-sm flex items-center gap-2">
                    <Calendar className="text-gray-400" size={14} />
                    <span className="text-[10px] font-bold text-gray-700 uppercase">PERIOD: {formatPeriod()}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-3 border border-gray-300 rounded shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none truncate">{stat.label}</span>
                            <span className="text-lg font-bold text-gray-800 tracking-tight">{stat.value}</span>
                            <span className="text-[8px] font-medium text-gray-400 uppercase italic truncate">{stat.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Quick Action Desk */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 pb-1">
                        Employee Actions
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

                    {/* Announcement Card */}
                    <div className="mt-4 bg-gray-100 border border-gray-300 p-4 rounded flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="text-gray-500">
                                <Award size={16} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Notice Board</h4>
                                <p className="text-xs font-medium text-gray-700 leading-tight">Annual Assessment Reports are now available for review.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/employee/documents')}
                            className="bg-gray-700 text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-gray-800 transition-colors whitespace-nowrap"
                        >
                            View Documents
                        </button>
                    </div>
                </div>

                {/* Right: Recent Files */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 pb-1">
                        Recent Documents
                    </h3>
                    <div className="bg-white border border-gray-300 rounded p-4 flex-1 shadow-sm">
                        <div className="flex flex-col gap-4">
                            {recentDocuments.length === 0 ? (
                                <div className="text-[10px] text-gray-400 italic font-medium py-4 text-center uppercase tracking-widest border-2 border-dashed border-gray-100 italic">
                                    No documents found in registry
                                </div>
                            ) : (
                                recentDocuments.map((file, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 p-1 group hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="text-gray-400">
                                                <FileText size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-gray-800 tracking-tight">{file.name}</span>
                                                <span className="text-[9px] text-gray-400 uppercase tracking-tight">{file.date}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const content = `DOCUMENT: ${file.name}\nType: ${file.type}\nDate: ${file.date}\n\nGenerated by SmartHRM Management Core.`;
                                                const blob = new Blob([content], { type: 'text/plain' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = file.name;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="text-gray-400 hover:text-blue-600 transition-colors transform active:scale-90"
                                        >
                                            <Download size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
