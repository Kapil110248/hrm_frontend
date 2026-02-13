import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, FileText, Save, LogOut, ArrowLeft, User, DollarSign, Calendar, Tag, CheckCircle2, AlertOctagon, X, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
        warning: 'bg-orange-500'
    };

    return (
        <div className={`fixed bottom-4 right-4 ${bgColors[type] || 'bg-gray-800'} text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 z-50 animate-fade-in-up`}>
            {type === 'success' && <CheckCircle2 size={18} />}
            {type === 'error' && <AlertOctagon size={18} />}
            <span className="font-bold text-xs uppercase tracking-wide">{message}</span>
            <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-full p-1"><X size={14} /></button>
        </div>
    );
};

const SingleChequePrinting = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));
    const [toast, setToast] = useState(null);

    const [chequeData, setChequeData] = useState({
        payee: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        memo: '',
        chequeNumber: '104013',
        bank: 'BNS - MAIN OPERATING'
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const formatCurrency = (val) => {
        if (!val) return '0.00';
        return new Intl.NumberFormat('en-JM', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    };

    const handleSave = async (print = false) => {
        if (!chequeData.payee || !chequeData.amount) {
            showToast("Please provide Payee and Amount.", "warning");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                companyId: selectedCompany.id,
                chequeNumber: chequeData.chequeNumber,
                payee: chequeData.payee,
                amount: parseFloat(chequeData.amount),
                date: chequeData.date,
                memo: chequeData.memo,
                bankAccount: chequeData.bank,
                status: print ? 'Printed' : 'Draft',
                createdBy: activeUser.email
            };

            const response = await api.createCheque(payload);

            if (response.success) {
                showToast(print ? "Cheque logged and sent to printer." : "Cheque saved to register.", "success");
                if (print) {
                    setTimeout(() => {
                        window.print();
                    }, 500);
                } else {
                     // Maybe clear form or stay? 
                }
            } else {
                showToast(response.message || "Failed to save cheque.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Server error occurred.", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-4 py-2 flex items-center justify-between shadow-sm no-print">
                <div className="flex items-center gap-2">
                    <Printer className="text-gray-700" size={18} />
                    <span className="font-bold text-gray-700 text-sm uppercase italic">Single Cheque Facility</span>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 border border-gray-400 text-[10px] font-bold hover:bg-white active:translate-y-0.5 transition-all text-gray-600 uppercase"
                >
                    <ArrowLeft size={14} /> Back
                </button>
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-auto flex flex-col items-center">
                <div className="w-full max-w-5xl flex flex-col gap-8">

                    {/* Top: Cheque Visual Preview */}
                    <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 p-8 flex items-center justify-center relative shadow-inner rounded-md overflow-hidden min-h-[220px]">
                        <div className="absolute top-2 left-4 text-[9px] font-black text-yellow-600/50 uppercase tracking-widest">Live Security Preview</div>

                        <div className="w-full max-w-2xl bg-white border border-gray-300 p-8 shadow-xl flex flex-col gap-6 font-serif relative overflow-hidden group">
                            {/* Security Watermark Mockup */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent pointer-events-none"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex flex-col uppercase">
                                    <span className="text-[11px] font-black tracking-tight">{selectedCompany.name || 'Island HR Solutions Limited'}</span>
                                    <span className="text-[8px] font-bold text-gray-400">Kingston, Jamaica</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[12px] font-black text-gray-800">NO. {chequeData.chequeNumber}</span>
                                    <span className="text-[10px] font-bold text-gray-500 border-b border-gray-300 min-w-[120px] text-right mt-1">{chequeData.date}</span>
                                </div>
                            </div>

                            <div className="flex items-end gap-3 relative z-10 mt-2">
                                <span className="text-[10px] font-bold italic text-gray-400 shrink-0">PAY TO THE ORDER OF:</span>
                                <div className="flex-1 border-b-2 border-blue-900/20 pb-1 px-4">
                                    <span className="text-lg font-black text-blue-900 uppercase tracking-widest whitespace-nowrap min-h-[28px] inline-block">
                                        {chequeData.payee || "........................................................"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 border-2 border-black p-1 px-3 bg-[#F8F9FA] shadow-sm shrink-0">
                                    <span className="text-[10px] font-black">$</span>
                                    <span className="text-sm font-black text-gray-900 min-w-[80px] text-right">
                                        {formatCurrency(chequeData.amount)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-end relative z-10">
                                <span className="text-[10px] font-bold italic text-gray-400 shrink-0 pr-4">MEMO:</span>
                                <div className="flex-1 border-b border-gray-200 text-[11px] font-bold text-gray-600 italic px-2 pb-1">
                                    {chequeData.memo || "Payroll Disbursement"}
                                </div>
                                <div className="w-48 ml-8 border-b-2 border-gray-300 pb-1 text-center">
                                    <span className="text-[8px] font-bold text-gray-400 uppercase">AUTHORIZED SIGNATURE</span>
                                </div>
                            </div>

                            <div className="text-[16px] font-black tracking-[0.3em] font-mono text-gray-400 mt-6 flex justify-center gap-4 relative z-10">
                                <span>⑆000{chequeData.chequeNumber}⑆</span>
                                <span>⑈0090029⑈</span>
                                <span>⑉003495832⑉</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Entry Form */}
                    <div className="bg-white border border-gray-400 p-6 shadow-md grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
                        <div className="flex flex-col gap-6">
                            <h3 className="text-xs font-black text-gray-700 uppercase border-b border-gray-100 pb-2 flex items-center gap-2">
                                <User size={14} className="text-blue-600" /> Payee Information
                            </h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Payee Name</label>
                                    <input
                                        type="text"
                                        placeholder="Full Name or Entity..."
                                        value={chequeData.payee}
                                        onChange={(e) => setChequeData({ ...chequeData, payee: e.target.value.toUpperCase() })}
                                        className="p-2 border border-gray-300 bg-gray-50 text-xs font-black text-blue-900 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Cheque Amount (JMD)</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <DollarSign size={14} />
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={chequeData.amount}
                                            onChange={(e) => setChequeData({ ...chequeData, amount: e.target.value })}
                                            className="w-full p-2 pl-8 border border-gray-300 bg-gray-50 text-xs font-black text-blue-900 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <h3 className="text-xs font-black text-gray-700 uppercase border-b border-gray-100 pb-2 flex items-center gap-2">
                                <Calendar size={14} className="text-blue-600" /> Transaction Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Issue Date</label>
                                    <input
                                        type="date"
                                        value={chequeData.date}
                                        onChange={(e) => setChequeData({ ...chequeData, date: e.target.value })}
                                        className="p-2 border border-gray-300 bg-gray-50 text-[11px] font-bold outline-none focus:border-blue-500 cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Cheque Number</label>
                                    <input
                                        type="text"
                                        value={chequeData.chequeNumber}
                                        onChange={(e) => setChequeData({ ...chequeData, chequeNumber: e.target.value })}
                                        className="p-2 border border-gray-300 bg-gray-50 text-[11px] font-bold outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter flex items-center gap-1">
                                    <Tag size={10} /> Memo / Reference
                                </label>
                                <textarea
                                    rows="1"
                                    placeholder="Enter memo tag..."
                                    value={chequeData.memo}
                                    onChange={(e) => setChequeData({ ...chequeData, memo: e.target.value })}
                                    className="p-2 border border-gray-300 bg-gray-50 text-xs font-bold outline-none focus:border-blue-500 focus:bg-white transition-colors flex-1 resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="bg-[#D4D0C8] border-t border-gray-400 p-2 flex flex-col sm:flex-row justify-end gap-3 no-print px-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-6 py-1 bg-white border-2 border-gray-400 text-[11px] font-black text-gray-800 hover:bg-gray-50 transition-all shadow-sm active:translate-y-0.5 group"
                >
                    <LogOut size={14} className="text-gray-600 group-hover:text-red-600" />
                    <span>Close</span>
                </button>
                <button
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    className="px-6 py-2.5 flex items-center justify-center gap-2 text-[10px] font-black text-blue-800 bg-white border-2 border-white border-b-gray-600 border-r-gray-600 hover:bg-blue-50 active:translate-y-0.5 transition-all w-full sm:w-auto uppercase italic"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                     Record Without Printing
                </button>
                <button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="px-10 py-2.5 bg-blue-700 text-white border-2 border-blue-500 border-b-blue-900 border-r-blue-900 flex items-center justify-center gap-2 text-[10px] font-black w-full sm:w-auto uppercase italic hover:bg-blue-800 active:translate-y-0.5 transition-all shadow-lg"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                     Finalize & Print Cheque
                </button>
            </div>
        </div>
    );
};

export default SingleChequePrinting;
