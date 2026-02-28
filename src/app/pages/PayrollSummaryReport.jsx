import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, LogOut, FileText, Download, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';

const PayrollSummaryReport = ({ individual = false }) => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        payPeriod: '',
        ofYear: new Date().getFullYear().toString(),
        department: '',
        branch: '',
        employee: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState(null);
    const [summaryData, setSummaryData] = useState([]);
    const [totalNet, setTotalNet] = useState(0);

    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));
    const [periods, setPeriods] = useState([]);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const fetchMetadata = async () => {
            if (!selectedCompany.id) return;
            try {
                const deptRes = await api.fetchDepartments(selectedCompany.id);
                if (deptRes.success) setDepartments(deptRes.data);

                const batchRes = await api.fetchPayrollBatches(selectedCompany.id);
                if (batchRes.success) {
                    setPeriods(batchRes.data);
                    if (batchRes.data.length > 0) {
                        setFilters(prev => ({ ...prev, payPeriod: batchRes.data[0].period }));
                    }
                }
            } catch (error) {
                console.error("Error fetching metadata:", error);
            }
        };
        fetchMetadata();
    }, [selectedCompany.id]);

    const handleGenerate = async () => {
        if (!filters.payPeriod) {
            alert("Please select a pay period.");
            return;
        }

        setIsGenerating(true);
        setReportGeneratedAt(null);

        try {
            const params = {
                companyId: selectedCompany.id,
                period: filters.payPeriod
            };

            if (filters.department) {
                params.departmentId = filters.department;
            }

            const res = await api.fetchPayrolls(params);

            if (res.success && res.data) {
                let records = res.data;

                if (individual && filters.employee) {
                    const term = filters.employee.toLowerCase();
                    records = records.filter(p =>
                        p.employee?.employeeId?.toLowerCase().includes(term) ||
                        p.employee?.firstName?.toLowerCase().includes(term) ||
                        p.employee?.lastName?.toLowerCase().includes(term)
                    );
                }

                const aggregates = {
                    count: records.length,
                    gross: records.reduce((sum, p) => sum + parseFloat(p.grossSalary || 0), 0),
                    deductions: records.reduce((sum, p) => sum + parseFloat(p.deductions || 0), 0),
                    tax: records.reduce((sum, p) => sum + parseFloat(p.tax || 0), 0),
                    net: records.reduce((sum, p) => sum + parseFloat(p.netSalary || 0), 0),
                    nis: records.reduce((sum, p) => sum + parseFloat(p.nis || 0), 0),
                    nht: records.reduce((sum, p) => sum + parseFloat(p.nht || 0), 0),
                    edTax: records.reduce((sum, p) => sum + parseFloat(p.edTax || 0), 0),
                    paye: records.reduce((sum, p) => sum + parseFloat(p.paye || 0), 0)
                };

                const newSummary = [
                    { category: 'Total Employees', count: aggregates.count, amount: '0.00' },
                    { category: 'Gross Payroll', count: aggregates.count, amount: aggregates.gross.toFixed(2) },
                    { category: 'Total Deductions', count: aggregates.count, amount: aggregates.deductions.toFixed(2) },
                    { category: 'Net Pay', count: aggregates.count, amount: aggregates.net.toFixed(2) },
                    { category: 'PAYE (Income Tax)', count: aggregates.count, amount: aggregates.paye.toFixed(2) },
                    { category: 'NIS Deductions', count: aggregates.count, amount: aggregates.nis.toFixed(2) },
                    { category: 'NHT Deductions', count: aggregates.count, amount: aggregates.nht.toFixed(2) },
                    { category: 'Education Tax', count: aggregates.count, amount: aggregates.edTax.toFixed(2) }
                ].filter(row =>
                    row.category === 'Total Employees' ||
                    parseFloat(row.amount) > 0 ||
                    (row.category === 'Gross Payroll' || row.category === 'Net Pay')
                );

                setSummaryData(newSummary);
                setTotalNet(aggregates.net);
                setReportGeneratedAt(new Date().toLocaleString());

            } else {
                alert("No records found.");
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
        const csvContent = "Category,Count,Amount\n" +
            summaryData.map(s => `"${s.category}",${s.count},${s.amount}`).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${selectedCompany.name}_Payroll_Summary_${filters.payPeriod}.csv`;
        link.click();
    };

    const handleExportExcel = () => {
        if (summaryData.length === 0) {
            alert("Please generate the report first.");
            return;
        }
        const ws = XLSX.utils.json_to_sheet(
            summaryData.map(s => ({
                'Category / Description': s.category,
                'Count': s.count,
                'Amount (JMD)': s.category === 'Total Employees' ? '-' : parseFloat(s.amount) || 0
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Payroll Summary');
        XLSX.writeFile(wb, `${selectedCompany.name || 'Company'}_Payroll_Summary_${filters.payPeriod}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 py-1 flex items-center justify-between shadow-sm">
                <span className="font-bold text-gray-700 uppercase flex items-center gap-2">
                    <FileText size={14} className="text-blue-800" />
                    {individual ? 'Individual Payroll Summary' : 'Company Payroll Master Summary'}
                </span>
                <div className="flex gap-2 no-print">
                    <button onClick={handleExport} className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-blue-700 shadow-sm">
                        <Download size={12} /> Export CSV
                    </button>
                    <button onClick={handleExportExcel} className="px-3 py-1 bg-green-700 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-green-800 shadow-sm">
                        <Download size={12} /> Export Excel
                    </button>
                    <button onClick={handlePrint} className="px-3 py-1 bg-gray-600 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-gray-700 shadow-sm">
                        <Printer size={12} /> Print PDF
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
                <div className="bg-white border border-gray-400 p-3 mb-4 shadow-sm no-print">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="text-gray-500 font-bold text-[9px] uppercase tracking-widest">Pay Period</label>
                            <select
                                value={filters.payPeriod}
                                onChange={(e) => setFilters({ ...filters, payPeriod: e.target.value })}
                                className="w-full p-1.5 border border-gray-400 bg-gray-50 text-blue-900 font-black mt-1 uppercase text-[11px]"
                            >
                                <option value="">Select Period...</option>
                                {periods.map((p, idx) => (
                                    <option key={idx} value={p.period}>{p.period}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-gray-500 font-bold text-[9px] uppercase tracking-widest">Department</label>
                            <select
                                value={filters.department}
                                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                className="w-full p-1.5 border border-gray-400 bg-gray-50 text-gray-800 font-bold mt-1 text-[11px]"
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                        {individual && (
                            <div>
                                <label className="text-gray-500 font-bold text-[9px] uppercase tracking-widest">Employee</label>
                                <input
                                    type="text"
                                    value={filters.employee}
                                    onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                                    placeholder="Search..."
                                    className="w-full p-1.5 border border-gray-400 bg-gray-50 font-bold mt-1 text-[11px]"
                                />
                            </div>
                        )}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={`w-full p-2 font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-sm transition-all ${isGenerating ? 'bg-gray-100 text-gray-400' : 'bg-blue-900 text-white hover:bg-black active:translate-y-0.5'}`}
                        >
                            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                            Generate Summary
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-gray-400 shadow-md p-8 min-h-[500px] printable-area relative">
                    <div className="absolute top-4 right-4 text-right no-print">
                        <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Internal Auditor Copy</p>
                    </div>

                    <div className="mb-8 text-center border-b-2 border-double border-gray-300 pb-4">
                        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-1">
                            {selectedCompany.name || 'HRM SYSTEM'}
                        </h1>
                        <h2 className="text-sm font-bold text-blue-900 uppercase tracking-widest">
                            {individual ? 'Individual Payroll Summary Ledger' : 'Company Payroll Master Summary'}
                        </h2>
                        <div className="flex items-center justify-center gap-4 mt-2">
                            <span className="bg-gray-100 px-3 py-0.5 border border-gray-300 rounded-full text-[10px] font-bold text-gray-600">
                                Period: {filters.payPeriod || '---'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">|</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter italic">
                                Currency: JAMD (JMD)
                            </span>
                        </div>
                        {reportGeneratedAt && (
                            <div className="mt-4 text-[9px] font-bold text-green-700 uppercase italic">
                                Report Authenticated: {reportGeneratedAt}
                            </div>
                        )}
                    </div>

                    {summaryData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-y-2 border-gray-800">
                                        <th className="p-3 text-left font-black uppercase tracking-widest text-gray-700">Category / Description</th>
                                        <th className="p-3 text-right font-black uppercase tracking-widest text-gray-700">Count / Ref</th>
                                        <th className="p-3 text-right font-black uppercase tracking-widest text-gray-700">Amount (JMD)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summaryData.map((row, idx) => (
                                        <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-blue-50/30' : 'bg-white'}`}>
                                            <td className="p-3 font-bold text-gray-800">{row.category}</td>
                                            <td className="p-3 text-right text-gray-600 font-mono">{row.count}</td>
                                            <td className="p-3 text-right font-black text-gray-900 border-l border-gray-50">
                                                {row.category === 'Total Employees' ? '-' : `$${parseFloat(row.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-800 text-white">
                                        <td className="p-3 font-black uppercase tracking-widest" colSpan="2">Net Cash Requirement</td>
                                        <td className="p-3 text-right font-black text-lg">
                                            ${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div className="mt-12 grid grid-cols-2 gap-20 px-8 no-print">
                                <div className="border-t border-gray-400 pt-2 text-center italic text-[9px] font-bold text-gray-400 uppercase">Prepared By (Finance Manager)</div>
                                <div className="border-t border-gray-400 pt-2 text-center italic text-[9px] font-bold text-gray-400 uppercase">Authorized By (Managing Director)</div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-80 text-gray-300 border-2 border-dashed border-gray-100">
                            <FileText size={48} className="mb-4 opacity-10" />
                            <span className="font-black text-xs uppercase tracking-[0.2em]">Engine Waiting for Criteria</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mt-4 no-print">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white font-bold text-[10px] uppercase shadow-sm">
                        <LogOut size={14} /> Back to Hub
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayrollSummaryReport;
