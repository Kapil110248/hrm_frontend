import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, ChevronLeft, ChevronRight, CheckCircle, Users, Calculator, FileCheck, LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

const PayrollWizard = () => {
    const navigate = useNavigate();
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [step, setStep] = useState(1);

    // Wizard State
    const [selection, setSelection] = useState('full');
    const [period, setPeriod] = useState(new Date().toLocaleString('default', { month: 'short', year: 'numeric' }).replace(' ', '-'));
    const [periods, setPeriods] = useState([]);
    const [selectedDepts, setSelectedDepts] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Validation/Preview Data
    const [validationStatus, setValidationStatus] = useState('pending'); // pending, validating, success, error
    const [previewData, setPreviewData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const storedCompany = localStorage.getItem('selectedCompany');
        if (storedCompany) {
            setSelectedCompany(JSON.parse(storedCompany));
        }
    }, []);

    useEffect(() => {
        const months = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
            const value = d.toLocaleString('default', { month: 'short', year: 'numeric' }).replace(' ', '-');
            months.push({ label, value });
        }
        setPeriods(months);
    }, []);

    useEffect(() => {
        if (selectedCompany?.id) {
            loadDepartments();
        }
    }, [selectedCompany]);

    const loadDepartments = async () => {
        try {
            const res = await api.fetchDepartments(selectedCompany.id);
            if (res.data) setDepartments(res.data);
        } catch (error) {
            console.error("Failed to load departments", error);
        }
    };

    const handleDeptToggle = (deptName) => {
        setSelectedDepts(prev =>
            prev.includes(deptName) ? prev.filter(d => d !== deptName) : [...prev, deptName]
        );
    };

    // Step 3 Logic: Validation / "Pre-flight" check
    useEffect(() => {
        if (step === 3) {
            runValidation();
        }
    }, [step]);

    const runValidation = async () => {
        setValidationStatus('validating');
        try {
            // Fetch POSTED transactions for this period to see if we have data to process
            const res = await api.fetchTransactionRegister({
                companyId: selectedCompany.id,
                period: period,
                status: 'POSTED'
            });

            if (res.data) {
                const transactions = res.data.transactions || [];

                if (transactions.length === 0) {
                    setPreviewData(null);
                    setValidationStatus('error');
                    return; // No data to process
                }

                // Calculate preview totals
                const totalRecipients = new Set(transactions.map(t => t.employeeId)).size;
                const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

                // Simplified tax est for preview (20%)
                const estTax = totalAmount * 0.2;
                const net = totalAmount - estTax;

                setPreviewData({
                    count: totalRecipients,
                    gross: totalAmount,
                    tax: estTax,
                    net: net,
                    totalCost: totalAmount
                });

                setValidationStatus('success');
            }
        } catch (error) {
            console.error("Validation failed", error);
            setValidationStatus('error');
        }
    };

    const handleFinish = async () => {
        if (step < 4) {
            setStep(s => s + 1);
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.generatePayrolls({
                companyId: selectedCompany.id,
                period: period
            });

            if (res.success) {
                alert(`SUCCESS: ${res.message}`);
                navigate('/payroll/register');
            } else {
                alert("Generation failed: " + res.message);
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Submission failed", error);
            alert("An error occurred during payroll generation.");
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'XY' }).format(val).replace('XY', '$');

    const steps = [
        { id: 1, title: 'Selection', icon: <Users size={20} /> },
        { id: 2, title: 'Config', icon: <Calculator size={20} /> },
        { id: 3, title: 'Validation', icon: <FileCheck size={20} /> },
        { id: 4, title: 'Submission', icon: <CheckCircle size={20} /> },
    ];

    if (!selectedCompany) return <div className="p-4">Please select a company first.</div>;

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            <div className="bg-[#0055E5] text-white px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Wand2 size={18} />
                    <span className="font-black italic uppercase tracking-widest text-[11px]">IntelliPay Setup Wizard</span>
                </div>
            </div>

            <div className="flex-1 p-2 md:p-10 flex flex-col items-center overflow-y-auto">
                <div className="w-full max-w-4xl bg-white border-2 border-gray-500 shadow-2xl flex flex-col min-h-[500px]">
                    {/* Stepper Header */}
                    <div className="flex border-b-2 border-gray-200 overflow-x-auto">
                        {steps.map((s) => (
                            <div
                                key={s.id}
                                className={`flex-1 min-w-[80px] p-2 md:p-4 flex flex-col items-center gap-1 border-r last:border-0 transition-colors ${step === s.id ? 'bg-blue-50 border-b-4 border-b-blue-600' :
                                    step > s.id ? 'bg-green-50' : 'bg-gray-50 opacity-40'
                                    }`}
                            >
                                <div className={`${step >= s.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {s.icon}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-tighter text-center ${step >= s.id ? 'text-blue-900' : 'text-gray-400'}`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-4 md:p-12 overflow-auto flex flex-col items-center justify-center">

                        {/* STEP 1: SELECTION */}
                        {step === 1 && (
                            <div className="text-center space-y-6 max-w-lg w-full">
                                <Users size={64} className="text-blue-600 mx-auto opacity-20" />
                                <h2 className="text-2xl font-black text-gray-800 italic uppercase">Identify Target Group</h2>

                                {/* Period Selection */}
                                <div className="w-full max-w-xs mx-auto mb-4">
                                    <label className="block text-gray-700 font-bold mb-1 text-left">Processing Period</label>
                                    <select
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value)}
                                        className="w-full p-2 border border-blue-500 font-bold text-blue-900 bg-blue-50"
                                    >
                                        {periods.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full">
                                    <button
                                        onClick={() => setSelection('full')}
                                        className={`p-4 border-2 transition-all font-black italic uppercase shadow-sm flex flex-col items-center gap-2 ${selection === 'full' ? 'border-blue-600 bg-blue-50 text-blue-900 scale-105 shadow-md z-10' : 'border-gray-200 bg-white text-gray-400 opacity-60'}`}
                                    >
                                        <Users size={24} />
                                        <span>Entire Company</span>
                                    </button>
                                    <button
                                        onClick={() => setSelection('dept')}
                                        className={`p-4 border-2 transition-all font-black italic uppercase shadow-sm flex flex-col items-center gap-2 ${selection === 'dept' ? 'border-blue-600 bg-blue-50 text-blue-900 scale-105 shadow-md z-10' : 'border-gray-200 bg-white text-gray-400 opacity-60'}`}
                                    >
                                        <Calculator size={24} />
                                        <span>By Department</span>
                                    </button>
                                </div>

                                {selection === 'dept' && (
                                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-2 w-full animate-in fade-in slide-in-from-top-4 duration-500">
                                        {departments.length > 0 ? departments.map(dept => (
                                            <label key={dept.id} className="flex items-center gap-2 p-3 border border-gray-200 bg-gray-50 rounded cursor-pointer hover:bg-blue-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDepts.includes(dept.name)}
                                                    onChange={() => handleDeptToggle(dept.name)}
                                                    className="accent-blue-600 h-4 w-4"
                                                />
                                                <span className="text-[10px] font-black uppercase text-gray-700 truncate">{dept.name}</span>
                                            </label>
                                        )) : <p className="col-span-3 text-red-500 font-bold">No departments found.</p>}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: CONFIG */}
                        {step === 2 && (
                            <div className="w-full max-w-2xl space-y-8 animate-in slide-in-from-right duration-500">
                                <div className="text-center space-y-2">
                                    <Calculator size={48} className="text-blue-600 mx-auto opacity-30" />
                                    <h2 className="text-2xl font-black text-gray-800 italic uppercase">Earnings & Deductions</h2>
                                    <p className="font-bold text-gray-500 uppercase text-[10px] tracking-widest">Confirm inclusion parameters.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-blue-900 border-b pb-1 uppercase italic tracking-widest">Standard Earnings</h4>
                                        <div className="space-y-2">
                                            {['Basic Salary', 'Overtime', 'Commission', 'Allowances'].map(item => (
                                                <label key={item} className="flex items-center justify-between p-3 border border-gray-100 bg-white shadow-sm rounded-lg hover:border-blue-300 transition-all cursor-pointer">
                                                    <span className="font-bold text-gray-700">{item}</span>
                                                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-red-900 border-b pb-1 uppercase italic tracking-widest">Cycle Deductions</h4>
                                        <div className="space-y-2">
                                            {['PAYE Tax', 'NIS', 'NHT', 'Education Tax'].map(item => (
                                                <label key={item} className="flex items-center justify-between p-3 border border-gray-100 bg-white shadow-sm rounded-lg hover:border-red-300 transition-all cursor-pointer">
                                                    <span className="font-bold text-gray-700">{item}</span>
                                                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-red-500" />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: VALIDATION */}
                        {step === 3 && (
                            <div className="w-full max-w-2xl space-y-8 animate-in zoom-in duration-500">
                                <div className="text-center space-y-2">
                                    <FileCheck size={48} className="text-amber-600 mx-auto opacity-30" />
                                    <h2 className="text-2xl font-black text-gray-800 italic uppercase">Validation Scan</h2>
                                    <p className="font-bold text-gray-500 uppercase text-[10px] tracking-widest">Checking available transaction data...</p>
                                </div>

                                {validationStatus === 'validating' && (
                                    <div className="flex flex-col items-center justify-center p-10 gap-4">
                                        <Loader2 size={40} className="animate-spin text-blue-600" />
                                        <span className="text-gray-500 font-bold uppercase">analyzing ledger...</span>
                                    </div>
                                )}

                                {validationStatus === 'error' && (
                                    <div className="bg-red-50 border-2 border-red-200 p-6 rounded text-center">
                                        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-red-800 mb-2">No Postable Data Found</h3>
                                        <p className="text-gray-700 mb-4">
                                            No 'POSTED' transactions were found for period <strong>{period}</strong>.
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Please go to <strong>Post Transactions</strong> and ensure all entered data is posted before running payroll.
                                        </p>
                                    </div>
                                )}

                                {validationStatus === 'success' && previewData && (
                                    <div className="bg-white border-2 border-green-100 rounded-2xl overflow-hidden shadow-inner">
                                        <div className="p-4 bg-green-50 border-b border-green-100 flex items-center gap-2">
                                            <CheckCircle className="text-green-600" size={20} />
                                            <span className="font-bold text-green-800 uppercase">Data Validation Passed</span>
                                        </div>
                                        <div className="p-4 grid grid-cols-2 gap-4">
                                            <div className="text-center p-2 border border-gray-100 rounded">
                                                <div className="text-gray-400 text-[10px] uppercase font-bold">Transaction Count</div>
                                                <div className="text-2xl font-black text-gray-800">{previewData.count}</div>
                                            </div>
                                            <div className="text-center p-2 border border-gray-100 rounded">
                                                <div className="text-gray-400 text-[10px] uppercase font-bold">Total Gross (Est)</div>
                                                <div className="text-2xl font-black text-gray-800">{formatCurrency(previewData.gross)}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 4: SUBMISSION */}
                        {step === 4 && (
                            <div className="w-full max-w-lg space-y-8 animate-in fade-in duration-700">
                                <div className="text-center space-y-2">
                                    <CheckCircle size={64} className="text-green-600 mx-auto" />
                                    <h2 className="text-2xl font-black text-gray-800 italic uppercase">Final Submission</h2>
                                    <p className="font-bold text-gray-500 uppercase text-[10px] tracking-widest">Review summary and commit.</p>
                                </div>

                                {previewData ? (
                                    <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-[10px] space-y-2 border-l-4 border-green-600 shadow-xl">
                                        <div className="border-b border-gray-800 pb-2 mb-2 flex justify-between uppercase">
                                            <span>Batch Cycle</span>
                                            <span>{period}</span>
                                        </div>
                                        <div className="flex justify-between"><span>TOTAL RECIPIENTS:</span> <span>{previewData.count} EMPLOYEES</span></div>
                                        <div className="flex justify-between"><span>TOTAL GROSS:</span> <span>{formatCurrency(previewData.gross)}</span></div>
                                        <div className="flex justify-between"><span>EST. TAXES:</span> <span>{formatCurrency(previewData.tax)}</span></div>
                                        <div className="flex justify-between text-white font-black pt-4 mt-2 border-t border-gray-800 tracking-widest">
                                            <span>TOTAL NET PAY:</span>
                                            <span>{formatCurrency(previewData.net)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-400">Preview data unavailable.</div>
                                )}

                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 font-bold text-[10px] italic">
                                    <Wand2 size={16} />
                                    Warning: Clicking 'Finish' will lock this pay period and generate payroll records.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Footer */}
                    <div className="p-4 md:p-6 bg-gray-50 border-t-2 border-gray-200 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                        <button
                            disabled={step === 1 || isSubmitting}
                            onClick={() => setStep(s => s - 1)}
                            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 font-black italic uppercase text-gray-500 hover:border-gray-500 disabled:opacity-0 transition-all w-full md:w-auto justify-center"
                        >
                            <ChevronLeft size={20} /> PREVIOUS STAGE
                        </button>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-4 py-3 font-black italic uppercase text-gray-400 hover:text-red-600 transition-none text-center"
                            >
                                CANCEL WIZARD
                            </button>
                            <button
                                onClick={handleFinish}
                                disabled={isSubmitting || (step === 3 && validationStatus !== 'success')}
                                className={`flex items-center gap-2 px-6 sm:px-10 py-3 bg-blue-600 text-white font-black italic uppercase shadow-xl hover:bg-blue-700 active:translate-y-1 transition-all w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isSubmitting ? 'PROCESSING...' : (step === 4 ? 'FINISH & RELEASE' : 'CONTINUE NEXT')}
                                {step < 4 && !isSubmitting && <ChevronRight size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#D4D0C8] border-t border-gray-400 p-3 px-12 flex justify-between items-center text-[9px] font-black italic text-gray-500 uppercase tracking-widest">
                <span>Wizard Version 6.0</span>
                <span>Session Secured: 256-bit Key</span>
            </div>
        </div>
    );
};

export default PayrollWizard;
