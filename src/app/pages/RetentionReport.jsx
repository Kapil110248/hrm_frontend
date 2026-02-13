import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, LogOut, FileText, Download } from 'lucide-react';

const RetentionReport = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        department: '',
        year: '2026',
        tenureRange: 'All'
    });

    const retentionData = [
        { department: 'IT', totalEmployees: 45, retained: 42, retentionRate: '93.3%', avgTenure: '3.2 years' },
        { department: 'HR', totalEmployees: 18, retained: 17, retentionRate: '94.4%', avgTenure: '4.1 years' },
        { department: 'Sales', totalEmployees: 32, retained: 28, retentionRate: '87.5%', avgTenure: '2.8 years' },
        { department: 'Finance', totalEmployees: 25, retained: 24, retentionRate: '96.0%', avgTenure: '3.9 years' },
        { department: 'Operations', totalEmployees: 55, retained: 50, retentionRate: '90.9%', avgTenure: '3.5 years' }
    ];

    const handleExport = () => {
        const headers = ["Department", "Total Employees", "Retained", "Retention Rate", "Avg Tenure"];
        const csvContent = [
            headers.join(","),
            ...filteredData.map(item => [
                item.department,
                item.totalEmployees,
                item.retained,
                item.retentionRate,
                item.avgTenure
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `retention_report_${filters.year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredData = retentionData.filter(item => {
        const matchesDept = !filters.department || item.department === filters.department;
        // Mocking tenure filtering logic since we have static data
        const matchesTenure = filters.tenureRange === 'All' || true;
        return matchesDept && matchesTenure;
    });

    const totals = filteredData.reduce((acc, curr) => ({
        total: acc.total + curr.totalEmployees,
        retained: acc.retained + curr.retained
    }), { total: 0, retained: 0 });

    const avgRate = totals.total > 0 ? ((totals.retained / totals.total) * 100).toFixed(1) + '%' : '0.0%';

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 py-1 flex items-center justify-between no-print shadow-sm">
                <div className="flex items-center gap-2">
                    <FileText className="text-blue-900" size={16} />
                    <span className="font-black text-gray-700 uppercase tracking-tighter italic">Retention Analysis Register</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="px-4 py-1.5 bg-white border border-gray-400 text-blue-800 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 active:translate-y-0.5 transition-all shadow-sm flex items-center gap-2"
                    >
                        <Download size={14} />
                        Export
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-4 py-1.5 bg-white border border-gray-400 text-green-700 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 active:translate-y-0.5 transition-all shadow-sm flex items-center gap-2"
                    >
                        <Printer size={14} />
                        Print
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
                {/* Filters */}
                <div className="bg-white border border-gray-400 p-4 mb-6 shadow-md no-print">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 border-b pb-1">Report Parameters</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Target Department</label>
                            <select
                                value={filters.department}
                                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                className="w-full p-2 border border-gray-300 bg-gray-50 text-blue-900 font-bold outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="">ALL DEPARTMENTS</option>
                                <option value="IT">IT</option>
                                <option value="HR">HR</option>
                                <option value="Sales">SALES</option>
                                <option value="Finance">FINANCE</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Reference Year</label>
                            <input
                                type="text"
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                className="w-full p-2 border border-gray-300 bg-gray-50 text-blue-900 font-bold outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Tenure Range Segment</label>
                            <select
                                value={filters.tenureRange}
                                onChange={(e) => setFilters({ ...filters, tenureRange: e.target.value })}
                                className="w-full p-2 border border-gray-300 bg-gray-50 text-blue-900 font-bold outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none"
                            >
                                <option value="All">ALL TENURES</option>
                                <option value="0-1">0-1 YEARS</option>
                                <option value="1-3">1-3 YEARS</option>
                                <option value="3-5">3-5 YEARS</option>
                                <option value="5+">5+ YEARS</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="bg-white border border-gray-400 shadow-2xl p-10 max-w-5xl mx-auto print:shadow-none print:border-none mb-10">
                    <div className="mb-8 text-center border-b-2 border-blue-900 pb-4">
                        <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter italic">Corporate Employee Retention Report</h2>
                        <div className="flex justify-center gap-4 mt-2">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">FISCAL YEAR: {filters.year}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">STATUS: FINALIZED</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#D4D0C8] text-gray-700 text-[10px] font-black uppercase tracking-widest border-2 border-gray-400">
                                    <th className="border-r border-gray-400 p-3 text-left">Department</th>
                                    <th className="border-r border-gray-400 p-3 text-right">Count (Start)</th>
                                    <th className="border-r border-gray-400 p-3 text-right">Retained</th>
                                    <th className="border-r border-gray-400 p-3 text-right">Retention %</th>
                                    <th className="p-3 text-right">Avg Tenure</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-bold text-gray-700">
                                {filteredData.length > 0 ? filteredData.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                        <td className="p-3 border-r border-gray-100 uppercase tracking-tight">{row.department}</td>
                                        <td className="p-3 border-r border-gray-100 text-right font-mono">{row.totalEmployees}</td>
                                        <td className="p-3 border-r border-gray-100 text-right font-mono text-green-700">{row.retained}</td>
                                        <td className="p-3 border-r border-gray-100 text-right font-black">{row.retentionRate}</td>
                                        <td className="p-3 text-right text-gray-500 italic">{row.avgTenure}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-gray-400 italic font-black uppercase">No records found for parameters</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-blue-900 text-white border-2 border-blue-950">
                                <tr className="font-black uppercase italic tracking-widest">
                                    <td className="p-3 border-r border-blue-800">TOTAL AGGREGATE</td>
                                    <td className="p-3 border-r border-blue-800 text-right">{totals.total}</td>
                                    <td className="p-3 border-r border-blue-800 text-right">{totals.retained}</td>
                                    <td className="p-3 border-r border-blue-800 text-right">{avgRate}</td>
                                    <td className="p-3 text-right">3.5 Years (AVG)</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 no-print pb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-8 py-2 bg-white border-2 border-gray-400 text-[11px] font-black text-gray-800 hover:bg-gray-50 transition-all shadow-md active:translate-y-0.5 group uppercase italic"
                    >
                        <LogOut size={14} className="text-gray-600 group-hover:text-red-600" />
                        <span>Close Register</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RetentionReport;

