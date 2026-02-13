import React, { useState, useEffect } from 'react';
import { Check, Plus, LogOut, X } from 'lucide-react';
import { api } from '../services/api';

const CompanySelection = ({ onSelect, onExit }) => {
    const [companies, setCompanies] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newCompany, setNewCompany] = useState({ name: '', frequency: 'Weekly' });
    const [isLoading, setIsLoading] = useState(false);

    const fetchCompanies = async () => {
        setIsLoading(true);
        try {
            const res = await api.fetchCompanies();
            if (res.success) {
                setCompanies(res.data);
                if (res.data.length > 0) setSelectedId(res.data[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleAddCompany = async () => {
        if (!newCompany.name.trim()) return;
        setIsLoading(true);
        try {
            const res = await api.createCompany({
                name: newCompany.name.toUpperCase(),
                code: `COMP-${Date.now()}`,
                payFrequency: newCompany.frequency
            });
            if (res.success) {
                await fetchCompanies();
                setIsAdding(false);
                setNewCompany({ name: '', frequency: 'Weekly' });
            }
        } catch (err) {
            alert(err.message || "Failed to add company");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full bg-[#333333] flex items-center justify-center font-sans z-[9999]">
            {/* Modal Window */}
            <div className="w-[600px] bg-white border-[3px] border-[#0055E5] flex flex-col shadow-2xl relative">

                {/* Title Bar - Blue Background */}
                <div className="bg-[#0055E5] h-8 flex items-center justify-between px-2 select-none">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#0055E5] text-white font-bold text-sm bg-blue-700 w-5 h-5 flex items-center justify-center rounded">C</div>
                        <span className="text-white font-bold text-sm tracking-wide">Company Selection</span>
                    </div>
                    <button
                        onClick={onExit}
                        className="bg-red-600 hover:bg-red-700 text-white w-5 h-5 flex items-center justify-center text-xs font-bold border border-white/50"
                    >
                        <X size={14} strokeWidth={4} />
                    </button>
                </div>

                {/* Content Area - Classic Beige Background */}
                <div className="bg-[#EBE9D8] p-4 pb-2 h-[350px] flex flex-col">

                    {/* Table Header */}
                    <div className="bg-[#EBE9D8] border border-gray-400 border-b-0 flex text-xs font-bold text-black select-none">
                        <div className="flex-1 p-2 border-r border-gray-300">Payroll Description</div>
                        <div className="w-32 p-2">Frequency</div>
                    </div>

                    {/* Table Body */}
                    <div className="border border-gray-400 flex-1 overflow-y-auto bg-white mb-4">
                        {companies.map((company) => (
                            <div
                                key={company.id}
                                onClick={() => setSelectedId(company.id)}
                                className={`flex text-xs cursor-pointer select-none ${selectedId === company.id
                                    ? 'bg-[#000080] text-white'
                                    : 'text-black hover:bg-gray-100'
                                    }`}
                            >
                                <div className={`flex-1 p-1 px-2 border-r ${selectedId === company.id ? 'border-white/30' : 'border-gray-200'}`}>
                                    {company.name}
                                </div>
                                <div className="w-32 p-1 px-2">
                                    {(company.payFrequency || company.frequency)?.toUpperCase() || 'N/A'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Button Area */}
                    <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-4">
                            {/* SELECT Button */}
                            <button
                                onClick={() => {
                                    const company = companies.find(c => c.id === selectedId);
                                    if (company) onSelect(company);
                                }}
                                disabled={!selectedId}
                                className="w-20 h-20 bg-[#EBE9D8] border-2 border-gray-300 flex flex-col items-center justify-center shadow-lg hover:bg-gray-50 active:translate-y-0.5 active:shadow-none transition-all group"
                            >
                                <div className="w-8 h-8 rounded-full border-2 border-green-600 flex items-center justify-center mb-1 group-hover:bg-green-50">
                                    <Check size={20} className="text-green-600 stroke-[4]" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-gray-800">Select</span>
                            </button>

                            {/* ADD Button */}
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-20 h-20 bg-[#EBE9D8] border-2 border-gray-300 flex flex-col items-center justify-center shadow-lg hover:bg-gray-50 active:translate-y-0.5 active:shadow-none transition-all group"
                            >
                                <div className="w-8 h-8 border-2 border-gray-600 flex items-center justify-center mb-1 group-hover:bg-gray-100">
                                    <Plus size={20} className="text-gray-600 stroke-[3]" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-gray-800">Add</span>
                            </button>
                        </div>

                        {/* EXIT Button */}
                        <button
                            onClick={onExit}
                            className="w-20 h-20 bg-[#EBE9D8] border-2 border-gray-300 flex flex-col items-center justify-center shadow-lg hover:bg-red-50 active:translate-y-0.5 active:shadow-none transition-all group ml-auto"
                        >
                            <div className="mb-1 text-blue-800">
                                <LogOut size={28} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-gray-800">Exit</span>
                        </button>
                    </div>

                </div>

            </div>

            {/* Add Company Modal Overlay (Nested) */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#EBE9D8] border border-gray-400 shadow-2xl w-full max-w-sm flex flex-col animate-[fadeIn_0.1s_ease-out] overflow-hidden">
                        <div className="bg-gradient-to-r from-[#0055E5] to-[#003399] text-white px-3 py-2 flex justify-between items-center shadow-sm">
                            <span className="text-xs font-bold tracking-wide">Add New Company</span>
                            <button onClick={() => setIsAdding(false)} className="hover:text-red-200 transition-colors">✕</button>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Name</label>
                                <input
                                    type="text"
                                    value={newCompany.name}
                                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                    className="w-full border border-gray-300 p-2 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-inner"
                                    placeholder="Enter company name..."
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Frequency</label>
                                <select
                                    value={newCompany.frequency}
                                    onChange={(e) => setNewCompany({ ...newCompany, frequency: e.target.value })}
                                    className="w-full border border-gray-300 p-2 text-xs font-semibold focus:border-blue-500 outline-none shadow-sm bg-white"
                                >
                                    <option value="Weekly">Weekly</option>
                                    <option value="Fortnightly">Fortnightly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Semi-Monthly">Semi-Monthly</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-gray-200">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 text-[10px] hover:bg-gray-50 font-bold uppercase rounded shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddCompany}
                                    className="px-3 py-1.5 bg-blue-600 text-white border border-blue-700 text-[10px] hover:bg-blue-700 font-bold uppercase rounded shadow-sm"
                                >
                                    Save Company
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanySelection;
