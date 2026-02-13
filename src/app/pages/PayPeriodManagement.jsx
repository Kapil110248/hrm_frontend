import React, { useState } from 'react';
import { Calendar, Save, Plus, Trash2, Edit } from 'lucide-react';

const PayPeriodManagement = () => {
    const [periods, setPeriods] = useState([
        { id: 1, year: 2026, period: 1, startDate: '2026-01-01', endDate: '2026-01-14', status: 'Closed' },
        { id: 2, year: 2026, period: 2, startDate: '2026-01-15', endDate: '2026-01-28', status: 'Closed' },
        { id: 3, year: 2026, period: 3, startDate: '2026-01-29', endDate: '2026-02-11', status: 'Open' },
    ]);

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans">
            {/* Header */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-700 text-white rounded-sm flex items-center justify-center shadow-sm">
                        <Calendar size={14} />
                    </div>
                    <span className="font-black text-gray-700 text-xs sm:text-sm uppercase italic tracking-tighter">Pay Period Management</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 overflow-auto">
                <div className="bg-white border border-gray-400 p-4 shadow-sm max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-700">Pay Periods - 2026</h2>
                        <button className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-sm text-xs font-bold hover:bg-blue-700">
                            <Plus size={12} /> New Period
                        </button>
                    </div>

                    <table className="w-full border-collapse border border-gray-300 text-xs">
                        <thead className="bg-[#EBE9D8]">
                            <tr>
                                <th className="border border-gray-300 px-2 py-1 text-left">Year</th>
                                <th className="border border-gray-300 px-2 py-1 text-left">Period #</th>
                                <th className="border border-gray-300 px-2 py-1 text-left">Start Date</th>
                                <th className="border border-gray-300 px-2 py-1 text-left">End Date</th>
                                <th className="border border-gray-300 px-2 py-1 text-center">Status</th>
                                <th className="border border-gray-300 px-2 py-1 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {periods.map(p => (
                                <tr key={p.id} className="hover:bg-blue-50">
                                    <td className="border border-gray-300 px-2 py-1">{p.year}</td>
                                    <td className="border border-gray-300 px-2 py-1">{p.period}</td>
                                    <td className="border border-gray-300 px-2 py-1">{p.startDate}</td>
                                    <td className="border border-gray-300 px-2 py-1">{p.endDate}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1 text-center flex justify-center gap-2">
                                        <button className="text-blue-600 hover:text-blue-800"><Edit size={14} /></button>
                                        <button className="text-red-600 hover:text-red-800"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PayPeriodManagement;
