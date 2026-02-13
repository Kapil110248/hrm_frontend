import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle2, AlertTriangle, Clock, RefreshCw, BarChart3, LogOut, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const ProcessingStatus = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, failed: 0 });
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));
    const [modules, setModules] = useState([]);

    const fetchStatusData = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const [statusRes, statsRes] = await Promise.all([
                api.fetchProcessingStatus({ companyId: selectedCompany.id }),
                api.fetchProcessingStatistics({ companyId: selectedCompany.id })
            ]);

            if (statusRes.success) {
                const { activeProcesses, recentCompleted } = statusRes.data;
                const allLogs = [...activeProcesses, ...recentCompleted];

                if (allLogs.length > 0) {
                    const mapped = allLogs.map(l => ({
                        name: l.processType.replace(/_/g, ' '),
                        status: l.status === 'STARTED' || l.status === 'IN_PROGRESS' ? 'In Progress' : l.status === 'COMPLETED' ? 'Completed' : 'Failed',
                        time: new Date(l.startedAt).toLocaleTimeString(),
                        details: l.status === 'IN_PROGRESS' ? `Processed ${l.recordsProcessed} of ${l.recordsTotal}` : l.errorMessage || `Executed by ${l.processedBy}`,
                        progress: l.recordsTotal > 0 ? (l.recordsProcessed / l.recordsTotal) * 100 : (l.status === 'COMPLETED' ? 100 : 0),
                        icon: l.status === 'COMPLETED' ? <CheckCircle2 className="text-green-500" /> :
                            l.status === 'FAILED' ? <AlertTriangle className="text-red-500" /> :
                                <RefreshCw className="text-blue-500 animate-spin" />
                    }));
                    setModules(mapped);
                } else {
                    setModules([
                        { name: 'SYSTEM_IDLE', status: 'Standby', time: '-', details: 'No active or recent processing tasks detected.', icon: <CheckCircle2 className="text-gray-300" /> }
                    ]);
                }
            }

            if (statsRes.success) {
                const s = statsRes.data;
                setStats({
                    total: s.totalRecordsProcessed || 0,
                    pending: (s.byStatus?.started || 0) + (s.byStatus?.inProgress || 0),
                    completed: s.byStatus?.completed || 0,
                    failed: s.byStatus?.failed || 0
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatusData();
        const interval = setInterval(fetchStatusData, 30000);
        return () => clearInterval(interval);
    }, [selectedCompany.id]);

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs min-w-0">
            {/* Header */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 border border-gray-400 shadow-inner rounded-sm">
                        <Activity size={20} className="text-blue-700 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="font-black text-blue-900 leading-tight italic uppercase text-base sm:text-lg tracking-tight underline decoration-blue-500/20 underline-offset-4">System Telemetry Interface</h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] italic">Station 042 :: Real-time Processing Monitor</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {loading && <div className="text-[10px] font-black text-blue-700 animate-bounce tracking-widest mr-2">POLLING_DRIVERS...</div>}
                    <button
                        onClick={fetchStatusData}
                        disabled={loading}
                        className="bg-[#E0DCCF] border-2 border-white border-r-gray-600 border-b-gray-600 px-6 py-2 flex items-center gap-2 text-blue-900 font-black hover:bg-white text-[10px] sm:text-xs tracking-widest shadow-md active:translate-y-1 active:shadow-inner active:border-b-0 active:border-r-0 transition-all uppercase italic"
                    >
                        <RefreshCw size={14} className={`text-blue-600 ${loading ? 'animate-spin' : ''}`} />
                        <span>Force Telemetry Update</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 sm:p-8 overflow-auto scrollbar-thin scrollbar-thumb-gray-400">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">

                    {/* Left - Module Status Cards */}
                    <div className="space-y-4 sm:space-y-6">
                        {modules.map((module, idx) => (
                            <div key={idx} className="bg-white border-2 border-white border-r-gray-400 border-b-gray-400 p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 group hover:border-blue-500 hover:scale-[1.01] transition-all rounded-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none group-hover:bg-blue-50/50 transition-colors"></div>
                                <div className="flex items-center gap-6 flex-1 relative z-10">
                                    <div className="p-4 sm:p-5 bg-gray-50 border-2 border-white border-r-gray-200 border-b-gray-200 shadow-inner group-hover:bg-blue-50 group-hover:border-blue-100 shrink-0 transition-colors rounded-xl">
                                        {module.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap justify-between items-start sm:items-center gap-2 mb-2">
                                            <h3 className="text-lg sm:text-xl font-black text-blue-900 italic uppercase tracking-tighter group-hover:translate-x-1 transition-transform">{module.name}</h3>
                                            <span className={`text-[10px] font-black italic uppercase px-3 py-1 rounded shadow-sm border-2 ${module.status === 'Completed' ? 'bg-green-50 border-green-200 text-green-700' :
                                                module.status === 'In Progress' ? 'bg-blue-50 border-blue-200 text-blue-700 animate-pulse' :
                                                    module.status === 'Failed' ? 'bg-red-50 border-red-200 text-red-700' :
                                                        'bg-gray-50 border-gray-300 text-gray-500'
                                                }`}>
                                                {module.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 italic">{module.details}</p>

                                        {module.progress > 0 && (
                                            <div className="w-full h-2.5 bg-gray-100 border-2 border-white border-r-gray-200 border-b-gray-200 rounded-full overflow-hidden shadow-inner font-mono text-[8px] text-blue-900 font-bold relative">
                                                <div
                                                    className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-1000"
                                                    style={{ width: `${module.progress}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex sm:flex-col justify-between sm:justify-center sm:text-right border-t-2 sm:border-t-0 border-gray-50 pt-4 sm:pt-0 sm:border-l-2 sm:pl-8 min-w-[120px] relative z-10">
                                    <p className="text-[10px] font-black text-gray-300 uppercase italic tracking-widest">Protocol Pulse</p>
                                    <p className="text-sm sm:text-base font-black text-blue-800 italic tabular-nums tracking-tighter uppercase">{module.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right - Global Analytics */}
                    <div className="space-y-6 lg:max-w-[350px] lg:w-full">
                        <div className="bg-[#000080] text-white p-6 sm:p-8 shadow-2xl border-4 border-white flex flex-col gap-6 rounded-sm relative group overflow-hidden">
                            <div className="absolute inset-0 bg-blue-900 opacity-50 group-hover:opacity-30 transition-opacity"></div>
                            <h3 className="font-black italic text-sm sm:text-base mb-2 border-b-2 border-blue-400/30 pb-3 uppercase tracking-[0.2em] flex items-center gap-3 relative z-10">
                                <BarChart3 size={18} className="text-blue-300" /> Station Load Matrix
                            </h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center bg-blue-950/50 p-4 rounded border border-blue-800/50 hover:border-blue-400 transition-colors">
                                    <span className="font-bold text-[10px] uppercase opacity-60 tracking-widest">Total Records</span>
                                    <span className="font-black italic text-lg tabular-nums text-green-400">{stats.total}</span>
                                </div>
                                <div className="flex justify-between items-center bg-blue-950/50 p-4 rounded border border-blue-800/50 hover:border-blue-400 transition-colors">
                                    <span className="font-bold text-[10px] uppercase opacity-60 tracking-widest">Pending Tasks</span>
                                    <span className="font-black italic text-sm tracking-tight text-blue-200">{stats.pending}</span>
                                </div>
                                <div className="flex justify-between items-center bg-blue-950/50 p-4 rounded border border-blue-800/50 hover:border-blue-400 transition-colors">
                                    <span className="font-bold text-[10px] uppercase opacity-60 tracking-widest">Completed</span>
                                    <span className="font-black italic text-lg tabular-nums text-blue-400 tracking-tighter">{stats.completed}</span>
                                </div>
                                <div className="flex justify-between items-center bg-blue-950/50 p-4 rounded border border-blue-800/50 hover:border-blue-400 transition-colors">
                                    <span className="font-bold text-[10px] uppercase opacity-60 tracking-widest">Failed</span>
                                    <span className="font-black italic text-sm tracking-tight text-red-400">{stats.failed}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-white border-r-gray-400 border-b-gray-400 p-6 shadow-xl italic rounded-sm hover:-translate-y-1 transition-transform border-l-4 border-l-blue-900">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle size={16} className="text-blue-900" />
                                <p className="font-black text-blue-900 uppercase italic text-[10px] sm:text-[11px] tracking-widest">Admin Directive</p>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold leading-relaxed uppercase tracking-tighter italic">
                                SYSTEM_READY: All core redundancy protocols verified for Feb-2026 calc session. Please monitor bank handshake latency.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#D4D0C8] border-t-2 border-white p-3 px-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 no-print shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-white px-4 py-1.5 border-2 border-white border-r-gray-200 border-b-gray-200 rounded-full shadow-inner">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <span className="font-black text-green-800 italic uppercase text-[10px] sm:text-[11px] tracking-widest">Security Link Cache: Verified</span>
                    </div>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-[#E0DCCF] border-2 border-white border-r-red-900 border-b-red-900 px-10 py-3 font-black italic hover:bg-white text-red-700 transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest shadow-xl active:translate-y-1 active:shadow-inner active:border-b-0 active:border-r-0"
                >
                    <LogOut size={16} /> <span className="whitespace-nowrap italic">Terminate Session</span>
                </button>
            </div>
        </div>
    );
};

export default ProcessingStatus;
