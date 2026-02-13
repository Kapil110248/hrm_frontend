import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Printer, Filter, Download, RefreshCw, FileText, CheckCircle2, RotateCcw, LogOut, Loader2, X, AlertTriangle, AlertOctagon } from 'lucide-react';
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

const Modal = ({ isOpen, onClose, title, children, type = 'normal' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className={`bg-white w-full max-w-sm rounded shadow-2xl border-2 overflow-hidden transform transition-all scale-100 ${type === 'danger' ? 'border-red-500' : 'border-gray-200'}`}>
                <div className={`px-4 py-2 border-b flex justify-between items-center ${type === 'danger' ? 'bg-red-50 border-red-200' : 'bg-[#D4D0C8] border-gray-300'}`}>
                    <h3 className={`font-black uppercase text-xs tracking-wider ${type === 'danger' ? 'text-red-700' : 'text-gray-700'}`}>{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 bg-[#EBE9D8]">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ChequePrintHistory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBank, setFilterBank] = useState('All');
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));
    const [history, setHistory] = useState([]);
    const [toast, setToast] = useState(null);
    const [voidTarget, setVoidTarget] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchHistory = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const response = await api.fetchChequeHistory({ companyId: selectedCompany.id });
            if (response.success) {
                const mapped = (response.data.cheques || []).map(h => ({
                    id: h.id,
                    chequeNum: h.chequeNumber,
                    date: new Date(h.printDate || h.date).toLocaleDateString(),
                    payee: h.payee?.toUpperCase() || 'UNKNOWN PAYEE',
                    amount: parseFloat(h.amount),
                    bank: h.bankAccount || 'Main Account',
                    status: h.status || 'Printed',
                    type: h.type || 'Single'
                }));
                setHistory(mapped);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to fetch history.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [selectedCompany.id]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-JM', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    };

    const handleVoid = async () => {
        if (!voidTarget) return;

        try {
            setLoading(true);
            const response = await api.voidCheque(voidTarget.id, { reason: 'User Repayment Reversal', voidedBy: activeUser.email });
            if (response.success) {
                showToast(`Cheque #${voidTarget.chequeNum} VOIDED successfully.`, "success");
                fetchHistory();
                setVoidTarget(null);
            } else {
                showToast(response.message || "Failed to void cheque.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Server error during void operation.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ["Date", "Cheque #", "Payee", "Amount", "Bank", "Type", "Status"];
        const csvContent = [
            headers.join(","),
            ...filteredHistory.map(item => [
                item.date,
                item.chequeNum,
                `"${item.payee}"`,
                item.amount,
                `"${item.bank}"`,
                item.type,
                item.status
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `cheque_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("History exported to CSV.", "info");
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.chequeNum.includes(searchTerm) ||
            item.id.toString().includes(searchTerm);
        const matchesBank = filterBank === 'All' || item.bank.toLowerCase().includes(filterBank.toLowerCase());
        return matchesSearch && matchesBank;
    });

    const totalPrinted = filteredHistory.filter(h => h.status === 'Printed').reduce((sum, h) => sum + h.amount, 0);
    const totalVoided = filteredHistory.filter(h => h.status === 'Voided').reduce((sum, h) => sum + h.amount, 0);

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <Modal isOpen={!!voidTarget} onClose={() => setVoidTarget(null)} title="Security Override Required" type="danger">
                <div className="flex flex-col gap-4">
                    <div className="bg-red-50 border border-red-200 p-3 rounded text-red-900 text-xs flex items-start gap-2">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <div>
                             Are you sure you want to <strong>VOID Cheque #{voidTarget?.chequeNum}</strong>?
                             <div className="mt-1 font-normal opacity-80">This action will nullify the financial impact but remain in the audit logs.</div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <button 
                            onClick={() => setVoidTarget(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-bold uppercase text-[10px] rounded-sm hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleVoid}
                            className="px-4 py-2 bg-red-700 text-white font-bold uppercase text-[10px] rounded-sm hover:bg-red-800 transition-colors shadow-sm"
                        >
                            Confirm Void
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Header */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-4 py-2.5 flex items-center justify-between shadow-sm select-none">
                <div className="flex items-center gap-4">
                    <FileText className="text-gray-700" size={20} />
                    <div>
                        <span className="font-black text-blue-900 text-sm uppercase italic block leading-none">Global Cheque Issuance Register</span>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5">Station 042 :: Secure Audit Stream</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {loading && <div className="text-[10px] font-black text-blue-800 animate-pulse italic flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> SCANNING LEDGER...</div>}
                    <button
                        onClick={fetchHistory}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 bg-white border-2 border-white border-r-gray-400 border-b-gray-400 text-[10px] font-black hover:bg-blue-50 active:translate-y-1 active:border-b-0 active:border-r-0 transition-all text-blue-900 uppercase italic shadow-md"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'FETCHING...' : 'SYNC_CENTRAL'}
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-5 py-2 bg-[#E0DCCF] border-2 border-white border-r-gray-600 border-b-gray-600 text-[11px] font-black italic text-red-700 hover:bg-white hover:text-red-900 transition-all shadow-md active:translate-y-1 active:border-b-0 active:border-r-0 uppercase tracking-tighter"
                    >
                        <LogOut size={16} /> Close Terminal
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#EBE9D8] border-b border-gray-400 p-3 flex flex-col md:flex-row gap-4 items-center shadow-inner no-print">
                <div className="flex items-center bg-white border-2 border-white border-r-gray-400 border-b-gray-400 px-4 py-1 shadow-md group hover:border-blue-500 transition-all w-full md:w-96 h-10">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0 border-r border-gray-100 pr-4 h-4 flex items-center gap-2 italic">
                        <Search size={14} /> Global Search
                    </label>
                    <input
                        type="text"
                        placeholder="RECIPIENT PAYEE OR SERIAL #"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent outline-none flex-1 text-[11px] font-black text-blue-950 border-none focus:ring-0 p-0 pl-4 uppercase placeholder:text-gray-300 placeholder:font-normal placeholder:italic italic"
                    />
                </div>

                <div className="flex items-center bg-white border-2 border-white border-r-gray-400 border-b-gray-400 px-4 py-1 shadow-md group hover:border-blue-500 transition-all w-full md:w-72 h-10">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0 border-r border-gray-100 pr-4 h-4 flex items-center italic">
                        Bank Source
                    </label>
                    <select
                        value={filterBank}
                        onChange={(e) => setFilterBank(e.target.value)}
                        className="bg-transparent outline-none flex-1 text-[11px] font-black text-blue-900 border-none focus:ring-0 p-0 pl-4 appearance-none cursor-pointer italic"
                    >
                        <option value="All">All Active Accounts</option>
                        <option value="BNS">BNS Operating</option>
                        <option value="NCB">NCB Payroll</option>
                        <option value="JN">JN Development</option>
                    </select>
                </div>

                <div className="flex-1"></div>

                <div className="flex gap-4 w-full md:w-auto items-center">
                    <button
                        onClick={handleExportCSV}
                        className="flex-1 md:flex-none h-10 px-8 bg-[#316AC5] border-2 border-white border-r-[#000040] border-b-[#000040] text-[10px] font-black flex items-center justify-center gap-3 hover:bg-blue-600 active:translate-y-1 active:border-r-0 active:border-b-0 shadow-xl transition-all text-white uppercase italic tracking-widest"
                    >
                        <Download size={14} /> COMMIT TO CSV
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 md:flex-none h-10 px-8 bg-[#E0DCCF] border-2 border-white border-r-gray-600 border-b-gray-600 text-[10px] font-black flex items-center justify-center gap-3 hover:bg-white active:translate-y-1 active:border-r-0 active:border-b-0 shadow-md transition-all text-blue-900 uppercase italic tracking-widest"
                    >
                        <Printer size={14} /> GEN_REPORT
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="flex-1 p-3 overflow-hidden flex flex-col min-h-0">
                <div className="bg-white border-2 border-white border-r-gray-500 border-b-gray-500 shadow-2xl flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-50 rounded-sm hover:border-blue-100 transition-colors">
                    <table className="w-full text-[11px] border-collapse min-w-[1000px] relative">
                        <thead className="sticky top-0 bg-[#F0F0F0] z-20 shadow-sm border-b-2 border-gray-400 font-black italic uppercase text-gray-700">
                            <tr>
                                <th className="p-4 border-r border-gray-300 w-28 text-left">Timestamp</th>
                                <th className="p-4 border-r border-gray-300 w-28 text-center bg-gray-50 italic">Serial Num</th>
                                <th className="p-4 border-r border-gray-300 text-left">Recipient Entity (Payee)</th>
                                <th className="p-4 border-r border-gray-300 w-36 text-right">Settlement (JMD)</th>
                                <th className="p-4 border-r border-gray-300 w-36">Bank Origin</th>
                                <th className="p-4 border-r border-gray-300 w-24 text-center">Batch Ph.</th>
                                <th className="p-4 border-r border-gray-300 w-28 text-center">Audit Status</th>
                                <th className="p-4 w-20 text-center no-print bg-gray-50">Control</th>
                            </tr>
                        </thead>
                        <tbody className="font-bold text-gray-700 divide-y divide-gray-100">
                            {filteredHistory.length > 0 ? filteredHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50 transition-all group cursor-crosshair">
                                    <td className="p-3 border-r border-gray-50 font-mono text-gray-400 group-hover:text-blue-600">{item.date}</td>
                                    <td className="p-3 border-r border-gray-50 bg-gray-50/20 text-center font-black text-gray-600 group-hover:text-blue-900 italic">#{item.chequeNum}</td>
                                    <td className="p-3 border-r border-gray-50 uppercase text-blue-900 font-black tracking-tight group-hover:translate-x-1 transition-transform">{item.payee}</td>
                                    <td className={`p-3 border-r border-gray-50 text-right font-black italic tabular-nums group-hover:scale-105 transition-transform origin-right ${item.status === 'Voided' ? 'text-gray-300 line-through' : 'text-blue-800'}`}>$ {formatCurrency(item.amount)}</td>
                                    <td className="p-3 border-r border-gray-50 text-gray-400 text-[10px] uppercase font-black italic tracking-tighter truncate max-w-[120px]">{item.bank}</td>
                                    <td className="p-3 border-r border-gray-50 text-center">
                                        <span className={`px-2 py-0.5 text-[9px] rounded-full border-2 font-black italic uppercase tracking-tighter shadow-sm ${item.type === 'Batch' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="p-3 border-r border-gray-50 text-center">
                                        <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-sm border-2 font-black italic text-[9px] uppercase shadow-inner ${
                                            item.status === 'PRINTED' ? 'bg-green-50 border-green-200 text-green-700' : 
                                            item.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 
                                            item.status === 'VOID' ? 'bg-red-50 border-red-200 text-red-600 line-through' :
                                            'bg-gray-50 border-gray-200 text-gray-600'
                                        }`}>
                                            {item.status === 'PRINTED' ? <CheckCircle2 size={12} /> : item.status === 'PENDING' ? <Loader2 size={12} /> : <RotateCcw size={12} />}
                                            {item.status}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center no-print bg-gray-50/10">
                                        {item.status !== 'Voided' && (
                                            <button
                                                onClick={() => setVoidTarget(item)}
                                                title="EXECUTE VOID PROTOCOL"
                                                className="p-1 px-3 bg-white border border-red-200 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-700 rounded-sm shadow-sm active:scale-90 transition-all font-black text-[9px]"
                                            >
                                                VOID
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="p-10 text-center font-black italic text-gray-300 uppercase tracking-[0.4em] select-none animate-pulse">
                                        Scanning Secure Database Registry...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Summary */}
            <div className="bg-[#D4D0C8] border-t-2 border-white p-3 flex flex-col sm:flex-row justify-between items-center px-8 font-black text-gray-500 text-[10px] uppercase tracking-widest gap-4 shadow-2xl z-20">
                <div className="flex bg-white px-4 py-1.5 border-2 border-white border-r-gray-200 border-b-gray-200 rounded-full shadow-inner">
                    <span className="text-gray-400 italic">Showing {filteredHistory.length} of {history.length} audit items in buffer</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-8 items-center bg-gray-200/50 p-2.5 px-6 rounded-sm border border-gray-300 shadow-inner">
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] opacity-70">Cumulative Settlement Value</span>
                        <span className="text-blue-900 border-l border-gray-400 pl-3 font-black italic text-sm tabular-nums tracking-tighter">$ {totalPrinted.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center gap-3 border-l sm:border-l-2 border-gray-400 sm:pl-8">
                        <span className="text-[9px] opacity-70 text-red-400">Voided Liabilities</span>
                        <span className="text-red-700 border-l border-gray-400 pl-3 font-black italic text-sm tabular-nums tracking-tighter">$ {totalVoided.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChequePrintHistory;
