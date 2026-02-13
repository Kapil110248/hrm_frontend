import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Printer, Download, LogOut, ChevronDown, CheckCircle, ListFilter, X, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const CalculationRegister = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('All Status');
    const [periodFilter, setPeriodFilter] = React.useState('ALL'); // 'ALL' or 'CURRENT'
    const [calculations, setCalculations] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [selectedCompany] = React.useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    const fetchBatches = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const response = await api.fetchPayrollBatches(selectedCompany.id);
            if (response.success) {
                setCalculations(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch batches", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchBatches();
    }, [selectedCompany.id]);

    const filteredCalculations = calculations.filter((c, index) => {
        const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.period.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || c.status === statusFilter;

        // 'Current Period' acts as a toggle to show ONLY the latest batch entry
        const matchesPeriod = periodFilter === 'ALL' || index === 0;

        return matchesSearch && matchesStatus && matchesPeriod;
    });

    const handlePrintLog = () => {
        window.print();
    };

    const handleRePrint = (id, period) => {
        // Redirect back to calculation page with the specific period
        navigate(`/processing/payroll-calculation?period=${period}`);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-1 flex items-center justify-between no-print">
                <div className="flex items-center gap-2">
                    <FileText size={14} className="text-blue-800" />
                    <span className="font-bold text-gray-700 uppercase italic text-[10px] sm:text-xs">Calculation Register Log</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPeriodFilter(prev => prev === 'ALL' ? 'CURRENT' : 'ALL')}
                        className={`px-3 py-1 border border-gray-400 text-[10px] font-black italic transition-all active:translate-y-0.5 shadow-sm flex items-center gap-1 ${periodFilter === 'ALL' ? 'bg-[#316AC5] text-white hover:bg-blue-700' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        <span className="hidden sm:inline">{periodFilter === 'ALL' ? 'ALL PERIODS' : 'CURR. PERIOD'}</span>
                        <span className="sm:hidden">{periodFilter === 'ALL' ? 'ALL' : 'CURR'}</span>
                        <ChevronDown size={10} />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 overflow-hidden">
                <div className="bg-white border-2 border-gray-500 p-3 sm:p-4 shadow-md flex flex-col lg:flex-row items-center gap-4">
                    <div className="flex-1 w-full flex items-center gap-2 bg-gray-50 border border-gray-300 p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all rounded-sm shadow-inner group">
                        <ListFilter size={18} className="text-blue-700 shrink-0 group-hover:scale-110 transition-transform" />
                        <div className="h-4 w-px bg-gray-300 mx-1"></div>
                        <input
                            type="text"
                            placeholder="SEARCH BY ID OR PERIOD..."
                            className="bg-transparent outline-none font-black w-full italic text-blue-900 placeholder:text-gray-400 placeholder:font-normal text-[10px] sm:text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-gray-400 hover:text-red-600 p-1"
                                title="Clear Filter"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 lg:flex-none p-2.5 border-2 border-gray-400 bg-white text-[10px] font-black uppercase italic text-gray-700 focus:border-blue-500 outline-none shadow-sm"
                        >
                            <option>All Status</option>
                            <option>Verified</option>
                            <option>Posted</option>
                        </select>
                        <button
                            onClick={handlePrintLog}
                            className="p-2.5 border border-gray-400 border-b-2 border-r-2 border-gray-500 bg-[#E0DCCF] hover:bg-gray-200 active:translate-y-0.5 shadow-sm transition-all"
                            title="Print Log"
                        >
                            <Printer size={18} className="text-gray-700" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-white border-2 border-gray-500 shadow-lg overflow-hidden flex flex-col">
                    <div className="bg-blue-600 text-white p-2 px-6 flex justify-between items-center italic font-black uppercase text-[10px]">
                        Historical Calculations
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-0">
                            <thead className="bg-gray-100 font-black italic text-gray-500 uppercase text-[9px] border-b">
                                <tr>
                                    <th className="p-3 sm:p-4 hidden md:table-cell">CALC ID</th>
                                    <th className="p-3 sm:p-4">PAY PERIOD</th>
                                    <th className="p-3 sm:p-4">TOTAL GROSS</th>
                                    <th className="p-3 sm:p-4 hidden sm:table-cell">ST. DEDUCTIONS</th>
                                    <th className="p-4 hidden xs:table-cell">STATUS</th>
                                    <th className="p-3 sm:p-4 text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="p-10 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading Historical Data...</td></tr>
                                ) : filteredCalculations.length === 0 ? (
                                    <tr><td colSpan={6} className="p-10 text-center text-gray-400 font-bold italic">No Historical Calculations Found</td></tr>
                                ) : filteredCalculations.map((c, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                        <td className="p-3 sm:p-4 font-black hidden md:table-cell">#{c.id}</td>
                                        <td className="p-3 sm:p-4 font-bold">
                                            <div className="md:hidden text-[8px] opacity-40 font-mono">#{c.id}</div>
                                            {c.period}
                                        </td>
                                        <td className="p-3 sm:p-4 font-black italic text-blue-900">${c.totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-3 sm:p-4 font-black italic text-red-600 hidden sm:table-cell">${c.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-3 sm:p-4 hidden xs:table-cell">
                                            <span className={`px-3 py-1 rounded-sm font-black italic text-[8px] uppercase ${c.status === 'Verified' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="p-3 sm:p-4 text-right">
                                            <button
                                                onClick={() => handleRePrint(c.id, c.period)}
                                                className="text-blue-600 font-black italic uppercase text-[9px] hover:underline"
                                            >
                                                {/* On small mobile, shorten the text */}
                                                <span className="hidden sm:inline">Re-Print Details</span>
                                                <span className="sm:hidden">Print</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="bg-white border-t border-gray-400 p-3 px-4 sm:px-8 flex justify-end no-print">
                <button
                    onClick={() => navigate(-1)}
                    className="w-full sm:w-auto bg-red-500 text-white px-10 py-3 sm:py-2 font-black italic hover:bg-red-600 shadow-xl active:translate-y-1 transition-all"
                >
                    CLOSE REGISTER
                </button>
            </div>
        </div>
    );
};

export default CalculationRegister;
