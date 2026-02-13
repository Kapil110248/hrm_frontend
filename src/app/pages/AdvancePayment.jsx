import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Save, LogOut, Search, User, CreditCard, ChevronRight, Loader2, Send } from 'lucide-react';
import { api } from '../../services/api';

const AdvancePayment = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [amount, setAmount] = useState('');
    const [terms, setTerms] = useState('1 Month (Full Deduction)');
    const [saveStatus, setSaveStatus] = useState(null); // null, 'saving', 'success'
    const [disburseStatus, setDisburseStatus] = useState(null); // null, 'processing', 'success'
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    const fetchInitial = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const [empRes, advRes] = await Promise.all([
                api.fetchEmployees(selectedCompany.id),
                api.fetchAdvancePayments({ companyId: selectedCompany.id })
            ]);

            if (empRes.success && advRes.success) {
                const allAdvances = advRes.data || [];

                setEmployees((empRes.data || []).map(e => {
                    // Calculate outstanding balance from PAID advances
                    const empAdvances = allAdvances.filter(a => a.employeeId === e.id && a.status === 'PAID');
                    const currentBalance = empAdvances.reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);

                    return {
                        id: e.id,
                        employeeId: e.employeeId,
                        name: `${e.firstName} ${e.lastName}`,
                        limit: e.baseSalary ? parseFloat(e.baseSalary) * 0.5 : 50000,
                        balance: currentBalance
                    };
                }));

                setRecentTransactions(allAdvances.slice(0, 10).map(a => ({
                    id: a.id,
                    date: new Date(a.requestDate).toLocaleDateString(),
                    employee: a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'Unknown',
                    amount: parseFloat(a.amount),
                    status: a.status,
                    color: a.status === 'PAID' ? 'text-green-600' : a.status === 'APPROVED' ? 'text-blue-600' : 'text-yellow-600'
                })));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitial();
    }, [selectedCompany.id]);

    const filteredAccounts = employees.filter(acc =>
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const adminCharge = amount ? parseFloat(amount) * 0.01 : 0;
    const totalDisbursement = amount ? parseFloat(amount) + adminCharge : 0;

    const getInstallmentsCount = () => {
        if (terms.includes('1 Month')) return 1;
        if (terms.includes('2 Months')) return 2;
        if (terms.includes('3 Months')) return 3;
        if (terms.includes('6 Months')) return 6;
        return 1;
    };

    const getCurrentPeriod = () => {
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[now.getMonth()]}-${now.getFullYear()}`;
    };

    const getNextPeriod = () => {
        const now = new Date();
        now.setMonth(now.getMonth() + 1);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[now.getMonth()]}-${now.getFullYear()}`;
    };

    const handleSave = async () => {
        if (!selectedEmployee || !amount) return;

        try {
            setSaveStatus('saving');
            const payload = {
                companyId: selectedCompany.id,
                employeeId: selectedEmployee.id,
                amount: parseFloat(amount),
                purpose: `Advance Payment - ${terms}`,
                status: 'PENDING',
                requestedBy: activeUser.email,
                installments: getInstallmentsCount(),
                deductionStart: getNextPeriod() // Default to next month
            };
            const response = await api.createAdvancePayment(payload);
            if (response.success) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 3000);
                fetchInitial();
            }
        } catch (err) {
            console.error(err);
            setSaveStatus(null);
        }
    };

    const handleDisburse = async () => {
        if (!selectedEmployee) return;
        if (!amount || parseFloat(amount) <= 0) {
            alert("INVALID: Please enter a disbursement amount.");
            return;
        }

        const confirm = window.confirm(`AUTHORIZE DISBURSEMENT of $${totalDisbursement.toLocaleString()} for ${selectedEmployee.name}?\n\nThis will create an approved and PAID record immediately.`);

        if (confirm) {
            try {
                setDisburseStatus('processing');
                const payload = {
                    companyId: selectedCompany.id,
                    employeeId: selectedEmployee.id,
                    amount: parseFloat(amount),
                    purpose: `Immediate Advance - ${terms}`,
                    status: 'PAID', // Direct disbursement
                    requestedBy: activeUser.email,
                    approvedBy: activeUser.email,
                    paymentDate: new Date().toISOString(),
                    installments: getInstallmentsCount(),
                    deductionStart: getNextPeriod() // Default to next month
                };
                const response = await api.createAdvancePayment(payload);
                if (response.success) {
                    setDisburseStatus('success');
                    setTimeout(() => {
                        setDisburseStatus(null);
                        setAmount('');
                        setSelectedEmployee(null);
                    }, 2000);
                    fetchInitial();
                }
            } catch (err) {
                console.error(err);
                setDisburseStatus(null);
            }
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            {/* Header */}
            <div className="bg-[#0055E5] text-white h-10 flex items-center justify-between px-4 text-[11px] font-black italic tracking-widest uppercase shadow-md border-b-2 border-white/20">
                <div className="flex items-center gap-2">
                    <DollarSign size={18} />
                    <span>Advance Payment & Loan Disbursement Module</span>
                </div>
                <div className="flex items-center gap-6">
                    {loading && <div className="text-[9px] font-bold text-blue-200 flex items-center gap-1 animate-pulse"><Loader2 size={12} className="animate-spin" /> SYNCHRONIZING WITH CORE...</div>}
                    <div className="flex items-center gap-4 border-l border-white/20 pl-4">
                        <span>Station: PAY-042</span>
                        <span className="text-blue-200">User: {activeUser.email?.split('@')[0].toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-3 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8 overflow-auto md:overflow-hidden pb-20 md:pb-6">
                {/* Left - Employee Selector */}
                <div className="w-full md:w-80 shrink-0 flex flex-col gap-6">
                    <div className="bg-white border-2 border-white border-r-gray-500 border-b-gray-500 p-4 shadow-2xl rounded-sm">
                        <div className="flex items-center gap-2 bg-gray-50 p-2.5 border-2 border-gray-200 mb-6 shadow-inner focus-within:border-blue-400 transition-colors">
                            <Search size={16} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="LOOKUP RECIPIENT..."
                                className="bg-transparent outline-none font-black placeholder:italic w-full italic uppercase tracking-tighter"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 overflow-auto max-h-[250px] md:max-h-[450px] scrollbar-thin scrollbar-thumb-gray-200 pr-1">
                            {filteredAccounts.map(acc => (
                                <button
                                    key={acc.id}
                                    onClick={() => setSelectedEmployee(acc)}
                                    className={`w-full text-left p-4 border-2 font-black italic flex items-center justify-between group transition-all rounded-sm ${selectedEmployee?.id === acc.id
                                        ? 'bg-[#0055E5] text-white border-white shadow-xl translate-x-1'
                                        : 'bg-white text-gray-700 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span className={`text-[9px] uppercase tracking-widest ${selectedEmployee?.id === acc.id ? 'text-blue-200' : 'text-gray-400'}`}>{acc.employeeId}</span>
                                        <span className="tracking-tight uppercase">{acc.name}</span>
                                    </div>
                                    <ChevronRight size={18} className={`${selectedEmployee?.id === acc.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-5 italic font-black text-center shadow-2xl uppercase tracking-[0.2em] text-[10px] border-2 border-white border-r-black border-b-black rounded-sm">
                        Corporate Funds Management System
                    </div>
                </div>

                {/* Right - Form */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-white border-2 border-white border-r-gray-500 border-b-gray-500 p-4 md:p-10 shadow-2xl flex-1 overflow-auto rounded-sm relative">
                        {!selectedEmployee ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 italic font-black uppercase tracking-[0.3em] opacity-40 select-none">
                                <User size={120} className="mb-6 animate-bounce duration-[3000ms]" strokeWidth={0.5} />
                                SELECT ELIGIBLE AGENT TO INITIALIZE DISBURSEMENT
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500 translate-none">
                                <div className="flex flex-col md:flex-row items-center gap-8 mb-10 border-b-2 border-gray-50 pb-10">
                                    <div className="w-24 h-24 bg-blue-50 border-4 border-white shadow-2xl rounded-2xl flex items-center justify-center text-blue-600 group hover:rotate-6 transition-transform">
                                        <User size={48} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h2 className="text-4xl font-black text-blue-900 italic uppercase leading-none tracking-tighter mb-2">{selectedEmployee.name}</h2>
                                        <div className="flex gap-4 justify-center md:justify-start">
                                            <span className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] border px-2 py-1 rounded">REF: {selectedEmployee.employeeId}</span>
                                            <span className="text-green-600 font-black uppercase tracking-[0.2em] text-[10px] border border-green-100 px-2 py-1 rounded bg-green-50">STATUS: ELIGIBLE</span>
                                        </div>
                                    </div>
                                    <div className="ml-auto text-center md:text-right bg-gray-50 p-6 border-2 border-white border-r-gray-100 border-b-gray-100 shadow-inner rounded-xl min-w-[200px]">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-2">Available Credit Ceiling</p>
                                        <p className="text-4xl font-black text-blue-800 italic leading-none tabular-nums tracking-tighter">${(selectedEmployee.limit - selectedEmployee.balance).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="font-black text-blue-800 uppercase italic text-[10px] tracking-widest ml-1">Proposed Disbursement Amount</label>
                                            <div className="flex items-center gap-1 bg-gray-50/50 border-2 border-gray-100 rounded-sm shadow-inner focus-within:border-blue-600 focus-within:bg-white transition-all overflow-hidden pr-4">
                                                <div className="pl-4 text-blue-400 shrink-0">
                                                    <DollarSign size={20} strokeWidth={3} />
                                                </div>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="w-full bg-transparent py-4 text-2xl font-black italic text-blue-900 outline-none"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="font-black text-gray-600 uppercase italic text-[10px] tracking-widest ml-1">Settlement Amortization (Terms)</label>
                                            <select
                                                className="w-full p-5 border-2 border-gray-100 bg-gray-50 font-black italic text-gray-700 outline-none focus:border-blue-600 focus:bg-white transition-all rounded-sm appearance-none shadow-inner cursor-pointer"
                                                value={terms}
                                                onChange={(e) => setTerms(e.target.value)}
                                            >
                                                <option>1 Month (Full Deduction)</option>
                                                <option>2 Months (Split 50/50)</option>
                                                <option>3 Months (Installments)</option>
                                                <option>6 Months (Long Term Relief)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="bg-gray-50 p-8 border-2 border-dashed border-gray-200 rounded-sm relative group overflow-hidden">
                                            <div className="absolute -top-4 -right-4 text-blue-100 opacity-20 group-hover:scale-150 transition-transform duration-1000">
                                                <DollarSign size={100} />
                                            </div>
                                            <h3 className="font-black text-gray-500 uppercase italic text-[11px] mb-6 flex items-center gap-2 relative z-10 tracking-widest border-b pb-2 border-gray-200">
                                                <CreditCard size={16} /> Transaction Calculation Detail
                                            </h3>
                                            <div className="space-y-4 relative z-10">
                                                <div className="flex justify-between items-center bg-white p-4 border border-gray-100 shadow-sm rounded">
                                                    <span className="font-black text-[10px] text-gray-400 uppercase italic">Outstanding Liability</span>
                                                    <span className="font-black text-red-600 italic text-sm tabular-nums">${selectedEmployee.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-4 border border-gray-100 shadow-sm rounded">
                                                    <span className="font-black text-[10px] text-gray-400 uppercase italic">Administrative Fee (1%)</span>
                                                    <span className="font-black text-blue-600 italic text-sm tabular-nums">${adminCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="pt-4 border-t-2 border-gray-200 flex justify-between items-center bg-blue-100/30 -mx-4 px-4 pb-2 rounded">
                                                    <span className="font-black text-blue-900 uppercase italic text-[11px] tracking-widest">Aggregate Payload</span>
                                                    <span className="text-3xl font-black text-blue-900 italic tabular-nums tracking-tighter">${totalDisbursement.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleDisburse}
                                            disabled={!selectedEmployee || disburseStatus === 'processing' || disburseStatus === 'success'}
                                            className={`w-full p-6 font-black italic uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center justify-center gap-4 rounded-sm border-2 border-white border-r-[#000040] border-b-[#000040] relative overflow-hidden group ${!selectedEmployee ? 'bg-gray-200 text-gray-400 border-none opacity-50 grayscale' :
                                                disburseStatus === 'processing' ? 'bg-[#000080] animate-pulse' :
                                                    disburseStatus === 'success' ? 'bg-green-700' : 'bg-[#000080] hover:bg-blue-800'
                                                } text-white`}
                                        >
                                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                            {disburseStatus === 'processing' ? (
                                                <><Loader2 size={24} className="animate-spin" /> DISPATCHING PAYLOAD...</>
                                            ) : disburseStatus === 'success' ? (
                                                <>✓ SETTLEMENT COMPLETE</>
                                            ) : (
                                                <>
                                                    <DollarSign size={24} className="group-hover:rotate-12 transition-transform" /> EXECUTE DISBURSEMENT
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent Transactions Log */}
                    <div className="bg-white border-2 border-white border-r-gray-500 border-b-gray-500 shadow-2xl overflow-hidden rounded-sm h-64 flex flex-col">
                        <div className="bg-[#1a1a1a] text-white p-3 text-[11px] font-black uppercase flex justify-between items-center italic tracking-widest shrink-0">
                            <span className="flex items-center gap-2"><Send size={14} className="text-blue-400" /> Secure Disbursement Activity Feed</span>
                            <div className="flex gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="opacity-50 text-[9px]">UPLINK_STABLE</span>
                                </div>
                                <span className="opacity-30 border-l border-white/20 pl-4">{loading ? 'SCANNING...' : 'BUFFER_OK'}</span>
                            </div>
                        </div>
                        <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200">
                            <table className="w-full text-left text-[10px] border-collapse relative">
                                <thead className="bg-[#F8F9FA] border-b-2 border-gray-100 sticky top-0 z-10 glass">
                                    <tr className="font-black text-gray-400 uppercase italic tracking-tighter">
                                        <th className="p-4 border-r border-gray-50">Settlement Date</th>
                                        <th className="p-4 border-r border-gray-50">Agent Name</th>
                                        <th className="p-4 text-right border-r border-gray-50">Gross Amount</th>
                                        <th className="p-4 text-center">Protocol Status</th>
                                    </tr>
                                </thead>
                                <tbody className="font-bold">
                                    {recentTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-gray-300 italic font-black uppercase tracking-[0.4em] select-none">Buffer is currently empty</td>
                                        </tr>
                                    ) : (
                                        recentTransactions.map(tx => (
                                            <tr key={tx.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors group">
                                                <td className="p-4 text-gray-400 font-mono tracking-tighter">{tx.date}</td>
                                                <td className="p-4 text-blue-900 uppercase font-black tracking-tight group-hover:underline">{tx.employee}</td>
                                                <td className="p-4 text-right font-black italic tabular-nums text-blue-800 tracking-tighter group-hover:scale-105 transition-transform origin-right">$ {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 bg-white border rounded-full font-black italic uppercase text-[8px] tracking-widest shadow-sm ${tx.color} border-current opacity-80 group-hover:opacity-100 transition-opacity`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end gap-6 no-print shrink-0 px-4">
                        <button
                            onClick={handleSave}
                            disabled={!selectedEmployee || saveStatus === 'saving'}
                            className={`flex items-center gap-3 px-10 py-4 border-2 shadow-xl font-black italic transition-all uppercase tracking-widest text-[11px] rounded-sm transform active:scale-95 ${!selectedEmployee ? 'bg-gray-100 text-gray-400 border-none grayscale opacity-50 cursor-not-allowed' :
                                saveStatus === 'saving' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    saveStatus === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-[#E0DCCF] hover:bg-white text-blue-900 border-white border-r-gray-600 border-b-gray-600'
                                }`}
                        >
                            {saveStatus === 'saving' ? (
                                <><Loader2 size={18} className="animate-spin" /> COMMITTING...</>
                            ) : saveStatus === 'success' ? (
                                <>✓ UPLOAD SUCCESS</>
                            ) : (
                                <>
                                    <Save size={18} className={!selectedEmployee ? 'text-gray-400' : 'text-blue-600'} /> STAGE TRANSACTION
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-3 px-10 py-4 bg-[#E0DCCF] border-2 border-white border-r-red-900 border-b-red-900 font-black italic hover:bg-white text-red-700 shadow-xl transition-all uppercase tracking-widest text-[11px] rounded-sm transform active:scale-95 active:border-r-0 active:border-b-0"
                        >
                            <LogOut size={18} /> Abort Module
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancePayment;
