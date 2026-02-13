import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, LogOut, FileText, Download } from 'lucide-react';

const TurnoverReport = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        dateFrom: '2026-01-01',
        dateTo: '2026-03-31',
        department: '',
        reason: ''
    });

    const turnoverData = [
        { employeeId: 'EMP045', name: 'John Smith', department: 'Sales', joinDate: '2024-03-15', exitDate: '2026-02-28', reason: 'Resignation', tenure: '1.9 years' },
        { employeeId: 'EMP089', name: 'Mary Johnson', department: 'IT', joinDate: '2023-06-10', exitDate: '2026-01-15', reason: 'Termination', tenure: '2.6 years' },
        { employeeId: 'EMP112', name: 'Robert Brown', department: 'HR', joinDate: '2025-01-20', exitDate: '2026-03-10', reason: 'Resignation', tenure: '1.1 years' }
    ];

    const handleExport = () => {
        const headers = ["Employee ID", "Name", "Department", "Join Date", "Exit Date", "Tenure", "Reason"];
        const csvContent = [
            headers.join(","),
            ...filteredData.map(item => [
                item.employeeId,
                `"${item.name}"`,
                item.department,
                item.joinDate,
                item.exitDate,
                item.tenure,
                item.reason
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `turnover_report_${filters.dateFrom}_to_${filters.dateTo}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredData = turnoverData.filter(item => {
        const matchesDept = !filters.department || item.department === filters.department;
        const matchesReason = !filters.reason || item.reason === filters.reason;
        const itemDate = new Date(item.exitDate);
        const fromDate = new Date(filters.dateFrom);
        const toDate = new Date(filters.dateTo);
        const matchesDate = itemDate >= fromDate && itemDate <= toDate;

        return matchesDept && matchesReason && matchesDate;
    });

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 py-1 flex items-center justify-between no-print">
                <div className="flex items-center gap-2">
                    <FileText className="text-blue-900" size={16} />
                    <span className="font-bold text-gray-700 uppercase tracking-tight">Turnover Analysis Register</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="px-4 py-1.5 bg-white border border-gray-400 text-blue-800 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 active:translate-y-0.5 transition-all shadow-sm flex items-center gap-2"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-4 py-1.5 bg-white border border-gray-400 text-green-700 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 active:translate-y-0.5 transition-all shadow-sm flex items-center gap-2"
                    >
                        <Printer size={14} />
                        Print Report
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
                {/* Filters */}
                <div className="bg-white border border-gray-400 p-4 mb-6 shadow-inner no-print">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 border-b pb-1">Report Parameters</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Exit Date From</label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                className="w-full p-2 border border-gray-300 bg-gray-50 text-blue-900 font-bold outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Exit Date To</label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                className="w-full p-2 border border-gray-300 bg-gray-50 text-blue-900 font-bold outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Target Department</label>
                            <select
                                value={filters.department}
                                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                className="w-full p-2 border border-gray-300 bg-gray-50 text-blue-900 font-bold outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none"
                            >
                                <option value="">ALL DEPARTMENTS</option>
                                <option value="IT">INFORMATION TECHNOLOGY</option>
                                <option value="HR">HUMAN RESOURCES</option>
                                <option value="Sales">SALES & MARKETING</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Exit Reason Group</label>
                            <select
                                value={filters.reason}
                                onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
                                className="w-full p-2 border border-gray-300 bg-gray-50 text-blue-900 font-bold outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none"
                            >
                                <option value="">ALL REASONS</option>
                                <option value="Resignation">RESIGNATION</option>
                                <option value="Termination">TERMINATION</option>
                                <option value="Retirement">RETIREMENT</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="bg-white border border-gray-400 shadow-xl p-8 max-w-5xl mx-auto print:shadow-none print:border-none">
                    <div className="mb-8 text-center border-b-2 border-blue-900 pb-4">
                        <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter italic">Employee Turnover Performance Report</h2>
                        <div className="flex justify-center gap-4 mt-2">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">PERIOD: {filters.dateFrom} TO {filters.dateTo}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">STATION: MASTER_TERMINAL_01</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#D4D0C8] text-gray-700 text-[10px] font-black uppercase tracking-widest border-2 border-gray-400">
                                    <th className="border-r border-gray-400 p-3 text-left">Emp ID</th>
                                    <th className="border-r border-gray-400 p-3 text-left">Full Name</th>
                                    <th className="border-r border-gray-400 p-3 text-left">Department</th>
                                    <th className="border-r border-gray-400 p-3 text-center">Join Date</th>
                                    <th className="border-r border-gray-400 p-3 text-center">Exit Date</th>
                                    <th className="border-r border-gray-400 p-3 text-center">Tenure</th>
                                    <th className="p-3 text-left">Primary Reason</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-bold text-gray-700">
                                {filteredData.length > 0 ? filteredData.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-200 hover:bg-blue-50 transition-colors group">
                                        <td className="p-3 border-r border-gray-100 font-mono text-blue-800">{row.employeeId}</td>
                                        <td className="p-3 border-r border-gray-100 uppercase tracking-tight">{row.name}</td>
                                        <td className="p-3 border-r border-gray-100 italic text-gray-500">{row.department}</td>
                                        <td className="p-3 border-r border-gray-100 text-center font-mono opacity-60 uppercase">{row.joinDate}</td>
                                        <td className="p-3 border-r border-gray-100 text-center font-mono text-red-600 uppercase">{row.exitDate}</td>
                                        <td className="p-3 border-r border-gray-100 text-center">{row.tenure}</td>
                                        <td className="p-3 uppercase">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] border ${row.reason === 'Termination' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                {row.reason}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="p-20 text-center text-gray-400 font-black uppercase tracking-[0.5em] italic">No turnover records found for selected period</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-blue-900 text-white border-2 border-blue-950">
                                <tr className="font-black uppercase italic tracking-widest">
                                    <td className="p-4" colSpan="3">Corporate Turnover Aggregate</td>
                                    <td className="p-4 text-right" colSpan="4">Population Change: {filteredData.length} Members</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 no-print pb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-8 py-2 bg-white border-2 border-gray-400 text-[11px] font-black text-gray-800 hover:bg-gray-50 transition-all shadow-md active:translate-y-0.5 group uppercase italic"
                    >
                        <LogOut size={14} className="text-gray-600 group-hover:text-red-600" />
                        <span>Close</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TurnoverReport;

