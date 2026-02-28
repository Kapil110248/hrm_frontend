import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, LogOut, FileText, Download, Loader2, Search } from 'lucide-react';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';

const YTDBreakdownReport = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        employee: '',
        year: new Date().getFullYear().toString(),
        category: 'All'
    });
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const companyStr = localStorage.getItem('selectedCompany');
                const company = companyStr ? JSON.parse(companyStr) : null;
                if (company) {
                    const res = await api.fetchEmployees(company.id);
                    if (res.success) setEmployees(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch employees", err);
            }
        };
        fetchEmployees();
    }, []);

    const generateReport = async () => {
        if (!selectedEmployee) {
            alert("Please select an employee first.");
            return;
        }

        setLoading(true);
        try {
            // Fetch all payrolls for the employee
            const res = await api.fetchPayrolls({ employeeId: selectedEmployee.id });

            if (res.success && res.data) {
                // Filter by selected year
                const yearRecords = res.data.filter(p => p.period.includes(filters.year));

                // Map to report format
                const formatted = yearRecords.map(p => ({
                    period: p.period,
                    gross: parseFloat(p.grossSalary || 0),
                    nis: parseFloat(p.nis || 0),
                    nht: parseFloat(p.nht || 0),
                    paye: parseFloat(p.paye || 0),
                    edTax: parseFloat(p.edTax || 0),
                    net: parseFloat(p.netSalary || 0)
                }));

                // Calculate YTD Total
                const total = formatted.reduce((acc, curr) => ({
                    period: 'YTD Total',
                    gross: acc.gross + curr.gross,
                    nis: acc.nis + curr.nis,
                    nht: acc.nht + curr.nht,
                    paye: acc.paye + curr.paye,
                    edTax: acc.edTax + curr.edTax,
                    net: acc.net + curr.net
                }), { period: 'YTD Total', gross: 0, nis: 0, nht: 0, paye: 0, edTax: 0, net: 0 });

                if (yearRecords.length > 0) {
                    setReportData([...formatted, total]);
                } else {
                    setReportData([]);
                    alert(`No payroll records found for ${filters.year}`);
                }
            }
        } catch (err) {
            console.error(err);
            alert("Failed to generate report");
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeSelect = (emp) => {
        setSelectedEmployee(emp);
        setFilters(prev => ({ ...prev, employee: `${emp.firstName} ${emp.lastName}` }));
        setSearchTerm(''); // Clear search to hide dropdown if implemented
    };

    const handleExport = () => {
        if (reportData.length === 0) return;

        const headers = ["Period", "Gross Pay", "NIS", "NHT", "PAYE", "Ed Tax", "Net Pay"];
        const csvContent = [
            headers.join(","),
            ...reportData.map(item => [
                item.period,
                item.gross.toFixed(2),
                item.nis.toFixed(2),
                item.nht.toFixed(2),
                item.paye.toFixed(2),
                item.edTax.toFixed(2),
                item.net.toFixed(2)
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        let filename = `ytd_${filters.year}`;
        if (selectedEmployee) filename += `_${selectedEmployee.lastName}`;
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportExcel = () => {
        if (reportData.length === 0) return;
        const dataToExport = reportData.map(item => ({
            'Period': item.period,
            'Gross Pay (JMD)': item.gross,
            'NIS (JMD)': item.nis,
            'NHT (JMD)': item.nht,
            'PAYE (JMD)': item.paye,
            'Ed Tax (JMD)': item.edTax,
            'Net Pay (JMD)': item.net
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'YTD Breakdown');
        let filename = `ytd_${filters.year}`;
        if (selectedEmployee) filename += `_${selectedEmployee.lastName}`;
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(val);

    const filteredEmployees = employees.filter(emp =>
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            {loading && (
                <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-900" size={32} />
                </div>
            )}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 py-1 flex items-center justify-between no-print shadow-sm">
                <div className="flex items-center gap-2">
                    <FileText className="text-blue-900" size={16} />
                    <span className="font-black text-gray-700 uppercase tracking-tighter">YTD Performance Matrix</span>
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
                        onClick={handleExportExcel}
                        className="px-4 py-1.5 bg-green-700 text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-800 active:translate-y-0.5 transition-all shadow-sm flex items-center gap-2"
                    >
                        <Download size={14} />
                        Excel
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-1.5 bg-white border border-gray-400 text-green-700 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 active:translate-y-0.5 transition-all shadow-sm flex items-center gap-2"
                    >
                        <Printer size={14} />
                        Print
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Sidebar / Filters */}
                    <div className="lg:col-span-1 bg-white border border-gray-400 p-4 shadow-md no-print h-fit">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 border-b pb-1">Aggregation Parameters</h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-gray-500 font-black text-[9px] uppercase">Select Employee</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2 text-gray-300" size={12} />
                                    <input
                                        type="text"
                                        placeholder="Search ID/Name..."
                                        className="w-full pl-7 p-2 border border-blue-200 bg-blue-50 font-bold outline-none uppercase text-[10px]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-lg max-h-48 overflow-y-auto z-10">
                                            {filteredEmployees.map(emp => (
                                                <div
                                                    key={emp.id}
                                                    onClick={() => handleEmployeeSelect(emp)}
                                                    className="p-2 hover:bg-blue-100 cursor-pointer border-b border-gray-50"
                                                >
                                                    <div className="font-bold uppercase text-[10px]">{emp.firstName} {emp.lastName}</div>
                                                    <div className="text-[9px] text-gray-400">{emp.employeeId}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedEmployee && (
                                    <div className="mt-2 text-blue-800 font-black uppercase text-[10px] border l-2 border-blue-500 pl-2">
                                        Active: {selectedEmployee.firstName} {selectedEmployee.lastName}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-gray-500 font-black text-[9px] uppercase">Fiscal Year</label>
                                <input
                                    type="text"
                                    value={filters.year}
                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                    className="w-full p-2 border border-gray-300 bg-gray-50 text-blue-900 font-bold outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <button
                                onClick={generateReport}
                                className="bg-blue-900 text-white font-black uppercase text-[10px] py-2 hover:bg-blue-800"
                            >
                                Generate Matrix
                            </button>
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="lg:col-span-3 bg-white border border-gray-400 shadow-2xl p-10 print:shadow-none print:border-none min-h-[600px]">
                        {reportData.length > 0 ? (
                            <>
                                <div className="mb-10 text-center border-b-4 border-double border-blue-900 pb-6">
                                    <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter italic">Year-to-Date Financial Breakdown</h2>
                                    <div className="flex justify-center gap-8 mt-4">
                                        <div className="text-left">
                                            <p className="text-[9px] font-black text-gray-400 uppercase">Employee Segment</p>
                                            <p className="text-xs font-black text-gray-800 uppercase italic">
                                                {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'N/A'}
                                            </p>
                                            <p className="text-[9px] text-gray-400">{selectedEmployee?.employeeId}</p>
                                        </div>
                                        <div className="text-left border-l border-gray-200 pl-8">
                                            <p className="text-[9px] font-black text-gray-400 uppercase">Analysis Period</p>
                                            <p className="text-xs font-black text-gray-800 uppercase italic">FY {filters.year}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-[#D4D0C8] text-gray-700 text-[10px] font-black uppercase tracking-[0.15em] border-2 border-gray-400">
                                                <th className="border-r border-gray-400 p-4 text-left">Internal Period</th>
                                                <th className="border-r border-gray-400 p-4 text-right">Gross Earnings</th>
                                                <th className="border-r border-gray-400 p-4 text-right">NIS</th>
                                                <th className="border-r border-gray-400 p-4 text-right">NHT</th>
                                                <th className="border-r border-gray-400 p-4 text-right">PAYE</th>
                                                <th className="border-r border-gray-400 p-4 text-right">Ed-Tax</th>
                                                <th className="p-4 text-right">Net Liquidity</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[12px] font-bold text-gray-700">
                                            {reportData.map((row, idx) => (
                                                <tr
                                                    key={idx}
                                                    className={row.period === 'YTD Total'
                                                        ? 'bg-blue-900 text-white font-black'
                                                        : idx % 2 === 0 ? 'bg-blue-50/50' : 'bg-white'
                                                    }
                                                >
                                                    <td className="p-4 border-r border-gray-100 uppercase tracking-tight">{row.period}</td>
                                                    <td className="p-4 border-r border-gray-100 text-right font-mono">{formatCurrency(row.gross)}</td>
                                                    <td className="p-4 border-r border-gray-100 text-right font-mono opacity-80">{formatCurrency(row.nis)}</td>
                                                    <td className="p-4 border-r border-gray-100 text-right font-mono opacity-80">{formatCurrency(row.nht)}</td>
                                                    <td className="p-4 border-r border-gray-100 text-right font-mono opacity-80">{formatCurrency(row.paye)}</td>
                                                    <td className="p-4 border-r border-gray-100 text-right font-mono opacity-80">{formatCurrency(row.edTax)}</td>
                                                    <td className="p-4 text-right font-mono text-lg tracking-tighter">{formatCurrency(row.net)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 text-gray-400">
                                <FileText size={48} className="mb-4 opacity-30" />
                                <h3 className="text-xl font-black uppercase italic tracking-widest">Awaiting Generation Protocol</h3>
                                <p className="text-xs mt-2">Select an employee target from the sidebar to initialize the YTD Matrix.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YTDBreakdownReport;

