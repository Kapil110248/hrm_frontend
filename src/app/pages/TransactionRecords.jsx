import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Filter, Search, Printer, Download, LogOut, Receipt, ArrowRight } from 'lucide-react';

const TransactionRecords = () => {
    const navigate = useNavigate();

    const transactions = [
        { id: 'T99401', date: '22/01/2026', type: 'PAYROLL', desc: 'Monthly Salary Disbursement', amount: '8,240,500.00', status: 'Completed' },
        { id: 'T99402', date: '22/01/2026', type: 'ADVANCE', desc: 'Employee Loan #102', amount: '25,000.00', status: 'Processing' },
        { id: 'T99403', date: '21/01/2026', type: 'TAX', desc: 'NHT Disbursement', amount: '450,200.00', status: 'Completed' },
        { id: 'T99404', date: '21/01/2026', type: 'ADJUST', desc: 'Overtime Correction', amount: '12,400.00', status: 'Verified' },
    ];

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-1 flex items-center gap-2">
                <Database size={14} className="text-blue-800" />
                <span className="font-bold text-gray-700 uppercase italic">Master Transaction Ledger & Audit Archives</span>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
                {/* Search / Filter Area */}
                <div className="bg-white border-2 border-gray-500 p-4 shadow-[4px_4px_0_rgba(0,0,0,0.1)] flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-300 p-3">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="SEARCH BY TRANSACTION ID, DATA OR DESCRIPTION..."
                            className="bg-transparent outline-none font-black italic w-full text-blue-900 placeholder:text-gray-300"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-[#E0DCCF] border border-gray-400 px-4 py-3 font-bold hover:bg-gray-100">
                        <Filter size={16} /> ADVANCED FILTERS
                    </button>
                    <div className="h-10 w-px bg-gray-300 mx-2"></div>
                    <div className="flex gap-2">
                        <button className="p-3 bg-white border border-gray-400 hover:bg-blue-50 text-blue-600 shadow-sm"><Printer size={18} /></button>
                        <button className="p-3 bg-white border border-gray-400 hover:bg-green-50 text-green-600 shadow-sm"><Download size={18} /></button>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="flex-1 bg-white border-2 border-gray-500 shadow-[8px_8px_0_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">
                    <div className="bg-blue-900 text-white p-3 flex justify-between items-center px-6">
                        <div className="flex items-center gap-3">
                            <Receipt size={18} />
                            <span className="font-black italic uppercase tracking-widest text-[10px]">Archived Records - Fiscal Jan 2026</span>
                        </div>
                        <div className="text-[9px] font-bold opacity-70">Showing 1-4 of 1,245 Records</div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 sticky top-0 border-b-2 border-gray-300 font-black italic text-gray-600 uppercase text-[9px]">
                                <tr>
                                    <th className="p-4">TX REF</th>
                                    <th className="p-4">POSTING DATE</th>
                                    <th className="p-4">CATEGORY</th>
                                    <th className="p-4">DESCRIPTION</th>
                                    <th className="p-4">VALUE (JMD)</th>
                                    <th className="p-4 text-center">STATUS</th>
                                    <th className="p-4 text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-blue-50 group transition-colors">
                                        <td className="p-4 font-black text-gray-400">#{tx.id}</td>
                                        <td className="p-4 font-mono font-bold">{tx.date}</td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-sm font-black italic text-[9px] uppercase text-gray-600">
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-gray-800 tracking-tight">{tx.desc}</td>
                                        <td className="p-4 font-black italic text-blue-900 text-sm">${tx.amount}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded font-black italic text-[8px] uppercase ${tx.status === 'Completed' ? 'text-green-600 border border-green-200 bg-green-50' :
                                                    tx.status === 'Processing' ? 'text-blue-600 border border-blue-200 bg-blue-50 animate-pulse' :
                                                        'text-purple-600 border border-purple-200 bg-purple-50'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-1 text-blue-600 opacity-0 group-hover:opacity-100 font-black italic flex items-center gap-1 ml-auto uppercase text-[9px]">
                                                DETAILS <ArrowRight size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="bg-white border-t border-gray-400 p-3 px-8 flex justify-between items-center no-print">
                <div className="text-[10px] font-black italic text-red-600 uppercase animate-pulse">
                    Live Audit Loop Active - Station Verified
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-red-500 text-white px-10 py-2 font-black italic hover:bg-red-600 shadow-xl active:translate-y-1 transition-all"
                >
                    CLOSE LEDGER
                </button>
            </div>
        </div>
    );
};

export default TransactionRecords;
