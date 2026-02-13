import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, RefreshCw, Users, Clock, Trash2, Filter, Calendar, CheckSquare, Square } from 'lucide-react';
import { api } from '../../services/api';

const GangShiftMaintenance = () => {
    const navigate = useNavigate();
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    // Filters / Selection Query
    const [query, setQuery] = useState({
        gang: '',
        shiftDate: new Date().toISOString().split('T')[0],
        shiftType: 'Day Shift'
    });

    const [gangs, setGangs] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch Gangs
    useEffect(() => {
        const fetchGangs = async () => {
            if (!selectedCompany.id) return;
            try {
                const res = await api.fetchGangs(selectedCompany.id);
                if (res.success) {
                    setGangs(res.data);
                }
            } catch (err) {
                console.error('Error fetching gangs:', err);
            }
        };
        fetchGangs();
    }, [selectedCompany.id]);

    // Fetch Assignments
    const fetchAssignments = async () => {
        if (!selectedCompany.id) return;
        setLoading(true);
        try {
            const params = {
                companyId: selectedCompany.id,
                date: query.shiftDate,
                shiftType: query.shiftType === 'All' ? null : query.shiftType,
                gangId: query.gang === '' ? null : query.gang
            };
            const res = await api.fetchGangShiftAssignments(params);
            if (res.success) {
                setAssignments(res.data);
            }
        } catch (err) {
            console.error('Error fetching assignments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [selectedCompany.id, query.shiftDate, query.shiftType, query.gang]);

    // Selection State
    const [selectedIds, setSelectedIds] = useState([]);

    const handleSelectAll = () => {
        if (selectedIds.length === assignments.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(assignments.map(a => a.id));
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Editing State
    const handleAssignmentChange = (id, field, value) => {
        setAssignments(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSave = async () => {
        if (!selectedCompany.id) return;
        setLoading(true);
        try {
            // Find appropriate gang IDs for the selected gang names
            const payload = {
                companyId: selectedCompany.id,
                date: query.shiftDate,
                assignments: assignments.map(a => {
                    const gang = gangs.find(g => g.name === a.gang);
                    return {
                        employeeId: a.id,
                        gangId: gang ? gang.id : null,
                        shiftType: a.shift
                    };
                }).filter(a => a.gangId !== null) // Only save if a gang is assigned
            };

            const res = await api.saveGangShiftAssignments(payload);
            if (res.success) {
                alert('Gang Shift assignments saved successfully.');
                fetchAssignments();
            } else {
                alert('Failed to save assignments: ' + res.message);
            }
        } catch (err) {
            console.error('Error saving assignments:', err);
            alert('An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-70px)] flex flex-col bg-[#EBE9D8] font-sans overflow-hidden">

            {/* 1. Header & Filters */}
            <div className="bg-[#EBE9D8] border-b border-white p-2 shadow-sm shrink-0">
                <div className="flex items-center justify-between mb-3 border-b border-gray-400 pb-2">
                    <h1 className="text-[#0B4FD7] font-black text-lg uppercase tracking-wider flex items-center gap-2">
                        <Users size={18} /> Gang Shift Maintenance
                    </h1>
                    <div className="text-xs font-bold text-gray-500">
                        DATE: <span className="text-black">{query.shiftDate}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Target Gang</label>
                        <select
                            value={query.gang}
                            onChange={(e) => setQuery({ ...query, gang: e.target.value })}
                            className="border border-gray-400 p-1 bg-white shadow-inner font-semibold outline-none focus:border-[#0B4FD7]"
                        >
                            <option value="">-- Select Gang --</option>
                            {gangs.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Shift Type</label>
                        <select
                            value={query.shiftType}
                            onChange={(e) => setQuery({ ...query, shiftType: e.target.value })}
                            className="border border-gray-400 p-1 bg-white shadow-inner font-semibold outline-none focus:border-[#0B4FD7]"
                        >
                            <option value="All">All Shifts</option>
                            <option>Day Shift</option>
                            <option>Night Shift</option>
                            <option>Swing Shift</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Shift Date</label>
                        <input
                            type="date"
                            value={query.shiftDate}
                            onChange={(e) => setQuery({ ...query, shiftDate: e.target.value })}
                            className="border border-gray-400 p-1 bg-white shadow-inner font-semibold outline-none focus:border-[#0B4FD7] uppercase"
                        />
                    </div>
                </div>
            </div>

            {/* 2. Data Grid */}
            <div className="flex-1 p-3 overflow-hidden flex flex-col min-h-0">
                <div className="bg-white border border-gray-500 shadow-inner flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                    <table className="w-full text-xs border-collapse relative">
                        <thead className="sticky top-0 bg-[#D4D0C8] z-10 shadow-sm">
                            <tr>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-10 text-center cursor-pointer hover:bg-gray-300" onClick={handleSelectAll}>
                                    {selectedIds.length === assignments.length && assignments.length > 0 ? <CheckSquare size={14} className="mx-auto text-black" /> : <Square size={14} className="mx-auto text-gray-500" />}
                                </th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-10 text-center">#</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-24 text-left">Emp ID</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 text-left">Employee Name</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-32 text-left">Job Role</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-32 text-left">Assigned Gang</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-32 text-left">Assigned Shift</th>
                                <th className="border-b border-gray-400 px-2 py-2 w-24 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className={`hover:bg-blue-50 group transition-colors cursor-pointer ${selectedIds.includes(item.id) ? 'bg-blue-100' : ''}`}
                                    onClick={(e) => {
                                        // Prevent toggling when clicking directly on inputs
                                        if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'OPTION') {
                                            handleSelectOne(item.id);
                                        }
                                    }}
                                >
                                    <td className="border-r border-b border-gray-200 px-2 py-1 text-center" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => handleSelectOne(item.id)} className="flex items-center justify-center w-full h-full">
                                            {selectedIds.includes(item.id) ? <CheckSquare size={14} className="mx-auto text-blue-700" /> : <Square size={14} className="mx-auto text-gray-400" />}
                                        </button>
                                    </td>
                                    <td className="border-r border-b border-gray-200 px-2 py-1 text-center bg-gray-50 font-bold text-gray-500">{index + 1}</td>
                                    <td className="border-r border-b border-gray-200 px-2 py-1 font-mono font-bold text-gray-700">{item.empId}</td>
                                    <td className="border-r border-b border-gray-200 px-2 py-1 font-bold">{item.name}</td>
                                    <td className="border-r border-b border-gray-200 px-2 py-1 text-gray-600">{item.role}</td>

                                    {/* Editable Gang */}
                                    <td className="border-r border-b border-gray-200 px-0 py-0.5 bg-white">
                                        <select
                                            value={item.gang}
                                            onChange={(e) => handleAssignmentChange(item.id, 'gang', e.target.value)}
                                            className="w-full px-2 py-1 outline-none border-2 border-transparent focus:border-[#0B4FD7] bg-transparent font-bold text-blue-700"
                                        >
                                            <option value="Unassigned">Unassigned</option>
                                            {gangs.map(g => (
                                                <option key={g.id} value={g.name}>{g.name}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* Editable Shift */}
                                    <td className="border-r border-b border-gray-200 px-0 py-0.5 bg-white">
                                        <select
                                            value={item.shift}
                                            onChange={(e) => handleAssignmentChange(item.id, 'shift', e.target.value)}
                                            className="w-full px-2 py-1 outline-none border-2 border-transparent focus:border-[#0B4FD7] bg-transparent font-bold text-gray-700"
                                        >
                                            <option>Day Shift</option>
                                            <option>Night Shift</option>
                                            <option>Swing Shift</option>
                                        </select>
                                    </td>

                                    <td className={`border-b border-gray-200 px-2 py-1 text-center font-bold ${item.status === 'Active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                        {item.status}
                                    </td>
                                </tr>
                            ))}
                            {/* Empty Filler Rows */}
                            {[...Array(Math.max(0, 15 - assignments.length))].map((_, i) => (
                                <tr key={`empty-${i}`}>
                                    <td className="border-r border-b border-gray-100 px-2 py-1 bg-gray-50"></td>
                                    <td className="border-r border-b border-gray-100 px-2 py-1 text-center bg-gray-50 text-gray-300"></td>
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

            {/* 3. Footer Actions */}
            <div className="bg-[#EBE9D8] border-t border-white p-2 flex justify-end items-center shadow-[0_-2px_4px_rgba(0,0,0,0.05)] shrink-0 z-20">
                <button
                    onClick={() => setAssignments(assignments.map(a => ({ ...a, gang: 'Unassigned', shift: 'Day Shift' })))}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#EBE9D8] border-2 border-white border-r-gray-400 border-b-gray-400 shadow-sm active:border-t-gray-400 active:border-l-gray-400 active:border-r-white active:border-b-white text-xs font-bold hover:bg-red-50 text-red-700 active:translate-y-0.5 uppercase mr-2"
                >
                    <Trash2 size={14} /> Clear Assignments
                </button>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-6 py-2 bg-[#0B4FD7] text-white border-2 border-blue-400 border-r-blue-800 border-b-blue-800 shadow-sm active:border-t-blue-800 active:border-l-blue-800 active:border-r-blue-400 active:border-b-blue-400 text-xs font-bold hover:bg-[#003CB3] active:translate-y-0.5 uppercase"
                >
                    <Save size={14} /> Save Gang Shift
                </button>
            </div>
        </div>
    );
};

export default GangShiftMaintenance;
