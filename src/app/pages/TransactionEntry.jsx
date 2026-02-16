import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, X, Upload, Download, LogOut, Loader2, Search, User, Filter, ChevronRight } from 'lucide-react';
import Table from '../../components/Table';
import { api } from '../../services/api';

const TransactionEntry = () => {
    const navigate = useNavigate();
    const [selectedRow, setSelectedRow] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    // Master Data
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [transactionCodes, setTransactionCodes] = useState([]);

    // Modal state for employee lookup
    const [showLookup, setShowLookup] = useState(false);
    const [lookupSearch, setLookupSearch] = useState('');

    // Form fields state
    const [formData, setFormData] = useState({
        employeeNo: '',
        employeeRecord: null,
        code: '',
        type: 'EARNING',
        departmentId: '',
        branch: 'Kingston Head Office', // Still semi-static since no model exists yet
        location: 'Main Floor',
        glAC: '7001-00 Salaries',
        notes: '',
        transDate: new Date().toISOString().split('T')[0],
        amount: '0.00',
        units: '1',
        rate: '0.000000'
    });

    // Transaction entries table data
    const [transactions, setTransactions] = useState([]);

    // Fetch Master Data
    useEffect(() => {
        const fetchMasters = async () => {
            if (!selectedCompany.id) return;
            try {
                setLoading(true);
                const [empRes, deptRes, transRes, codeRes] = await Promise.all([
                    api.fetchEmployees(selectedCompany.id),
                    api.fetchDepartments(selectedCompany.id),
                    api.fetchTransactionRegister({ companyId: selectedCompany.id, status: 'ENTERED' }),
                    api.getTransactionCodes(true)
                ]);

                if (empRes.success) setEmployees(empRes.data || []);
                if (deptRes.success) setDepartments(deptRes.data || []);
                if (codeRes.success) setTransactionCodes(codeRes.data || []);
                if (transRes.success) {
                    const mapped = (transRes.data.transactions || []).map(t => ({
                        id: t.id,
                        rate: t.rate || '0.00',
                        quantity: t.units || '1',
                        duty: '',
                        trans: t.code,
                        employee: t.employee?.employeeId || 'N/A',
                        employeeName: `${t.employee?.firstName} ${t.employee?.lastName}`.toUpperCase(),
                        department: t.employee?.department?.name || 'N/A',
                        branch: 'MAIN',
                        locationGL: t.type,
                    }));
                    setTransactions(mapped);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMasters();
    }, [selectedCompany.id]);

    const handleInputChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            // Auto-calculate amount if rate/units change
            if (field === 'rate' || field === 'units') {
                const r = parseFloat(field === 'rate' ? value : prev.rate) || 0;
                const u = parseFloat(field === 'units' ? value : prev.units) || 0;
                updated.amount = (r * u).toFixed(2);
            }
            // Auto-calculate rate if amount/units change (reverse)
            if (field === 'amount' && parseFloat(prev.units) > 0) {
                updated.rate = (parseFloat(value) / parseFloat(prev.units)).toFixed(6);
            }

            return updated;
        });
    };

    const handleSelectEmployee = (emp) => {
        setFormData(prev => ({
            ...prev,
            employeeNo: emp.employeeId,
            employeeRecord: emp,
            departmentId: emp.departmentId || '',
            // Populate other fields from employee template if needed
        }));
        setShowLookup(false);
    };

    const handleNew = () => {
        setFormData({
            employeeNo: '',
            employeeRecord: null,
            code: '',
            type: 'EARNING',
            departmentId: '',
            branch: 'Kingston Head Office',
            location: 'Main Floor',
            glAC: '7001-00 Salaries',
            notes: '',
            transDate: new Date().toISOString().split('T')[0],
            amount: '0.00',
            units: '1',
            rate: '0.000000'
        });
        setSelectedRow(null);
    };

    const handleRowClick = (id) => {
        setSelectedRow(id);
    };

    const handleEnter = async () => {
        if (!formData.employeeNo || !formData.code || !formData.amount) {
            alert("Requirements: Employee No., Code and Amount.");
            return;
        }

        const targetEmp = employees.find(e => e.employeeId === formData.employeeNo);
        if (!targetEmp) {
            alert("Invalid Employee Number.");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                companyId: selectedCompany.id,
                employeeId: targetEmp.employeeId, // Send the string ID (e.g., EMP001) instead of UUID
                transactionDate: formData.transDate,
                type: formData.type || 'EARNING',
                code: formData.code,
                description: formData.notes || `${formData.code} for ${targetEmp.firstName}`,
                amount: parseFloat(formData.amount),
                units: parseFloat(formData.units),
                rate: parseFloat(formData.rate),
                status: 'ENTERED',
                period: 'Feb-2026',
                enteredBy: activeUser.email
            };

            const response = await api.createTransaction(payload);
            if (response.success) {
                const t = response.data;
                const newTransaction = {
                    id: t.id,
                    rate: t.rate,
                    quantity: t.units || '1',
                    duty: '',
                    trans: t.code,
                    employee: formData.employeeNo,
                    employeeName: `${targetEmp.firstName} ${targetEmp.lastName}`.toUpperCase(),
                    department: departments.find(d => d.id === targetEmp.departmentId)?.name || 'N/A',
                    branch: formData.branch,
                    locationGL: formData.type,
                };
                setTransactions(prev => [newTransaction, ...prev]);
                handleNew();
            } else {
                alert(response.message || "Entry failed.");
            }
        } catch (err) {
            console.error("Transaction Error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Connection error.";
            alert(`Uplink Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (selectedRow) {
            if (!window.confirm("CRITICAL: Delete selected financial entry?")) return;
            try {
                setLoading(true);
                const response = await api.deleteTransaction(selectedRow);
                if (response.success) {
                    setTransactions(prev => prev.filter(t => t.id !== selectedRow));
                    setSelectedRow(null);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs select-none">
            {/* Header */}
            <div className="bg-[#000080] text-white px-3 py-2 flex items-center justify-between border-b-2 border-white shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-sm">
                        <User className="text-[#000080]" size={16} />
                    </div>
                    <span className="font-black italic uppercase tracking-widest text-[11px]">Island HR System - Transaction Entry Terminal [STATION_042]</span>
                </div>
                <div className="flex items-center gap-4">
                    {loading && <div className="flex items-center gap-2 text-[9px] font-black animate-pulse"><Loader2 size={14} className="animate-spin" /> UPLINK_ACTIVE</div>}
                    <div className="bg-green-600 text-white px-3 py-0.5 rounded text-[9px] font-black border border-green-400">SECURE_CHANNEL</div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 overflow-auto min-w-0 flex flex-col gap-4">

                {/* Upper Section: Entry Form */}
                <div className="bg-white border-2 border-white border-r-gray-500 border-b-gray-500 p-4 shadow-xl rounded-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Column 1: Employee & Code */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-3 border border-gray-200 rounded shadow-inner">
                                <label className="text-blue-900 font-black uppercase text-[10px] mb-1.5 block italic">Employee Account #</label>
                                <div className="flex gap-1">
                                    <input
                                        type="text"
                                        value={formData.employeeNo}
                                        onChange={(e) => handleInputChange('employeeNo', e.target.value.toUpperCase())}
                                        placeholder="SEARCH ID..."
                                        className="flex-1 p-2 border-2 border-gray-300 bg-white text-blue-900 font-black outline-none focus:border-blue-700 transition-colors uppercase italic"
                                        disabled={loading}
                                    />
                                    <button
                                        onClick={() => setShowLookup(true)}
                                        className="px-3 bg-[#D4D0C8] border-2 border-white border-r-gray-600 border-b-gray-600 hover:bg-white active:translate-y-0.5 shadow-sm"
                                        disabled={loading}
                                    >
                                        <Search size={16} className="text-gray-700" />
                                    </button>
                                </div>
                                {formData.employeeRecord && (
                                    <div className="mt-2 text-[10px] font-black text-green-700 italic border-t pt-2 border-green-100 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                                        IDENTIFIED: {formData.employeeRecord.firstName} {formData.employeeRecord.lastName}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-600 font-black uppercase text-[10px] italic">Transaction Code</label>
                                <select
                                    value={formData.code}
                                    onChange={(e) => handleInputChange('code', e.target.value)}
                                    className="w-full p-2.5 border-2 border-gray-200 bg-gray-50 text-blue-900 font-black outline-none focus:bg-white transition-all cursor-pointer"
                                    disabled={loading}
                                >
                                    <option value="">-- SELECT PROTOCOL --</option>
                                    {transactionCodes.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Column 2: Classifications */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-gray-600 font-black uppercase text-[10px] italic">Entry Type</label>
                                <div className="flex gap-2">
                                    {['EARNING', 'DEDUCTION', 'ALLOWANCE'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => handleInputChange('type', t)}
                                            className={`flex-1 py-2 text-[9px] font-black border-2 transition-all ${formData.type === t ? 'bg-blue-600 text-white border-blue-900 shadow-inner translate-y-0.5' : 'bg-gray-100 text-gray-400 border-white border-r-gray-400 border-b-gray-400 hover:bg-white'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-600 font-black uppercase text-[10px] italic">Assigned Department</label>
                                <select
                                    value={formData.departmentId}
                                    onChange={(e) => handleInputChange('departmentId', e.target.value)}
                                    className="w-full p-2.5 border-2 border-gray-200 bg-gray-50 text-gray-700 font-black outline-none focus:bg-white transition-all appearance-none italic"
                                    disabled={loading}
                                >
                                    <option value="">SELECT DEPARTMENT...</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Column 3: Values */}
                        <div className="bg-gray-100 p-4 border-2 border-white border-r-gray-200 border-b-gray-200 shadow-inner rounded-sm space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-gray-500 font-black uppercase text-[9px] italic">Units/Qty</label>
                                    <input
                                        type="number"
                                        value={formData.units}
                                        onChange={(e) => handleInputChange('units', e.target.value)}
                                        className="w-full p-2 border-2 border-gray-200 bg-white text-gray-800 font-black text-center outline-none focus:border-blue-400"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-gray-500 font-black uppercase text-[9px] italic">Rate/Price</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        value={formData.rate}
                                        onChange={(e) => handleInputChange('rate', e.target.value)}
                                        className="w-full p-2 border-2 border-gray-200 bg-white text-gray-800 font-black text-right outline-none focus:border-blue-400"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-blue-900 font-black uppercase text-[10px] italic border-b border-blue-100 pb-1 flex justify-between">
                                    <span>Calculated Net Amount</span>
                                    <span className="text-[8px] opacity-50 underline uppercase tracking-tighter">Manual Override Enabled</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                    className="w-full p-3 border-2 border-blue-600 bg-blue-50 text-2xl font-black italic text-blue-950 text-right outline-none shadow-inner"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Column 4: Controls */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleEnter}
                                disabled={loading}
                                className="flex-1 bg-green-600 text-white border-4 border-white border-r-green-900 border-b-green-900 hover:bg-green-700 active:translate-y-1 active:border-r-0 active:border-b-0 shadow-xl transition-all flex flex-col items-center justify-center p-4 group"
                            >
                                <Save size={24} className="group-hover:scale-110 transition-transform mb-1" />
                                <span className="font-black uppercase text-[11px] tracking-widest italic">POST_ENTRY</span>
                            </button>
                            <div className="flex gap-2 h-14">
                                <button
                                    onClick={handleNew}
                                    className="flex-1 bg-white border-2 border-white border-r-gray-400 border-b-gray-400 hover:bg-gray-100 active:translate-y-0.5 shadow-md font-black text-[10px] uppercase italic text-gray-600 flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} /> NEW
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={!selectedRow}
                                    className={`flex-1 bg-[#E0DCCF] border-2 border-white border-r-red-900 border-b-red-900 hover:bg-white active:translate-y-0.5 shadow-md font-black text-[10px] uppercase italic text-red-700 flex items-center justify-center gap-2 ${!selectedRow ? 'opacity-30 grayscale' : ''}`}
                                >
                                    <X size={14} /> VOID
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lower Section: Data Queue */}
                <div className="flex-1 bg-white border-2 border-white border-r-gray-500 border-b-gray-500 shadow-2xl flex flex-col min-h-0 rounded-sm overflow-hidden">
                    <div className="bg-[#D4D0C8] px-4 py-2 border-b-2 border-gray-400 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <Filter size={14} className="text-blue-900" />
                            <span className="font-black text-gray-700 uppercase text-[10px] tracking-[0.2em] italic">Active Transaction Stream :: FEB-2026 Batch</span>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-[10px] font-black text-blue-800 bg-white/50 px-3 py-0.5 border border-white rounded shadow-inner">
                                QUEUE_SIZE: {transactions.length} RECS
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 p-1">
                        <Table
                            columns={[
                                { header: 'Serial #', accessor: 'id', width: '80px', render: (v) => <span className="text-[9px] opacity-40 font-mono">#{v.substring(0, 6)}</span> },
                                { header: 'TRANS_ID', accessor: 'trans', width: '100px', render: (v) => <span className="font-black italic text-blue-900">{v}</span> },
                                {
                                    header: 'EMPLOYEE_ENTITY', accessor: 'employeeName', width: '250px', render: (v, row) => (
                                        <div className="flex flex-col">
                                            <span className="font-black text-blue-900 uppercase leading-none">{v}</span>
                                            <span className="text-[9px] text-gray-400 font-black italic">{row.employee}</span>
                                        </div>
                                    )
                                },
                                { header: 'DEPARTMENT', accessor: 'department', width: '150px' },
                                { header: 'RATE (BASE)', accessor: 'rate', width: '120px', render: (v) => <span className="font-mono text-gray-500">$ {parseFloat(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> },
                                { header: 'QTY', accessor: 'quantity', width: '80px', render: (v) => <span className="font-black text-center block italic text-blue-700">{v}</span> },
                                {
                                    header: 'TYPE', accessor: 'locationGL', width: '120px', render: (v) => (
                                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black italic ${v === 'EARNING' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {v}
                                        </span>
                                    )
                                },
                                {
                                    header: 'SETTLEMENT', accessor: 'amount', width: '150px', render: (_, row) => (
                                        <span className="font-black italic text-sm text-blue-900 block text-right">
                                            $ {(parseFloat(row.rate) * parseFloat(row.quantity)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    )
                                }
                            ]}
                            data={transactions.map(t => ({
                                ...t,
                                highlighted: t.id === selectedRow
                            }))}
                            rowKey="id"
                            onRowClick={(row) => handleRowClick(row.id)}
                            minRows={15}
                        />
                    </div>
                </div>

                {/* Final Actions Footer */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-4 py-2 shrink-0">
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/files/import')}
                            className="bg-[#D4D0C8] border-2 border-white border-r-gray-600 border-b-gray-600 px-6 py-2 shadow-lg hover:bg-white transition-all font-black text-[10px] uppercase italic flex items-center gap-2 group"
                        >
                            <Upload size={16} className="group-hover:-translate-y-0.5 transition-transform" /> Mass Import Protocol
                        </button>
                        <button
                            onClick={() => { }} // Handle export
                            className="bg-[#D4D0C8] border-2 border-white border-r-gray-600 border-b-gray-600 px-6 py-2 shadow-lg hover:bg-white transition-all font-black text-[10px] uppercase italic flex items-center gap-2 group"
                        >
                            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> Archive Local Queue
                        </button>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-[#E0DCCF] border-2 border-white border-r-red-900 border-b-red-900 px-10 py-2 shadow-xl hover:bg-white text-red-700 hover:text-red-900 transition-all font-black text-[11px] uppercase italic flex items-center gap-3 tracking-widest active:translate-y-1 active:border-0"
                    >
                        <LogOut size={18} /> Exit Terminal
                    </button>
                </div>
            </div>

            {/* Employee Lookup Modal */}
            {showLookup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#EBE9D8] border-4 border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-[#000080] text-white p-3 flex justify-between items-center">
                            <span className="font-black uppercase italic tracking-widest text-xs flex items-center gap-2"><User size={14} /> Core Employee Registry lookup</span>
                            <button onClick={() => setShowLookup(false)} className="hover:bg-red-600 p-1"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-3 mb-6">
                                <div className="flex-1 flex items-center bg-white border-2 border-gray-300 px-4 py-2 shadow-inner group focus-within:border-blue-600">
                                    <Search size={18} className="text-gray-400 group-focus-within:text-blue-600" />
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="FILTER BY NAME OR ID..."
                                        className="w-full bg-transparent outline-none font-black text-blue-900 uppercase italic px-4"
                                        value={lookupSearch}
                                        onChange={(e) => setLookupSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="border-2 border-gray-300 bg-white max-h-[400px] overflow-auto shadow-inner rounded-sm">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead className="sticky top-0 bg-[#D4D0C8] border-b-2 border-gray-400 font-black italic uppercase text-gray-600">
                                        <tr>
                                            <th className="p-3 border-r border-gray-100">ID#</th>
                                            <th className="p-3 border-r border-gray-100">Full Name</th>
                                            <th className="p-3 border-r border-gray-100">Department</th>
                                            <th className="p-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {employees
                                            .filter(e =>
                                                `${e.firstName} ${e.lastName} ${e.employeeId}`.toLowerCase().includes(lookupSearch.toLowerCase())
                                            )
                                            .map(e => (
                                                <tr key={e.id} className="hover:bg-blue-50 transition-colors group">
                                                    <td className="p-3 font-mono font-black border-r border-gray-50">{e.employeeId}</td>
                                                    <td className="p-3 font-black text-blue-900 uppercase border-r border-gray-50">{e.firstName} {e.lastName}</td>
                                                    <td className="p-3 text-gray-400 italic text-[10px] border-r border-gray-50 uppercase">{e.department?.name || 'N/A'}</td>
                                                    <td className="p-2 text-right">
                                                        <button
                                                            onClick={() => handleSelectEmployee(e)}
                                                            className="bg-blue-600 text-white px-4 py-1.5 font-black text-[10px] uppercase italic rounded-sm hover:bg-blue-800 transition-all flex items-center gap-2 ml-auto"
                                                        >
                                                            SELECT <ChevronRight size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        {employees.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="p-10 text-center font-black italic text-gray-300 uppercase tracking-widest">Master record stream empty</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-[#D4D0C8] border-t border-gray-400 p-2 text-right text-[9px] font-black text-gray-500 italic uppercase">
                            Secure lookup session active :: ISO_8601_READY
                        </div>
                    </div>
                </div>
            )}

            {/* System Monitor Status Bar */}
            <div className="bg-[#D4D0C8] border-t-2 border-white px-4 py-1 flex justify-between items-center text-[10px] font-black italic text-gray-600 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] uppercase tracking-tighter">
                <div className="flex gap-6">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> K_LOCK</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div> N_LOCK</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div> S_LOCK</span>
                </div>
                <div className="flex gap-8 items-center">
                    <span className="border-l border-gray-400 pl-4">DOMAIN: {selectedCompany.name || activeUser.companyName || 'COMMUNITY_CORE'}</span>
                    <span className="border-l border-gray-400 pl-4 text-blue-800">UPLINK_STATION: 042xAlpha</span>
                    <span className="border-l border-gray-400 pl-4">{new Date().toLocaleTimeString()} JST</span>
                </div>
            </div>
        </div>
    );
};

export default TransactionEntry;
