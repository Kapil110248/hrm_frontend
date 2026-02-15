import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Printer, LogOut, FileText, Download, Send } from 'lucide-react';
import { api } from '../../services/api';

const BankTransferAdvice = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [filters, setFilters] = useState({
        bank: '',
        payPeriod: location.state?.filterOptions?.payPeriod || location.state?.payPeriod || (new Date().getMonth() + 1).toString(),
        ofYear: location.state?.filterOptions?.ofYear || location.state?.selectedYear || new Date().getFullYear().toString(),
        batchRef: ''
    });

    const [transferData, setTransferData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch data when filters change
    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const companyStr = localStorage.getItem('selectedCompany');
                const company = companyStr ? JSON.parse(companyStr) : null;

                if (company) {
                    const res = await api.fetchPayrolls({
                        companyId: company.id,
                        period: getPeriodString(filters.payPeriod, filters.ofYear)
                    });

                    if (res.success) {
                        const mapped = res.data
                            .filter(p => p.employee && (p.netSalary > 0)) // Only users with net pay
                            .map(p => ({
                                id: p.id,
                                employeeId: p.employee.employeeId,
                                name: `${p.employee.firstName} ${p.employee.lastName}`,
                                accountNo: p.employee.bankAccount || 'MISSING',
                                amount: parseFloat(p.netSalary),
                                bank: p.employee.bankName || 'NOT SPECIFIED',
                                status: ['Finalized', 'Sent', 'Paid'].includes(p.status) ? 'Processed' : 'Pending',
                                paymentMethod: p.employee.paymentMethod
                            }));

                        setTransferData(mapped);
                    }
                }
            } catch (err) {
                console.error("Failed to load bank transfer data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [filters.payPeriod, filters.ofYear]);

    const getPeriodString = (period, year) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIdx = parseInt(period) - 1;
        const monthName = months[monthIdx] || 'Jan';
        return `${monthName}-${year}`;
    };

    const filteredData = transferData.filter(item => {
        if (filters.bank && item.bank !== filters.bank) return false;
        // Optional: Filter by payment method if needed (e.g. only 'Bank Transfer')
        if (item.paymentMethod && item.paymentMethod !== 'Bank Transfer') return false;
        return true;
    });

    const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);

    const handleSendToBank = async () => {
        if (filteredData.length === 0) {
            alert("ACTION REQUIRED: No data available to transmit.");
            return;
        }

        if (!window.confirm(`CONFIRM TRANSMISSION: You are about to securely transmit advice for ${filteredData.length} records. This will mark them as PAID in the system. Proceed?`)) {
            return;
        }

        try {
            setIsLoading(true);
            const payrollIds = filteredData.map(item => item.id);
            const res = await api.transmitBankAdvice({
                payrollIds,
                bankName: filters.bank || 'Consolidated'
            });

            if (res.success) {
                alert(`SUCCESS: ${res.message || 'Bank advice transmitted successfully.'}`);

                // Refresh data
                const companyStr = localStorage.getItem('selectedCompany');
                const company = companyStr ? JSON.parse(companyStr) : null;

                if (company) {
                    const period = getPeriodString(filters.payPeriod, filters.ofYear);
                    const refreshRes = await api.fetchPayrolls({
                        companyId: company.id,
                        period
                    });

                    if (refreshRes.success) {
                        const mapped = refreshRes.data
                            .filter(p => p.employee && (p.netSalary > 0))
                            .map(p => ({
                                id: p.id,
                                employeeId: p.employee.employeeId,
                                name: `${p.employee.firstName} ${p.employee.lastName}`,
                                accountNo: p.employee.bankAccount || 'MISSING',
                                amount: parseFloat(p.netSalary),
                                bank: p.employee.bankName || 'NOT SPECIFIED',
                                status: ['Finalized', 'Sent', 'Paid'].includes(p.status) ? 'Processed' : 'Pending',
                                paymentMethod: p.employee.paymentMethod
                            }));
                        setTransferData(mapped);
                    }
                }
            }
        } catch (err) {
            console.error("Transmission failed", err);
            alert("ERROR: Failed to transmit advice. Please contact IT support.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        if (filteredData.length === 0) {
            alert("INFO: Buffer empty. Nothing to export.");
            return;
        }

        // CSV Header
        const headers = ["Employee ID", "Personnel Name", "Account Number", "Bank Institution", "Net Amount", "Status"];

        // Map data rows
        const rows = filteredData.map(item => [
            item.employeeId,
            `"${item.name.replace(/"/g, '""')}"`, // Escape quotes in names
            `"${item.accountNo}"`, // Force string for account numbers to preserve leading zeros
            item.bank,
            item.amount.toFixed(2),
            item.status
        ].join(","));

        // Combine with BOM for Excel UTF-8 compatibility
        const BOM = "\uFEFF";
        const csvContent = BOM + [headers.join(","), ...rows].join("\r\n");

        // Create Blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.style.display = 'none';

        // Sanitize filename
        const safeBank = (filters.bank || 'CONSOLIDATED').replace(/[^a-z0-9]/yi, '_');
        const filename = `BANK_ADVICE_${safeBank}_${filters.payPeriod}_${filters.ofYear}.csv`;
        link.setAttribute("download", filename);

        document.body.appendChild(link);

        // Trigger download
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 py-1 flex items-center justify-between no-print shadow-sm">
                <div className="flex items-center gap-2">
                    <FileText className="text-blue-900" size={16} />
                    <span className="font-black text-gray-700 uppercase tracking-tighter italic">Bank Transfer Register Matrix</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSendToBank}
                        className="px-4 py-1.5 bg-[#316AC5] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 active:translate-y-0.5 transition-all shadow-sm flex items-center gap-1 italic"
                    >
                        <Send size={12} />
                        Transmit Advice
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-4 py-1.5 bg-green-700 text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-800 active:translate-y-0.5 transition-all shadow-sm flex items-center gap-1 italic"
                    >
                        <Download size={12} />
                        Export Buffer
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-4 py-1.5 bg-white border border-gray-400 text-gray-800 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 active:translate-y-0.5 transition-all shadow-sm flex items-center gap-1 italic"
                    >
                        <Printer size={12} />
                        Hard Copy
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-auto flex flex-col gap-6">
                {/* Filters */}
                <div className="bg-white border-2 border-gray-300 p-6 shadow-xl no-print">
                    <h3 className="font-black text-[10px] text-blue-800 uppercase tracking-[0.2em] mb-4 border-b pb-2 italic">Runtime Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Bank Institution</label>
                            <select
                                value={filters.bank}
                                onChange={(e) => setFilters({ ...filters, bank: e.target.value })}
                                className="w-full p-2 border border-gray-300 bg-gray-50 font-bold text-blue-900 outline-none focus:border-blue-500 transition-colors shadow-inner"
                            >
                                <option value="">All Institutions</option>
                                <option value="BNS">Bank of Nova Scotia</option>
                                <option value="NCB">National Commercial Bank</option>
                                <option value="JN Bank">JN Bank</option>
                                <option value="JMMB">JMMB</option>
                                <option value="Sagicor">Sagicor Bank</option>
                                <option value="CitiBank">CitiBank</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Tax Year</label>
                            <select
                                value={filters.ofYear}
                                onChange={(e) => setFilters({ ...filters, ofYear: e.target.value })}
                                className="w-full p-2 border border-gray-300 bg-gray-50 font-bold text-blue-900 outline-none focus:border-blue-500 transition-colors shadow-inner cursor-pointer"
                            >
                                {[...Array(5)].map((_, i) => {
                                    const y = new Date().getFullYear() - 2 + i;
                                    return <option key={y} value={y}>{y}</option>;
                                })}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Pay Cycle</label>
                            <select
                                value={filters.payPeriod}
                                onChange={(e) => setFilters({ ...filters, payPeriod: e.target.value })}
                                className="w-full p-2 border border-gray-300 bg-gray-50 font-bold text-blue-900 outline-none focus:border-blue-500 transition-colors shadow-inner cursor-pointer"
                            >
                                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                                    <option key={i + 1} value={i + 1}>{m} (Period {i + 1})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Batch Trace ID</label>
                            <input
                                type="text"
                                value={filters.batchRef}
                                onChange={(e) => setFilters({ ...filters, batchRef: e.target.value })}
                                placeholder="SALARY-MATRIX-001"
                                className="w-full p-2 border border-gray-300 bg-gray-50 font-bold text-blue-900 outline-none focus:border-blue-500 transition-colors shadow-inner"
                            />
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="bg-white border-2 border-gray-300 shadow-2xl p-8 min-h-[600px] flex flex-col print:shadow-none print:border-none">
                    <div className="mb-10 text-center border-b-4 border-double border-blue-900 pb-6">
                        <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter italic">Bank Transfer Advice</h2>
                        <div className="flex justify-center gap-6 mt-3 font-bold text-[10px] text-gray-500 uppercase tracking-widest">
                            <span>CYCLE: {filters.payPeriod}</span>
                            <span>•</span>
                            <span>TAX YEAR: {filters.ofYear}</span>
                            <span>•</span>
                            <span>INSTITUTION: {filters.bank || 'CONSOLIDATED'}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-y-2 border-gray-800">
                                    <th className="p-3 text-left font-black uppercase text-[10px] tracking-wider text-gray-600">Employee ID</th>
                                    <th className="p-3 text-left font-black uppercase text-[10px] tracking-wider text-gray-600">Personnel Name</th>
                                    <th className="p-3 text-left font-black uppercase text-[10px] tracking-wider text-gray-600">Account Matrix</th>
                                    <th className="p-3 text-left font-black uppercase text-[10px] tracking-wider text-gray-600">Bank Code</th>
                                    <th className="p-3 text-right font-black uppercase text-[10px] tracking-wider text-gray-600">Net Disbursement</th>
                                    <th className="p-3 text-center font-black uppercase text-[10px] tracking-wider text-gray-600">Transmission Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y border-b border-gray-800">
                                {filteredData.length > 0 ? filteredData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="p-3 font-bold text-blue-900">{row.employeeId}</td>
                                        <td className="p-3 font-bold uppercase">{row.name}</td>
                                        <td className="p-3 font-mono text-gray-600">{row.accountNo}</td>
                                        <td className="p-3"><span className="px-2 py-0.5 bg-gray-200 rounded font-black text-[9px] uppercase">{row.bank}</span></td>
                                        <td className="p-3 text-right font-black text-blue-900">${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-tighter ${row.status === 'Processed' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-400 italic font-bold">No disbursement data matching current parameters</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 border-t-4 border-blue-900 pt-6">
                        <div className="grid grid-cols-2 gap-8 font-black uppercase italic">
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-500">Transmission Integrity Hash</p>
                                <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">{filters.batchRef || 'NO-REF-SPECIFIED'}•{Date.now()}</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <div className="grid grid-cols-2 gap-x-8 text-sm border-b-2 border-gray-200 pb-2 w-full max-w-xs">
                                    <span className="text-gray-500">Record Count:</span>
                                    <span>{filteredData.length}</span>
                                    <span className="text-blue-900 text-lg">Batch Total:</span>
                                    <span className="text-blue-900 text-lg underline decoration-double underline-offset-4">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-8 flex justify-end no-print">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-3 px-10 py-2.5 bg-white border-2 border-gray-400 text-[11px] font-black text-gray-800 hover:bg-gray-50 transition-all shadow-md active:translate-y-0.5 group uppercase italic"
                    >
                        <LogOut size={16} className="text-gray-600 group-hover:text-red-600" />
                        <span>Close Register</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BankTransferAdvice;

