import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import {
    DollarSign, TrendingUp, CreditCard, Landmark,
    FileText, ArrowRight, PieChart, Download, Wallet, Activity
} from 'lucide-react';

const FinanceDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { label: 'Total Employees', value: '...', sub: 'Loading...' },
        { label: 'Active Users', value: '...', sub: 'Loading...' },
        { label: 'Database Health', value: '...', sub: 'Loading...' },
        { label: 'Processing Output', value: '...', sub: 'Loading...' },
        { label: 'Audit Logs', value: '...', sub: 'Loading...' },
        { label: 'System Status', value: '...', sub: 'Loading...' },
    ]);
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const companyStr = localStorage.getItem('selectedCompany');
                const company = companyStr ? JSON.parse(companyStr) : null;
                const [statsRes, logsRes] = await Promise.all([
                    api.fetchAdminStats(company?.id),
                    api.fetchAuditLogs(4)
                ]);
                if (statsRes.success) setStats(statsRes.data);
                if (logsRes.success) setLogs(logsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins} mins ago`;
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        return date.toLocaleDateString();
    };

    const quickActions = [
        { label: 'Bank Transfer Advice', icon: <Landmark size={18} />, path: '/reports/bank-transfer-advice', desc: 'Generate ACH Files' },
        { label: 'Cheque Printing', icon: <CreditCard size={18} />, path: '/processing/cheque-printing', desc: 'Batch Print Queue' },
        { label: 'S01 Return', icon: <FileText size={18} />, path: '/statutory/s01', desc: 'Tax Compliance' },
        { label: 'GL Interface', icon: <PieChart size={18} />, path: '/reports/ledger', desc: 'General Ledger Export' },
        { label: 'Payroll Register', icon: <FileText size={18} />, path: '/payroll/register', desc: 'Detailed Breakdown' },
        { label: 'Disbursement', icon: <DollarSign size={18} />, path: '/processing/disbursement', desc: 'Confirm Payments' },
    ];

    const handleExportFinancials = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Category,Value,Status\n"
            + stats.map(e => `${e.label},${e.value},${e.sub}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "financial_summary.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadBankFiles = () => {
        alert("Downloading bank transfer files...");
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F5F7] font-sans p-4 md:p-6 overflow-y-auto relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white/20 z-50 flex items-center justify-center backdrop-blur-[1px]">
                    <Activity className="animate-pulse text-blue-600" size={32} />
                </div>
            )}
            {/* Header */}
            <div className="border-b border-gray-300 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
                        Financial Controller Center
                    </h1>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Treasury & Disbursement Operations</p>
                </div>
                <button
                    onClick={handleExportFinancials}
                    className="bg-gray-700 text-white px-4 py-1.5 rounded shadow-sm flex items-center gap-2 hover:bg-gray-800 transition-colors uppercase text-[10px] font-bold"
                >
                    <Download size={14} /> Export Data
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-3 border border-gray-300 rounded shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
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
                        Treasury Management
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
                                <Landmark size={16} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Banking Files Ready</h4>
                                <p className="text-xs font-medium text-gray-700">ACH transfer files for the current period have been generated.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDownloadBankFiles}
                            className="bg-gray-700 text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-gray-800 transition-colors"
                        >
                            Download
                        </button>
                    </div>
                </div>

                {/* Right: Activity & Analytics */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 pb-1">
                        Ledger Activity
                    </h3>
                    <div className="bg-white border border-gray-300 rounded p-4 flex-1 shadow-sm">
                        <div className="flex flex-col gap-4">
                            {logs.length > 0 ? (
                                logs.map((log, i) => (
                                    <div key={i} className="flex gap-4 items-start border-l-2 border-gray-200 pl-4 py-1">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-800 tracking-tighter">{log.username || 'System'}</span>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold bg-gray-100 text-gray-600`}>{log.entity || 'LOG'}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{log.action.replace(/_/g, ' ')}</p>
                                            <span className="text-[8px] text-gray-400 font-bold uppercase mt-1">{formatTime(log.createdAt)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 italic text-[10px] font-bold uppercase">No recent activity.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
