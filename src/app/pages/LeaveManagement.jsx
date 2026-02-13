import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, Plus, Edit, RefreshCw, X, Search, Folder, Calendar } from 'lucide-react';
import { api } from '../../services/api';

const LeaveManagement = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // Form fields state
    const [formData, setFormData] = useState({
        employeeId: '',
        employeeName: '',
        leaveType: '',
        startDate: '',
        endDate: '',
        days: '0',
        reason: '',
        status: 'Pending',
        approvedBy: '',
        remarks: ''
    });

    const [searchTerm, setSearchTerm] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [leaveRecords, setLeaveRecords] = useState([]);
    const [employees, setEmployees] = useState([]);

    const fetchLeaves = async () => {
        setIsLoading(true);
        try {
            const companyStr = localStorage.getItem('selectedCompany');
            const company = companyStr ? JSON.parse(companyStr) : null;
            const res = await api.fetchLeaves({ companyId: company?.id });
            if (res.success) {
                setLeaveRecords(res.data.map(r => ({
                    ...r,
                    employeeId: r.employee.employeeId, // Map to user-friendly ID
                    employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
                    leaveType: r.type,
                    startDate: r.startDate.split('T')[0],
                    endDate: r.endDate.split('T')[0]
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
        fetchLeaves();
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

            if (field === 'startDate' || field === 'endDate') {
                if (updated.startDate && updated.endDate) {
                    const start = new Date(updated.startDate);
                    const end = new Date(updated.endDate);
                    if (end >= start) {
                        const diffTime = Math.abs(end - start);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        updated.days = diffDays.toString();
                    } else {
                        updated.days = '0';
                    }
                }
            }
            return updated;
        });
    };

    const handleNew = () => {
        setFormData({
            employeeId: '',
            employeeName: '',
            leaveType: '',
            startDate: '',
            endDate: '',
            days: '0',
            reason: '',
            status: 'Pending',
            approvedBy: '',
            remarks: ''
        });
        setSelectedRow(null);
        setIsEditing(true);
    };

    const handleCommit = async () => {
        if (!formData.employeeId || !formData.leaveType) {
            alert('VALIDATION ERROR: Please ensure Staff ID and Leave Type are provided.');
            return;
        }

        setIsLoading(true);
        try {
            const dataToSave = {
                employeeId: formData.employeeId,
                type: formData.leaveType,
                startDate: formData.startDate,
                endDate: formData.endDate,
                status: formData.status,
                reason: formData.reason
            };

            let res;
            if (selectedRow) {
                res = await api.updateLeave(selectedRow, dataToSave);
            } else {
                res = await api.createLeave(dataToSave);
            }

            if (res.success) {
                await fetchLeaves();
                setIsEditing(false);
                setSelectedRow(null);
                handleNew();
                alert('SUCCESS: System ledger updated.');
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert(err.message || "Failed to commit leave record");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        if (selectedRow) {
            setIsEditing(true);
        } else {
            alert('SELECTION REQUIRED: Please select a record to swap/edit.');
        }
    };

    const handleDelete = async () => {
        if (!selectedRow) {
            alert('SELECTION REQUIRED: Select a record to drop/delete.');
            return;
        }
        if (window.confirm('CRITICAL ACTION: Are you sure you want to drop this record from the ledger?')) {
            setIsLoading(true);
            try {
                const res = await api.deleteLeave(selectedRow);
                if (res.success) {
                    await fetchLeaves();
                    setSelectedRow(null);
                    handleNew();
                }
            } catch (err) {
                alert(err.message || "Failed to delete record");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleFind = () => {
        const id = prompt("FIND RECORD: Enter Staff ID or Name to search:");
        if (id) setSearchTerm(id);
    };

    const handleSync = () => {
        setSearchTerm('');
        alert('SYSTEM SYNC: Data view refreshed.');
    };

    const handleRowClick = (id) => {
        setSelectedRow(id);
        const record = leaveRecords.find(r => r.id === id);
        if (record) {
            setFormData(record);
            setIsEditing(true); // Populate and unlock for editing
        }
    };

    const filteredRecords = leaveRecords.filter(r =>
        r.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs selection:bg-blue-200">
            {/* Header */}
            <header className="bg-gradient-to-b from-[#EEEEEE] to-[#D4D0C8] border-b border-gray-400 p-2 flex items-center justify-between no-print shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-2 pl-2">
                    <Calendar className="text-blue-800 drop-shadow-sm" size={18} />
                    <h1 className="font-black text-gray-700 uppercase italic tracking-tight text-xs sm:text-sm">
                        Leave Management <span className="text-blue-700 tracking-widest ml-1 hidden xs:inline">v2.0</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3 pr-2">
                    <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 bg-white/50 border border-white/60 rounded text-[10px] font-bold text-gray-500 italic">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                        LV-SYSTEM-ACTIVE
                    </div>
                </div>
            </header>

            {/* Main Area - Fixed X-Overflow removed */}
            <main className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
                <div className="max-w-screen-2xl mx-auto flex flex-col xl:flex-row gap-4 sm:gap-6 min-h-full">

                    {/* Panel 1: Data Entry Form */}
                    <section className="flex flex-col gap-4 w-full xl:w-[400px] shrink-0">
                        <div className="bg-white border-2 border-gray-400 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] relative pt-6 p-4">
                            <div className="absolute -top-3 left-4 bg-[#316AC5] text-white px-3 py-1 text-[10px] font-black uppercase italic border border-blue-900 shadow-md transform -skew-x-12 z-10 font-sans">
                                Application Input
                            </div>

                            <div className="grid grid-cols-1 gap-y-4">
                                <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center">
                                    <label className="text-gray-500 font-black text-right uppercase text-[9px] tracking-tighter">ID Tag</label>
                                    <select
                                        value={formData.employeeId}
                                        onChange={(e) => handleInputChange('employeeId', e.target.value)}
                                        className="w-full p-2 border border-gray-300 bg-gray-50 text-blue-900 font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                                        disabled={!isEditing}
                                    >
                                        <option value="">-- SELECT --</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.employeeId}>
                                                {emp.employeeId} - {emp.firstName} {emp.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center">
                                    <label className="text-gray-500 font-black text-right uppercase text-[9px] tracking-tighter">Identity</label>
                                    <input
                                        type="text"
                                        value={formData.employeeName}
                                        onChange={(e) => handleInputChange('employeeName', e.target.value)}
                                        className="w-full p-2 border border-gray-300 bg-gray-50 text-blue-900 font-bold focus:ring-1 focus:ring-blue-500 outline-none shadow-inner"
                                        readOnly
                                        placeholder="Full Name..."
                                    />
                                </div>

                                <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center">
                                    <label className="text-gray-500 font-black text-right uppercase text-[9px] tracking-tighter">Class</label>
                                    <select
                                        value={formData.leaveType}
                                        onChange={(e) => handleInputChange('leaveType', e.target.value)}
                                        className="w-full p-2 border border-gray-300 bg-gray-50 text-blue-900 font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                                        disabled={!isEditing}
                                    >
                                        <option value="">-- SELECT CLASS --</option>
                                        <option value="Annual Leave">Annual (Full Paid)</option>
                                        <option value="Sick Leave">Sick (Medical)</option>
                                        <option value="Casual Leave">Casual (Unpaid)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-gray-400 uppercase ml-1 tracking-widest">Start Block</span>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                            className="w-full p-2 border border-gray-300 bg-blue-50/50 text-blue-900 font-bold outline-none"
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-gray-400 uppercase ml-1 tracking-widest">End Block</span>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                                            className="w-full p-2 border border-gray-300 bg-blue-50/50 text-blue-900 font-bold outline-none"
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center">
                                    <label className="text-gray-500 font-black text-right uppercase text-[9px] tracking-tighter">Net Total</label>
                                    <div className="bg-yellow-50 border border-yellow-200 p-2 text-yellow-800 font-black text-sm text-center shadow-inner italic">
                                        {formData.days || '0'} DAYS
                                    </div>
                                </div>

                                <div className="h-px bg-gray-200 my-1"></div>

                                <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center">
                                    <label className="text-gray-500 font-black text-right uppercase text-[9px] tracking-tighter">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                        className={`w-full p-2 border font-black outline-none ${formData.status === 'Approved' ? 'border-green-400 bg-green-50 text-green-700' :
                                            formData.status === 'Rejected' ? 'border-red-400 bg-red-50 text-red-700' :
                                                'border-gray-300 bg-gray-50 text-gray-700'
                                            }`}
                                        disabled={!isEditing}
                                    >
                                        <option value="Pending">PENDING</option>
                                        <option value="Approved">APPROVED</option>
                                        <option value="Rejected">REJECTED</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Action Toolbar */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 xl:grid-cols-2 gap-2 mt-auto">
                            {[
                                { icon: Search, label: 'Find', color: 'blue', action: handleFind },
                                { icon: X, label: 'Drop', color: 'red', action: handleDelete },
                                { icon: RefreshCw, label: 'Sync', color: 'green', action: handleSync },
                                { icon: Save, label: 'Enter', color: 'blue', action: handleCommit },
                                { icon: Folder, label: 'Log', color: 'gray', action: handleSync },
                                { icon: Plus, label: 'Init', color: 'amber', action: handleNew, primary: true }
                            ].map((btn, idx) => (
                                <button
                                    key={idx}
                                    onClick={btn.action}
                                    className={`flex flex-col items-center justify-center p-2 border-b-2 border-r-2 rounded-sm transition-all active:scale-95 active:border-0 shadow-sm ${btn.primary ? 'ring-2 ring-amber-400 ring-offset-1 bg-[#F9F7F2]' : 'bg-[#E0DCCF]'
                                        } border-gray-500/50 hover:bg-white/80`}
                                >
                                    <btn.icon className={`text-${btn.color}-600 mb-1`} size={16} />
                                    <span className="font-black text-[8px] uppercase tracking-widest">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Panel 2: Ledger Table - X-Overflow removed, fluid layout restored */}
                    <section className="flex-1 min-w-0 flex flex-col overflow-hidden">
                        <div className="bg-white border-2 border-gray-400 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] flex flex-col h-full overflow-hidden">
                            <div className="bg-[#D4D0C8] border-b border-gray-400 p-2 flex items-center justify-between shrink-0">
                                <span className="font-black text-gray-600 uppercase text-[10px] italic tracking-widest pl-2">System Ledger</span>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b border-gray-300 sticky top-0 z-10 shadow-sm">
                                            {['ID CODE', 'STAFF IDENTITY', 'CATEGORY', 'START', 'END', 'QTY', 'STATE'].map(head => (
                                                <th key={head} className="p-3 text-left font-black text-[9px] text-gray-400 uppercase tracking-widest border-r border-gray-200 last:border-0 whitespace-nowrap">
                                                    {head}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredRecords.map((record) => (
                                            <tr
                                                key={record.id}
                                                onClick={() => handleRowClick(record.id)}
                                                className={`group cursor-pointer transition-colors duration-75 ${selectedRow === record.id
                                                    ? 'bg-[#316AC5] text-white'
                                                    : 'hover:bg-blue-50 odd:bg-white even:bg-gray-50/50'
                                                    }`}
                                            >
                                                <td className="p-3 font-bold text-[10px] border-r border-gray-200/40">{record.employeeId}</td>
                                                <td className="p-3 font-black text-[10px] uppercase truncate max-w-[120px] border-r border-gray-200/40 italic">{record.employeeName}</td>
                                                <td className="p-3 font-bold text-[10px] border-r border-gray-200/40">{record.leaveType}</td>
                                                <td className="p-3 font-bold text-[10px] border-r border-gray-200/40 text-gray-400 group-hover:text-blue-600">{record.startDate}</td>
                                                <td className="p-3 font-bold text-[10px] border-r border-gray-200/40 text-gray-400 group-hover:text-blue-600">{record.endDate}</td>
                                                <td className="p-3 text-center border-r border-gray-200/40 shrink-0">
                                                    <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${selectedRow === record.id ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                                                        }`}>
                                                        {record.days}
                                                    </span>
                                                </td>
                                                <td className="p-3 shrink-0">
                                                    <span className={`font-black text-[9px] uppercase tracking-widest ${record.status === 'Approved' ? 'text-green-500' :
                                                        record.status === 'Rejected' ? 'text-red-500' : 'text-amber-500'
                                                        } ${selectedRow === record.id ? 'text-white' : ''}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Final Action - Global Controls */}
                    <div className="flex flex-row xl:flex-col gap-3 w-full xl:w-32 shrink-0 z-30 no-print">
                        <div className="hidden xl:block xl:flex-1"></div>
                        <button
                            onClick={handleCommit}
                            className="flex-1 xl:flex-none flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-600 to-blue-800 border-b-4 border-r-4 border-blue-900 rounded-sm text-white hover:brightness-110 active:scale-95 transition-all shadow-xl"
                        >
                            <Save className={`mb-2 drop-shadow-md ${isEditing ? 'animate-bounce' : ''}`} size={28} />
                            <span className="font-black text-[10px] uppercase italic tracking-[0.2em] leading-none text-center">Commit App</span>
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-1 bg-white border-2 border-gray-400 text-[11px] font-black text-gray-800 hover:bg-gray-50 transition-all shadow-sm active:translate-y-0.5 group"
                        >
                            <LogOut size={14} className="text-gray-600 group-hover:text-red-600" />
                            <span>Close</span>
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default LeaveManagement;
