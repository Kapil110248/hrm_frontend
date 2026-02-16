import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Edit2, Trash2, Loader2, Search, Settings } from 'lucide-react';
import Table from '../../components/Table';
import { api } from '../../services/api';

const TransactionCodeManagement = () => {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCode, setEditingCode] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: 'EARNING',
        description: '',
        isActive: true
    });

    const fetchCodes = async () => {
        try {
            setLoading(true);
            const response = await api.getTransactionCodes();
            if (response.success) {
                setCodes(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch transaction codes', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleEdit = (code) => {
        setEditingCode(code);
        setFormData({
            code: code.code,
            name: code.name,
            type: code.type,
            description: code.description || '',
            isActive: code.isActive
        });
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingCode(null);
        setFormData({
            code: '',
            name: '',
            type: 'EARNING',
            description: '',
            isActive: true
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.code || !formData.name || !formData.type) {
            alert("Code, Name and Type are required.");
            return;
        }

        try {
            setLoading(true);
            let response;
            if (editingCode) {
                response = await api.updateTransactionCode(editingCode.id, formData);
            } else {
                response = await api.createTransactionCode(formData);
            }

            if (response.success) {
                setShowModal(false);
                fetchCodes();
            } else {
                alert(response.message || "Operation failed.");
            }
        } catch (error) {
            console.error('Save failed', error);
            alert("Error saving transaction code.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this transaction code? This may affect existing transactions.")) return;

        try {
            setLoading(true);
            const response = await api.deleteTransactionCode(id);
            if (response.success) {
                fetchCodes();
            } else {
                alert(response.message || "Delete failed.");
            }
        } catch (error) {
            console.error('Delete failed', error);
            alert("Error deleting transaction code.");
        } finally {
            setLoading(false);
        }
    };

    const filteredCodes = codes.filter(c => 
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs select-none">
            {/* Header */}
            <div className="bg-[#000080] text-white px-3 py-2 flex items-center justify-between border-b-2 border-white shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-sm">
                        <Settings className="text-[#000080]" size={16} />
                    </div>
                    <span className="font-black italic uppercase tracking-widest text-[11px]">Island HR System - Transaction Protocol Configuration</span>
                </div>
                <div className="flex items-center gap-4">
                    {loading && <div className="flex items-center gap-2 text-[9px] font-black animate-pulse"><Loader2 size={14} className="animate-spin" /> SYNCING...</div>}
                    <div className="bg-blue-600 text-white px-3 py-0.5 rounded text-[9px] font-black border border-blue-400 uppercase">Master Config Mode</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
                {/* Search and Actions */}
                <div className="flex justify-between items-center bg-white border-2 border-white border-r-gray-500 border-b-gray-500 p-3 shadow-md rounded-sm">
                    <div className="flex items-center bg-gray-50 border-2 border-gray-300 px-4 py-1.5 shadow-inner focus-within:border-blue-600 group w-72 transition-all">
                        <Search size={16} className="text-gray-400 group-focus-within:text-blue-600" />
                        <input
                            type="text"
                            placeholder="FILTER CODES OR NAMES..."
                            className="bg-transparent outline-none font-black text-blue-900 uppercase italic px-3 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="bg-green-600 text-white border-2 border-white border-r-green-900 border-b-green-900 px-6 py-2 shadow-lg hover:bg-green-700 active:translate-y-0.5 transition-all font-black text-[10px] uppercase italic flex items-center gap-2"
                    >
                        <Plus size={16} /> Register New Protocol
                    </button>
                </div>

                {/* Data Table Container */}
                <div className="flex-1 bg-white border-2 border-white border-r-gray-500 border-b-gray-500 shadow-xl flex flex-col min-h-0 rounded-sm overflow-hidden">
                    <div className="bg-[#D4D0C8] px-4 py-2 border-b-2 border-gray-400 flex justify-between items-center shrink-0">
                        <span className="font-black text-gray-700 uppercase text-[10px] tracking-[0.2em] italic">System Transaction Code Registry</span>
                        <div className="text-[10px] font-black text-blue-800 bg-white/50 px-3 py-0.5 border border-white rounded shadow-inner">
                            {filteredCodes.length} DEFINITIONS LOADED
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-1">
                        <Table
                            columns={[
                                { header: 'ID_CODE', accessor: 'code', width: '100px', render: (v) => <span className="font-black italic text-blue-900">{v}</span> },
                                { header: 'PROTOCOL NAME', accessor: 'name', width: '250px', render: (v) => <span className="font-bold uppercase">{v}</span> },
                                { 
                                    header: 'CLASSIFICATION', accessor: 'type', width: '150px', render: (v) => (
                                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black italic ${
                                            v === 'EARNING' ? 'bg-green-50 text-green-700 border-green-200' : 
                                            v === 'DEDUCTION' ? 'bg-red-50 text-red-700 border-red-200' : 
                                            'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                            {v}
                                        </span>
                                    )
                                },
                                { header: 'DESCRIPTION', accessor: 'description', width: '300px', render: (v) => <span className="text-gray-500 italic">{v || '---'}</span> },
                                { 
                                    header: 'STATUS', accessor: 'isActive', width: '100px', render: (v) => (
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${v ? 'bg-green-500 shadow-[0_0_5px_green]' : 'bg-red-500 shadow-[0_0_5px_red]'}`}></div>
                                            <span className="font-black italic text-[9px]">{v ? 'ACTIVE' : 'DISABLED'}</span>
                                        </div>
                                    )
                                },
                                {
                                    header: 'ACTIONS', accessor: 'id', width: '120px', render: (_, row) => (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(row)} className="p-1 hover:bg-blue-100 text-blue-700 rounded transition-colors"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(row.id)} className="p-1 hover:bg-red-100 text-red-700 rounded transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    )
                                }
                            ]}
                            data={filteredCodes}
                            rowKey="id"
                            minRows={10}
                        />
                    </div>
                </div>
            </div>

            {/* Entry/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#EBE9D8] border-4 border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="bg-[#000080] text-white p-3 flex justify-between items-center border-b-2 border-white">
                            <span className="font-black uppercase italic tracking-widest text-[10px] flex items-center gap-2">
                                <Settings size={14} /> {editingCode ? 'MODIFY PROTOCOL DEFINITION' : 'REGISTER NEW TRANSACTION PROTOCOL'}
                            </span>
                            <button onClick={() => setShowModal(false)} className="hover:bg-red-600 p-1 transition-colors"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-gray-600 font-black uppercase text-[10px] italic">Protocol ID / Code (e.g. BSAL)</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                    className="w-full p-2.5 border-2 border-gray-300 bg-white text-blue-900 font-black outline-none focus:border-blue-700 transition-all uppercase italic"
                                    placeholder="ENTER CODE..."
                                    required
                                    disabled={loading || !!editingCode}
                                />
                                {editingCode && <p className="text-[9px] text-gray-400 font-bold italic">* Protocol ID cannot be modified once registered</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-gray-600 font-black uppercase text-[10px] italic">Display Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full p-2.5 border-2 border-gray-300 bg-white text-gray-800 font-black outline-none focus:border-blue-700 transition-all uppercase"
                                    placeholder="E.G. BASIC SALARY"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-gray-600 font-black uppercase text-[10px] italic">Protocol Classification</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                    className="w-full p-2.5 border-2 border-gray-300 bg-white text-gray-800 font-black outline-none focus:border-blue-700 transition-all cursor-pointer italic"
                                >
                                    <option value="EARNING">EARNING</option>
                                    <option value="DEDUCTION">DEDUCTION</option>
                                    <option value="ALLOWANCE">ALLOWANCE</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-gray-600 font-black uppercase text-[10px] italic">Technical Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full p-2.5 border-2 border-gray-300 bg-white text-gray-800 font-black outline-none focus:border-blue-700 transition-all h-20 resize-none italic"
                                    placeholder="INTERNAL NOTES OR DETAILS..."
                                />
                            </div>

                            <div className="flex items-center gap-3 bg-white p-3 border-2 border-gray-200">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <label htmlFor="isActive" className="text-gray-700 font-black uppercase text-[10px] italic cursor-pointer">Protocol Active Status</label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-white border-2 border-white border-r-gray-400 border-b-gray-400 hover:bg-gray-100 active:translate-y-0.5 shadow-md font-black text-[10px] uppercase italic text-gray-600 py-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white border-2 border-white border-r-blue-900 border-b-blue-900 hover:bg-blue-700 active:translate-y-0.5 shadow-md font-black text-[10px] uppercase italic flex items-center justify-center gap-2 py-3"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                                    {editingCode ? 'COMMIT CHANGES' : 'INITIALIZE PROTOCOL'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionCodeManagement;
