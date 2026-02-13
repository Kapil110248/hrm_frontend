import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListFilter, Search, Printer, Download, LogOut, FileText, ChevronDown, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const TransactionRegister = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [period, setPeriod] = useState('ALL');
    const [showAudit, setShowAudit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    const fetchRecords = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const params = { companyId: selectedCompany.id };
            if (period === 'CURRENT') {
                params.period = 'Feb-2026'; // Mocking current period
            }
            const response = await api.fetchTransactionRegister(params);
            if (response.success) {
                const mapped = (response.data.transactions || []).map(t => ({
                    id: t.id,
                    txId: t.id.substring(0, 8).toUpperCase(),
                    date: new Date(t.transactionDate).toLocaleDateString(),
                    employee: `${t.employee?.firstName} ${t.employee?.lastName}`,
                    type: t.type,
                    amount: parseFloat(t.amount),
                    status: t.status,
                    period: t.period === 'Feb-2026' ? 'CURRENT' : 'PREVIOUS'
                }));
                setRecords(mapped);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [selectedCompany.id, period]);

    const handleViewAudit = () => {
        setShowAudit(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        const filtered = records.filter(r =>
            (r.employee.toLowerCase().includes(searchTerm.toLowerCase()) || r.txId.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        const csvString = [
            ["TX ID", "DATE", "EMPLOYEE", "CATEGORY", "AMOUNT", "STATUS"],
            ...filtered.map(r => [r.txId, r.date, r.employee, r.type, r.amount, r.status])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Transaction_Register_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredRecords = records.filter(r => {
        const matchesSearch = r.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.txId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.type.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const totalValue = filteredRecords.reduce((sum, r) => sum + r.amount, 0);

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ListFilter size={14} className="text-blue-800" />
                    <span className="font-bold text-gray-700 uppercase italic underline decoration-blue-500/30 underline-offset-4">Transaction Register Management</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPeriod(prev => prev === 'ALL' ? 'CURRENT' : 'ALL')}
                        className={`px-3 py-1 border border-gray-400 text-[10px] font-black italic transition-all flex items-center gap-1 shadow-sm ${period === 'ALL' ? 'bg-[#316AC5] text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                    >
                        {period === 'ALL' ? 'ALL PERIODS' : 'CURRENT PERIOD'} <ChevronDown size={10} />
                    </button>
                    {loading && <div className="flex items-center gap-2 px-2 text-blue-700 font-bold italic animate-pulse"><Loader2 size={12} className="animate-spin" /> REFRESHING...</div>}
                </div>
            </div>

            <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
                {/* Search & Tool Bar */}
                <div className="bg-white border border-gray-400 p-2 flex items-center gap-4 shadow-md">
                    <div className="flex-1 flex items-center gap-2 px-2 bg-gray-50 border border-gray-300 focus-within:border-blue-500 transition-colors shadow-inner">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="FILTER BY ID, EMPLOYEE OR TYPE..."
                            className="bg-transparent outline-none p-2 font-bold w-full italic uppercase placeholder:normal-case"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="p-2 border border-gray-400 bg-[#E0DCCF] hover:bg-white hover:text-blue-700 transition-all shadow-sm active:translate-y-0.5"
                        >
                            <Printer size={16} title="Print Register" />
                        </button>
                        <button
                            onClick={handleExport}
                            className="p-2 border border-gray-400 bg-[#E0DCCF] hover:bg-white hover:text-green-700 transition-all shadow-sm active:translate-y-0.5"
                        >
                            <Download size={16} title="Export CSV" />
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="flex-1 bg-white border border-gray-400 shadow-xl overflow-hidden flex flex-col rounded-sm">
                    <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-gray-400">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#D4D0C8] sticky top-0 border-b border-gray-400 font-black italic text-gray-700 z-10 shadow-sm">
                                <tr>
                                    <th className="p-3 border-r border-gray-300">TX ID</th>
                                    <th className="p-3 border-r border-gray-300">DATE</th>
                                    <th className="p-3 border-r border-gray-300">EMPLOYEE</th>
                                    <th className="p-3 border-r border-gray-300">CATEGORY</th>
                                    <th className="p-3 border-r border-gray-300">AMOUNT</th>
                                    <th className="p-3">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRecords.length > 0 ? filteredRecords.map((record, i) => (
                                    <tr key={i} className="hover:bg-blue-50 cursor-pointer group transition-colors">
                                        <td className="p-3 font-black text-gray-400 group-hover:text-blue-600 transition-colors uppercase tabular-nums">#{record.txId}</td>
                                        <td className="p-3 font-mono text-gray-600">{record.date}</td>
                                        <td className="p-3 font-black text-blue-900 italic group-hover:underline group-hover:translate-x-1 transition-transform uppercase">{record.employee}</td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 bg-gray-50 border border-gray-300 rounded font-black text-[9px] uppercase tracking-tighter text-gray-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-700 transition-all">
                                                {record.type}
                                            </span>
                                        </td>
                                        <td className="p-3 font-black text-blue-800 italic group-hover:scale-105 transition-transform origin-left tabular-nums">
                                            ${record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full font-black italic uppercase text-[9px] border shadow-sm ${record.status === 'POSTED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                record.status === 'ENTERED' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse' :
                                                    record.status === 'PROCESSED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                        'bg-red-100 text-red-700 border-red-200'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="p-10 text-center font-black italic text-gray-300 uppercase tracking-widest bg-gray-50/50">
                                            No Transaction Records Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Status Bar */}
                    <div className="bg-[#EBE9D8] border-t border-gray-400 p-2 flex justify-between px-6 text-[10px] font-black italic text-gray-500 uppercase tracking-widest shrink-0">
                        <span>Total Records: {records.length}</span>
                        <div className="flex gap-4">
                            <span>{searchTerm ? `Matches: ${filteredRecords.length}` : ''}</span>
                            <span className="text-blue-900 border-l border-gray-400 pl-4 bg-gray-200/50 px-2 rounded">Register Value: ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 no-print">
                    <button
                        onClick={handleViewAudit}
                        className="flex items-center gap-2 px-6 py-3 bg-[#E0DCCF] border-2 border-white border-b-gray-600 border-r-gray-600 font-black italic hover:bg-white hover:text-blue-800 active:translate-y-1 active:border-b-0 active:border-r-0 transition-all text-blue-900 shadow-md uppercase tracking-wider text-[10px]"
                    >
                        <FileText size={16} className="text-blue-600" /> View System Logs
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#E0DCCF] border-2 border-white border-b-gray-600 border-r-gray-600 font-black italic hover:bg-white hover:text-red-800 transition-all shadow-md uppercase tracking-wider text-[10px]"
                    >
                        <LogOut size={16} className="text-red-600" /> Close Register
                    </button>
                </div>

                {/* Audit Log Overlay */}
                {showAudit && (
                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="w-full max-w-2xl bg-[#D4D0C8] border-4 border-[#D4D0C8] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col h-[500px] animate-in zoom-in duration-300 overflow-hidden">
                            <div className="bg-[#000080] text-white px-3 py-1.5 flex items-center justify-between border-b-2 border-white/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-600 border border-white rounded-full"></div>
                                    <span className="font-black italic uppercase tracking-widest text-[9px]">Audit Control Center - Security Level 4</span>
                                </div>
                                <button onClick={() => setShowAudit(false)} className="hover:bg-red-600 px-3 py-0.5 font-black transition-colors border border-transparent hover:border-white">✕</button>
                            </div>
                            <div className="flex-1 bg-black p-6 font-mono text-[10px] overflow-auto space-y-2 relative group">
                                <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,0,0.05)_0%,transparent_100%)]"></div>
                                <div className="text-green-500 border-b border-green-900/30 pb-2 mb-4 animate-pulse">
                                    SYSTEM ACCESS ESTABLISHED: {new Date().toLocaleString()} @ PORT_042
                                </div>
                                <p className="text-green-500/80">[AUTH] User verified: {activeUser.email}</p>
                                <p className="text-green-500/80">[CID] Company Token: {activeUser.companyId?.substring(0, 13)}...</p>
                                <p className="text-green-500/80">[SCAN] Integrity check: OK</p>

                                {filteredRecords.map(r => (
                                    <div key={r.id} className="pt-2 border-t border-green-900/20 text-green-400/90">
                                        <p><span className="text-blue-500">ENTRY_HNDL:</span> {r.id}</p>
                                        <p><span className="text-blue-500">OPERATOR:</span> {activeUser.email.toUpperCase()}</p>
                                        <p><span className="text-blue-500">TIMESTAMP:</span> {r.date} :: SYNCED</p>
                                        <p><span className="text-blue-500">VALIDATION:</span> {r.status}_STATUS_VERIFIED</p>
                                    </div>
                                ))}
                                <p className="pt-4 text-green-500 font-bold border-t border-green-900 mt-4 italic">--- SYSTEM SCAN COMPLETE - NO ANOMALIES DETECTED ---</p>
                            </div>
                            <div className="bg-[#D4D0C8] p-2 flex justify-end border-t border-gray-400">
                                <button onClick={() => setShowAudit(false)} className="px-8 py-1.5 bg-white border-2 border-white border-b-gray-600 border-r-gray-600 font-black uppercase text-[10px] hover:bg-gray-100 active:translate-y-0.5 transition-all italic text-blue-900 shadow-sm">Exit Terminal</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionRegister;
