import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, LogOut, FileText, Download, Search, User, Loader2, ShieldCheck, Landmark } from 'lucide-react';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';

const P24Report = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [payrollHistory, setPayrollHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            const companyStr = localStorage.getItem('selectedCompany');
            const company = companyStr ? JSON.parse(companyStr) : null;
            setSelectedCompany(company);
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

    const aggregates = yearHistory.reduce((acc, p) => ({
        gross: acc.gross + parseFloat(p.grossSalary || 0),
        nis: acc.nis + parseFloat(p.nis || 0),
        nht: acc.nht + parseFloat(p.nht || 0),
        tax: acc.tax + parseFloat(p.paye || 0), // P24 "Tax" usually refers to Income Tax (PAYE)
        net: acc.net + parseFloat(p.netSalary || 0),
        edTax: acc.edTax + parseFloat(p.edTax || 0)
    }), { gross: 0, nis: 0, nht: 0, tax: 0, net: 0, edTax: 0 });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(val || 0);
    };

    const handleExportExcel = () => {
        if (!selectedEmployee) return;
        const dataToExport = [
            { 'Category': `Total Gross Emoluments (${yearHistory.length} periods)`, 'Amount (JMD)': aggregates.gross },
            { 'Category': 'NIS Statutory Deduction (3%)', 'Amount (JMD)': -aggregates.nis },
            { 'Category': 'NHT Statutory Deduction (2%)', 'Amount (JMD)': -aggregates.nht },
            { 'Category': 'Income Tax Withheld (PAYE)', 'Amount (JMD)': -aggregates.tax },
            { 'Category': 'Education Tax Withheld (2.25%)', 'Amount (JMD)': -aggregates.edTax },
            { 'Category': 'Net Emoluments Disbursed', 'Amount (JMD)': aggregates.net }
        ];
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'P24');
        XLSX.writeFile(wb, `P24_${selectedYear}_${selectedEmployee.lastName}.xlsx`);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs relative">
            {loading && (
                <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            )}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 py-1 flex items-center justify-between">
                <span className="font-bold text-gray-700 uppercase tracking-tighter">P24 Year End Certificate - Jamaica Compliance</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1">
                        <Download size={12} /> Export PDF
                    </button>
                    <button onClick={handleExportExcel} className="px-3 py-1 bg-green-700 text-white text-[10px] font-bold flex items-center gap-1">
                        <Download size={12} /> Excel
                    </button>
                    <button onClick={() => window.print()} className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold flex items-center gap-1">
                        <Printer size={12} /> Print
                    </button>
                    <button onClick={() => navigate(-1)} className="px-3 py-1 bg-gray-600 text-white text-[10px] font-bold flex items-center gap-1">
                        <LogOut size={12} /> Exit
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                    {/* Employee Search */}
                    <div className="lg:col-span-1 bg-white border border-gray-400 p-3 shadow-inner h-[500px] flex flex-col">
                        <label className="text-gray-500 font-black text-[9px] uppercase tracking-widest mb-2">Personnel Index</label>
                        <div className="relative mb-3">
                            <Search className="absolute left-2 top-2 text-gray-400" size={12} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ID or Name..."
                                className="w-full pl-8 p-1.5 border border-gray-300 bg-gray-50 text-blue-900 font-bold outline-none"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto border border-gray-100">
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

                    {/* Certificate Content */}
                    <div className="lg:col-span-3 bg-white border border-gray-400 shadow-lg p-6 sm:p-12 overflow-y-auto">
                        {selectedEmployee ? (
                            <div className="max-w-3xl mx-auto border-4 border-double border-gray-200 p-8 relative">
                                <div className="absolute top-4 right-4 text-[8px] font-bold text-gray-300 rotate-12 uppercase border border-gray-200 p-1">Authorized Copy</div>

                                <div className="text-center mb-8 border-b-2 border-blue-900 pb-6">
                                    <ShieldCheck className="mx-auto text-blue-900 mb-2" size={32} />
                                    <h1 className="text-xl font-black text-blue-900 uppercase tracking-widest">Government of Jamaica</h1>
                                    <h2 className="text-lg font-black text-blue-900 uppercase mt-1">Form P24 - Year End Certificate</h2>
                                    <p className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-widest">Tax Administration Jamaica</p>
                                    <div className="mt-4 bg-blue-900 text-white px-4 py-1 inline-block font-black text-xs">
                                        TAX YEAR: {selectedYear}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-8 border-b border-dashed border-gray-200 pb-8">
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-[8pt] font-black text-gray-400 uppercase tracking-widest block mb-1">Registered Employer</span>
                                            <span className="text-[10pt] font-black text-gray-900 uppercase italic">{selectedCompany?.name || 'SYNCING...'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[8pt] font-black text-gray-400 uppercase tracking-widest block mb-1">Company TRN</span>
                                            <span className="text-[10pt] font-black text-gray-900">{selectedCompany?.trn || '000-000-000'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-[8pt] font-black text-gray-400 uppercase tracking-widest block mb-1">Service Identity</span>
                                            <span className="text-[10pt] font-black text-gray-900 uppercase italic">{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                                        </div>
                                        <div>
                                            <span className="text-[8pt] font-black text-gray-400 uppercase tracking-widest block mb-1">Staff Reference</span>
                                            <span className="text-[10pt] font-black text-gray-900">{selectedEmployee.employeeId}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-sm font-black text-blue-900 uppercase mb-4 italic tracking-tighter">Aggregate Emoluments & Deductions</h3>
                                    <div className="border border-gray-200 overflow-hidden">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-blue-50 text-blue-900 uppercase tracking-widest">
                                                    <th className="p-3 text-left border-b border-gray-200">Description of Sequence</th>
                                                    <th className="p-3 text-right border-b border-gray-200">Aggregate JMD</th>
                                                </tr>
                                            </thead>
                                            <tbody className="font-bold tabular-nums">
                                                <tr className="border-b border-gray-100">
                                                    <td className="p-3 uppercase">Total Gross Emoluments ({yearHistory.length} periods)</td>
                                                    <td className="p-3 text-right">{formatCurrency(aggregates.gross)}</td>
                                                </tr>
                                                <tr className="border-b border-gray-100 text-gray-600 italic">
                                                    <td className="p-3 pl-8 uppercase">NIS Statutory Deduction (3%)</td>
                                                    <td className="p-3 text-right">({formatCurrency(aggregates.nis)})</td>
                                                </tr>
                                                <tr className="border-b border-gray-100 text-gray-600 italic">
                                                    <td className="p-3 pl-8 uppercase">NHT Statutory Deduction (2%)</td>
                                                    <td className="p-3 text-right">({formatCurrency(aggregates.nht)})</td>
                                                </tr>
                                                <tr className="border-b border-gray-100 text-red-700">
                                                    <td className="p-3 uppercase">Income Tax Withheld (PAYE)</td>
                                                    <td className="p-3 text-right">({formatCurrency(aggregates.tax)})</td>
                                                </tr>
                                                <tr className="border-b border-gray-100 text-red-700">
                                                    <td className="p-3 uppercase">Education Tax Withheld (2.25%)</td>
                                                    <td className="p-3 text-right">({formatCurrency(aggregates.edTax)})</td>
                                                </tr>
                                                <tr className="bg-green-50 text-green-900 font-black">
                                                    <td className="p-3 uppercase">Net Emoluments Disbursed</td>
                                                    <td className="p-3 text-right">{formatCurrency(aggregates.net)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="p-6 border-2 border-dashed border-gray-200 bg-gray-50/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Landmark size={16} className="text-gray-400" />
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Authorized Certification</span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 italic leading-relaxed font-bold">
                                        This is to certify that the above mentioned emoluments and deductions have been processed through the official SmartHRM Payroll Engine
                                        in compliance with the Tax Administration Act. This certificate is valid for submission for tax return purposes.
                                    </p>
                                    <div className="mt-8 flex justify-between items-end">
                                        <div className="text-center w-48">
                                            <div className="border-b-2 border-gray-900 font-mono italic text-[10px] pb-1 uppercase">{selectedCompany?.name}</div>
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1 block">Seal of Authority</span>
                                        </div>
                                        <div className="text-right text-[9px] font-black text-gray-400 uppercase italic">
                                            Print Date: {new Date().toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 text-center text-[8px] text-gray-300 uppercase italic tracking-widest">
                                    Serial: {Math.random().toString(16).substr(2, 12).toUpperCase()} | SmartHRM Compliance v4.2
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12">
                                <FileText size={48} className="text-gray-100 mb-4" />
                                <h3 className="text-lg font-black text-gray-300 uppercase italic tracking-widest">Awaiting Identity Selection</h3>
                                <p className="text-gray-400 mt-2 max-w-xs">Please select a staff member from the left index to initialize the P24 Year End Certificate transmission.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default P24Report;

