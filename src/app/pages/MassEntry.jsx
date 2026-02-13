import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, RefreshCw, Upload, Download, Trash2, Filter } from 'lucide-react';
import { api } from '../../services/api';

const MassEntry = () => {
    const navigate = useNavigate();
    const [selectedCompany, setSelectedCompany] = useState(null);

    // Filter State
    const [filters, setFilters] = useState({
        payCycle: '2026 - Weekly - 06',
        transType: 'Regular Hours',
        department: '' // Empty means all
    });

    const [entries, setEntries] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [originalEmployees, setOriginalEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const storedCompany = localStorage.getItem('selectedCompany');
        if (storedCompany) {
            setSelectedCompany(JSON.parse(storedCompany));
        }
    }, []);

    useEffect(() => {
        if (selectedCompany?.id) {
            loadDepartments();
        }
    }, [selectedCompany]);

    const loadDepartments = async () => {
        try {
            const res = await api.fetchDepartments(selectedCompany.id);
            if (res.data) {
                setDepartments(res.data);
            }
        } catch (error) {
            console.error("Failed to load departments", error);
        }
    };

    const handleLoadEmployees = async () => {
        if (!selectedCompany?.id) return;
        setIsLoading(true);
        try {
            const res = await api.fetchEmployees(selectedCompany.id);
            if (res.data) {
                let emps = res.data;
                // Filter by department if selected
                if (filters.department) {
                    emps = emps.filter(e => e.department?.name === filters.department);
                }

                // Map to grid format
                const loadedData = emps.map(emp => ({
                    id: emp.id,
                    empId: emp.employeeId,
                    name: `${emp.firstName} ${emp.lastName}`,
                    department: emp.department?.name || 'N/A',
                    hours: 0,
                    rate: parseFloat(emp.hourlyRate || emp.baseSalary || 0), // Default to some rate
                    amount: 0,
                    employeeId: emp.employeeId // Keep strictly for ID ref
                }));

                setEntries(loadedData);
                setOriginalEmployees(emps);
            }
        } catch (error) {
            console.error("Failed to load employees", error);
            alert("Failed to load employees");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (id, field, value) => {
        const numValue = parseFloat(value) || 0;
        setEntries(prev => prev.map(entry => {
            if (entry.id === id) {
                const updated = { ...entry, [field]: numValue };
                // Auto-calculate amount
                updated.amount = (updated.hours * updated.rate);
                return updated;
            }
            return entry;
        }));
    };

    const handleDownloadTemplate = () => {
        const headers = "EmployeeID,Name,Hours,Rate,Amount\n";
        const dummyData = "EMP001,JOHN BROWN,40,2500,100000\nEMP002,SARAH SMITH,35,2800,98000";
        const blob = new Blob([headers + dummyData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `hrm_mass_entry_template_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-JM', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    };

    const handleSave = async () => {
        const activeEntries = entries.filter(e => e.amount > 0);
        if (activeEntries.length === 0) {
            alert("SYSTEM ERROR: No valid transaction data detected in grid.");
            return;
        }

        setIsSaving(true);
        try {
            // Map entries to transaction payload
            // Determine type and code based on selected filter
            let type = 'EARNING';
            let code = 'REG';
            if (filters.transType.includes('Overtime')) { code = 'OT15'; }
            else if (filters.transType.includes('Bonus')) { code = 'BONUS'; }
            else if (filters.transType.includes('Travel')) { type = 'ALLOWANCE'; code = 'TRAVEL'; }

            const payload = {
                transactions: activeEntries.map(e => ({
                    companyId: selectedCompany.id,
                    employeeId: e.empId, // Using employeeId string (e.g. EMP001) as expected by backend logic lookup
                    transactionDate: new Date().toISOString(),
                    type: type,
                    code: code,
                    description: filters.transType,
                    amount: e.amount,
                    units: e.hours,
                    rate: e.rate,
                    status: 'ENTERED',
                    period: filters.payCycle
                }))
            };

            const res = await api.bulkCreateTransactions(payload);
            if (res.success) {
                alert(`COMMIT SUCCESS: ${res.data.created} records securely posted to the general ledger for ${filters.payCycle}.`);
                // Clear grid or reset values?
                setEntries(prev => prev.map(e => ({ ...e, hours: 0, amount: 0 })));
            } else {
                alert("Creation failed: " + res.message);
            }

        } catch (error) {
            console.error("Save failed", error);
            alert("An error occurred while saving transactions.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleSelectAll = () => {
        if (selectedIds.length === entries.length && entries.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(entries.map(e => e.id));
        }
    };

    const handleToggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleClearSelected = () => {
        if (selectedIds.length === 0) return;
        setEntries(prev => prev.map(e =>
            selectedIds.includes(e.id) ? { ...e, hours: 0, amount: 0 } : e
        ));
        setSelectedIds([]); // Clear selection after resetting
    };

    if (!selectedCompany) return <div className="p-4">Please select a company first.</div>;

    return (
        <div className="h-[calc(100vh-70px)] flex flex-col bg-[#EBE9D8] font-sans overflow-hidden">

            {/* 1. Header & Filters Panel */}
            <div className="bg-[#EBE9D8] border-b border-white p-2 shadow-sm shrink-0">
                <div className="flex items-center justify-between mb-3 border-b border-gray-400 pb-2">
                    <h1 className="text-[#0B4FD7] font-black text-lg uppercase tracking-wider flex items-center gap-2">
                        <Filter size={18} /> Mass Transaction Entry
                    </h1>
                    <div className="text-xs font-bold text-gray-500">
                        BATCH: <span className="text-black">FEB-2025-01</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Pay Cycle</label>
                        <select
                            value={filters.payCycle}
                            onChange={(e) => setFilters({ ...filters, payCycle: e.target.value })}
                            className="border border-gray-400 p-1 bg-white shadow-inner font-semibold outline-none focus:border-[#0B4FD7]"
                        >
                            <option>2026 - Weekly - 06</option>
                            <option>2026 - Monthly - 02</option>
                            <option>Feb-2026</option>
                            <option>Jan-2026</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Transaction Type</label>
                        <select
                            value={filters.transType}
                            onChange={(e) => setFilters({ ...filters, transType: e.target.value })}
                            className="border border-gray-400 p-1 bg-white shadow-inner font-semibold outline-none focus:border-[#0B4FD7]"
                        >
                            <option>Regular Hours</option>
                            <option>Overtime (1.5x)</option>
                            <option>Bonus (Flat Amount)</option>
                            <option>Travel Allowance</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Department</label>
                        <select
                            value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                            className="border border-gray-400 p-1 bg-white shadow-inner font-semibold outline-none focus:border-[#0B4FD7]"
                        >
                            <option value="">-- All Departments --</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleLoadEmployees}
                            disabled={isLoading}
                            className="w-full bg-[#EBE9D8] border border-gray-400 shadow-[1px_1px_0_rgba(0,0,0,0.2)] px-4 py-1.5 active:translate-y-0.5 active:shadow-inner text-xs font-bold hover:bg-white transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={12} className={`inline mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'LOADING...' : 'LOAD EMPLOYEES'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Data Grid */}
            <div className="flex-1 p-3 overflow-hidden flex flex-col min-h-0">
                <div className="bg-white border border-gray-500 shadow-inner flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                    <table className="w-full text-xs border-collapse relative">
                        <thead className="sticky top-0 bg-[#D4D0C8] z-10 shadow-sm">
                            <tr>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-8 text-center bg-gray-100 z-20">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === entries.length && entries.length > 0}
                                        onChange={handleToggleSelectAll}
                                        className="cursor-pointer"
                                    />
                                </th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-10 text-center text-gray-700">#</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-24 text-left text-gray-700">Emp ID</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 text-left text-gray-700">Employee Name</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 text-left w-32 text-gray-700">Department</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-24 text-right text-gray-700">Hours/Qty</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-24 text-right text-gray-700">Rate</th>
                                <th className="border-b border-gray-400 px-2 py-2 w-32 text-right text-gray-700">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.length > 0 ? (
                                entries.map((entry, index) => (
                                    <tr key={entry.id} className={`${selectedIds.includes(entry.id) ? 'bg-blue-50/50' : ''} hover:bg-blue-50 group transition-colors`}>
                                        <td className="border-r border-b border-gray-200 px-2 py-1 text-center font-bold text-gray-500">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(entry.id)}
                                                onChange={() => handleToggleSelect(entry.id)}
                                                className="cursor-pointer"
                                            />
                                        </td>
                                        <td className="border-r border-b border-gray-200 px-2 py-1 text-center bg-gray-50 font-bold text-gray-500">{index + 1}</td>
                                        <td className="border-r border-b border-gray-200 px-2 py-1 font-mono font-bold text-gray-700">{entry.empId}</td>
                                        <td className="border-r border-b border-gray-200 px-2 py-1 font-bold">{entry.name}</td>
                                        <td className="border-r border-b border-gray-200 px-2 py-1 text-gray-600">{entry.department}</td>
                                        <td className="border-r border-b border-gray-200 px-0 py-0.5 bg-white">
                                            <input
                                                type="number"
                                                value={entry.hours}
                                                onChange={(e) => handleInputChange(entry.id, 'hours', e.target.value)}
                                                className="w-full text-right px-2 py-1 outline-none border-2 border-transparent focus:border-[#0B4FD7] bg-transparent font-mono focus:bg-white transition-all"
                                            />
                                        </td>
                                        <td className="border-r border-b border-gray-200 px-0 py-0.5 bg-white">
                                            <input
                                                type="number"
                                                value={entry.rate}
                                                onChange={(e) => handleInputChange(entry.id, 'rate', e.target.value)}
                                                className="w-full text-right px-2 py-1 outline-none border-2 border-transparent focus:border-[#0B4FD7] bg-transparent font-mono focus:bg-white text-gray-600 transition-all"
                                            />
                                        </td>
                                        <td className="border-b border-gray-200 px-2 py-1 text-right font-mono font-bold bg-[#EBE9D8]/30 text-[#0B4FD7]">
                                            {formatCurrency(entry.amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-gray-400 font-bold italic">
                                        Select filters and click "LOAD EMPLOYEES" to start
                                    </td>
                                </tr>
                            )}

                            {[...Array(Math.max(0, 15 - entries.length))].map((_, i) => (
                                <tr key={`empty-${i}`}>
                                    <td className="border-r border-b border-gray-100 px-2 py-1 text-center bg-gray-50 text-gray-300"></td>
                                    <td className="border-r border-b border-gray-100 px-2 py-4"></td>
                                    <td className="border-r border-b border-gray-100 px-2 py-4"></td>
                                    <td className="border-r border-b border-gray-100 px-2 py-4"></td>
                                    <td className="border-r border-b border-gray-100 px-2 py-4"></td>
                                    <td className="border-r border-b border-gray-100 px-2 py-4"></td>
                                    <td className="border-r border-b border-gray-100 px-2 py-4"></td>
                                    <td className="border-b border-gray-100 px-2 py-4 bg-gray-50/20"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. Action Footer */}
            <div className="bg-[#EBE9D8] border-t border-white p-2 flex justify-between items-center shadow-[0_-2px_4px_rgba(0,0,0,0.05)] shrink-0 z-20">
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/processing/import-saved')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#EBE9D8] border-2 border-white border-r-gray-400 border-b-gray-400 shadow-sm active:border-t-gray-400 active:border-l-gray-400 active:border-r-white active:border-b-white text-xs font-bold hover:bg-gray-50 active:translate-y-0.5 uppercase transition-all"
                    >
                        <Upload size={14} className="text-blue-700" /> Import CSV
                    </button>
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#EBE9D8] border-2 border-white border-r-gray-400 border-b-gray-400 shadow-sm active:border-t-gray-400 active:border-l-gray-400 active:border-r-white active:border-b-white text-xs font-bold hover:bg-gray-50 active:translate-y-0.5 uppercase transition-all"
                    >
                        <Download size={14} className="text-green-700" /> Template
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleClearSelected}
                        disabled={selectedIds.length === 0}
                        className={`flex items-center gap-1.5 px-4 py-2 bg-[#EBE9D8] border-2 border-white border-r-gray-400 border-b-gray-400 shadow-sm active:border-t-gray-400 active:border-l-gray-400 active:border-r-white active:border-b-white text-xs font-bold transition-all uppercase ${selectedIds.length === 0 ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:bg-red-50 text-red-700 active:translate-y-0.5'}`}
                    >
                        <Trash2 size={14} /> Clear Selected
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex items-center gap-1.5 px-6 py-2 border-2 border-blue-400 border-r-blue-800 border-b-blue-800 shadow-sm active:border-t-blue-800 active:border-l-blue-800 active:border-r-blue-400 active:border-b-blue-400 text-xs font-bold transition-all ml-4 uppercase ${isSaving ? 'bg-gray-400 text-gray-200 border-gray-500 cursor-not-allowed' : 'bg-[#0B4FD7] text-white hover:bg-[#003CB3] active:translate-y-0.5'}`}
                    >
                        {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                        {isSaving ? 'Processing...' : 'Save Transactions'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MassEntry;
