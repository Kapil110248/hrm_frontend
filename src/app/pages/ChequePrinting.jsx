import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, FileText, CheckCircle2, Save, LogOut, Search, Loader2, X, AlertTriangle, AlertOctagon } from 'lucide-react';
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
            {type === 'warning' && <AlertTriangle size={18} />}
            <span className="font-bold text-xs uppercase tracking-wide">{message}</span>
            <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-full p-1"><X size={14} /></button>
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded shadow-2xl border border-gray-200 overflow-hidden transform transition-all scale-100">
                <div className="bg-[#D4D0C8] px-4 py-2 border-b border-gray-300 flex justify-between items-center">
                    <h3 className="font-black text-gray-700 uppercase text-xs tracking-wider">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 bg-[#EBE9D8]">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ChequePrinting = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [printing, setPrinting] = useState(false);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));
    const [period, setPeriod] = useState(() => {
        const d = new Date();
        return d.toLocaleString('default', { month: 'short' }) + '-' + d.getFullYear();
    });
    const [queue, setQueue] = useState([]);
    const [settings, setSettings] = useState({
        bankAccount: 'BNS - MAIN OPERATING (****8932)',
        startingCheque: '104012',
        template: 'Standard 3-per-page (Voucher)'
    });

    const [toast, setToast] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchQueue = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const response = await api.fetchPayrolls({
                companyId: selectedCompany.id,
                period: period
            });

            if (response.success) {
                const mapped = (response.data || []).map(p => ({
                    id: p.id,
                    name: `${p.employee?.firstName} ${p.employee?.lastName}`.toUpperCase(),
                    trn: p.employee?.trn || '000-000-000',
                    amount: parseFloat(p.netSalary || 0),
                    payee: `${p.employee?.firstName} ${p.employee?.lastName}`,
                    bankAccount: settings.bankAccount
                })).filter(item => item.amount > 0);

                setQueue(mapped);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to fetch print queue.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCompany?.id) {
            fetchQueue();
        }
    }, [selectedCompany.id, period]);

    const handlePrint = async () => {
        setShowPrintModal(false);
        if (queue.length === 0) return;

        try {
            setPrinting(true);
            const printData = {
                companyId: selectedCompany.id,
                period: period,
                cheques: queue.map((item, idx) => ({
                    payrollId: item.id,
                    employeeId: item.id,
                    chequeNumber: (parseInt(settings.startingCheque) + idx).toString(),
                    amount: item.amount,
                    payee: item.payee,
                    date: new Date().toISOString().split('T')[0],
                    bankAccount: settings.bankAccount
                })),
                printedBy: activeUser.email
            };

            const response = await api.printCheques(printData);
            if (response.success) {
                showToast(`${response.data.count || queue.length} cheques processed successfully.`, "success");
                setTimeout(() => {
                    window.print();
                    setPrinting(false);
                }, 1000);
            } else {
                showToast(response.message || "Print process aborted.", "error");
                setPrinting(false);
            }
        } catch (err) {
            console.error(err);
            showToast("Communication error with print server.", "error");
            setPrinting(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-JM', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    };

    const firstItem = queue[0] || { payee: 'PAYEE NAME', amount: 0 };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <Modal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} title="Confirm Batch Print">
                <div className="flex flex-col gap-4">
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded text-blue-900 text-xs flex items-start gap-2">
                        <Printer size={16} className="shrink-0 mt-0.5" />
                        <div>
                            You are about to generate and log <strong>{queue.length} cheques</strong> starting from sequence <strong>#{settings.startingCheque}</strong>.
                        </div>
                    </div>
                    <p className="text-gray-600 italic text-[10px]">Ensure the correct stationery is loaded in the active device.</p>
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={() => setShowPrintModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-bold uppercase text-[10px] rounded-sm hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-blue-800 text-white font-bold uppercase text-[10px] rounded-sm hover:bg-blue-900 transition-colors shadow-sm"
                        >
                            Execute Print
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Header */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-4 py-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <Printer className="text-gray-700" size={18} />
                    <span className="font-bold text-gray-700 text-sm uppercase italic underline decoration-blue-500/30 underline-offset-4">Cheque Printing Facility</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Period:</span>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="text-xs font-bold p-1 border border-gray-400 outline-none uppercase bg-white cursor-pointer"
                        >
                            {[...Array(36)].map((_, i) => {
                                const d = new Date();
                                d.setMonth(d.getMonth() - 12 + i); // From 12 months ago to 24 months ahead
                                const month = d.toLocaleString('default', { month: 'short' });
                                const year = d.getFullYear();
                                const val = `${month}-${year}`;
                                return <option key={val} value={val}>{val}</option>;
                            })}
                        </select>
                    </div>
                    {loading && <div className="text-[10px] font-black text-blue-700 italic animate-pulse flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> SCANNING QUEUE...</div>}
                    <div className="text-[9px] font-black text-gray-500 bg-white/50 px-2 py-0.5 border border-gray-300 rounded uppercase">STATION 042 :: ACTIVE</div>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left: Cheque Config */}
                    <div className="md:col-span-1 bg-white border-2 border-white border-r-gray-400 border-b-gray-400 p-6 flex flex-col gap-5 shadow-xl rounded-sm">
                        <h3 className="text-xs font-black text-blue-900 italic border-b-2 border-blue-100 pb-2 uppercase tracking-widest">Global Print Settings</h3>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black text-gray-500 uppercase italic">Bank Source Account</label>
                                <select
                                    className="p-2 border-2 border-gray-200 bg-gray-50 text-[11px] font-black text-blue-900 outline-none focus:border-blue-500 shadow-inner"
                                    value={settings.bankAccount}
                                    onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
                                >
                                    <option>{activeUser.bankName || 'BNS'} - {activeUser.bankAccount || 'MAIN OPERATING'}</option>
                                    <option>NCB - PAYROLL PRIMARY (****1102)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black text-gray-500 uppercase italic">Reference Range (Start)</label>
                                <input
                                    type="text"
                                    value={settings.startingCheque}
                                    onChange={(e) => setSettings({ ...settings, startingCheque: e.target.value })}
                                    className="p-2 border-2 border-gray-200 bg-white text-[11px] font-black text-gray-800 outline-none focus:border-blue-500 uppercase shadow-inner"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black text-gray-500 uppercase italic">Mechanical Template</label>
                                <select
                                    className="p-2 border-2 border-gray-200 bg-gray-50 text-[11px] font-black text-blue-900 outline-none focus:border-blue-500 shadow-inner"
                                    value={settings.template}
                                    onChange={(e) => setSettings({ ...settings, template: e.target.value })}
                                >
                                    <option>Standard 3-per-page (Voucher)</option>
                                    <option>Single Cheque (Personal)</option>
                                    <option>Continuous Form Dot-Matrix</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-100 italic text-[9px] text-gray-400 font-black uppercase tracking-tighter">
                            Active Device: HP LaserJet Pro :: NETWORK_LINK_UP
                        </div>
                    </div>

                    {/* Right: Preview & Queue */}
                    <div className="md:col-span-2 flex flex-col gap-6">
                        {/* Visual Preview */}
                        <div className="bg-yellow-50 border-4 border-dashed border-yellow-200 p-4 md:p-8 flex items-center justify-center relative min-h-[180px] overflow-x-auto shadow-inner rounded hover:border-yellow-300 transition-colors">
                            <div className="absolute top-2 left-4 text-[9px] font-black italic text-yellow-600 uppercase tracking-widest animate-pulse">RENDER PREVIEW (1:1 SCALE)</div>
                            <div className="w-full min-w-[340px] max-w-lg bg-white border border-gray-300 p-8 shadow-2xl flex flex-col gap-6 font-serif relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-50/10 pointer-events-none group-hover:bg-blue-50/20 transition-colors"></div>
                                <div className="flex justify-between relative z-10">
                                    <span className="text-[11px] font-black uppercase text-gray-800 tracking-tighter">{selectedCompany.name || 'ISLAND HR SOLUTIONS LIMITED'}</span>
                                    <span className="text-[11px] font-black text-blue-900">REF NO. {settings.startingCheque}</span>
                                </div>
                                <div className="flex justify-between items-end border-b-2 border-black/5 pb-2 relative z-10 mt-2">
                                    <span className="text-[9px] italic font-bold text-gray-400 shrink-0 uppercase">Pay to:</span>
                                    <span className="text-sm font-black border-b-2 border-blue-900/10 flex-1 mx-4 text-center uppercase tracking-[0.15em] text-blue-900 mb-1">{firstItem.payee}</span>
                                    <span className="text-sm font-black border-4 border-gray-800 p-3 bg-gray-50 tabular-nums shadow-md">$ {formatCurrency(firstItem.amount)}</span>
                                </div>
                                <div className="text-[18px] font-black italic tracking-[0.3em] mt-6 font-mono text-gray-400/80 relative z-10 text-center select-none">
                                    ⑆000{settings.startingCheque}⑆ ⑈0090029⑈ ⑉003495832⑉
                                </div>
                            </div>
                        </div>

                        {/* Print Queue */}
                        <div className="bg-white border-2 border-white border-r-gray-400 border-b-gray-400 flex flex-col flex-1 shadow-2xl overflow-hidden rounded-sm hover:border-blue-100 transition-colors">
                            <div className="bg-[#316AC5] text-white p-3 text-[11px] font-black uppercase flex justify-between items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] italic tracking-widest">
                                <span className="flex items-center gap-2"><FileText size={14} /> Commit Queue Statistics</span>
                                <div className="flex items-center gap-4">
                                    <span className="bg-white/20 px-3 rounded">{queue.length} BATCH ITEMS</span>
                                    <Search size={16} className="cursor-pointer hover:rotate-12 transition-transform opacity-60" />
                                </div>
                            </div>
                            <div className="flex-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-50">
                                <table className="w-full text-[11px] border-collapse relative">
                                    <thead className="bg-[#F8F9FA] sticky top-0 border-b-2 border-gray-200 z-10 shadow-sm text-gray-500 font-black uppercase">
                                        <tr>
                                            <th className="p-3 border-r border-gray-100 text-left">Recipient (Payee)</th>
                                            <th className="p-3 border-r border-gray-100 text-left">ID Ref</th>
                                            <th className="p-3 text-right">Commit Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {queue.length > 0 ? queue.map((item, i) => (
                                            <tr key={item.id} className="font-bold hover:bg-blue-50 transition-all cursor-crosshair group">
                                                <td className="p-3 border-r border-gray-100 text-blue-900 uppercase group-hover:translate-x-1 transition-transform italic tracking-tight">{item.name}</td>
                                                <td className="p-3 border-r border-gray-100 font-mono text-gray-400 group-hover:text-gray-600 transition-colors tabular-nums">{item.trn}</td>
                                                <td className="p-3 text-right text-blue-600 font-black tabular-nums italic">$ {formatCurrency(item.amount)}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="p-10 text-center font-black italic text-gray-300 uppercase tracking-widest">
                                                    {loading ? 'Fetching Payroll Data...' : 'No Payroll Records Found for Period'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="bg-[#D4D0C8] border-t-2 border-white p-3 flex flex-col sm:flex-row justify-end gap-4 no-print px-8 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-20">
                <button
                    onClick={() => navigate(-1)}
                    disabled={printing}
                    className="px-8 py-3 flex items-center justify-center gap-2 text-[11px] font-black text-gray-600 bg-[#E0DCCF] border-2 border-white border-b-gray-600 border-r-gray-600 hover:bg-white hover:text-red-700 active:translate-y-1 active:border-b-0 active:border-r-0 transition-all w-full sm:w-auto uppercase italic shadow-md"
                >
                    <LogOut size={18} /> Exit Facility
                </button>
                <button
                    onClick={() => {
                        if (queue.length === 0) showToast("Queue is empty. No items to print.", "warning");
                        else setShowPrintModal(true);
                    }}
                    disabled={printing || queue.length === 0}
                    className={`px-12 py-3 border-2 flex items-center justify-center gap-3 text-[11px] font-black w-full sm:w-auto uppercase italic transition-all shadow-xl tracking-widest ${printing || queue.length === 0 ? 'bg-gray-300 text-gray-500 border-gray-400' : 'bg-[#000080] text-white border-white border-b-black border-r-black hover:bg-blue-800 active:translate-y-1 active:shadow-inner active:border-b-0 active:border-r-0'}`}
                >
                    {printing ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                    {printing ? 'PROCESS IN PROGRESS...' : 'EXECUTE PRINT COMMAND'}
                </button>
            </div>
        </div>
    );
};

export default ChequePrinting;
