import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, LogOut, FileText, Loader2, Download } from 'lucide-react';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';

const EmployeeReport = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    useEffect(() => {
        const fetchEmployees = async () => {
            if (!selectedCompany.id) return;
            try {
                setLoading(true);
                const response = await api.fetchEmployees(selectedCompany.id);
                if (response.success) {
                    setEmployees(response.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [selectedCompany.id]);

    const handleExportExcel = () => {
        if (employees.length === 0) return;
        const dataToExport = employees.map(emp => ({
            'Employee ID': emp.employeeId,
            'Name': `${emp.firstName} ${emp.lastName}`,
            'Department': emp.department?.name || '-',
            'Designation': emp.designation,
            'Status': emp.status
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Employee Report');
        XLSX.writeFile(wb, `Employee_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 py-1">
                <span className="font-bold text-gray-700">Employee Report</span>
            </div>
            <div className="flex-1 p-4 overflow-auto relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                )}
                <div className="bg-white border border-gray-400 shadow-inner p-4 min-h-[400px]">
                    <table className="w-full border-collapse">
                        <thead className="bg-[#D4D0C8]">
                            <tr>
                                <th className="border p-2 text-left uppercase tracking-tighter">Employee ID</th>
                                <th className="border p-2 text-left uppercase tracking-tighter">Name</th>
                                <th className="border p-2 text-left uppercase tracking-tighter">Department</th>
                                <th className="border p-2 text-left uppercase tracking-tighter">Designation</th>
                                <th className="border p-2 text-left uppercase tracking-tighter">Status</th>
                            </tr>
                        </thead>
                        <tbody className="font-bold">
                            {employees.length > 0 ? (
                                employees.map(emp => (
                                    <tr key={emp.id} className="odd:bg-blue-50 hover:bg-yellow-50 transition-colors">
                                        <td className="border p-2">{emp.employeeId}</td>
                                        <td className="border p-2">{emp.firstName} {emp.lastName}</td>
                                        <td className="border p-2">{emp.department?.name || '-'}</td>
                                        <td className="border p-2">{emp.designation}</td>
                                        <td className="border p-2">
                                            <span className={emp.status === 'Active' ? 'text-green-700' : 'text-red-600'}>
                                                {emp.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : !loading && (
                                <tr>
                                    <td colSpan="5" className="border p-8 text-center text-gray-400 italic">
                                        No employee records found for this company.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-6 py-2 bg-green-700 border border-green-800 text-white font-bold uppercase tracking-widest text-[10px] shadow-sm active:translate-y-0.5"
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-2 bg-[#316AC5] border border-[#26539a] text-white font-bold uppercase tracking-widest text-[10px] shadow-sm active:translate-y-0.5"
                    >
                        <Printer size={16} />
                        Print
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-600 border border-gray-700 text-white font-bold uppercase tracking-widest text-[10px] shadow-sm active:translate-y-0.5"
                    >
                        <LogOut size={16} />
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeReport;

