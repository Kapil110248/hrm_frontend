import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileText, Search, RotateCcw, Loader2, X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600'
    };

    return (
        <div className={`fixed bottom-4 right-4 ${bgColors[type] || 'bg-gray-800'} text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 z-50 animate-fade-in-up`}>
            {type === 'success' && <CheckCircle size={18} />}
            {type === 'error' && <AlertCircle size={18} />}
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

const PostedTransactionRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    // Filters
    const [filters, setFilters] = useState({
        period: new Date().toLocaleString('default', { month: 'short', year: 'numeric' }).replace(' ', '-'),
        department: '',
        search: ''
    });

    const [transactions, setTransactions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [periods, setPeriods] = useState([]);

    // UI States
    const [toast, setToast] = useState(null);
    const [showVoidModal, setShowVoidModal] = useState(false);
    const [selectedTrx, setSelectedTrx] = useState(null);
    const [voidReason, setVoidReason] = useState('');
    const [isVoiding, setIsVoiding] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchPosted = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const params = {
                companyId: selectedCompany.id,
                status: 'POSTED'
            };
            if (filters.period) params.period = filters.period;

            const response = await api.fetchTransactionRegister(params);
            if (response.success) {
                const mapped = (response.data.transactions || []).map(t => ({
                    id: t.id,
                    txId: t.id.substring(0, 8).toUpperCase(),
                    date: new Date(t.transactionDate).toLocaleDateString(),
                    empId: t.employee?.employeeId || 'N/A',
                    name: `${t.employee?.firstName} ${t.employee?.lastName}`.toUpperCase(),
                    type: t.code || t.type,
                    amount: parseFloat(t.amount),
                    status: t.status === 'POSTED' ? 'Posted' : 'Voided',
                    postedBy: t.postedBy || 'Admin',
                    department: t.employee?.department?.name || 'General'
                }));
                setTransactions(mapped);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to fetch register data", "error");
        } finally {
            setLoading(false);
        }
    };

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

    const generatePeriods = () => {
        const months = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
            const value = d.toLocaleString('default', { month: 'short', year: 'numeric' }).replace(' ', '-');
            months.push({ label, value });
        }
        setPeriods(months);
    };

    useEffect(() => {
        if (selectedCompany.id) {
            fetchPosted();
            fetchDepartments();
            generatePeriods();
        }
    }, [selectedCompany.id, filters.period]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-JM', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    };

    const initiateReverse = (trx) => {
        setSelectedTrx(trx);
        setVoidReason('');
        setShowVoidModal(true);
    };

    const confirmReverse = async () => {
        if (!selectedTrx) return;
        if (!voidReason.trim()) {
            showToast("Please provide a reason for reversal.", "error");
            return;
        }

        try {
            setIsVoiding(true);
            const response = await api.voidTransaction(selectedTrx.id, {
                reason: voidReason,
                voidedBy: activeUser.email
            });

            if (response.success) {
                showToast("Transaction reversed successfully.", "success");
                setShowVoidModal(false);
                fetchPosted(); // Refresh list
            } else {
                showToast(response.message || "Failed to reverse transaction.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error processing reversal.", "error");
        } finally {
            setIsVoiding(false);
        }
    };

    const handleExport = () => {
        if (filteredTransactions.length === 0) {
            showToast("No records to export.", "info");
            return;
        }
        const csvString = [
            ["TX ID", "DATE", "EMPLOYEE", "CATEGORY", "AMOUNT", "STATUS", "POSTED BY"],
            ...filteredTransactions.map(r => [r.txId, r.date, r.name, r.type, r.amount, r.status, r.postedBy])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Posted_Register_${filters.period}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("CSV Export generated successfully.", "success");
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesDept = !filters.department || t.department.toLowerCase().includes(filters.department.toLowerCase());
        const matchesSearch = t.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            t.empId.toLowerCase().includes(filters.search.toLowerCase()) ||
            t.id.toLowerCase().includes(filters.search.toLowerCase());
        return matchesDept && matchesSearch;
    });

    const totalAmount = filteredTransactions.reduce((sum, t) => t.status === 'Posted' ? sum + t.amount : sum, 0);

    return (
        <div className="h-[calc(100vh-70px)] flex flex-col bg-[#EBE9D8] font-sans overflow-hidden relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <Modal isOpen={showVoidModal} onClose={() => setShowVoidModal(false)} title="Confirm Reversal">
                <div className="flex flex-col gap-4">
                    <div className="bg-red-50 border border-red-200 p-3 rounded text-red-800 text-xs flex items-start gap-2">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <div>
                            Most transactions cannot be un-posted. This action will <strong>VOID</strong> the transaction and set the amount to $0.00.
                        </div>
                    </div>

                    <div className="text-xs">
                        <label className="block font-bold text-gray-700 mb-1 uppercase">Reason for Reversal</label>
                        <textarea
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                            className="w-full border border-gray-400 p-2 text-xs font-medium outline-none focus:border-blue-500 h-20 resize-none rounded-sm"
                            placeholder="e.g. Data Entry Error, Duplicate Record..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={() => setShowVoidModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-bold uppercase text-[10px] rounded-sm hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmReverse}
                            disabled={isVoiding}
                            className="px-4 py-2 bg-red-600 text-white font-bold uppercase text-[10px] rounded-sm hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                        >
                            {isVoiding ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                            {isVoiding ? 'Voiding...' : 'Confirm Void'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* 1. Header & Filters */}
            <div className="bg-[#EBE9D8] border-b border-white p-3 shadow-sm shrink-0">
                <div className="flex items-center justify-between mb-3 border-b border-gray-400 pb-2">
                    <h1 className="text-[#0B4FD7] font-black text-lg uppercase tracking-wider flex items-center gap-2 italic">
                        <FileText size={18} /> Posted Transaction Register
                    </h1>
                    <div className="flex items-center gap-4">
                        {loading && <div className="text-[10px] font-bold text-blue-700 animate-pulse flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> SYNCHRONIZING...</div>}
                        <div className="text-xs font-black text-gray-500 uppercase">
                            NET VALUE: <span className="text-blue-900 text-sm bg-white px-3 py-1 border border-gray-300 rounded shadow-inner ml-2">${formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[10px] font-black italic uppercase items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-gray-700">Filter Pay Period</label>
                        <select
                            value={filters.period}
                            onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                            className="border-2 border-white border-r-gray-400 border-b-gray-400 h-9 px-2 bg-white shadow-inner font-black text-blue-900 outline-none focus:border-blue-500"
                        >
                            {periods.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-gray-700">Department</label>
                        <select
                            value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                            className="border-2 border-white border-r-gray-400 border-b-gray-400 h-9 px-2 bg-white shadow-inner font-black text-blue-900 outline-none focus:border-blue-500"
                        >
                            <option value="">-- All Departments --</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-gray-700">Search Records</label>
                        <div className="flex items-center border-2 border-white border-r-gray-400 border-b-gray-400 bg-white h-9 px-3 focus-within:border-blue-500 shadow-inner">
                            <Search size={14} className="text-gray-400 mr-2 shrink-0 pointer-events-none" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="NAME, ID OR TRX#..."
                                className="w-full h-full outline-none font-black text-blue-900 uppercase placeholder:normal-case placeholder:italic placeholder:font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={fetchPosted}
                            disabled={loading}
                            className={`w-full h-9 border-2 border-white border-r-gray-600 border-b-gray-600 shadow-md px-4 active:translate-y-0.5 active:shadow-inner text-[10px] font-black transition-all flex items-center justify-center gap-2 tracking-widest ${loading ? 'bg-gray-100 text-gray-400' : 'bg-[#E0DCCF] hover:bg-white text-blue-800 uppercase'}`}
                        >
                            <Loader2 size={12} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'BUSY...' : 'REFRESH DATA'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Data Grid */}
            <div className="flex-1 p-3 overflow-hidden flex flex-col min-h-0">
                <div className="bg-white border-2 border-white border-r-gray-500 border-b-gray-500 shadow-2xl flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-sm">
                    <table className="w-full text-[11px] border-collapse relative">
                        <thead className="sticky top-0 bg-[#D4D0C8] z-10 shadow-sm border-b-2 border-gray-400 font-black italic uppercase text-gray-700">
                            <tr>
                                <th className="border-r border-gray-400 px-2 py-3 w-24 text-left">Trx ID</th>
                                <th className="border-r border-gray-400 px-2 py-3 w-24 text-left">Date</th>
                                <th className="border-r border-gray-400 px-2 py-3 w-24 text-left">Emp ID</th>
                                <th className="border-r border-gray-400 px-2 py-3 text-left">Employee Name</th>
                                <th className="border-r border-gray-400 px-2 py-3 text-left w-40">Transaction Code</th>
                                <th className="border-r border-gray-400 px-2 py-3 text-right w-32">Amount</th>
                                <th className="border-r border-gray-400 px-2 py-3 text-left w-24">Posted By</th>
                                <th className="border-r border-gray-400 px-2 py-3 w-24 text-center">Status</th>
                                <th className="px-2 py-3 w-10 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((trx) => (
                                    <tr key={trx.id} className={`hover:bg-blue-50 group transition-colors ${trx.status === 'Reversed' ? 'opacity-60 bg-gray-50' : ''}`}>
                                        <td className="border-r border-gray-200 px-2 py-2 font-black text-gray-400 group-hover:text-blue-600 transition-colors uppercase tabular-nums">#{trx.txId}</td>
                                        <td className="border-r border-gray-200 px-2 py-2 font-mono text-gray-500 italic">{trx.date}</td>
                                        <td className="border-r border-gray-200 px-2 py-2 font-black text-gray-700 uppercase">{trx.empId}</td>
                                        <td className="border-r border-gray-200 px-2 py-2 font-black text-blue-900 italic tracking-tight uppercase group-hover:underline">{trx.name}</td>
                                        <td className="border-r border-gray-200 px-2 py-2">
                                            <span className="text-[10px] bg-gray-50 border border-gray-300 px-2 py-0.5 rounded italic font-black text-gray-600 uppercase">
                                                {trx.type}
                                            </span>
                                        </td>
                                        <td className={`border-r border-gray-200 px-2 py-2 text-right font-black italic tabular-nums group-hover:scale-105 transition-transform origin-right ${trx.status === 'Reversed' ? 'text-gray-400 line-through' : 'text-blue-800'}`}>
                                            ${formatCurrency(trx.amount)}
                                        </td>
                                        <td className="border-r border-gray-200 px-2 py-2 text-gray-500 italic font-bold text-[10px] uppercase truncate max-w-[80px]">{trx.postedBy}</td>
                                        <td className={`border-r border-gray-200 px-2 py-2 text-center`}>
                                            <span className={`px-2 py-0.5 rounded-full font-black italic uppercase text-[9px] border shadow-sm ${trx.status === 'Posted' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-500 border-red-200'}`}>
                                                {trx.status}
                                            </span>
                                        </td>
                                        <td className="px-1 py-2 text-center">
                                            {trx.status === 'Posted' && (
                                                <button
                                                    onClick={() => initiateReverse(trx)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-all active:scale-90"
                                                    title="Reverse Transaction"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-20 text-gray-300 font-black italic uppercase tracking-[0.2em] bg-gray-50/50">
                                        {loading ? 'Accessing Secure Register...' : 'No Posted Records Found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. Footer Actions */}
            <div className="bg-[#EBE9D8] border-t-2 border-white p-3 flex justify-between items-center shadow-2xl shrink-0 z-20">
                <div className="text-[10px] font-black italic text-gray-500 uppercase tracking-widest">
                    SYSTEM STATUS: OK | {filteredTransactions.length} RECORDS IN BUFFER
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-8 py-3 bg-[#316AC5] text-white border-2 border-white border-r-[#000080] border-b-[#000080] border-l-white border-t-white shadow-xl active:translate-y-1 active:shadow-inner active:border-b-0 active:border-r-0 text-[11px] font-black italic hover:bg-blue-600 transition-all uppercase tracking-widest"
                >
                    <Download size={14} /> Commit to CSV
                </button>
            </div>
        </div>
    );
};

export default PostedTransactionRegister;
