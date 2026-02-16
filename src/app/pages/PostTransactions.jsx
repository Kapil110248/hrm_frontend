import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, RefreshCw, CheckSquare, Square, Filter, Send, AlertTriangle, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
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

const PostTransactions = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    const [filters, setFilters] = useState({
        period: new Date().toLocaleString('default', { month: 'short', year: 'numeric' }).replace(' ', '-').toUpperCase(),
        type: 'All'
    });

    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    // UI States
    const [toast, setToast] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchPending = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const params = {
                companyId: selectedCompany.id,
                status: 'ENTERED'
            };
            if (filters.type !== 'All') params.type = filters.type;
            if (filters.period) params.period = filters.period;

            const response = await api.fetchTransactions(params);
            if (response.success) {
                const mapped = (response.data || []).map(t => ({
                    id: t.id,
                    empId: t.employee?.employeeId || 'N/A',
                    name: `${t.employee?.firstName} ${t.employee?.lastName}`.toUpperCase(),
                    type: t.type,
                    amount: parseFloat(t.amount),
                    date: new Date(t.transactionDate).toLocaleDateString(),
                    status: t.status,
                    code: t.code
                }));
                setPendingTransactions(mapped);
                setSelectedIds([]);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to fetch pending transactions.", "error");
        } finally {
            setLoading(false);
        }
    };

    const generatePeriods = () => {
        const months = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
            const value = d.toLocaleString('default', { month: 'short', year: 'numeric' }).replace(' ', '-').toUpperCase();
            months.push({ label, value });
        }
        setPeriods(months);
    };

    useEffect(() => {
        if (selectedCompany.id) {
            generatePeriods();
            fetchPending();
        }
    }, [selectedCompany.id, filters.type, filters.period]);

    const handleSelectAll = () => {
        if (selectedIds.length === pendingTransactions.length && pendingTransactions.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingTransactions.map(t => t.id));
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const initiatePost = () => {
        if (selectedIds.length === 0) {
            showToast("No transactions selected.", "error");
            return;
        }
        setShowConfirmModal(true);
    };

    const confirmPost = async () => {
        setShowConfirmModal(false);
        try {
            setPosting(true);
            const response = await api.postTransactions({
                transactionIds: selectedIds,
                postedBy: activeUser.email,
                companyId: selectedCompany.id
            });

            if (response.success) {
                showToast(`Successfully posted ${response.data.count} transactions!`, "success");
                fetchPending();
            } else {
                showToast(response.message || "Failed to post transactions.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error during posting process.", "error");
        } finally {
            setPosting(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-JM', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    };

    const totalSelected = pendingTransactions
        .filter(t => selectedIds.includes(t.id))
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="h-[calc(100vh-70px)] flex flex-col bg-[#EBE9D8] font-sans overflow-hidden relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Posting">
                <div className="flex flex-col gap-4">
                    <div className="text-xs text-gray-700 font-medium">
                        You are about to post <span className="font-black text-blue-700">{selectedIds.length}</span> transactions.
                        <br /><br />
                        Total Value: <span className="font-black text-blue-700">${formatCurrency(totalSelected)}</span>
                        <br /><br />
                        <span className="text-red-600 font-bold uppercase italic text-[10px]">
                            Warning: This action cannot be undone. Items will be locked.
                        </span>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-bold uppercase text-[10px] rounded-sm hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmPost}
                            className="px-4 py-2 bg-blue-600 text-white font-bold uppercase text-[10px] rounded-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Send size={12} /> Confirm Post
                        </button>
                    </div>
                </div>
            </Modal>

            {/* 1. Header & Filters */}
            <div className="bg-[#EBE9D8] border-b border-white p-3 shadow-sm shrink-0">
                <div className="flex items-center justify-between mb-3 border-b border-gray-400 pb-2">
                    <h1 className="text-[#0B4FD7] font-black text-lg uppercase tracking-wider flex items-center gap-2 italic">
                        <Send size={18} /> Post Pending Transactions
                    </h1>
                    <div className="flex items-center gap-4">
                        {loading && <div className="text-[10px] font-bold text-blue-700 animate-pulse flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> SCANNING PENDING...</div>}
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                            SELECT PENDING ENTRIES TO COMMIT
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] font-black italic uppercase">
                    <div className="flex flex-col gap-1">
                        <label className="text-gray-700">Pay Period</label>
                        <select
                            value={filters.period}
                            onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                            className="border-2 border-white border-r-gray-400 border-b-gray-400 p-1.5 bg-white shadow-inner outline-none focus:border-blue-500 font-black text-blue-900"
                        >
                            {periods.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-gray-700">Type Filter</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="border-2 border-white border-r-gray-400 border-b-gray-400 p-1.5 bg-white shadow-inner outline-none focus:border-blue-500 font-black text-blue-900"
                        >
                            <option value="All">All Transactions</option>
                            <option value="EARNING">Earning</option>
                            <option value="DEDUCTION">Deduction</option>
                            <option value="ALLOWANCE">Allowance</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <div className="bg-yellow-100 border-2 border-white border-r-yellow-600 border-b-yellow-600 p-2 text-yellow-800 flex items-center gap-2 w-full shadow-sm">
                            <AlertTriangle size={14} className="shrink-0" />
                            <span className="font-black italic">POSTED ITEMS CANNOT BE REVERTED. VERIFY TOTALS BEFORE PROCEEDING.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Data Grid */}
            <div className="flex-1 p-3 overflow-hidden flex flex-col min-h-0">
                <div className="bg-white border-2 border-white border-r-gray-500 border-b-gray-500 shadow-2xl flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-sm">
                    <table className="w-full text-[11px] border-collapse relative">
                        <thead className="sticky top-0 bg-[#D4D0C8] z-10 shadow-sm border-b-2 border-gray-400 font-black italic uppercase text-gray-700">
                            <tr>
                                <th className="border-r border-gray-400 px-2 py-3 w-10 text-center cursor-pointer hover:bg-white transition-colors" onClick={handleSelectAll}>
                                    {selectedIds.length === pendingTransactions.length && pendingTransactions.length > 0 ? <CheckSquare size={14} className="mx-auto text-blue-700" /> : <Square size={14} className="mx-auto text-gray-500" />}
                                </th>
                                <th className="border-r border-gray-400 px-2 py-2 w-24 text-left">Date</th>
                                <th className="border-r border-gray-400 px-2 py-2 w-24 text-left">Emp ID</th>
                                <th className="border-r border-gray-400 px-2 py-2 text-left">Employee Name</th>
                                <th className="border-r border-gray-400 px-2 py-2 text-left w-32">Type</th>
                                <th className="border-r border-gray-400 px-2 py-2 w-32 text-right">Amount</th>
                                <th className="px-2 py-2 w-24 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pendingTransactions.length > 0 ? (
                                pendingTransactions.map((t) => (
                                    <tr
                                        key={t.id}
                                        className={`hover:bg-blue-50 group cursor-pointer transition-colors ${selectedIds.includes(t.id) ? 'bg-blue-100' : ''}`}
                                        onClick={() => handleSelectOne(t.id)}
                                    >
                                        <td className="border-r border-gray-200 px-2 py-2 text-center">
                                            {selectedIds.includes(t.id) ? <CheckSquare size={14} className="mx-auto text-blue-700" /> : <Square size={14} className="mx-auto text-gray-300" />}
                                        </td>
                                        <td className="border-r border-gray-200 px-2 py-2 font-mono text-gray-500 italic">{t.date}</td>
                                        <td className="border-r border-gray-200 px-2 py-2 font-black text-gray-700 group-hover:text-blue-700 uppercase">{t.empId}</td>
                                        <td className="border-r border-gray-200 px-2 py-2 font-black text-blue-900 italic tracking-tight uppercase group-hover:underline">{t.name}</td>
                                        <td className="border-r border-gray-200 px-2 py-2 font-black">
                                            <span className="text-[10px] bg-gray-100 border border-gray-300 px-2 py-0.5 rounded italic uppercase leading-none">
                                                {t.code || t.type}
                                            </span>
                                        </td>
                                        <td className="border-r border-gray-200 px-2 py-2 text-right font-black text-blue-800 tabular-nums italic">
                                            ${formatCurrency(t.amount)}
                                        </td>
                                        <td className="px-2 py-2 text-center italic text-yellow-600 font-black text-[9px] uppercase animate-pulse">
                                            {t.status}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-20 text-gray-300 font-black italic uppercase tracking-[0.2em] bg-gray-50/50">
                                        {loading ? 'Scanning Secure Registry...' : 'No Pending Transactions Found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. Footer Actions */}
            <div className="bg-[#EBE9D8] border-t-2 border-white p-3 flex justify-between items-center shadow-2xl shrink-0 z-20">
                <div className="flex items-center gap-6 font-black italic uppercase">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500">Selection Count</span>
                        <span className="text-xs text-gray-800">{selectedIds.length} ITEMS</span>
                    </div>
                    <div className="flex flex-col border-l border-gray-400 pl-6">
                        <span className="text-[9px] text-gray-500">Commitment Value</span>
                        <span className="text-lg text-blue-800 tracking-tighter">${formatCurrency(totalSelected)}</span>
                    </div>
                    <div className="flex flex-col border-l border-gray-400 pl-6 opacity-50">
                        <span className="text-[9px] text-gray-500">Total Pending</span>
                        <span className="text-xs text-gray-600 tracking-tighter">${formatCurrency(pendingTransactions.reduce((sum, t) => sum + t.amount, 0))}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSelectAll}
                        className="flex items-center gap-2 px-4 py-2 bg-[#EBE9D8] border-2 border-white border-r-gray-400 border-b-gray-400 shadow-md active:translate-y-0.5 active:shadow-inner text-[10px] font-black italic hover:bg-white text-gray-600 uppercase transition-all"
                    >
                        {selectedIds.length === pendingTransactions.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                        onClick={initiatePost}
                        disabled={selectedIds.length === 0 || posting}
                        className={`flex items-center gap-2 px-10 py-3 border-2 shadow-xl text-[11px] font-black italic uppercase transition-all tracking-widest ${selectedIds.length > 0 && !posting ? 'bg-green-700 text-white border-green-400 border-r-green-900 border-b-green-900 border-l-green-400 border-t-green-400 hover:bg-green-600 active:translate-y-1 active:shadow-inner active:border-b-0 active:border-r-0' : 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed opacity-50'}`}
                    >
                        {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {posting ? 'Processing...' : 'Post Selected to Register'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostTransactions;
