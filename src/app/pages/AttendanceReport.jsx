import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, LogOut, Loader2, Download } from 'lucide-react';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';

const AttendanceReport = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!selectedCompany.id) return;
            try {
                setLoading(true);
                const response = await api.fetchAttendance({ companyId: selectedCompany.id });
                if (response.success) {
                    setAttendanceData(response.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [selectedCompany.id]);

    const formatTime = (time) => {
        if (!time) return '-';
        return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    };

    const handleExportExcel = () => {
        if (attendanceData.length === 0) return;
        const dataToExport = attendanceData.map(record => ({
            'Employee ID': record.employee?.employeeId || '-',
            'Full Name': `${record.employee?.firstName} ${record.employee?.lastName}`,
            'Report Date': formatDate(record.date),
            'Time In': formatTime(record.checkIn),
            'Time Out': formatTime(record.checkOut),
            'Total Hrs': record.totalHours || '0',
            'Status': record.status
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
        XLSX.writeFile(wb, `Attendance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans relative">
            {loading && (
                <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            )}
            {/* Header Section */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 sm:px-4 py-2.5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <Printer className="text-blue-800" size={18} />
                    <span className="font-black text-gray-700 text-xs sm:text-sm uppercase italic tracking-tighter">Attendance Performance Report</span>
                </div>
            </div>

            <div className="flex-1 p-2 sm:p-6 overflow-auto bg-[#333333]/5">
                {/* Responsive Table Container */}
                <div className="bg-white border border-gray-400 shadow-[4px_4px_0_rgba(0,0,0,0.1)] rounded-sm overflow-hidden flex flex-col min-h-[400px]">
                    <div className="overflow-x-auto overscroll-contain no-scrollbar">
                        <table className="w-full border-collapse text-left min-w-[700px]">
                            <thead className="bg-[#D4D0C8] sticky top-0 border-b border-gray-400 z-10">
                                <tr>
                                    <th className="px-4 py-3 border-r border-gray-300 font-black text-[10px] text-gray-600 uppercase tracking-widest whitespace-nowrap">Employee ID</th>
                                    <th className="px-4 py-3 border-r border-gray-300 font-black text-[10px] text-gray-600 uppercase tracking-widest whitespace-nowrap">Full Name</th>
                                    <th className="px-4 py-3 border-r border-gray-300 font-black text-[10px] text-gray-600 uppercase tracking-widest text-center whitespace-nowrap">Report Date</th>
                                    <th className="px-4 py-3 border-r border-gray-300 font-black text-[10px] text-gray-600 uppercase tracking-widest text-center whitespace-nowrap">Time In</th>
                                    <th className="px-4 py-3 border-r border-gray-300 font-black text-[10px] text-gray-600 uppercase tracking-widest text-center whitespace-nowrap">Time Out</th>
                                    <th className="px-4 py-3 border-r border-gray-300 font-black text-[10px] text-gray-600 uppercase tracking-widest text-center whitespace-nowrap">Total Hrs</th>
                                    <th className="px-4 py-3 font-black text-[10px] text-gray-600 uppercase tracking-widest text-center whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-bold text-gray-700">
                                {attendanceData.length > 0 ? (
                                    attendanceData.map(record => (
                                        <tr key={record.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                            <td className="px-4 py-3 border-r border-gray-100 font-mono text-blue-800 tracking-tighter whitespace-nowrap uppercase">
                                                {record.employee?.employeeId || '-'}
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-100 uppercase tracking-tight whitespace-nowrap">
                                                {record.employee?.firstName} {record.employee?.lastName}
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-100 text-center font-mono whitespace-nowrap">
                                                {formatDate(record.date)}
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-100 text-center text-green-700 whitespace-nowrap">
                                                {formatTime(record.checkIn)}
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-100 text-center text-red-600 whitespace-nowrap">
                                                {formatTime(record.checkOut)}
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-100 text-center font-black whitespace-nowrap">
                                                {record.totalHours || '0'}
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black border shadow-sm ${record.status === 'Present' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : !loading && (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-gray-400 italic font-medium uppercase tracking-widest bg-gray-50/30">
                                            No attendance records found for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                        onClick={handleExportExcel}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-lg border-b-4 border-r-4 border-green-900 active:border-b-0 active:border-r-0 active:translate-y-1 transition-all"
                    >
                        <Download size={16} />
                        Export Excel
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 bg-[#0055E5] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-lg border-b-4 border-r-4 border-blue-900 active:border-b-0 active:border-r-0 active:translate-y-1 transition-all"
                    >
                        <Printer size={16} />
                        Run Print Batch
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-8 py-1 bg-white border-2 border-gray-400 text-[11px] font-black text-gray-800 hover:bg-gray-50 transition-all shadow-sm active:translate-y-0.5 group"
                    >
                        <LogOut size={16} className="text-gray-600 group-hover:text-red-600" />
                        <span>Close</span>
                    </button>
                    <div className="flex-1"></div>
                    <div className="bg-white border border-gray-400 px-4 py-3 flex flex-col justify-center rounded-sm shadow-inner sm:w-48">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Total Capacity</span>
                        <span className="text-xl font-black text-gray-800 tracking-tighter leading-none mt-1">100% Verified</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceReport;

