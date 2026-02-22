import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, LogOut, FileText, Download, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';

const RetentionReport = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        department: '',
        year: new Date().getFullYear().toString(),
        tenureRange: 'All'
    });

    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState([]);
    const [totals, setTotals] = useState({ total: 0, retained: 0, avgTenure: 0 });
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const fetchMetadata = async () => {
            if (selectedCompany.id) {
                const res = await api.fetchDepartments(selectedCompany.id);
                if (res.success) setDepartments(res.data);
            }
        };
        fetchMetadata();
    }, [selectedCompany.id]);

    useEffect(() => {
        const generateReport = async () => {
            if (!selectedCompany.id) return;
            setLoading(true);
            try {
                // 1. Fetch all employees (Active and Inactive if possible, but api.fetchEmployees might return only active)
                // We need to know who is currently active.
                const empRes = await api.fetchEmployees(selectedCompany.id);

                // 2. Fetch all redundancies (Exits) correctly
                // We use this to reconstruct the population at the start of the year
                const exitRes = await api.fetchRedundancies({ companyId: selectedCompany.id, status: 'COMPLETED' });

                if (empRes.success && exitRes.success) {
                    processRetentionData(empRes.data, exitRes.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        generateReport();
    }, [selectedCompany.id, filters.year]);

    const processRetentionData = (currentEmployees, exits) => {
        const startOfYear = new Date(`${filters.year}-01-01`);
        const endOfYear = new Date(`${filters.year}-12-31`);

        // Initialize stats by department
        const deptStats = {};

        // Helper to get department name
        const getDept = (dept) => dept?.name || 'Unassigned';

        // 1. Identify "Start Population" (Active on Jan 1st)
        // = (Currently Active joined before Jan 1) + (Exited AFTER Jan 1 but joined BEFORE Jan 1)

        // Add Currently Active employees who were present at start of year
        currentEmployees.forEach(emp => {
            const joinDate = emp.joinDate ? new Date(emp.joinDate) : null;
            if (joinDate && joinDate < startOfYear) {
                const d = getDept(emp.department);
                if (!deptStats[d]) deptStats[d] = { total: 0, retained: 0, tenureSum: 0, tenureCount: 0 };

                deptStats[d].total += 1; // Was here at start
                deptStats[d].retained += 1; // Still here (Retained)

                // Calculate tenure for average
                const tenureMs = new Date() - joinDate;
                deptStats[d].tenureSum += tenureMs;
                deptStats[d].tenureCount += 1;
            }
        });

        // Add Exited employees who were present at start of year
        exits.forEach(exit => {
            const exitDate = new Date(exit.effectiveDate);
            const joinDate = exit.employee?.joinDate ? new Date(exit.employee.joinDate) : null;

            // Only count if they left DURING this year
            if (exitDate >= startOfYear && exitDate <= endOfYear) {
                // And they must have joined BEFORE the start of this year to be in the "Start Population"
                if (joinDate && joinDate < startOfYear) {
                    const d = getDept(exit.employee?.department);
                    if (!deptStats[d]) deptStats[d] = { total: 0, retained: 0, tenureSum: 0, tenureCount: 0 };

                    deptStats[d].total += 1; // Was here at start
                    // NOT retained
                }
            }
        });

        // Convert to array
        const rows = Object.keys(deptStats).map(dept => {
            const s = deptStats[dept];
            const rate = s.total > 0 ? (s.retained / s.total) * 100 : 0;
            const avgTenureYears = s.tenureCount > 0 ? (s.tenureSum / s.tenureCount / (1000 * 60 * 60 * 24 * 365.25)) : 0;

            return {
                department: dept,
                totalEmployees: s.total,
                retained: s.retained,
                retentionRate: rate.toFixed(1) + '%',
                avgTenure: avgTenureYears.toFixed(1) + ' years'
            };
        });

        setStats(rows);

        // Calculate Totals
        const totalStart = rows.reduce((sum, r) => sum + r.totalEmployees, 0);
        const totalRetained = rows.reduce((sum, r) => sum + r.retained, 0);

        // Weighted average tenure? Or simple average of averages? Better to sum raw data but for now weighted approx
        // Actually we can sum raw from deptStats
        let globalTenureSum = 0;
        let globalTenureCount = 0;
        Object.values(deptStats).forEach(s => {
            globalTenureSum += s.tenureSum;
            globalTenureCount += s.tenureCount;
        });
        const globalAvgTenure = globalTenureCount > 0 ? (globalTenureSum / globalTenureCount / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1) : '0.0';

        const globalRate = totalStart > 0 ? ((totalRetained / totalStart) * 100).toFixed(1) + '%' : '0.0%';

        setTotals({
            total: totalStart,
            retained: totalRetained,
            retentionRate: globalRate,
            avgTenure: globalAvgTenure + ' Years'
        });
    };

    const filteredData = stats.filter(item => {
        return !filters.department || item.department === filters.department;
    });

    const handleExport = () => {
        if (filteredData.length === 0) return;
        const dataToExport = filteredData.map(item => ({
            'Department': item.department,
            'Start Count': item.totalEmployees,
            'Retained': item.retained,
            'Retention Rate': item.retentionRate,
            'Avg Tenure': item.avgTenure
        }));

        dataToExport.push({
            'Department': 'TOTAL AGGREGATE',
            'Start Count': totals.total,
            'Retained': totals.retained,
            'Retention Rate': totals.retentionRate,
            'Avg Tenure': totals.avgTenure
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Retention Report');
        XLSX.writeFile(wb, `Retention_Report_${filters.year}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs relative">
            {loading && (
                <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            )}
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
                        Export Excel
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
                                {departments.map(d => (
                                    <option key={d.id} value={d.name}>{d.name.toUpperCase()}</option>
                                ))}
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
                    </div>
                </div>

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
                                    <td className="p-3 border-r border-blue-800 text-right">{totals.retentionRate}</td>
                                    <td className="p-3 text-right">{totals.avgTenure}</td>
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
