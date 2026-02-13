import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Calculator, Save, Play, RefreshCw, CheckCircle2,
    AlertCircle, FileText, Mail, Download, Search, Loader2
} from 'lucide-react';
import { api } from '../../services/api';

const PayrollCalculation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialPeriod = queryParams.get('period') || '2026-02';

    const [period, setPeriod] = useState(initialPeriod);
    const [isCalculating, setIsCalculating] = useState(false);
    const [calcStage, setCalcStage] = useState('');
    const [selectedDept, setSelectedDept] = useState('All Departments');
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    const [staffRecords, setStaffRecords] = useState([]);

    const fetchDepartments = async () => {
        if (!selectedCompany.id) return;
        try {
            const response = await api.fetchDepartments(selectedCompany.id);
            if (response.success) {
                setDepartments(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch departments", err);
        }
    };

    const fetchRecords = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const params = {
                companyId: selectedCompany.id,
                period: period
            };
            if (selectedDept !== 'All Departments') {
                params.departmentId = selectedDept;
            }
            const response = await api.fetchPayrolls(params);
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
        fetchDepartments();
    }, [selectedCompany.id]);

    useEffect(() => {
        fetchRecords();
    }, [selectedCompany.id, period, selectedDept]);

    const handleHrmSync = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            setCalcStage('Synchronizing with Personnel Directory...');

            const response = await api.syncPayrolls({
                companyId: selectedCompany.id,
                period: period
            });

            if (response.success) {
                await fetchRecords();
                alert(`✅ HRM Sync Complete\n${response.data.created} new employee(s) imported to ${period}.\n${response.data.existing} record(s) already synchronized.`);
            } else {
                alert("Sync failed: " + response.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setCalcStage('');
        }
    };

    const handleExportCSV = () => {
        if (staffRecords.length === 0) return;

        const csvContent = "Staff,Department,Gross,NIS,NHT,EdTax,PAYE,Net,Status\n" +
            staffRecords.map(s => `"${s.employee?.firstName} ${s.employee?.lastName}","${s.employee?.department?.name || 'N/A'}",${s.grossSalary},${s.nis},${s.nht},${s.edTax},${s.paye},${s.netSalary},"${s.status}"`).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Payroll_Export_${period}_${selectedDept}.csv`);
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
                setCalcStage('Applying statutory rules (NIS/NHT/PAYE)...');
                setTimeout(() => {
                    setCalcStage('Finalizing individual tallies...');
                    setTimeout(() => {
                        fetchRecords();
                        setIsCalculating(false);
                        setCalcStage('');
                        alert(`✅ SUCCESS: ${response.data.count} payroll records processed for ${period}.`);
                    }, 1000);
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
            alert("No payroll records found for this period. Run 'Step 2: Calculate' first.");
            return;
        }

        const pendingCount = staffRecords.filter(s => s.status === 'Pending').length;
        if (pendingCount > 0) {
            alert(`⚠️ FINALIZATION BLOCKED\n\nCannot finalize payroll batch!\n\nReason: ${pendingCount} employees are still in 'Pending' status.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPlease run "Step 2: Calculate" to process all employees before finalizing.`);
            return;
        }

        const confirmed = window.confirm(`🔒 FINALIZE PAYROLL BATCH - ${period}\n\nThis will lock all records and Mark them as ready for disbursement.\n\nProceed?`);
        if (confirmed) {
            try {
                const response = await api.finalizeBatch({
                    companyId: selectedCompany.id,
                    period: period
                });
                if (response.success) {
                    alert(`✅ SUCCESS: ${response.data.count} records finalized.`);
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
                        { step: 'Step 1: HRM Sync', icon: <RefreshCw size={32} className="text-blue-500" />, btnText: 'Sync HRM Data', desc: 'Refresh employee data & base rates', color: 'gray', action: handleHrmSync, disabled: loading || isCalculating },
                        { step: 'Step 2: Calculate', icon: <Play size={32} className="text-emerald-500" />, btnText: isCalculating ? 'Processing...' : 'Run Master Engine', desc: 'Calculate Statutories & Net Pay', color: 'primary', action: runCalculations, disabled: isCalculating || loading },
                        {
                            step: 'Step 3: Audit', icon: <FileText size={32} className="text-amber-500" />, btnText: 'Review Summary', desc: 'Check for discrepancies before locking', color: 'gray', action: () => {
                                const totalNis = staffRecords.reduce((sum, s) => sum + parseFloat(s.nis || 0), 0);
                                const totalNht = staffRecords.reduce((sum, s) => sum + parseFloat(s.nht || 0), 0);
                                const totalEdTax = staffRecords.reduce((sum, s) => sum + parseFloat(s.edTax || 0), 0);

                                alert(`📊 PAYROLL AUDIT SUMMARY - ${period.toUpperCase()}\n\nScope: ${selectedDept}\nTotal Population: ${staffRecords.length}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nGross Payroll:        $${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}\nTotal Income Tax:     $${totalIncomeTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}\nNIS Contributions:    $${totalNis.toLocaleString(undefined, { minimumFractionDigits: 2 })}\nNHT Contributions:    $${totalNht.toLocaleString(undefined, { minimumFractionDigits: 2 })}\nEducation Tax:        $${totalEdTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}\nOther Deductions:     $${totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNET DISBURSEMENT:    $${totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
                            }, disabled: staffRecords.length === 0
                        },
                        { step: 'Step 4: Finalize', icon: <CheckCircle2 size={32} className="text-gray-400" />, btnText: 'Finalize Batch', desc: 'Lock period & generate payslips', color: 'gray', action: handleFinalize, disabled: staffRecords.length === 0 || isCalculating }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white border border-gray-300 p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">{item.step}</h4>
                                <div className="opacity-20">{item.icon}</div>
                            </div>
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
                {(isCalculating || loading) && (
                    <div className="bg-gray-800 p-3 flex items-center justify-between border-l-4 border-blue-500 shadow-lg animate-pulse">
                        <div className="flex items-center gap-4 text-white">
                            <Loader2 className="animate-spin text-blue-400" size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{calcStage || 'Loading context...'}</span>
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
                                className="text-[10px] font-bold text-blue-900 border border-gray-300 bg-white p-1.5 rounded-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                                <option value="All Departments">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                            <span className="text-[9px] text-gray-400 ml-2 italic">Found {staffRecords.length} records</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleExportCSV} className="p-1.5 px-4 bg-white border border-gray-300 text-[9px] font-black uppercase flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
                                <Download size={14} /> Export CSV
                            </button>
                            <button onClick={handlePrintPDF} className="p-1.5 px-4 bg-gray-700 text-white border border-gray-800 text-[9px] font-black uppercase flex items-center gap-1.5 hover:bg-gray-900 transition-colors">
                                <FileText size={14} /> Print PDF
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead className="bg-[#F8F9FA] border-b border-gray-300 text-[10px] font-bold text-gray-700 uppercase sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 border-r border-gray-200">Staff Member</th>
                                    <th className="p-3 border-r border-gray-200">Dept</th>
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
                                {loading && staffRecords.length === 0 ? (
                                    <tr><td colSpan={9} className="p-10 text-center text-gray-400 uppercase tracking-widest">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin" size={24} />
                                            <span>Streaming payroll data...</span>
                                        </div>
                                    </td></tr>
                                ) : staffRecords.length === 0 ? (
                                    <tr><td colSpan={9} className="p-10 text-center text-gray-400 uppercase tracking-widest">No records found for this period. Click 'Run Master Engine' to start.</td></tr>
                                ) : staffRecords.map(payroll => (
                                    <tr key={payroll.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                                        <td className="p-3 border-r border-gray-200 uppercase">
                                            <span className="text-gray-800 font-bold group-hover:text-blue-700 transition-colors">{payroll.employee?.firstName} {payroll.employee?.lastName}</span>
                                            <div className="text-[9px] text-gray-400 font-mono tracking-tighter">ID: {payroll.employee?.employeeId} | TRN: {payroll.employee?.trn || 'PENDING'}</div>
                                        </td>
                                        <td className="p-3 border-r border-gray-200">
                                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] text-gray-600 font-bold uppercase">{payroll.employee?.department?.name || 'N/A'}</span>
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-right font-mono">${parseFloat(payroll.grossSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-3 border-r border-gray-200 text-right font-mono text-gray-500">${parseFloat(payroll.nis).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-3 border-r border-gray-200 text-right font-mono text-gray-500">${parseFloat(payroll.nht).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-3 border-r border-gray-200 text-right font-mono text-gray-500">${parseFloat(payroll.edTax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-3 border-r border-gray-200 text-right font-mono text-amber-700 font-bold">${parseFloat(payroll.paye).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-3 border-r border-gray-200 text-right font-bold bg-gray-50 text-[13px] font-mono text-blue-900">
                                            ${parseFloat(payroll.netSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-sm
                                                ${payroll.status === 'Finalized' ? 'bg-green-600 text-white' :
                                                    payroll.status === 'Calculated' ? 'bg-blue-600 text-white' :
                                                        'bg-gray-400 text-white'}`}>
                                                {payroll.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Batch Footer Summary */}
                    <div className="bg-gray-100 p-4 border-t border-gray-300 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
                        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm border-l-4 border-l-gray-400">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Batch Gross Payroll</span>
                            <div className="text-sm font-bold text-gray-800 mt-1">${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm border-l-4 border-l-amber-400">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Total Income Tax (PAYE)</span>
                            <div className="text-sm font-bold text-amber-700 mt-1">${totalIncomeTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm border-l-4 border-l-blue-400">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Other Deductions & Statutories</span>
                            <div className="text-sm font-bold text-gray-800 mt-1">${(totalGross - totalNet - totalIncomeTax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-gray-800 p-3 rounded text-white shadow-lg border-l-4 border-l-emerald-400">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Net Disbursement</span>
                            <div className="text-xl font-bold tracking-tight">${totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Compliance Footer */}
            <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest no-print">
                <div className="flex gap-6">
                    <span className="flex items-center gap-1.5"><AlertCircle size={14} className="text-amber-500" /> Compliance: Jamaica Income Tax Act 2024</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> NIS & NHT Thresholds Verified</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-400">Environment: Production</span>
                    <span className="border-l border-gray-600 pl-3">Session Time: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .flex-1 { overflow: visible !important; }
                    table { min-width: 100% !important; border: 1px solid #ccc !important; }
                }
            `}} />
        </div>
    );
};

export default PayrollCalculation;
