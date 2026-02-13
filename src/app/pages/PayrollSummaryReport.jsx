import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, LogOut, FileText, Download, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const PayrollSummaryReport = ({ individual = false }) => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        payPeriod: '3',
        ofYear: '2026',
        department: '',
        branch: '',
        employee: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState(null);
    const [summaryData, setSummaryData] = useState([]);
    const [totalNet, setTotalNet] = useState(0);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setReportGeneratedAt(null);

        try {
            const companyStr = localStorage.getItem('selectedCompany');
            const company = companyStr ? JSON.parse(companyStr) : null;

            if (!company) {
                alert("Company not selected");
                setIsGenerating(false);
                return;
            }

            // Construct period param
            let periodParam = filters.payPeriod;
            if ((periodParam.length <= 2) && !isNaN(periodParam)) {
                const date = new Date();
                date.setMonth(parseInt(periodParam) - 1);
                periodParam = `${date.toLocaleString('default', { month: 'short' })}-${filters.ofYear}`;
            }

            // Fetch payrolls
            // If individual, we filter client side or backend. Backend fetchPayrolls returns all for period usually.
            // We can filter by employee ID/Name on client side if needed.
            const res = await api.fetchPayrolls({
                companyId: company.id,
                period: periodParam
            });

            if (res.success && res.data) {
                let records = res.data;

                // Apply client-side filters if backend doesn't support them all yet in this endpoint
                if (individual && filters.employee) {
                    const term = filters.employee.toLowerCase();
                    records = records.filter(p =>
                        p.employee?.employeeId?.toLowerCase().includes(term) ||
                        p.employee?.firstName?.toLowerCase().includes(term) ||
                        p.employee?.lastName?.toLowerCase().includes(term)
                    );
                }

                if (filters.department) {
                    records = records.filter(p => p.employee?.department?.name === filters.department || p.employee?.department === filters.department);
                }

                // Calculate aggregates
                const aggregates = {
                    count: records.length,
                    gross: records.reduce((sum, p) => sum + parseFloat(p.grossSalary || 0), 0),
                    deductions: records.reduce((sum, p) => sum + parseFloat(p.deductions || 0), 0),
                    tax: records.reduce((sum, p) => sum + parseFloat(p.tax || 0), 0),
                    net: records.reduce((sum, p) => sum + parseFloat(p.netSalary || 0), 0),
                    // Optional/Estimated fields
                    nis: records.reduce((sum, p) => sum + parseFloat(p.nis || 0), 0),
                    nht: records.reduce((sum, p) => sum + parseFloat(p.nht || 0), 0),
                    edTax: records.reduce((sum, p) => sum + parseFloat(p.edTax || 0), 0),
                    pension: records.reduce((sum, p) => sum + parseFloat(p.pension || 0), 0)
                };

                const newSummary = [
                    { category: 'Total Employees', count: aggregates.count, amount: '0.00' }, // Amount N/A for count
                    { category: 'Gross Payroll', count: aggregates.count, amount: aggregates.gross.toFixed(2) },
                    { category: 'Total Deductions', count: aggregates.count, amount: aggregates.deductions.toFixed(2) },
                    { category: 'Net Pay', count: aggregates.count, amount: aggregates.net.toFixed(2) },
                    { category: 'PAYE (Income Tax)', count: aggregates.count, amount: aggregates.tax.toFixed(2) },
                    // Conditional rows if data exists > 0
                    { category: 'NIS Deductions', count: aggregates.count, amount: aggregates.nis.toFixed(2) },
                    { category: 'NHT Deductions', count: aggregates.count, amount: aggregates.nht.toFixed(2) },
                    { category: 'Education Tax', count: aggregates.count, amount: aggregates.edTax.toFixed(2) },
                    { category: 'Pension Contributions', count: aggregates.count, amount: aggregates.pension.toFixed(2) }
                ].filter(row => row.category === 'Total Employees' || parseFloat(row.amount) > 0 || (row.category === 'Gross Payroll')); // Filter out empty optional rows

                setSummaryData(newSummary);
                setTotalNet(aggregates.net);
                setReportGeneratedAt(new Date().toLocaleString());

            } else {
                alert("No records found for the selected period.");
                setSummaryData([]);
            }

        } catch (error) {
            console.error(error);
            alert("Error generating report.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExport = () => {
        if (summaryData.length === 0) {
            alert("Please generate the report first.");
            return;
        }

        alert("PREPARING EXPORT: Formatting summary data for Excel (XLSX) / CSV...");
        const csvContent = "Category,Count,Amount\n" +
            summaryData.map(s => `${s.category},${s.count},${s.amount.replace(/,/g, '')}`).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Payroll_Summary_${filters.ofYear}_P${filters.payPeriod}.csv`);
        link.click();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 py-1 flex items-center justify-between">
                <span className="font-bold text-gray-700">
                    {individual ? 'Individual Employee Payroll Summary' : 'Company Payroll Summary Report (Year-to-Date)'}
                </span>
                <div className="flex gap-2 no-print">
                    <button
                        onClick={handleExport}
                        className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                    >
                        <Download size={12} />
                        Export CSV
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-green-700 active:scale-95 transition-all shadow-sm"
                    >
                        <Printer size={12} />
                        Print PDF
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
                {/* Filters */}
                <div className="bg-white border border-gray-400 p-3 mb-4 shadow-inner">
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className="text-gray-700 font-bold text-[10px] uppercase">Pay Period</label>
                            <select
                                value={filters.payPeriod}
                                onChange={(e) => setFilters({ ...filters, payPeriod: e.target.value })}
                                className="w-full p-1 border border-gray-400 bg-white text-blue-800 font-bold shadow-inner mt-1 uppercase"
                            >
                                <option value="Feb-2026">Feb-2026</option>
                                <option value="Jan-2026">Jan-2026</option>
                                <option value="3">March (3)</option>
                                <option value="2">February (2)</option>
                                <option value="1">January (1)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-gray-700 font-bold text-[10px] uppercase">Year</label>
                            <input
                                type="text"
                                value={filters.ofYear}
                                onChange={(e) => setFilters({ ...filters, ofYear: e.target.value })}
                                className="w-full p-1 border border-gray-400 bg-white text-blue-800 font-bold shadow-inner mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-gray-700 font-bold text-[10px] uppercase">Department</label>
                            <select
                                value={filters.department}
                                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                className="w-full p-1 border border-gray-400 bg-white text-blue-800 font-bold shadow-inner mt-1"
                            >
                                <option value="">All Departments</option>
                                {/* In a real app, populate with fetched departments */}
                                <option value="IT">IT</option>
                                <option value="HR">HR</option>
                                <option value="Finance">Finance</option>
                                <option value="Sales">Sales</option>
                                <option value="Operations">Operations</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-gray-700 font-bold text-[10px] uppercase">Branch</label>
                            <select
                                value={filters.branch}
                                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                                className="w-full p-1 border border-gray-400 bg-white text-blue-800 font-bold shadow-inner mt-1"
                            >
                                <option value="">All Branches</option>
                                <option value="Main">Main Branch</option>
                                <option value="West">West Branch</option>
                            </select>
                        </div>
                        {individual && (
                            <div>
                                <label className="text-gray-700 font-bold text-[10px] uppercase">Employee</label>
                                <input
                                    type="text"
                                    value={filters.employee}
                                    onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                                    placeholder="Employee ID or Name"
                                    className="w-full p-1 border border-gray-400 bg-white text-blue-800 font-bold shadow-inner mt-1 text-[10px]"
                                />
                            </div>
                        )}
                        <div className="flex items-end">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className={`w-full p-1.5 font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-md transition-all ${isGenerating ? 'bg-gray-200 text-gray-500' : 'bg-blue-900 text-white hover:bg-black active:translate-y-0.5'}`}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText size={14} />
                                        Generate Summary
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="bg-white border border-gray-400 shadow-inner p-4 min-h-[400px]">
                    <div className="mb-4 text-center relative">
                        <h2 className="text-lg font-black text-blue-900 uppercase">
                            {individual ? 'Individual Employee Summary' : 'Company Payroll Master Summary'}
                        </h2>
                        <p className="text-[10px] text-gray-600">
                            {individual ? `Employee Search: ${filters.employee || 'All'}` : `Period ${filters.payPeriod} - ${filters.ofYear}`}
                        </p>
                        <p className="text-[9px] text-gray-500 italic mt-1">Crystal Reports Format</p>
                        {reportGeneratedAt && (
                            <span className="absolute top-0 right-0 text-[8px] font-bold text-green-600 uppercase italic">
                                Verified: {reportGeneratedAt}
                            </span>
                        )}
                    </div>

                    {summaryData.length > 0 ? (
                        <table className="w-full border-collapse">
                            <thead className="bg-[#D4D0C8]">
                                <tr>
                                    <th className="border p-2 text-left font-bold">Category</th>
                                    <th className="border p-2 text-right font-bold">Count / Ref</th>
                                    <th className="border p-2 text-right font-bold">Amount (JMD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summaryData.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                                        <td className="border p-2 font-bold">{row.category}</td>
                                        <td className="border p-2 text-right">{row.count}</td>
                                        <td className="border p-2 text-right font-black">
                                            {row.category === 'Total Employees' ? '-' : `$${parseFloat(row.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-blue-900 text-white">
                                <tr>
                                    <td className="border p-2 font-black uppercase" colSpan="2">Total Net Payroll</td>
                                    <td className="border p-2 text-right font-black">${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            {isGenerating ? (
                                <span className="font-bold animate-pulse">Processing...</span>
                            ) : (
                                <>
                                    <FileText size={48} className="mb-2 opacity-20" />
                                    <span className="font-bold italic text-xs uppercase tracking-widest">No Report Generated</span>
                                    <span className="text-[9px]">Select criteria and click Generate</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mt-4">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white">
                        <LogOut size={16} />
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayrollSummaryReport;
