import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Shield, User, Clock,
    Search, Download, LogOut, Loader2,
    Filter, Calendar, ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';

const AuditLogs = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [limit, setLimit] = useState(50);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const res = await api.fetchAuditLogs(limit);
            if (res.success && Array.isArray(res.data)) {
                setLogs(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch audit logs', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [limit]);

    const formatAction = (action) => {
        if (!action) return 'UNKNOWN ACTION';
        return String(action).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    const handleExport = () => {
        const filtered = logs.filter(log =>
            (log.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.entity || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        const csvString = [
            ["ID", "USER", "ACTION", "ENTITY", "ENTITY ID", "TIMESTAMP", "IP", "USER AGENT"],
            ...filtered.map(l => [
                l.id,
                l.username || l.userId,
                l.action,
                l.entity,
                l.entityId,
                l.createdAt,
                l.ipAddress || 'N/A',
                `"${l.userAgent || 'N/A'}"`
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredLogs = logs.filter(log =>
        (log.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.entity || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F5F7] font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-300 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
                        <Shield className="text-blue-600" size={20} />
                        System Audit Trail
                    </h1>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">
                        Secure immutable event logging
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-white border border-gray-300 text-[10px] font-bold uppercase text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Download size={14} />
                        Export Trail
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-gray-800 text-white text-[10px] font-bold uppercase hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <LogOut size={14} />
                        Exit Console
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-[#EBECEF] p-4 px-6 border-b border-gray-300 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Global Search</label>
                    <div className="flex items-center bg-white border border-gray-300 p-2 shadow-inner focus-within:border-blue-500 transition-colors">
                        <Search size={14} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="NAME, ACTION, OR ENTITY..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-xs font-bold outline-none uppercase placeholder:italic placeholder:font-normal"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Entry Limit</label>
                    <div className="relative">
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="w-full bg-white border border-gray-300 p-2 text-xs font-bold outline-none appearance-none"
                        >
                            <option value={50}>Last 50 Entries</option>
                            <option value={100}>Last 100 Entries</option>
                            <option value={500}>Last 500 Entries</option>
                            <option value={1000}>Full Archive (1000)</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                </div>
                <button
                    onClick={fetchLogs}
                    className="bg-white border border-gray-400 p-2 text-[10px] font-bold uppercase text-blue-700 shadow-sm hover:translate-y-[-1px] active:translate-y-[1px]"
                >
                    Refresh Pulse
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
                <div className="bg-white border border-gray-300 shadow-xl flex-1 flex flex-col overflow-hidden">
                    <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-300">
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-tighter italic">
                                    <th className="p-3 border-r border-gray-200">Session User</th>
                                    <th className="p-3 border-r border-gray-200">Operation / Action</th>
                                    <th className="p-3 border-r border-gray-200 text-center">Entity</th>
                                    <th className="p-3 border-r border-gray-200">ID Reference</th>
                                    <th className="p-3 border-r border-gray-200 text-center">Protocol IP</th>
                                    <th className="p-3">Event Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-blue-600" size={32} />
                                                <span className="text-[10px] font-black text-gray-400 uppercase animate-pulse">Scanning Secure Repository...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length > 0 ? (
                                    filteredLogs.map((log, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors group text-[11px]">
                                            <td className="p-3 border-r border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 group-hover:bg-blue-100 transition-colors">
                                                        <User size={12} />
                                                    </div>
                                                    <span className="font-bold text-gray-800 uppercase">{log.username || 'System'}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 border-r border-gray-100">
                                                <span className="font-bold text-blue-900 italic tracking-tight uppercase">
                                                    {formatAction(log.action)}
                                                </span>
                                            </td>
                                            <td className="p-3 border-r border-gray-100 text-center">
                                                <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-[9px] font-black text-blue-700 uppercase">
                                                    {log.entity || 'CORE'}
                                                </span>
                                            </td>
                                            <td className="p-3 border-r border-gray-100">
                                                <code className="text-[10px] text-gray-400 group-hover:text-blue-600 transition-colors">
                                                    {log.entityId ? `#${log.entityId.substring(0, 8)}...` : 'N/A'}
                                                </code>
                                            </td>
                                            <td className="p-3 border-r border-gray-100 text-center">
                                                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
                                                    {log.ipAddress || '0.0.0.0'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2 text-gray-500 font-mono italic text-[10px]">
                                                    <Clock size={12} />
                                                    {formatTime(log.createdAt)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center text-gray-300 font-black italic uppercase tracking-[0.2em]">
                                            No Immutable Logs Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Footer / Meta */}
                    <div className="bg-gray-50 p-2 px-6 border-t border-gray-300 flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Buffer: {filteredLogs.length} Records displayed</span>
                        <div className="flex items-center gap-2 text-green-600">
                            <Activity size={10} className="animate-pulse" />
                            Live Telemetry Link Active
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
