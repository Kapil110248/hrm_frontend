import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, Clock, Play, Pause, RefreshCw, Calendar, User, X, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600'
    };

    return (
        <div className={`fixed bottom-4 right-4 ${bgColors[type] || 'bg-gray-800'} text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 z-50 animate-fade-in-up`}>
            {type === 'success' && <CheckCircle size={18} />}
            {type === 'error' && <AlertCircle size={18} />}
            <span className="font-bold text-xs uppercase tracking-wide">{message}</span>
            <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-full p-1"><X size={14} /></button>
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded shadow-2xl border border-gray-200 overflow-hidden transform transition-all scale-100">
                <div className="bg-[#D4D0C8] px-4 py-2 border-b border-gray-300 flex justify-between items-center">
                    <h3 className="font-black text-gray-700 uppercase text-xs tracking-wider">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 bg-[#EBE9D8]">
                    {children}
                </div>
            </div>
        </div>
    );
};

const TimeKeeper = () => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [entries, setEntries] = useState([]);
    const [stats, setStats] = useState({ active: 0, lunch: 0, off: 0 });
    const [loading, setLoading] = useState(true);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [departmentFilter, setDepartmentFilter] = useState('All Departments');
    const [departments, setDepartments] = useState([]);
    
    // UI States
    const [toast, setToast] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const intervalRef = useRef(null);
    const [selectedCompany, setSelectedCompany] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('selectedCompany') || '{}');
        } catch {
            return {};
        }
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch Departments helper
    useEffect(() => {
        const uniqueDepts = Array.from(new Set(entries.map(e => e.department))).sort();
        setDepartments(uniqueDepts);
    }, [entries]);

    const fetchData = async (silent = false) => {
        if (!silent) setIsSyncing(true);
        try {
            const res = await api.fetchLiveAttendance(selectedCompany?.id);
            if (res.data) {
                setEntries(res.data.entries || []);
                setStats(res.data.stats || { active: 0, lunch: 0, off: 0 });
                if (!silent) showToast('Data Synced Successfully', 'success');
            }
        } catch (error) {
            console.error("Failed to fetch live attendance", error);
            if (!silent) showToast('Failed to sync data', 'error');
        } finally {
            setLoading(false);
            if (!silent) setIsSyncing(false);
        }
    };

    // Initial Fetch
    useEffect(() => {
        fetchData(true);
    }, [selectedCompany]);

    // Polling Logic
    useEffect(() => {
        if (isMonitoring) {
            intervalRef.current = setInterval(() => {
                fetchData(true); // Silent fetch for polling
            }, 5000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
             if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isMonitoring, selectedCompany]);

    const handleSaveLogs = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            showToast('Monitoring logs saved to database', 'success');
        }, 1500);
    };

    const handleHistory = () => {
        setShowHistoryModal(true);
    };

    const confirmHistoryFetch = () => {
        setShowHistoryModal(false);
        showToast(`Fetching archives for ${historyDate}...`, 'info');
        // Logic to fetch historical data would go here
    };

    const handleStartShift = () => {
        setIsMonitoring(true);
        fetchData(true);
        showToast('Live Monitoring Started', 'success');
    };

    const handlePause = () => {
        setIsMonitoring(false);
        showToast('Live Monitoring Paused', 'info');
    };

    const filteredEntries = entries.filter(entry =>
        departmentFilter === 'All Departments' || entry.department === departmentFilter
    );

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} title="Select Archive Date">
                <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-bold uppercase text-gray-600">Date to retrieve:</label>
                    <input 
                        type="date" 
                        value={historyDate}
                        onChange={(e) => setHistoryDate(e.target.value)}
                        className="p-2 border border-gray-400 rounded-sm font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button 
                            onClick={() => setShowHistoryModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-bold uppercase text-[10px] rounded-sm hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmHistoryFetch}
                            className="px-4 py-2 bg-blue-600 text-white font-bold uppercase text-[10px] rounded-sm hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Retrieve
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Header */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 sm:px-4 py-2 flex justify-between items-center gap-4">
                <div className="flex items-center gap-2 min-w-0">
                    <Clock size={16} className="text-blue-700 shrink-0" />
                    <span className="font-bold text-gray-700 uppercase tracking-tighter truncate">Time Keeper - Real Time Monitoring</span>
                </div>
                <div className="text-blue-800 font-black text-xs sm:text-sm italic whitespace-nowrap bg-white/50 px-3 py-1 rounded shadow-inner">{currentTime}</div>
            </div>

            {/* Content area */}
            <div className="flex-1 p-2 sm:p-4 flex flex-col lg:flex-row gap-4 overflow-y-auto lg:overflow-hidden min-w-0">
                {/* Control Panel */}
                <div className="w-full lg:w-64 bg-[#D4D0C8] border border-gray-400 p-3 shadow-[inset_1px_1px_0_white] shrink-0">
                    <div className="bg-[#316AC5] text-white px-3 py-1.5 font-bold mb-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-between">
                        <span>CONTROLS</span>
                        <div className="lg:hidden text-[9px] font-black opacity-75">MANUAL OVERRIDE</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                        <button
                            onClick={handleStartShift}
                            disabled={isMonitoring}
                            className={`flex items-center gap-3 w-full bg-white border border-gray-500 p-2.5 shadow-sm transition-all rounded-sm group relative overflow-hidden ${isMonitoring ? 'bg-green-50 border-green-500' : 'hover:bg-green-50 active:translate-y-0.5'}`}
                        >
                            <Play size={18} className={`text-green-600 ${isMonitoring ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform`} />
                            <span className="font-black text-[11px] uppercase tracking-tighter text-left z-10">
                                {isMonitoring ? 'MONITORING ACTIVE' : 'START SHIFT LOG'}
                            </span>
                            {isMonitoring && <div className="absolute inset-0 bg-green-100 opacity-20 animate-pulse"></div>}
                        </button>
                        <button
                            onClick={handlePause}
                            disabled={!isMonitoring}
                            className={`flex items-center gap-3 w-full bg-white border border-gray-400 p-2.5 shadow-sm transition-all rounded-sm group ${!isMonitoring ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-50 active:translate-y-0.5'}`}
                        >
                            <Pause size={18} className="text-yellow-600 group-hover:scale-110 transition-transform" />
                            <span className="font-black text-[11px] uppercase tracking-tighter">PAUSE MONITORING</span>
                        </button>
                        <button 
                            onClick={() => fetchData(false)}
                            disabled={isSyncing}
                            className="flex items-center gap-3 w-full bg-white border border-gray-400 p-2.5 hover:bg-blue-50 active:translate-y-0.5 shadow-sm transition-all rounded-sm group"
                        >
                            <RefreshCw size={18} className={`text-blue-600 transition-transform ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                            <span className="font-black text-[11px] uppercase tracking-tighter">
                                {isSyncing ? 'SYNCING...' : 'SYNC BIOMETRIC'}
                            </span>
                        </button>
                    </div>

                    <div className="mt-6 lg:mt-8 border-t border-gray-400 pt-4">
                        <div className="text-[10px] font-bold text-gray-600 uppercase mb-2 tracking-widest">Filters / Views</div>
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                            <div className="relative flex-1">
                                <select
                                    value={departmentFilter}
                                    onChange={(e) => setDepartmentFilter(e.target.value)}
                                    className="w-full p-2 pr-8 border border-gray-400 font-bold bg-white text-[10px] focus:ring-1 focus:ring-blue-500 outline-none appearance-none rounded-sm"
                                >
                                    <option>All Departments</option>
                                    {departments.map(dept => (
                                        <option key={dept}>{dept}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-500 pointer-events-none" />
                            </div>
                            
                            <div className="flex-1 bg-white p-3 border border-gray-400 text-[10px] sm:text-[11px] font-black shadow-inner grid grid-cols-3 sm:grid-cols-1 gap-2">
                                <div className="flex justify-between border-b lg:border-none border-gray-100 pb-1"><span>ACTIVE:</span> <span className="text-green-600">{stats.active}</span></div>
                                <div className="flex justify-between border-b lg:border-none border-gray-100 pb-1"><span>LUNCH:</span> <span className="text-yellow-600">{stats.lunch}</span></div>
                                <div className="flex justify-between border-b lg:border-none border-gray-100 pb-1"><span>OFF:</span> <span className="text-gray-400">{stats.off}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tracking Table Section */}
                <div className="flex-1 flex flex-col border border-gray-400 bg-white shadow-inner overflow-hidden min-h-[400px] sm:min-h-0 relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-3">
                                <RefreshCw className="animate-spin text-blue-600" size={32} />
                                <span className="text-xs font-bold text-blue-800 uppercase tracking-widest animate-pulse">Connecting to time server...</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-[#EBE9D8] p-2 border-b border-gray-400 flex items-center justify-between px-3 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className="font-black uppercase tracking-wider text-[11px]">{isMonitoring ? 'Live Status Feed' : 'Feed Paused'}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border transition-colors duration-300 ${isMonitoring ? 'text-green-700 bg-green-100 border-green-200' : 'text-gray-500 bg-gray-100 border-gray-200'}`}>
                            {isMonitoring ? 'System Online' : 'Standby'}
                        </span>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead className="bg-gray-100 sticky top-0 border-b border-gray-300 z-10">
                                <tr className="text-[10px] uppercase font-black text-gray-500 italic">
                                    <th className="p-3 border-r border-gray-200">ID</th>
                                    <th className="p-3 border-r border-gray-200">Employee Name</th>
                                    <th className="p-3 border-r border-gray-200">Dept</th>
                                    <th className="p-3 border-r border-gray-200">Clock In</th>
                                    <th className="p-3 border-r border-gray-200">Break Status</th>
                                    <th className="p-3">Current Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <User size={32} className="opacity-20" />
                                                <span className="text-xs font-bold italic">No active employees found in this sector.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEntries.map(entry => (
                                        <tr key={entry.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors group cursor-default">
                                            <td className="p-3 font-mono text-gray-400 group-hover:text-blue-600 transition-colors">#{entry.id}</td>
                                            <td className="p-3 flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 border border-blue-200 group-hover:scale-110 group-hover:shadow-sm transition-all duration-300">
                                                    <User size={14} className="text-blue-600" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-blue-900 leading-none group-hover:text-blue-700 transition-colors">{entry.name}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold sm:hidden">{entry.department}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 font-bold text-gray-600">{entry.department}</td>
                                            <td className="p-3 font-mono text-gray-500 italic">{entry.clockIn}</td>
                                            <td className="p-3">
                                                <span className={`px-2.5 py-1 rounded-sm text-[9px] font-black tracking-widest shadow-sm ${entry.breakStatus === 'OUT' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                                    {entry.breakStatus}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${entry.status === 'WORKING' ? 'bg-green-500' : entry.status === 'ON BREAK' ? 'bg-orange-500' : 'bg-gray-400'} group-hover:scale-125 transition-transform`}></div>
                                                    <span className="font-black text-[11px] uppercase group-hover:tracking-wider transition-all duration-300">{entry.status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer Stats */}
                    <div className="bg-[#EBE9D8] p-3 border-t border-gray-400 flex flex-col sm:flex-row justify-between items-center px-4 text-[10px] font-black text-gray-500 gap-2 shrink-0">
                        <span className="uppercase tracking-widest">LAST SYNC: {new Date().toLocaleTimeString()}</span>
                        <div className="flex gap-6 uppercase tracking-widest bg-white/30 px-3 py-1 rounded text-right">
                            <div className="flex gap-2 justify-end"><span>Total Employees:</span> <span className="text-gray-900">{entries.length}</span></div>
                        </div>
                    </div>
                </div>

                {/* Vertical / Horizontal Action Buttons */}
                <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-20 lg:h-full shrink-0 items-stretch">
                    <button
                        onClick={handleSaveLogs}
                        disabled={isSaving}
                        className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 border-2 border-white border-b-gray-600 border-r-gray-600 bg-[#E0DCCF] hover:bg-white active:bg-gray-100 active:translate-y-0.5 transition-all shadow-md group relative overflow-hidden"
                    >
                        {isSaving ? (
                             <RefreshCw className="text-blue-600 mb-1 animate-spin" size={24} />
                        ) : (
                             <Save className="text-blue-600 mb-1 group-hover:scale-110 transition-transform" size={24} />
                        )}
                        <span className="font-black text-[10px] uppercase text-center">
                            {isSaving ? 'SAVING...' : 'SAVE LOGS'}
                        </span>
                    </button>
                    <button
                        onClick={handleHistory}
                        className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 border-2 border-white border-b-gray-600 border-r-gray-600 bg-[#E0DCCF] hover:bg-white active:bg-gray-100 active:translate-y-0.5 transition-all shadow-md group"
                    >
                        <Calendar className="text-gray-700 mb-1 group-hover:scale-110 transition-transform" size={24} />
                        <span className="font-black text-[10px] uppercase">History</span>
                    </button>
                    <div className="hidden lg:block flex-1"></div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 border-2 border-white border-b-gray-600 border-r-gray-600 bg-[#E0DCCF] hover:bg-red-50 active:bg-red-100 active:translate-y-0.5 transition-all shadow-md group"
                    >
                        <LogOut className="text-red-600 mb-1 group-hover:rotate-12 transition-transform" size={24} />
                        <span className="font-black text-[10px] uppercase text-red-700">EXIT</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimeKeeper;
