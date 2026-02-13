import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, RefreshCw, Edit3 } from 'lucide-react';
import { api } from '../../services/api';

const MassUpdating = () => {
    const navigate = useNavigate();
    const [selectedCompany, setSelectedCompany] = useState(null);

    const [filters, setFilters] = useState({
        department: '',
        status: 'Active'
    });

    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const storedCompany = localStorage.getItem('selectedCompany');
        if (storedCompany) {
            setSelectedCompany(JSON.parse(storedCompany));
        }
    }, []);

    useEffect(() => {
        if (selectedCompany?.id) {
            loadData();
        }
    }, [selectedCompany]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [deptRes, empRes] = await Promise.all([
                api.fetchDepartments(selectedCompany.id),
                api.fetchEmployees(selectedCompany.id)
            ]);

            if (deptRes.data) {
                setDepartments(deptRes.data);
            }

            if (empRes.data) {
                // Map to grid format
                const loaded = empRes.data.map(emp => {
                    const rate = parseFloat(emp.baseSalary || emp.hourlyRate || 0);
                    return {
                        id: emp.id,
                        empId: emp.employeeId,
                        name: `${emp.firstName} ${emp.lastName}`,
                        department: emp.department?.name || '',
                        departmentId: emp.departmentId,
                        rate: rate,
                        status: emp.status,
                        newRate: rate,
                        newDept: emp.department?.name || '', // We use name for UI selector, will map back to ID on save
                        salaryType: emp.salaryType
                    };
                });
                setEmployees(loaded);
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (id, field, value) => {
        setEmployees(prev => prev.map(emp =>
            emp.id === id ? { ...emp, [field]: value } : emp
        ));
    };

    const handleUpdateAll = (field, value) => {
        const confirmUpdate = window.confirm(`Are you sure you want to update ${field} for ALL displayed employees?`);
        if (confirmUpdate) {
            // Only update visible employees based on filters
            const targetIds = filteredEmployees.map(e => e.id);
            setEmployees(prev => prev.map(emp =>
                targetIds.includes(emp.id) ? { ...emp, [field]: value } : emp
            ));
        }
    };

    const handleSave = async () => {
        const changed = employees.filter(e => e.rate !== e.newRate || e.department !== e.newDept);
        if (changed.length === 0) {
            alert("No changes detected.");
            return;
        }

        setIsSaving(true);
        try {
            // Prepare updates
            const updates = changed.map(e => {
                const updatePayload = {
                    id: e.id,
                };

                if (e.rate !== e.newRate) {
                    if (e.salaryType === 'Hourly') {
                        updatePayload.hourlyRate = parseFloat(e.newRate);
                    } else {
                        updatePayload.baseSalary = parseFloat(e.newRate);
                    }
                }

                if (e.department !== e.newDept) {
                    const newDeptObj = departments.find(d => d.name === e.newDept);
                    updatePayload.departmentId = newDeptObj ? newDeptObj.id : null;
                }

                return updatePayload;
            });

            const res = await api.bulkUpdateEmployees({ updates });
            if (res.success) {
                alert(`Successfully updated employee records.`);
                // Refresh data
                loadData();
            } else {
                alert("Update failed: " + res.message);
            }

        } catch (error) {
            console.error("Save failed", error);
            alert("An error occurred while saving updates.");
        } finally {
            setIsSaving(false);
        }
    };

    // Filter logic for render
    const filteredEmployees = employees.filter(e => {
        if (filters.department && e.department !== filters.department) return false;
        if (filters.status !== 'All') {
            if (filters.status === 'Active' && e.status !== 'Active') return false;
            if (filters.status === 'On Leave' && e.status !== 'On Leave') return false; // assuming 'On Leave' status text
        }
        return true;
    });

    if (!selectedCompany) return <div className="p-4">Please select a company first.</div>;

    return (
        <div className="h-[calc(100vh-70px)] flex flex-col bg-[#EBE9D8] font-sans overflow-hidden">

            {/* 1. Header & Filters */}
            <div className="bg-[#EBE9D8] border-b border-white p-2 shadow-sm shrink-0">
                <div className="flex items-center justify-between mb-3 border-b border-gray-400 pb-2">
                    <h1 className="text-[#0B4FD7] font-black text-lg uppercase tracking-wider flex items-center gap-2">
                        <Edit3 size={18} /> Mass Employee Update
                    </h1>
                    <div className="text-xs font-bold text-gray-500">
                        MODE: <span className="text-black">BULK EDIT</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Filter Department</label>
                        <select
                            value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                            className="border border-gray-400 p-1 bg-white shadow-inner font-semibold outline-none focus:border-[#0B4FD7]"
                        >
                            <option value="">-- All Departments --</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Filter Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="border border-gray-400 p-1 bg-white shadow-inner font-semibold outline-none focus:border-[#0B4FD7]"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active Only</option>
                            <option value="On Leave">On Leave</option>
                        </select>
                    </div>

                    {/* Bulk Actions Header */}
                    <div className="col-span-2 flex items-end gap-2">
                        <button
                            onClick={() => {
                                const rate = prompt("Enter new rate for ALL visible employees:");
                                if (rate) handleUpdateAll('newRate', parseFloat(rate));
                            }}
                            className="bg-white border border-gray-400 px-3 py-1.5 shadow-sm text-xs font-bold hover:bg-blue-50 text-blue-800"
                        >
                            SET ALL RATES
                        </button>
                        <button
                            onClick={() => {
                                // For department, ideally showing a modal with dropdown, but prompt is okay for now if typing name exact
                                // Better: prompt for name, but maybe just set the dropdown?
                                // Let's use a simple prompt for now, or just setting to the *filter* value if set?
                                // Prompt is risky for exact matching. 
                                // Let's assume user types it.
                                const deptName = prompt("Enter new department Name exactly:");
                                if (deptName) handleUpdateAll('newDept', deptName);
                            }}
                            className="bg-white border border-gray-400 px-3 py-1.5 shadow-sm text-xs font-bold hover:bg-blue-50 text-blue-800"
                        >
                            SET ALL DEPTS
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Data Grid */}
            <div className="flex-1 p-3 overflow-hidden flex flex-col min-h-0">
                <div className="bg-white border border-gray-500 shadow-inner flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                    {isLoading ? (
                        <div className="p-10 text-center font-bold text-gray-400">Loading directory...</div>
                    ) : (
                        <table className="w-full text-xs border-collapse relative">
                            <thead className="sticky top-0 bg-[#D4D0C8] z-10 shadow-sm">
                                <tr>
                                    <th className="border-r border-b border-gray-400 px-2 py-2 w-10 text-center">#</th>
                                    <th className="border-r border-b border-gray-400 px-2 py-2 w-24 text-left">Emp ID</th>
                                    <th className="border-r border-b border-gray-400 px-2 py-2 text-left">Name</th>
                                    <th className="border-r border-b border-gray-400 px-2 py-2 text-left w-32 bg-gray-200 text-gray-500">Current Dept</th>
                                    <th className="border-r border-b border-gray-400 px-2 py-2 text-left w-32 bg-blue-50 text-[#0B4FD7]">New Dept</th>
                                    <th className="border-r border-b border-gray-400 px-2 py-2 w-24 text-right bg-gray-200 text-gray-500">Current Rate</th>
                                    <th className="border-b border-gray-400 px-2 py-2 w-24 text-right bg-blue-50 text-[#0B4FD7]">New Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((emp, index) => {
                                    const isChanged = emp.rate !== emp.newRate || emp.department !== emp.newDept;
                                    return (
                                        <tr key={emp.id} className={`hover:bg-blue-50 group ${isChanged ? 'bg-yellow-50' : ''}`}>
                                            <td className="border-r border-b border-gray-200 px-2 py-1 text-center bg-gray-50 font-bold text-gray-500">{index + 1}</td>
                                            <td className="border-r border-b border-gray-200 px-2 py-1 font-mono font-bold text-gray-700">{emp.empId}</td>
                                            <td className="border-r border-b border-gray-200 px-2 py-1 font-bold">{emp.name}</td>

                                            {/* Read-only Current Values */}
                                            <td className="border-r border-b border-gray-200 px-2 py-1 text-gray-400 bg-gray-50/50">{emp.department}</td>

                                            {/* Editable New Values */}
                                            <td className="border-r border-b border-gray-200 px-0 py-0.5 bg-white">
                                                <select
                                                    value={emp.newDept}
                                                    onChange={(e) => handleInputChange(emp.id, 'newDept', e.target.value)}
                                                    className={`w-full px-2 py-1 outline-none border-2 border-transparent focus:border-[#0B4FD7] bg-transparent font-bold ${emp.department !== emp.newDept ? 'text-[#0B4FD7]' : 'text-gray-800'}`}
                                                >
                                                    <option value="">Select...</option>
                                                    {departments.map(d => (
                                                        <option key={d.id} value={d.name}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            <td className="border-r border-b border-gray-200 px-2 py-1 text-right text-gray-400 bg-gray-50/50">{emp.rate.toFixed(2)}</td>

                                            <td className="border-b border-gray-200 px-0 py-0.5 bg-white">
                                                <input
                                                    type="number"
                                                    value={emp.newRate}
                                                    onChange={(e) => handleInputChange(emp.id, 'newRate', parseFloat(e.target.value))}
                                                    className={`w-full text-right px-2 py-1 outline-none border-2 border-transparent focus:border-[#0B4FD7] bg-transparent font-mono font-bold ${emp.rate !== emp.newRate ? 'text-[#0B4FD7]' : 'text-gray-800'}`}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* 3. Footer Actions */}
            <div className="bg-[#EBE9D8] border-t border-white p-2 flex justify-end items-center shadow-[0_-2px_4px_rgba(0,0,0,0.05)] shrink-0 z-20">
                <button
                    onClick={() => setEmployees(employees.map(e => ({ ...e, newRate: e.rate, newDept: e.department })))}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#EBE9D8] border-2 border-white border-r-gray-400 border-b-gray-400 shadow-sm active:border-t-gray-400 active:border-l-gray-400 active:border-r-white active:border-b-white text-xs font-bold hover:bg-gray-50 text-gray-600 active:translate-y-0.5 uppercase mr-2"
                >
                    <RefreshCw size={14} /> Reset Changes
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-6 py-2 bg-[#0B4FD7] text-white border-2 border-blue-400 border-r-blue-800 border-b-blue-800 shadow-sm active:border-t-blue-800 active:border-l-blue-800 active:border-r-blue-400 active:border-b-blue-400 text-xs font-bold hover:bg-[#003CB3] active:translate-y-0.5 uppercase disabled:bg-gray-400"
                >
                    <Save size={14} className={isSaving ? "animate-spin" : ""} /> {isSaving ? "Saving..." : "Apply Updates"}
                </button>
            </div>

        </div>
    );
};

export default MassUpdating;
