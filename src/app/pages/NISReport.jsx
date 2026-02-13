import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Loader2, Calendar } from 'lucide-react';
import { api } from '../../services/api';

const NISReport = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const companyStr = localStorage.getItem('selectedCompany');
        if (companyStr) {
            const company = JSON.parse(companyStr);
            setSelectedCompany(company);
        }
    }, []);

    const fetchReportData = async () => {
        if (!selectedCompany.id) return;
        setLoading(true);
        try {
            // Format period as 'MMM-YYYY' (e.g., 'Feb-2026')
            const period = selectedDate.toLocaleString('default', { month: 'short', year: 'numeric' });
            
            const res = await api.fetchPayrolls({ 
                companyId: selectedCompany.id,
                period: period
            });
            
            if (res.success) {
                setPayrolls(res.data);
            } else {
                setPayrolls([]);
            }
        } catch (err) {
            console.error(err);
            setPayrolls([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [selectedCompany.id, selectedDate]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(val || 0);
    };

    const totalEmployeeContribution = payrolls.reduce((acc, p) => acc + parseFloat(p.nis || 0), 0);
    const totalEmployerContribution = totalEmployeeContribution; // Employer matches Employee (3%)
    const totalRemittance = totalEmployeeContribution + totalEmployerContribution;

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans relative">
            {loading && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            )}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-700 text-white rounded-sm flex items-center justify-center shadow-sm">
                        <FileText size={14} />
                    </div>
                    <span className="font-black text-gray-700 text-xs sm:text-sm uppercase italic tracking-tighter">National Insurance Scheme (NIS) Report</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-1 bg-white border border-gray-400 px-2 py-1 rounded-sm shadow-sm">
                        <Calendar size={12} className="text-gray-500" />
                        <input 
                            type="month" 
                            className="text-xs font-bold text-gray-700 outline-none bg-transparent uppercase"
                            value={selectedDate.toISOString().slice(0, 7)}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        />
                    </div>
                    <button onClick={fetchReportData} className="flex items-center gap-1 bg-white border border-gray-400 px-2 py-1 rounded-sm text-xs font-bold shadow-sm hover:bg-gray-50">
                        <Filter size={12} /> Refresh
                    </button>
                    <button className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-sm text-xs font-bold hover:bg-blue-700 shadow-sm border border-blue-800">
                        <Download size={12} /> Export
                    </button>
                </div>
            </div>

            <div className="p-4 flex-1 overflow-auto">
                <div className="bg-white border border-gray-400 p-4 shadow-sm min-h-[400px]">
                    <div className="flex justify-between items-end mb-4 border-b pb-2">
                        <div>
                            <h2 className="font-bold text-gray-800 uppercase italic">Monthly Remittance - NIS</h2>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                Period: {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </p>
                            <p className="text-[10px] font-bold text-blue-700 uppercase">{selectedCompany?.name || 'ALL BRANCHES'}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Remittance</div>
                            <div className="text-lg font-black text-blue-800">{formatCurrency(totalRemittance)}</div>
                        </div>
                    </div>

                    <table className="w-full text-[10px] text-left border-collapse">
                        <thead className="bg-gray-100 border-b border-gray-300">
                            <tr className="uppercase tracking-widest text-gray-400 font-bold">
                                <th className="p-2">NIS Number</th>
                                <th className="p-2">Employee Name</th>
                                <th className="p-2 text-right">Gross Earnings</th>
                                <th className="p-2 text-right">Employee (3%)</th>
                                <th className="p-2 text-right">Employer (3%)</th>
                                <th className="p-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrolls.length > 0 ? (
                                payrolls.map(p => {
                                    const nisVal = parseFloat(p.nis || 0);
                                    return (
                                        <tr key={p.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                            <td className="p-2 font-black text-gray-600">{p.employee?.nisNumber || 'N/A'}</td>
                                            <td className="p-2 font-black text-gray-800 uppercase italic">
                                                {p.employee?.firstName} {p.employee?.lastName}
                                            </td>
                                            <td className="p-2 text-right font-mono">{formatCurrency(p.grossSalary)}</td>
                                            <td className="p-2 text-right font-mono text-red-700">{formatCurrency(nisVal)}</td>
                                            <td className="p-2 text-right font-mono text-blue-700">{formatCurrency(nisVal)}</td>
                                            <td className="p-2 text-right font-black text-gray-900">{formatCurrency(nisVal * 2)}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 italic font-bold uppercase tracking-widest">
                                        No payroll records found for {selectedDate.toLocaleString('default', { month: 'short', year: 'numeric' })}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-gray-50 font-black border-t-2 border-gray-300">
                            <tr>
                                <td colSpan="3" className="p-2 text-right uppercase tracking-widest text-gray-500">Aggregates</td>
                                <td className="p-2 text-right text-red-700">{formatCurrency(totalEmployeeContribution)}</td>
                                <td className="p-2 text-right text-blue-700">{formatCurrency(totalEmployerContribution)}</td>
                                <td className="p-2 text-right text-black">{formatCurrency(totalRemittance)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NISReport;
