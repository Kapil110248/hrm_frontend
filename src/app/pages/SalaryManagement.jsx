import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, Plus, Edit, RefreshCw, X, Search, Folder, DollarSign } from 'lucide-react';
import { api } from '../../services/api';

const SalaryManagement = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // Form fields state
    const [formData, setFormData] = useState({
        employeeId: '', employeeName: '', basicSalary: '', allowances: '', deductions: '', netSalary: '', month: '', year: '', status: 'Pending'
    });

    const [isLoading, setIsLoading] = useState(false);
    const [salaryRecords, setSalaryRecords] = useState([]);
    const [employees, setEmployees] = useState([]);

    const fetchPayrolls = async () => {
        setIsLoading(true);
        try {
            const companyStr = localStorage.getItem('selectedCompany');
            const company = companyStr ? JSON.parse(companyStr) : null;
            const res = await api.fetchPayrolls({ companyId: company?.id });
            if (res.success) {
                setSalaryRecords(res.data.map(r => ({
                    ...r,
                    employeeId: r.employee.employeeId, // Map to user-friendly ID
                    employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
                    basicSalary: r.grossSalary.toString(),
                    allowances: (parseFloat(r.grossSalary) - parseFloat(r.netSalary) + parseFloat(r.deductions)).toString(),
                    deductions: r.deductions.toString(),
                    netSalary: r.netSalary.toString(),
                    month: r.period.split('-')[0], // Assuming MMM-YYYY
                    year: r.period.split('-')[1]
                })));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const companyStr = localStorage.getItem('selectedCompany');
            const company = companyStr ? JSON.parse(companyStr) : null;
            if (company) {
                const res = await api.fetchEmployees(company.id);
                if (res.success) {
                    setEmployees(res.data);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    React.useEffect(() => {
        fetchEmployees();
        fetchPayrolls();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            // Auto-populate employee name when ID is selected
            if (field === 'employeeId') {
                const selectedEmployee = employees.find(e => e.employeeId === value);
                if (selectedEmployee) {
                    updated.employeeName = `${selectedEmployee.firstName} ${selectedEmployee.lastName}`;
                }
            }

            if (['basicSalary', 'allowances', 'deductions'].includes(field)) {
                updated.netSalary = ((parseFloat(updated.basicSalary) || 0) + (parseFloat(updated.allowances) || 0) - (parseFloat(updated.deductions) || 0)).toFixed(2);
            }
            return updated;
        });
    };

    const handleNew = () => {
        setFormData({ employeeId: '', employeeName: '', basicSalary: '', allowances: '', deductions: '', netSalary: '0.00', month: new Date().toLocaleString('default', { month: 'long' }), year: new Date().getFullYear().toString(), status: 'Pending' });
        setSelectedRow(null);
        setIsEditing(true);
    };

    const handleCommit = async () => {
        if (!formData.employeeId) {
            alert('VALIDATION ERROR: Please select an employee from the directory first.');
            return;
        }

        setIsLoading(true);
        try {
            const dataToSave = {
                employeeId: formData.employeeId,
                period: `${formData.month.substring(0, 3).toUpperCase()}-${formData.year}`,
                grossSalary: formData.basicSalary,
                netSalary: formData.netSalary,
                deductions: formData.deductions,
                tax: '0', // Assuming tax is part of deductions or separate
                status: formData.status
            };

            let res;
            if (selectedRow) {
                res = await api.updatePayroll(selectedRow, dataToSave);
            } else {
                res = await api.createPayroll(dataToSave);
            }

            if (res.success) {
                await fetchPayrolls();
                setIsEditing(false);
                handleNew();
                alert(`SUCCESS: Payroll record updated.`);
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert(err.message || "Failed to commit pay record");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmployeeLink = () => {
        const id = prompt("DIRECTORY LOOKUP: Enter Staff ID (e.g. EMP101)");
        const name = prompt("DIRECTORY LOOKUP: Enter Staff Name (e.g. ALAN WAKE)");
        if (id && name) {
            setFormData(prev => ({ ...prev, employeeId: id, employeeName: name.toUpperCase() }));
            setIsEditing(true);
        }
    };

    const handleRowClick = (id) => {
        setSelectedRow(id);
        const record = salaryRecords.find(r => r.id === id);
        if (record) {
            setFormData(record);
            setIsEditing(true);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F5F7] font-sans text-gray-900">
            {/* Header / Action Bar */}
            <div className="bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex flex-col">
                    <h1 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Payroll Disbursement</h1>
                    <p className="text-gray-400 text-[9px] uppercase font-bold tracking-widest">Execution & Ledger Control</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest border border-gray-200 px-2 py-1 rounded">
                        Terminal Status: Secure
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-hidden p-6 flex gap-6">
                {/* Panel 1: Configuration */}
                <section className="w-[400px] flex flex-col gap-4">
                    <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Payroll Parameters</h3>

                        <div className="space-y-4">
                            <Field label="Employee Link">
                                <select
                                    value={formData.employeeId}
                                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-[11px] font-bold text-gray-700 outline-none"
                                >
                                    <option value="">Select from Directory</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.employeeId}>
                                            {emp.employeeId} — {emp.firstName} {emp.lastName}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Employee Name">
                                <input type="text" value={formData.employeeName} readOnly className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-[11px] font-bold text-gray-500 outline-none" />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Month">
                                    <select
                                        value={formData.month}
                                        onChange={(e) => handleInputChange('month', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full p-2 border border-gray-300 rounded text-[11px] font-bold text-gray-900 outline-none"
                                    >
                                        <option value="January">January</option>
                                        <option value="February">February</option>
                                        <option value="March">March</option>
                                        <option value="April">April</option>
                                        <option value="May">May</option>
                                        <option value="June">June</option>
                                        <option value="July">July</option>
                                        <option value="August">August</option>
                                        <option value="September">September</option>
                                        <option value="October">October</option>
                                        <option value="November">November</option>
                                        <option value="December">December</option>
                                    </select>
                                </Field>
                                <Field label="Year">
                                    <select
                                        value={formData.year}
                                        onChange={(e) => handleInputChange('year', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full p-2 border border-gray-300 rounded text-[11px] font-bold text-gray-900 outline-none"
                                    >
                                        {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <Field label="Base Pay (JMD)"><input type="number" value={formData.basicSalary} onChange={(e) => handleInputChange('basicSalary', e.target.value)} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded text-[11px] font-bold text-gray-900 focus:border-gray-500 outline-none" /></Field>
                            <Field label="Allowances"><input type="number" value={formData.allowances} onChange={(e) => handleInputChange('allowances', e.target.value)} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded text-[11px] font-bold text-gray-900 focus:border-gray-500 outline-none" /></Field>
                            <Field label="Deductions"><input type="number" value={formData.deductions} onChange={(e) => handleInputChange('deductions', e.target.value)} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded text-[11px] font-bold text-gray-900 focus:border-gray-500 outline-none" /></Field>

                            <div className="p-4 bg-gray-900 rounded text-right">
                                <span className="block text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Total Net Payable</span>
                                <span className="text-xl font-bold text-white font-mono">${parseFloat(formData.netSalary || 0).toLocaleString()}</span>
                            </div>

                            <Field label="Status">
                                <select value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded text-[11px] font-bold text-gray-700 outline-none appearance-none">
                                    <option value="Pending">PENDING DISPATCH</option>
                                    <option value="Paid">CLEARED / PAID</option>
                                    <option value="Hold">ON HOLD</option>
                                </select>
                            </Field>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleNew} className="p-3 bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:bg-gray-50 transition-colors">Reset Form</button>
                        <button onClick={handleCommit} className="p-3 bg-gray-800 border border-gray-800 rounded text-[10px] font-bold text-white uppercase tracking-widest hover:bg-gray-900 transition-colors shadow-sm">Commit Pay</button>
                    </div>
                </section>

                {/* Panel 2: Ledger */}
                <section className="flex-1 bg-white border border-gray-200 rounded shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Master Payroll Ledger</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase">System Sync: Live</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#F8F9FA] text-[9px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                <tr>
                                    {['ID', 'Employee', 'Period', 'Gross', 'Extras', 'Deduct', 'Net Disbursement'].map(h => (
                                        <th key={h} className="px-6 py-4">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {salaryRecords.map(record => (
                                    <tr key={record.id} onClick={() => handleRowClick(record.id)} className={`cursor-pointer transition-colors ${selectedRow === record.id ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}>
                                        <td className="px-6 py-4 text-[10px] font-bold">{record.employeeId}</td>
                                        <td className="px-6 py-4 text-[10px] font-bold uppercase">{record.employeeName}</td>
                                        <td className="px-6 py-4 text-[10px] font-bold uppercase">{record.month}</td>
                                        <td className="px-6 py-4 text-[10px] font-mono text-right">${parseFloat(record.basicSalary).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-[10px] font-mono text-right text-green-500">${parseFloat(record.allowances).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-[10px] font-mono text-right text-red-500">${parseFloat(record.deductions).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-[10px] font-mono text-right font-bold text-gray-900 group-selected:text-white tabular-nums">${parseFloat(record.netSalary).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            <div className="bg-gray-100 border-t border-gray-200 p-4 flex justify-end gap-3 sticky bottom-0">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-1 bg-white border-2 border-gray-400 text-[11px] font-black text-gray-800 hover:bg-gray-50 transition-all shadow-sm active:translate-y-0.5 group"
                >
                    <LogOut size={14} className="text-gray-600 group-hover:text-red-600" />
                    <span>Close</span>
                </button>
            </div>
        </div>
    );
};

const Field = ({ label, children }) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
        {children}
    </div>
);

export default SalaryManagement;
