import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Download, FileText, Search, RotateCcw, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const PostedTransactionRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    // Filters
    const [filters, setFilters] = useState({
        period: 'Feb-2026',
        department: '',
        search: ''
    });

    const [transactions, setTransactions] = useState([]);

    const fetchPosted = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const params = {
                companyId: selectedCompany.id,
                status: 'POSTED'
            };
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
                    status: 'Posted',
                    postedBy: t.postedBy || 'Admin',
                    department: t.employee?.department?.name || 'General'
                }));
                setTransactions(mapped);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosted();
    }, [selectedCompany.id]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-JM', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    };

    const handleReverse = async (id) => {
        const confirm = window.confirm(`PROCEED TO REVERSE TRANSACTION ${id}?\n\nThis will nullify the amount and mark it as voided.`);
        if (confirm) {
            try {
                setLoading(true);
                // We'll use updateTransaction to change status or amount, 
                // but usually there's a specific void endpoint.
                // For now, let's just use delete if it's not strictly processed.
                const response = await api.updateTransaction(id, { status: 'VOIDED', amount: 0 });
                if (response.success) {
                    fetchPosted();
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleExport = () => {
        const csvString = [
            ["TX ID", "DATE", "EMPLOYEE", "CATEGORY", "AMOUNT", "STATUS", "POSTED BY"],
            ...filteredTransactions.map(r => [r.txId, r.date, r.name, r.type, r.amount, r.status, r.postedBy])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Posted_Register_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        <div className="h-[calc(100vh-70px)] flex flex-col bg-[#EBE9D8] font-sans overflow-hidden">

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
                            <option value="Feb-2026">February 2026</option>
                            <option value="Jan-2026">January 2026</option>
                            <option value="Dec-2025">December 2025</option>
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
                            <option value="Accounting">Accounting</option>
                            <option value="Operations">Operations</option>
                            <option value="Sales">Sales</option>
                            <option value="IT">IT</option>
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
                            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
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
                                                    onClick={() => handleReverse(trx.id)}
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
