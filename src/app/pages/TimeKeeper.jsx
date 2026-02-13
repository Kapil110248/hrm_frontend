import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, Clock, Play, Pause, RefreshCw, Calendar, User } from 'lucide-react';

const TimeKeeper = () => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [entries, setEntries] = useState([
        { id: 1, name: 'John Doe', department: 'IT', clockIn: '08:30 AM', status: 'Working' },
        { id: 2, name: 'Jane Smith', department: 'HR', clockIn: '09:00 AM', status: 'Working' },
        { id: 3, name: 'Mike Ross', department: 'Finance', clockIn: '08:45 AM', status: 'On Break' },
    ]);
    const [departmentFilter, setDepartmentFilter] = useState('All Departments');

    // Update clock every second
    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSaveLogs = () => {
        alert('SUCCESS: All monitoring logs have been synchronized with the master database.');
    };

    const handleHistory = () => {
        const date = prompt("ENTER DATE (YYYY-MM-DD) OR RANGE TO VIEW ARCHIVE:", new Date().toISOString().split('T')[0]);
        if (date) {
            alert(`RETRIEVING ARCHIVE: Fetching historical attendance logs for ${date}...`);
        }
    };

    const handleStartShift = () => {
        alert('LOGGING STARTED: Session initialized. Monitoring active workers...');
    };

    const handlePause = () => {
        alert('MONITORING PAUSED: Live feed is now in stand-by mode.');
    };

    const filteredEntries = entries.filter(entry =>
        departmentFilter === 'All Departments' ||
        (entry.department === 'IT' && departmentFilter === 'IT Department') ||
        (entry.department === 'HR' && departmentFilter === 'Human Resources') ||
        (entry.department === 'Finance' && departmentFilter === 'Finance Department')
    );

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
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
                            className="flex items-center gap-3 w-full bg-white border border-gray-500 p-2.5 hover:bg-green-50 active:translate-y-0.5 shadow-sm transition-colors rounded-sm group"
                        >
                            <Play size={18} className="text-green-600 group-hover:scale-110 transition-transform" />
                            <span className="font-black text-[11px] uppercase tracking-tighter">START SHIFT LOG</span>
                        </button>
                        <button
                            onClick={handlePause}
                            className="flex items-center gap-3 w-full bg-white border border-gray-400 p-2.5 hover:bg-yellow-50 active:translate-y-0.5 shadow-sm transition-colors rounded-sm group"
                        >
                            <Pause size={18} className="text-yellow-600 group-hover:scale-110 transition-transform" />
                            <span className="font-black text-[11px] uppercase tracking-tighter">PAUSE MONITORING</span>
                        </button>
                        <button className="flex items-center gap-3 w-full bg-gray-100 border border-gray-500 p-2.5 opacity-50 cursor-not-allowed rounded-sm">
                            <RefreshCw size={18} className="text-blue-600" />
                            <span className="font-black text-[11px] uppercase tracking-tighter italic">SYNC BIOMETRIC</span>
                        </button>
                    </div>

                    <div className="mt-6 lg:mt-8 border-t border-gray-400 pt-4">
                        <div className="text-[10px] font-bold text-gray-600 uppercase mb-2 tracking-widest">Filters / Views</div>
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                            <select
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="flex-1 p-1.5 border border-gray-400 font-bold bg-white text-[11px] focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                                <option>All Departments</option>
                                <option>IT Department</option>
                                <option>Human Resources</option>
                                <option>Finance Department</option>
                            </select>
                            <div className="flex-1 bg-white p-3 border border-gray-400 text-[10px] sm:text-[11px] font-black shadow-inner grid grid-cols-3 sm:grid-cols-1 gap-2">
                                <div className="flex justify-between border-b lg:border-none border-gray-100 pb-1"><span>ACTIVE:</span> <span className="text-green-600">12</span></div>
                                <div className="flex justify-between border-b lg:border-none border-gray-100 pb-1"><span>LUNCH:</span> <span className="text-yellow-600">3</span></div>
                                <div className="flex justify-between border-b lg:border-none border-gray-100 pb-1"><span>OFF:</span> <span className="text-gray-400">45</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tracking Table Section */}
                <div className="flex-1 flex flex-col border border-gray-400 bg-white shadow-inner overflow-hidden min-h-[400px] sm:min-h-0">
                    <div className="bg-[#EBE9D8] p-2 border-b border-gray-400 flex items-center justify-between px-3 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            <span className="font-black uppercase tracking-wider text-[11px]">Live Status Feed</span>
                        </div>
                        <span className="text-[9px] text-green-700 font-black uppercase bg-green-100 px-2 py-0.5 rounded border border-green-200">System Online</span>
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
                                {filteredEntries.map(entry => (
                                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors group cursor-default">
                                        <td className="p-3 font-mono text-gray-400 group-hover:text-blue-600">#{entry.id}</td>
                                        <td className="p-3 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 border border-blue-200 group-hover:scale-110 transition-transform">
                                                <User size={14} className="text-blue-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-blue-900 leading-none">{entry.name}</span>
                                                <span className="text-[9px] text-gray-400 font-bold sm:hidden">{entry.department}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 font-bold text-gray-600">{entry.department}</td>
                                        <td className="p-3 font-mono text-gray-500 italic">{entry.clockIn}</td>
                                        <td className="p-3">
                                            <span className={`px-2.5 py-1 rounded-sm text-[9px] font-black tracking-widest ${entry.status === 'On Break' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                                {entry.status === 'On Break' ? 'OUT' : 'IN'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${entry.status === 'Working' ? 'bg-green-500' : 'bg-orange-500'} group-hover:scale-125 transition-transform`}></div>
                                                <span className="font-black text-[11px] uppercase">{entry.status}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer Stats */}
                    <div className="bg-[#EBE9D8] p-3 border-t border-gray-400 flex flex-col sm:flex-row justify-between items-center px-4 text-[10px] font-black text-gray-500 gap-2 shrink-0">
                        <span className="uppercase tracking-widest">LAST SYNC: JUST NOW</span>
                        <div className="flex gap-6 uppercase tracking-widest bg-white/30 px-3 py-1 rounded">
                            <div className="flex gap-2"><span>Total Hours:</span> <span className="text-gray-900">1,450.4</span></div>
                            <div className="flex gap-2"><span>Alerts:</span> <span className="text-red-600">2</span></div>
                        </div>
                    </div>
                </div>

                {/* Vertical / Horizontal Action Buttons */}
                <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-20 lg:h-full shrink-0 items-stretch">
                    <button
                        onClick={handleSaveLogs}
                        className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 border-2 border-white border-b-gray-600 border-r-gray-600 bg-[#E0DCCF] hover:bg-white active:bg-gray-100 active:translate-y-0.5 transition-all shadow-md group"
                    >
                        <Save className="text-blue-600 mb-1 group-hover:scale-110 transition-transform" size={24} />
                        <span className="font-black text-[10px] uppercase">SAVE Logs</span>
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
