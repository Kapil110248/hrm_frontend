import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calculator, Save, Play, RefreshCw, CheckCircle2,
    AlertCircle, FileText, Mail, Download, Search, Loader2
} from 'lucide-react';
import { api } from '../../services/api';

const PayrollCalculation = () => {
    const navigate = useNavigate();
    const [period, setPeriod] = useState('2026-01');
    const [isCalculating, setIsCalculating] = useState(false);
    const [calcStage, setCalcStage] = useState('');
    const [selectedDept, setSelectedDept] = useState('All Departments');
    const [loading, setLoading] = useState(false);
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    const [staffRecords, setStaffRecords] = useState([]);

    const fetchRecords = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const response = await api.fetchPayrolls({ 
                companyId: selectedCompany.id, 
                period: period 
            });
            if (response.success) {
                setStaffRecords(response.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [selectedCompany.id, period]);

    const handleExportCSV = () => {
        if (staffRecords.length === 0) return;
        
        const csvContent = "Staff,Gross,NIS,NHT,EdTax,PAYE,Net,Status\n" +
            staffRecords.map(s => `"${s.employee?.firstName} ${s.employee?.lastName}",${s.grossSalary},${s.nis},${s.nht},${s.edTax},${s.paye},${s.netSalary},"${s.status}"`).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Payroll_Export_${period}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintPDF = () => {
        window.print();
    };

    const runCalculations = async () => {
        if (!selectedCompany.id) return;
        
        try {
            setIsCalculating(true);
            setCalcStage('Initializing calculation engine...');
            
            const response = await api.generatePayrolls({
                companyId: selectedCompany.id,
                period: period
            });

            if (response.success) {
                setCalcStage('Applying statutory rules...');
                setTimeout(() => {
                    fetchRecords();
                    setIsCalculating(false);
                    setCalcStage('');
                }, 1000);
            } else {
                alert("Calculation failed: " + response.message);
                setIsCalculating(false);
            }
        } catch (err) {
            console.error(err);
            setIsCalculating(false);
        }
    };

    const handleFinalize = async () => {
        const calculatedEmployees = staffRecords.filter(s => s.status === 'Calculated').length;
        const totalEmployees = staffRecords.length;

        if (totalEmployees === 0) {
            alert("No payroll records found for this period.");
            return;
        }

        if (calculatedEmployees < totalEmployees) {
            alert(`⚠️ FINALIZATION BLOCKED\n\nCannot finalize payroll batch!\n\nReason: Not all employees have been calculated.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCalculated: ${calculatedEmployees}\nPending: ${totalEmployees - calculatedEmployees}\nTotal: ${totalEmployees}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nPlease run "Step 2: Calculate" to process all employees before finalizing.`);
            return;
        }

        const confirmed = window.confirm(`🔒 FINALIZE PAYROLL BATCH - ${period}\n\nProceed with finalization?`);
        if (confirmed) {
            try {
                const response = await api.finalizeBatch({
                    companyId: selectedCompany.id,
                    period: period
                });
                if (response.success) {
                    alert("✅ PAYROLL BATCH FINALIZED SUCCESSFULLY!");
                    fetchRecords();
                } else {
                    alert("Finalization failed: " + response.message);
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Derived totals
    const totalGross = staffRecords.reduce((sum, s) => sum + parseFloat(s.grossSalary || 0), 0);
    const totalNet = staffRecords.reduce((sum, s) => sum + parseFloat(s.netSalary || 0), 0);
    const totalDeductions = staffRecords.reduce((sum, s) => sum + parseFloat(s.deductions || 0), 0);
    const totalTax = staffRecords.reduce((sum, s) => sum + parseFloat(s.tax || 0), 0);
    const totalIncomeTax = staffRecords.reduce((sum, s) => sum + parseFloat(s.paye || 0), 0);

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F5F7] font-sans text-xs">
            {/* Header */}
            <div className="bg-white border-b border-gray-300 px-3 sm:px-4 py-3 sm:py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2 no-print">
                <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
                    <Calculator className="text-gray-600 shrink-0" size={16} />
                    <span className="font-bold text-gray-800 text-xs uppercase tracking-wider border-l-2 border-gray-300 pl-2 leading-tight">
                        Payroll Execution Terminal <span className="hidden xs:inline">· Jamaica Statutory Engine</span>
                    </span>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-3 bg-white border border-gray-300 px-3 py-2 shadow-sm group hover:border-blue-500 transition-all w-full sm:w-72 lg:w-64">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter shrink-0 border-r border-gray-200 pr-3 h-4 flex items-center">
                            Tax Period
                        </label>
                        <input
                            type="month"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="text-xs font-black text-blue-900 focus:outline-none bg-transparent cursor-pointer flex-1 text-right focus:ring-0 appearance-none border-none p-0 uppercase"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-2 sm:p-4 flex flex-col gap-4 overflow-y-auto min-w-0">

                {/* Control Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                        { step: 'Step 1: HRM Sync', icon: <RefreshCw size={32} className="text-gray-400" />, btnText: 'Sync HRM Data', desc: 'Auto-imports employee data & salary', color: 'gray', action: fetchRecords },
                        { step: 'Step 2: Calculate', icon: <Play size={32} className="text-gray-700" />, btnText: isCalculating ? 'Processing...' : 'Run Master Engine', desc: 'Applies statutory rates and calculates net pay', color: 'primary', action: runCalculations, disabled: isCalculating || loading },
                        {
                            step: 'Step 3: Audit', icon: <FileText size={32} className="text-gray-600" />, btnText: 'Review Summary', desc: 'Review calculated payroll discrepancies', color: 'gray', action: () => {
                                alert(`PAYROLL AUDIT SUMMARY - ${period}\n\nTotal Employees: ${staffRecords.length}\nGross: $${totalGross.toLocaleString()}\nNet: $${totalNet.toLocaleString()}`);
                            }
                        },
                        { step: 'Step 4: Finalize', icon: <Mail size={32} className="text-gray-600" />, btnText: 'Finalize Batch', desc: 'Lock calculations and prepare for disbursement', color: 'gray', action: handleFinalize }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white border border-gray-300 p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
                            <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">{item.step}</h4>
                            <button
                                disabled={item.disabled}
                                onClick={item.action}
                                className={`p-2.5 text-[10px] font-bold uppercase border transition-all flex items-center justify-center gap-2 rounded
                                    ${item.color === 'primary' ? 'bg-gray-800 text-white hover:bg-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                                {item.btnText}
                            </button>
                            <p className="text-[9px] text-gray-500 mt-1 leading-tight">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Progress Monitor */}
                {isCalculating && (
                    <div className="bg-gray-800 p-3 flex items-center justify-between border-l-4 border-gray-600 shadow-lg">
                        <div className="flex items-center gap-4 text-white">
                            <Loader2 className="animate-spin text-gray-400" size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{calcStage}</span>
                        </div>
                    </div>
                )}

                {/* Main Data Container */}
                <div className="flex-1 bg-white border border-gray-400 shadow-inner overflow-hidden flex flex-col min-h-0">
                    <div className="bg-gray-100 p-2 sm:p-3 border-b border-gray-300 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black text-gray-500 uppercase">Filter:</span>
                             <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="text-[10px] font-black text-blue-900 border border-gray-300 bg-white p-1.5 rounded-sm"
                            >
                                <option>All Departments</option>
                                {/* We could fetch real departments here if needed */}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleExportCSV} className="p-1.5 px-4 bg-gray-50 border border-gray-300 text-[9px] font-black uppercase flex items-center gap-1.5 hover:bg-white">
                                <Download size={14} /> Export CSV
                            </button>
                            <button onClick={handlePrintPDF} className="p-1.5 px-4 bg-gray-700 text-white border border-gray-800 text-[9px] font-black uppercase flex items-center gap-1.5 hover:bg-gray-900">
                                <FileText size={14} /> Print PDF
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead className="bg-gray-100 border-b border-gray-300 text-[10px] font-bold text-gray-700 uppercase sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 border-r border-gray-200">Staff Member</th>
                                    <th className="p-3 border-r border-gray-200 text-right">Gross Pay</th>
                                    <th className="p-3 border-r border-gray-200 text-right">NIS EE</th>
                                    <th className="p-3 border-r border-gray-200 text-right">NHT EE</th>
                                    <th className="p-3 border-r border-gray-200 text-right">ED TAX</th>
                                    <th className="p-3 border-r border-gray-200 text-right">PAYE</th>
                                    <th className="p-3 border-r border-gray-200 text-right font-bold">Net Pay</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-medium text-gray-700">
                                {loading ? (
                                    <tr><td colSpan={8} className="p-10 text-center text-gray-400 uppercase tracking-widest">Loading records...</td></tr>
                                ) : staffRecords.length === 0 ? (
                                    <tr><td colSpan={8} className="p-10 text-center text-gray-400 uppercase tracking-widest">No records found. Run engine to calculate.</td></tr>
                                ) : staffRecords.map(payroll => (
                                    <tr key={payroll.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="p-3 border-r border-gray-200 uppercase">
                                            <span className="text-gray-800 font-bold">{payroll.employee?.firstName} {payroll.employee?.lastName}</span>
                                            <div className="text-[9px] text-gray-400">TRN: {payroll.employee?.trn}</div>
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-right font-mono">${parseFloat(payroll.grossSalary).toLocaleString()}</td>
                                        <td className="p-3 border-r border-gray-200 text-right font-mono">${parseFloat(payroll.nis).toLocaleString()}</td>
                                        <td className="p-3 border-r border-gray-200 text-right font-mono">${parseFloat(payroll.nht).toLocaleString()}</td>
                                        <td className="p-3 border-r border-gray-200 text-right font-mono">${parseFloat(payroll.edTax).toLocaleString()}</td>
                                        <td className="p-3 border-r border-gray-200 text-right font-mono font-bold">${parseFloat(payroll.paye).toLocaleString()}</td>
                                        <td className="p-3 border-r border-gray-200 text-right font-bold bg-gray-50 text-[13px] font-mono">${parseFloat(payroll.netSalary).toLocaleString()}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${payroll.status === 'Finalized' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {payroll.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Batch Footer Summary */}
                    <div className="bg-gray-100 p-4 border-t border-gray-300 grid grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded border border-gray-200">
                            <span className="text-[9px] font-bold text-gray-500 uppercase">Batch Total Gross</span>
                            <div className="text-sm font-bold text-gray-800 mt-1">${totalGross.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                            <span className="text-[9px] font-bold text-gray-500 uppercase">Deductions</span>
                            <div className="text-sm font-bold text-gray-800 mt-1">${totalDeductions.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                            <span className="text-[9px] font-bold text-gray-500 uppercase">Income Tax (PAYE)</span>
                            <div className="text-sm font-bold text-gray-800 mt-1">${totalIncomeTax.toLocaleString()}</div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded text-white">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Net Disbursement</span>
                            <div className="text-xl font-bold tracking-tight">${totalNet.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Compliance Footer */}
            <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                <div className="flex gap-6">
                    <span className="flex items-center gap-1.5"><AlertCircle size={14} className="text-gray-400" /> Compliance: Jamaica Tax Act 2024</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-gray-400" /> NIS Ceiling Applied</span>
                </div>
                <div>Server Time: {new Date().toLocaleTimeString()}</div>
            </div>
        </div>
    );
};

export default PayrollCalculation;
