import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, Plus, Edit, RefreshCw, X, Search, Folder, Clock } from 'lucide-react';
import { api } from '../../services/api';

const AttendanceManagement = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        employeeId: '', employeeName: '', date: selectedDate, checkIn: '', checkOut: '', hoursWorked: '0.00', status: 'Present', remarks: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [employees, setEmployees] = useState([]);

    const fetchAttendance = async () => {
        setIsLoading(true);
        try {
            const companyStr = localStorage.getItem('selectedCompany');
            const company = companyStr ? JSON.parse(companyStr) : null;
            const res = await api.fetchAttendance({ date: selectedDate, companyId: company?.id });
            if (res.success) {
                setAttendanceRecords(res.data.map(r => ({
                    ...r,
                    employeeId: r.employee.employeeId, // Map to user-friendly ID
                    employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
                    hoursWorked: r.hours.toString()
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
            console.log('Selected Company:', company);

            if (company) {
                console.log('Fetching employees for company ID:', company.id);
                const res = await api.fetchEmployees(company.id);
                console.log('API Response:', res);

                if (res.success) {
                    console.log('Employees loaded:', res.data);
                    console.log('Employee count:', res.data.length);
                    if (res.data.length > 0) {
                        console.log('First employee structure:', res.data[0]);
                        console.log('First employee ID:', res.data[0].employeeId);
                        console.log('First employee name:', res.data[0].firstName, res.data[0].lastName);
                    }
                    setEmployees(res.data);
                } else {
                    console.error('Failed to fetch employees:', res.message);
                }
            } else {
                console.error('No company selected');
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    React.useEffect(() => {
        fetchEmployees();
    }, []); // Fetch employees only once on mount

    React.useEffect(() => {
        fetchAttendance();
    }, [selectedDate]);

    const calculateHours = (inTime, outTime) => {
        if (!inTime || !outTime) return '0.00';
        const start = new Date(`2000-01-01 ${inTime}`);
        const end = new Date(`2000-01-01 ${outTime}`);
        if (end < start) return '0.00';
        const diff = (end - start) / (1000 * 60 * 60);
        return diff.toFixed(2);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Auto-populate employee name when ID is selected
            if (field === 'employeeId') {
                const selectedEmployee = employees.find(e => e.employeeId === value);
                if (selectedEmployee) {
                    newData.employeeName = `${selectedEmployee.firstName} ${selectedEmployee.lastName}`;
                }
            }

            if (field === 'checkIn' || field === 'checkOut') {
                newData.hoursWorked = calculateHours(newData.checkIn, newData.checkOut);
            }
            return newData;
        });
    };

    const handleNew = () => {
        setFormData({ employeeId: '', employeeName: '', date: selectedDate, checkIn: '', checkOut: '', hoursWorked: '0.00', status: 'Present', remarks: '' });
        setSelectedRow(null);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!formData.employeeId) {
            alert("REQUIRED: Staff ID is mandatory.");
            return;
        }

        setIsLoading(true);
        try {
            const dataToSave = {
                employeeId: formData.employeeId,
                date: formData.date,
                checkIn: formData.checkIn,
                checkOut: formData.checkOut,
                hours: formData.hoursWorked,
                status: formData.status,
                remarks: formData.remarks
            };

            let res;
            if (selectedRow) {
                res = await api.updateAttendance(selectedRow, dataToSave);
            } else {
                res = await api.createAttendance(dataToSave);
            }

            if (res.success) {
                await fetchAttendance();
                setIsEditing(false);
                setFormData({ employeeId: '', employeeName: '', date: selectedDate, checkIn: '', checkOut: '', hoursWorked: '0.00', status: 'Present', remarks: '' });
                setSelectedRow(null);
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert(err.message || "Failed to save record");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedRow) return;
        if (window.confirm("DELETE: Remove this attendance record from the register?")) {
            setIsLoading(true);
            try {
                const res = await api.deleteAttendance(selectedRow);
                if (res.success) {
                    await fetchAttendance();
                    setSelectedRow(null);
                    setFormData({ employeeId: '', employeeName: '', date: selectedDate, checkIn: '', checkOut: '', hoursWorked: '0.00', status: 'Present', remarks: '' });
                }
            } catch (err) {
                alert(err.message || "Failed to delete record");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleRowClick = (id) => {
        setSelectedRow(id);
        const record = attendanceRecords.find(r => r.id === id);
        if (record) {
            setFormData(record);
            setIsEditing(true);
        }
    };

    const filteredRecords = attendanceRecords.filter(r => {
        const matchesSearch = r.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) || r.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F5F7] font-sans text-gray-900">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex flex-col">
                    <h1 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Attendance Register</h1>
                    <p className="text-gray-400 text-[9px] uppercase font-bold tracking-widest">Timesheet & Presence Control</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Review Date</label>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-1.5 border border-gray-200 rounded text-[10px] font-bold text-gray-700 outline-none" />
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-hidden p-6 flex gap-6">
                {/* Entry Panel */}
                <section className="w-[380px] flex flex-col gap-4 shrink-0">
                    <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Shift Parameters</h3>
                        <div className="space-y-4">
                            <Field label={`Staff ID (${employees.length} employees)`}>
                                <select value={formData.employeeId} onChange={(e) => handleInputChange('employeeId', e.target.value)} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded text-[11px] font-bold text-gray-900 outline-none focus:border-gray-500">
                                    <option value="">Select...</option>
                                    {employees.length === 0 ? (
                                        <option disabled>No employees found</option>
                                    ) : (
                                        employees.map(emp => (
                                            <option key={emp.id} value={emp.employeeId}>
                                                {emp.employeeId} - {emp.firstName} {emp.lastName}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </Field>
                            <Field label="Staff Name"><input type="text" value={formData.employeeName} onChange={(e) => handleInputChange('employeeName', e.target.value)} disabled className="w-full p-2 border border-gray-300 rounded text-[11px] font-bold text-gray-900 outline-none focus:border-gray-500 bg-gray-50" /></Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="In Location"><input type="time" value={formData.checkIn} onChange={(e) => handleInputChange('checkIn', e.target.value)} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded text-[11px] font-bold text-gray-900 outline-none" /></Field>
                                <Field label="Out Location"><input type="time" value={formData.checkOut} onChange={(e) => handleInputChange('checkOut', e.target.value)} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded text-[11px] font-bold text-gray-900 outline-none" /></Field>
                            </div>

                            <Field label="Status">
                                <select value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded text-[11px] font-bold text-gray-700 outline-none appearance-none">
                                    <option value="Present">PRESENT / NORMAL</option>
                                    <option value="Absent">ABSENT / UNAUTH</option>
                                    <option value="Late">LATE ARRIVAL</option>
                                    <option value="Leave">APPROVED LEAVE</option>
                                </select>
                            </Field>

                            <Field label="Operation Remarks"><textarea value={formData.remarks} onChange={(e) => handleInputChange('remarks', e.target.value)} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded text-[11px] font-medium text-gray-700 outline-none h-20" /></Field>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleSave}
                            className="w-full p-3 bg-blue-600 border border-blue-700 rounded text-[10px] font-black text-white uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md active:translate-y-0.5"
                        >
                            {selectedRow ? 'Update Record' : 'Save Record'}
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={handleNew} className="p-3 bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm">New / Clear</button>
                            <button
                                onClick={handleDelete}
                                disabled={!selectedRow}
                                className={`p-3 border rounded text-[10px] font-bold uppercase tracking-widest transition-all ${selectedRow ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'}`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </section>

                {/* Ledger Panel */}
                <section className="flex-1 bg-white border border-gray-200 rounded shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 text-gray-300" size={12} />
                            <input type="text" placeholder="Quick Search Employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded text-[10px] font-medium outline-none" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic pr-2">Daily Presence Log</span>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#F8F9FA] text-[9px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 w-24">Emp ID</th>
                                    <th className="px-6 py-4">Staff Member</th>
                                    <th className="px-6 py-4 w-24">Login</th>
                                    <th className="px-6 py-4 w-24">Logout</th>
                                    <th className="px-6 py-4 w-32 text-right">Computed Hrs</th>
                                    <th className="px-6 py-4 w-32 text-center">Record Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {filteredRecords.map(record => (
                                    <tr key={record.id} onClick={() => handleRowClick(record.id)} className={`cursor-pointer transition-all ${selectedRow === record.id ? 'bg-gray-800 text-white' : 'hover:bg-blue-50/50'}`}>
                                        <td className="px-6 py-4 text-[10px] font-bold font-mono text-blue-900 group-hover:text-blue-600">{record.employeeId}</td>
                                        <td className="px-6 py-4 text-[10px] font-black uppercase tracking-tight">{record.employeeName}</td>
                                        <td className="px-6 py-4 text-[10px] font-mono opacity-60">{record.checkIn || '--:--'}</td>
                                        <td className="px-6 py-4 text-[10px] font-mono opacity-60">{record.checkOut || '--:--'}</td>
                                        <td className="px-6 py-4 text-[11px] font-black text-right tabular-nums">{record.hoursWorked}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-[8px] font-black tracking-widest uppercase shadow-sm border ${record.status === 'Present' ? 'bg-green-100 text-green-700 border-green-200' :
                                                record.status === 'Absent' ? 'bg-red-100 text-red-700 border-red-200' :
                                                    record.status === 'Late' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                        'bg-blue-100 text-blue-700 border-blue-200'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {/* Filler Rows for professional look */}
                                {[...Array(Math.max(0, 8 - filteredRecords.length))].map((_, i) => (
                                    <tr key={`filler-${i}`} className="border-b border-gray-50 opacity-20">
                                        <td colSpan={6} className="py-6"></td>
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

export default AttendanceManagement;

