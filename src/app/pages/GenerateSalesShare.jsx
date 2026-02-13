import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, RefreshCw, Trash2, PieChart, DollarSign, Filter } from 'lucide-react';
import { api } from '../../services/api';

const GenerateSalesShare = () => {
    const navigate = useNavigate();
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [filters, setFilters] = useState({
        period: 'Feb 2025',
        region: ''
    });

    const [salesData, setSalesData] = useState([]);

    useEffect(() => {
        const storedCompany = localStorage.getItem('selectedCompany');
        if (storedCompany) {
            setSelectedCompany(JSON.parse(storedCompany));
        }
    }, []);

    useEffect(() => {
        if (selectedCompany?.id) {
            fetchSalesData();
        }
    }, [selectedCompany, filters.period]);

    const fetchSalesData = async () => {
        setIsLoading(true);
        try {
            const res = await api.fetchSalesShares(selectedCompany.id, filters.period);
            if (res.success) {
                setSalesData(res.data);
            }
        } catch (err) {
            console.error("Error fetching sales data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (id, field, value) => {
        const numValue = parseFloat(value) || 0;
        setSalesData(prev => prev.map(entry => {
            if (entry.id === id) {
                const updated = { ...entry, [field]: numValue };
                if (field === 'totalSales' || field === 'commissionRate') {
                    updated.shareAmount = (updated.totalSales * (updated.commissionRate / 100));
                }
                return updated;
            }
            return entry;
        }));
    };

    const handleCalculateAll = () => {
        setSalesData(prev => prev.map(entry => ({
            ...entry,
            shareAmount: (entry.totalSales * (entry.commissionRate / 100))
        })));
        alert("Recalculated all shares based on current rates.");
    };

    const handleSave = async () => {
        if (!selectedCompany?.id) return;
        setIsLoading(true);
        try {
            const payload = {
                companyId: selectedCompany.id,
                period: filters.period,
                salesShares: salesData.map(s => ({
                    employeeId: s.id,
                    totalSales: s.totalSales,
                    commissionRate: s.commissionRate,
                    shareAmount: s.shareAmount
                }))
            };

            const res = await api.saveSalesShares(payload);
            if (res.success) {
                alert("Sales shares saved successfully.");
                fetchSalesData();
            } else {
                alert("Failed to save: " + res.message);
            }
        } catch (err) {
            console.error("Error saving sales shares:", err);
            alert("An error occurred while saving.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-JM', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    };


    return (
        <div className="h-[calc(100vh-70px)] flex flex-col bg-[#EBE9D8] font-sans overflow-hidden">

            {/* 1. Header & Filters */}
            <div className="bg-[#EBE9D8] border-b border-white p-2 shadow-sm shrink-0">
                <div className="flex items-center justify-between mb-3 border-b border-gray-400 pb-2">
                    <h1 className="text-[#0B4FD7] font-black text-lg uppercase tracking-wider flex items-center gap-2">
                        <PieChart size={18} /> Generate Sales Share
                    </h1>
                    <div className="text-xs font-bold text-gray-500">
                        PERIOD: <span className="text-black">FEB 2025</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Sales Period</label>
                        <select
                            value={filters.period}
                            onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                            className="border border-gray-400 p-1 bg-white shadow-inner font-semibold outline-none focus:border-[#0B4FD7]"
                        >
                            <option>Feb 2025</option>
                            <option>Jan 2025</option>
                            <option>Dec 2024</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Region / Branch</label>
                        <select
                            value={filters.region}
                            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                            className="border border-gray-400 p-1 bg-white shadow-inner font-semibold outline-none focus:border-[#0B4FD7]"
                        >
                            <option value="">-- All Regions --</option>
                            <option value="KINGSTON">Kingston HQ</option>
                            <option value="MONTEGO BAY">Montego Bay</option>
                            <option value="MANDEVILLE">Mandeville</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-span-2 flex items-end gap-2">
                        <button
                            onClick={() => {
                                const target = prompt("Set Base Commission Rate (%) for all:");
                                if (target) {
                                    const rate = parseFloat(target);
                                    setSalesData(prev => prev.map(e => ({ ...e, commissionRate: rate, shareAmount: (e.totalSales * (rate / 100)) })));
                                }
                            }}
                            className="bg-white border border-gray-400 px-3 py-1.5 shadow-sm text-xs font-bold hover:bg-blue-50 text-blue-800 uppercase"
                        >
                            Set Global Rate (%)
                        </button>
                        <button
                            onClick={handleCalculateAll}
                            className="bg-white border border-gray-400 px-3 py-1.5 shadow-sm text-xs font-bold hover:bg-blue-50 text-green-700 uppercase"
                        >
                            Recalculate All
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
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-10 text-center">#</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-24 text-left">Emp ID</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 text-left">Employee Name</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 text-left w-32">Region</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-32 text-right">Total Sales ($)</th>
                                <th className="border-r border-b border-gray-400 px-2 py-2 w-20 text-right">Comm. %</th>
                                <th className="border-b border-gray-400 px-2 py-2 w-32 text-right">Share Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesData
                                .filter(e => !filters.region || e.region === filters.region)
                                .map((entry, index) => (
                                    <tr key={entry.id} className="hover:bg-blue-50 group">
                                        <td className="border-r border-b border-gray-200 px-2 py-1 text-center bg-gray-50 font-bold text-gray-500">{index + 1}</td>
                                        <td className="border-r border-b border-gray-200 px-2 py-1 font-mono font-bold text-gray-700">{entry.empId}</td>
                                        <td className="border-r border-b border-gray-200 px-2 py-1 font-bold">{entry.name}</td>
                                        <td className="border-r border-b border-gray-200 px-2 py-1 text-gray-600">{entry.region}</td>
                                        <td className="border-r border-b border-gray-200 px-0 py-0.5 bg-white">
                                            <input
                                                type="number"
                                                value={entry.totalSales}
                                                onChange={(e) => handleInputChange(entry.id, 'totalSales', e.target.value)}
                                                className="w-full text-right px-2 py-1 outline-none border-2 border-transparent focus:border-[#0B4FD7] bg-transparent font-mono focus:bg-white transition-all text-gray-800"
                                            />
                                        </td>
                                        <td className="border-r border-b border-gray-200 px-0 py-0.5 bg-white">
                                            <input
                                                type="number"
                                                value={entry.commissionRate}
                                                onChange={(e) => handleInputChange(entry.id, 'commissionRate', e.target.value)}
                                                className="w-full text-right px-2 py-1 outline-none border-2 border-transparent focus:border-[#0B4FD7] bg-transparent font-mono focus:bg-white transition-all text-blue-700 font-bold"
                                            />
                                        </td>
                                        <td className="border-b border-gray-200 px-2 py-1 text-right font-mono font-bold bg-[#EBE9D8]/30 text-green-700">
                                            {formatCurrency(entry.shareAmount)}
                                        </td>
                                    </tr>
                                ))}
                            {/* Empty Rows */}
                            {[...Array(Math.max(0, 15 - salesData.length))].map((_, i) => (
                                <tr key={`empty-${i}`}>
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
                    onClick={() => setSalesData(prev => prev.map(e => ({ ...e, totalSales: 0, shareAmount: 0 })))}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#EBE9D8] border-2 border-white border-r-gray-400 border-b-gray-400 shadow-sm active:border-t-gray-400 active:border-l-gray-400 active:border-r-white active:border-b-white text-xs font-bold hover:bg-red-50 text-red-700 active:translate-y-0.5 uppercase mr-2"
                >
                    <Trash2 size={14} /> Clear Sales
                </button>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-6 py-2 bg-[#0B4FD7] text-white border-2 border-blue-400 border-r-blue-800 border-b-blue-800 shadow-sm active:border-t-blue-800 active:border-l-blue-800 active:border-r-blue-400 active:border-b-blue-400 text-xs font-bold hover:bg-[#003CB3] active:translate-y-0.5 uppercase"
                >
                    <DollarSign size={14} /> Process Payments
                </button>
            </div>

        </div>
    );
};

export default GenerateSalesShare;
