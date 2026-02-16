import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Download, Search, Filter, RefreshCw, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LedgerReport = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));
    
    // Filters
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        status: 'POSTED' // Default to posted for GL
    });

    const loadTransactions = async () => {
        if (!selectedCompany?.id) return;
        
        setLoading(true);
        try {
            const res = await api.fetchTransactions({
                companyId: selectedCompany.id,
                status: filters.status,
                // We'll need to filter by date client-side if API doesn't support range, 
                // but checking controller, it supports period. 
                // For now, let's fetch all posted and filter by date here if needed, 
                // or rely on period if users prefer. 
                // To match user expectation of "Date Range", we might need to filter client-side 
                // until backend supports date range query.
            });

            if (res.success) {
                // Client-side date filtering for now as controller supports 'period' but not range
                const start = new Date(filters.startDate);
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);

                const filtered = res.data.filter(t => {
                    const tDate = new Date(t.transactionDate);
                    return tDate >= start && tDate <= end;
                });
                
                setTransactions(filtered);
            }
        } catch (error) {
            console.error("Failed to load ledger", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, [selectedCompany.id]); // Load initially

    const handleExportCSV = () => {
        if (transactions.length === 0) return;

        // CSV Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Transaction ID,Employee ID,Employee Name,Type,Code,Description,Amount,Status,Posted By,Posted At\n";

        // CSV Rows
        transactions.forEach(t => {
            const row = [
                new Date(t.transactionDate).toLocaleDateString(),
                t.id,
                t.employee?.employeeId || '',
                `"${t.employee?.firstName || ''} ${t.employee?.lastName || ''}"`,
                t.type,
                t.code,
                `"${t.description || ''}"`,
                t.amount,
                t.status,
                t.postedBy || '',
                t.postedAt ? new Date(t.postedAt).toLocaleDateString() : ''
            ].join(",");
            csvContent += row + "\n";
        });

        // Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `GL_Export_${filters.startDate}_to_${filters.endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-full bg-[#EBE9D8] font-sans">
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-300 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                            <FileText className="text-blue-600" size={24} /> 
                            General Ledger Interface
                        </h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {selectedCompany.name || 'No Company Selected'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleExportCSV}
                        disabled={transactions.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase text-xs"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-100 p-3 border-b border-gray-300 flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Start Date</label>
                    <input 
                        type="date" 
                        value={filters.startDate}
                        onChange={e => setFilters({...filters, startDate: e.target.value})}
                        className="p-1.5 border border-gray-300 rounded text-xs font-bold"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">End Date</label>
                    <input 
                        type="date" 
                        value={filters.endDate}
                        onChange={e => setFilters({...filters, endDate: e.target.value})}
                        className="p-1.5 border border-gray-300 rounded text-xs font-bold"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Filter Status</label>
                    <select 
                        value={filters.status}
                        onChange={e => setFilters({...filters, status: e.target.value})}
                        className="p-1.5 border border-gray-300 rounded text-xs font-bold min-w-[120px]"
                    >
                        <option value="POSTED">POSTED ONLY</option>
                        <option value="">ALL TRANSACTIONS</option>
                    </select>
                </div>
                <button 
                    onClick={loadTransactions}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-bold uppercase text-xs mb-0.5"
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
                <div className="bg-white border border-gray-300 rounded-lg shadow-inner flex-1 overflow-hidden flex flex-col">
                    {/* Table Header */}
                    <div className="bg-gray-200 border-b border-gray-300 p-2 grid grid-cols-12 gap-2 text-[10px] font-black text-gray-600 uppercase tracking-wider">
                        <div className="col-span-1">Date</div>
                        <div className="col-span-1">Code</div>
                        <div className="col-span-2">Employee</div>
                        <div className="col-span-4">Description</div>
                        <div className="col-span-1 text-right">Debit</div>
                        <div className="col-span-1 text-right">Credit</div>
                        <div className="col-span-2 text-center">Status</div>
                    </div>

                    {/* Table Body */}
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Loader2 size={32} className="animate-spin mb-2" />
                                <span className="text-xs font-bold">Loading Ledger...</span>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <FileText size={48} className="mb-2 opacity-20" />
                                <span className="text-xs font-bold">No transactions found for this period.</span>
                            </div>
                        ) : (
                            transactions.map(t => (
                                <div key={t.id} className="grid grid-cols-12 gap-2 p-2 border-b border-gray-100 items-center text-xs hover:bg-blue-50 transition-colors">
                                    <div className="col-span-1 font-mono text-gray-500">{new Date(t.transactionDate).toLocaleDateString()}</div>
                                    <div className="col-span-1 font-bold text-gray-700">{t.code}</div>
                                    <div className="col-span-2 truncate font-medium">{t.employee?.firstName} {t.employee?.lastName}</div>
                                    <div className="col-span-4 truncate text-gray-500 italic">{t.description}</div>
                                    
                                    {/* Debit/Credit Logic based on type */}
                                    <div className="col-span-1 text-right font-mono font-bold text-gray-800">
                                        {['EARNING', 'ALLOWANCE'].includes(t.type) ? new Intl.NumberFormat('en-JM', { minimumFractionDigits: 2 }).format(t.amount) : '-'}
                                    </div>
                                    <div className="col-span-1 text-right font-mono font-bold text-gray-800">
                                        {['DEDUCTION'].includes(t.type) ? `(${new Intl.NumberFormat('en-JM', { minimumFractionDigits: 2 }).format(t.amount)})` : '-'}
                                    </div>

                                    <div className="col-span-2 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                            t.status === 'POSTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Footer Totals */}
                    <div className="bg-gray-100 border-t border-gray-300 p-3 flex justify-between items-center text-xs font-bold">
                        <span className="text-gray-500 uppercase">{transactions.length} Records Found</span>
                        <div className="flex gap-6">
                            <span className="text-gray-600">TOTAL DEBITS: <span className="text-black">{new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(
                                transactions.filter(t => ['EARNING', 'ALLOWANCE'].includes(t.type)).reduce((sum, t) => sum + Number(t.amount), 0)
                            )}</span></span>
                            <span className="text-gray-600">TOTAL CREDITS: <span className="text-red-600">{new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(
                                transactions.filter(t => ['DEDUCTION'].includes(t.type)).reduce((sum, t) => sum + Number(t.amount), 0)
                            )}</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LedgerReport;