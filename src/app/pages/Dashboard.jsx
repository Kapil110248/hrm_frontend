import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Calendar, Clock, DollarSign, BarChart3,
    FileText, Plus, ArrowRight, Wallet, ShieldCheck,
    Mail, CreditCard, Activity, Landmark
} from 'lucide-react';
import { api } from '../../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState([]);
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const statsRes = await api.fetchAdminStats();
            if (statsRes.success) setStats(statsRes.data);

            const logsRes = await api.fetchProcessingLogs({ companyId: JSON.parse(localStorage.getItem('selectedCompany') || '{}').id });
            if (logsRes.success) setLogs(logsRes.data.logs || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const quickActions = [
        { label: 'Process Payroll', icon: <Activity size={18} />, path: '/processing/payroll-calculation', desc: 'Run Jamaica Tax Engine' },
        { label: 'New Employee', icon: <Plus size={18} />, path: '/employees', desc: 'Add Staff to Registry' },
        { label: 'Electronic Transfer', icon: <Landmark size={18} />, path: '/banking/bns', desc: 'Bank Advice Files' },
        { label: 'My Payslips', icon: <FileText size={18} />, path: '/employee/payslips', desc: 'View History' },
        { label: 'Statutory Returns', icon: <FileText size={18} />, path: '/statutory/s01', desc: 'P45, NIS, NHT, S01' },
        { label: 'Cheque Printing', icon: <CreditCard size={18} />, path: '/processing/cheque-printing', desc: 'Physical Payment Slips' },
    ];

    return (
        <div className="flex flex-col h-full w-full bg-transparent font-sans p-4 overflow-y-auto relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white/20 z-50 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="flex flex-col items-center gap-2">
                        <Activity className="animate-pulse text-blue-600" size={32} />
                        <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Hydrating Dashboard...</span>
                    </div>
                </div>
            )}
            {/* Header / Welcome */}
            <div className="border-b border-gray-400 pb-2 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-blue-900 uppercase tracking-tighter">
                        Human Capital Command Center
                    </h1>
                    <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">Jamaica Region · Enterprise Session</p>
                </div>
                <div className="bg-[#D4D0C8] px-3 py-1 border border-white border-r-gray-500 border-b-gray-500 shadow-sm flex items-center gap-2">
                    <Calendar className="text-gray-600" size={14} />
                    <span className="text-[11px] font-bold text-black uppercase">{new Date().toLocaleDateString('en-JM', { dateStyle: 'medium' })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
                {stats.length > 0 ? (
                    stats.map((stat, idx) => (
                        <div key={idx} className="card-classic p-2 flex flex-col justify-between min-h-[80px]">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none truncate mb-1">{stat.label}</span>
                            <span className="text-lg font-black text-blue-900 tracking-tight">{stat.value}</span>
                            <div className="mt-1 pt-1 border-t border-gray-200">
                                <span className="text-[9px] font-bold text-gray-400 uppercase italic truncate block">{stat.sub}</span>
                            </div>
                        </div>
                    ))
                ) : !isLoading && (
                    <div className="col-span-full p-4 text-center text-gray-400 text-[10px] font-bold uppercase">No connection to statistics engine.</div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Quick Action Desk */}
                <div className="lg:col-span-2 flex flex-col gap-3">
                    <h3 className="text-[11px] font-bold text-blue-900 uppercase tracking-widest border-b border-gray-400 pb-1 mb-1">
                        Operational Controls
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(action.path)}
                                className="btn-classic flex items-center gap-3 h-14 px-3 hover:bg-white group text-left justify-start"
                            >
                                <div className="text-blue-800 group-hover:text-blue-600 transition-none shrink-0">
                                    {action.icon}
                                </div>
                                <div className="flex flex-col truncate flex-1">
                                    <span className="text-[11px] font-bold text-black uppercase tracking-tight truncate group-hover:underline">{action.label}</span>
                                    <span className="text-[9px] text-gray-500 font-medium truncate">{action.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Pending Tasks / Alerts */}
                    <div className="mt-4 bg-[#FFFFE0] border border-gray-400 p-2 flex items-center justify-between gap-4 shadow-[inset_2px_2px_0_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3">
                            <div className="text-orange-600">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-black uppercase">Compliance Exception</h4>
                                <p className="text-[11px] font-medium text-black leading-tight">Registry sync required for updated TAJ tax thresholds.</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/employees')} className="btn-classic text-[10px] h-8">Verify</button>
                    </div>
                </div>

                {/* Right: Activity & Analytics */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-[11px] font-bold text-blue-900 uppercase tracking-widest border-b border-gray-400 pb-1 mb-1">
                        Recent Processing Logs
                    </h3>
                    <div className="card-classic p-0 flex flex-col h-full bg-white">
                        <div className="flex flex-col flex-1 overflow-y-auto max-h-[300px] border border-gray-200 m-2 bg-gray-50">
                            {logs.length > 0 ? (
                                logs.map((log, i) => (
                                    <div key={i} className="flex gap-2 items-start border-b border-gray-200 p-2 last:border-0 hover:bg-blue-50">
                                        <div className="min-w-[40px] text-[9px] font-bold text-gray-400 uppercase pt-0.5">
                                            {new Date(log.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[11px] font-bold text-black truncate">{log.processType.replace(/_/g, ' ')}</span>
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[9px] font-medium text-gray-600 uppercase">Period: {log.period}</span>
                                                <span className={`text-[9px] font-bold uppercase ${log.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-800'}`}>
                                                    [{log.status}]
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-[10px] font-bold uppercase italic">
                                    No recent activity logs found.
                                </div>
                            )}
                        </div>
                        <div className="p-2 border-t border-gray-200 bg-gray-100">
                            <button className="btn-classic w-full text-[10px]">Refresh Monitor</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
