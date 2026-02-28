import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, LogOut, FileText, Download, Search, Calendar, User, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';

const NHTReport = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [payrollHistory, setPayrollHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        const fetchEmployees = async () => {
            const companyStr = localStorage.getItem('selectedCompany');
            const company = companyStr ? JSON.parse(companyStr) : null;
            if (company) {
                const res = await api.fetchEmployees(company.id);
                if (res.success) setEmployees(res.data);
            }
        };
        fetchEmployees();
    }, []);

    const fetchHistory = async (emp) => {
        setLoading(true);
        try {
            const res = await api.fetchPayrolls({ employeeId: emp.id });
            if (res.success) {
                // Filter by year if needed, but for now show all and we'll filter in render
                setPayrollHistory(res.data);
                setSelectedEmployee(emp);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const yearHistory = payrollHistory.filter(p => p.period.includes(selectedYear));

    const totalGross = yearHistory.reduce((acc, p) => acc + parseFloat(p.grossSalary), 0);
    const totalNHT = yearHistory.reduce((acc, p) => acc + parseFloat(p.nht || 0), 0);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(val || 0);
    };

    const handleExportExcel = () => {
        if (!selectedEmployee || yearHistory.length === 0) return;
        const dataToExport = yearHistory.map((p, idx) => ({
            'Sequence': idx + 1,
            'Internal Period': p.period,
            'Gross Emoluments (JMD)': parseFloat(p.grossSalary || 0),
            'NHT Ded. (2%) (JMD)': parseFloat(p.nht || 0)
        }));

        dataToExport.push({
            'Sequence': 'Annual Aggregates',
            'Internal Period': '',
            'Gross Emoluments (JMD)': totalGross,
            'NHT Ded. (2%) (JMD)': totalNHT
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'NHT Report');
        XLSX.writeFile(wb, `NHT_${selectedYear}_${selectedEmployee.lastName}.xlsx`);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs relative">
            {loading && (
                <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            )}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 py-1 flex items-center justify-between">
                <span className="font-bold text-gray-700 uppercase tracking-tighter">NHT Contribution Ledger - National Housing Trust</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm border border-blue-800">
                        <Download size={12} /> Export PDF
                    </button>
                    <button onClick={handleExportExcel} className="px-3 py-1 bg-green-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm border border-green-800">
                        <Download size={12} /> Excel
                    </button>
                    <button onClick={() => window.print()} className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm border border-green-800">
                        <Printer size={12} /> Print
                    </button>
                    <button onClick={() => navigate(-1)} className="px-3 py-1 bg-gray-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm border border-gray-800">
                        <LogOut size={12} /> Exit
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                    {/* Employee Search */}
                    <div className="lg:col-span-1 bg-white border border-gray-400 p-3 shadow-inner h-[500px] flex flex-col">
                        <label className="text-gray-500 font-black text-[9px] uppercase tracking-widest mb-2">Registry Search</label>
                        <div className="relative mb-3">
                            <Search className="absolute left-2 top-2 text-gray-400" size={12} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ID or Name..."
                                className="w-full pl-8 p-1.5 border border-gray-300 bg-gray-50 text-blue-900 font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto border border-gray-100 rounded">
                            {filteredEmployees.map(emp => (
                                <div
                                    key={emp.id}
                                    onClick={() => fetchHistory(emp)}
                                    className={`p-2 border-b border-gray-50 cursor-pointer transition-colors ${selectedEmployee?.id === emp.id ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}
                                >
                                    <div className="font-black text-[10px] uppercase truncate">{emp.firstName} {emp.lastName}</div>
                                    <div className={`text-[9px] ${selectedEmployee?.id === emp.id ? 'text-blue-100' : 'text-gray-400'}`}>{emp.employeeId}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="lg:col-span-3 bg-white border border-gray-400 shadow-lg p-6 sm:p-12 overflow-y-auto min-h-[800px]">
                        {selectedEmployee ? (
                            <div className="max-w-4xl mx-auto">
                                <div className="text-center mb-8 border-b-4 border-green-900 pb-6 relative">
                                    <div className="absolute top-0 right-0 p-2 border-2 border-gray-200 text-gray-300 font-black rotate-12 uppercase italic">DRAFT TRANSMISSION</div>
                                    <h1 className="text-2xl font-black text-green-900 uppercase tracking-widest">National Housing Trust</h1>
                                    <h2 className="text-xl font-black text-green-900 uppercase mt-1">Annual Contribution Statement</h2>
                                    <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-[0.2em]">Government of Jamaica</p>
                                    <div className="mt-4 inline-block bg-green-900 text-white px-6 py-1 font-black text-xs uppercase tracking-widest">
                                        Tax Year: {selectedYear}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-4">
                                        <div className="border-l-4 border-green-900 pl-4">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Employee Identity</span>
                                            <span className="text-sm font-black text-gray-900 uppercase italic">{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                                        </div>
                                        <div className="border-l-4 border-green-900 pl-4">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Internal Reference</span>
                                            <span className="text-sm font-black text-gray-900">{selectedEmployee.employeeId}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="border-l-4 border-green-900 pl-4">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">NHT Reg. / TRN</span>
                                            <span className="text-sm font-black text-gray-900">{selectedEmployee.trn || 'PENDING SYNC'}</span>
                                        </div>
                                        <div className="border-l-4 border-green-900 pl-4">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">NIS Serial Number</span>
                                            <span className="text-sm font-black text-gray-900">{selectedEmployee.nisNumber || 'NOT RECORDED'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 p-6 mb-8 grid grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Periods Processed</span>
                                        <span className="text-xl font-black text-blue-900">{yearHistory.length}</span>
                                    </div>
                                    <div className="text-center border-x border-blue-100">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Total Gross Earnings</span>
                                        <span className="text-xl font-black text-gray-900">{formatCurrency(totalGross)}</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">NHT Contribution (2%)</span>
                                        <span className="text-xl font-black text-green-700">{formatCurrency(totalNHT)}</span>
                                    </div>
                                </div>

                                <div className="border border-gray-300">
                                    <table className="w-full text-[10px]">
                                        <thead className="bg-green-900 text-white uppercase tracking-widest italic">
                                            <tr>
                                                <th className="p-3 text-left">Sequence</th>
                                                <th className="p-3 text-left">Internal Period</th>
                                                <th className="p-3 text-right">Gross Emoluments</th>
                                                <th className="p-3 text-right">NHT Ded. (2%)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {yearHistory.length > 0 ? (
                                                yearHistory.map((p, idx) => (
                                                    <tr key={p.id} className="hover:bg-green-50/50">
                                                        <td className="p-3 font-bold text-gray-400">{idx + 1}</td>
                                                        <td className="p-3 font-black text-gray-800 uppercase">{p.period}</td>
                                                        <td className="p-3 text-right font-mono">{formatCurrency(p.grossSalary)}</td>
                                                        <td className="p-3 text-right font-black text-green-700 font-mono">{formatCurrency(parseFloat(p.nht || 0))}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="p-12 text-center text-gray-400 font-black uppercase italic tracking-widest">
                                                        No payroll sequences discovered for year {selectedYear}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {yearHistory.length > 0 && (
                                            <tfoot className="bg-green-900 text-white font-black uppercase text-[11px]">
                                                <tr>
                                                    <td colSpan="2" className="p-3 text-right">Annual Aggregates</td>
                                                    <td className="p-3 text-right">{formatCurrency(totalGross)}</td>
                                                    <td className="p-3 text-right">{formatCurrency(totalNHT)}</td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>

                                <div className="mt-8 border-t-2 border-dashed border-gray-200 pt-8 flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                    <span>Generation ID: {Math.random().toString(16).substr(2, 12).toUpperCase()}</span>
                                    <span className="italic">Authorized System Transmission</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12">
                                <FileText size={48} className="text-gray-200 mb-4" />
                                <h3 className="text-lg font-black text-gray-300 uppercase italic tracking-widest">Awaiting Identity Selection</h3>
                                <p className="text-gray-400 mt-2 max-w-sm">Please choose a staff member from the registry on the left to initialize the NHT contribution audit sequence.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NHTReport;

