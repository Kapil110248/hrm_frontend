import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, LogOut, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const SalaryReport = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [salaryData, setSalaryData] = useState([]);
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    useEffect(() => {
        const fetchSalaries = async () => {
            if (!selectedCompany.id) return;
            try {
                setLoading(true);
                const response = await api.fetchPayrolls({ companyId: selectedCompany.id });
                if (response.success) {
                    setSalaryData(response.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSalaries();
    }, [selectedCompany.id]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(val || 0);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs relative">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 py-1">
                <span className="font-bold text-gray-700">Salary Report</span>
            </div>
            <div className="flex-1 p-4 overflow-auto">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                )}
                <div className="bg-white border border-gray-400 shadow-inner p-4 min-h-[400px]">
                    <table className="w-full border-collapse">
                        <thead className="bg-[#D4D0C8]">
                            <tr>
                                <th className="border p-2 text-left uppercase tracking-tighter">Employee ID</th>
                                <th className="border p-2 text-left uppercase tracking-tighter">Name</th>
                                <th className="border p-2 text-left uppercase tracking-tighter">Period</th>
                                <th className="border p-2 text-left uppercase tracking-tighter">Gross Salary</th>
                                <th className="border p-2 text-left uppercase tracking-tighter">Tax / Stat</th>
                                <th className="border p-2 text-left uppercase tracking-tighter">Other Deduct</th>
                                <th className="border p-2 text-left uppercase tracking-tighter font-black">Net Salary</th>
                            </tr>
                        </thead>
                        <tbody className="font-bold">
                            {salaryData.length > 0 ? (
                                salaryData.map(record => (
                                    <tr key={record.id} className="odd:bg-blue-50 hover:bg-yellow-50 transition-colors">
                                        <td className="border p-2">{record.employee?.employeeId || '-'}</td>
                                        <td className="border p-2">{record.employee?.firstName} {record.employee?.lastName}</td>
                                        <td className="border p-2">{record.period}</td>
                                        <td className="border p-2 text-right">{formatCurrency(record.grossSalary)}</td>
                                        <td className="border p-2 text-right text-red-600">({formatCurrency(record.tax)})</td>
                                        <td className="border p-2 text-right text-red-600">{formatCurrency(record.deductions)}</td>
                                        <td className="border p-2 text-right text-blue-900 font-black">{formatCurrency(record.netSalary)}</td>
                                    </tr>
                                ))
                            ) : !loading && (
                                <tr>
                                    <td colSpan="7" className="border p-12 text-center text-gray-400 italic">
                                        No payroll records discovered for this company.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex gap-2 mt-4">
                    <button className="flex items-center gap-2 px-6 py-2 bg-[#316AC5] border border-[#26539a] text-white font-bold uppercase tracking-widest text-[10px] shadow-sm active:translate-y-0.5">
                        <Printer size={16} />
                        Print
                    </button>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-6 py-2 bg-gray-600 border border-gray-700 text-white font-bold uppercase tracking-widest text-[10px] shadow-sm active:translate-y-0.5">
                        <LogOut size={16} />
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalaryReport;

