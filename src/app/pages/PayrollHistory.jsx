import React from 'react';
import { History, FileText } from 'lucide-react';

const PayrollHistory = () => {
    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-700 text-white rounded-sm flex items-center justify-center shadow-sm">
                        <History size={14} />
                    </div>
                    <span className="font-black text-gray-700 text-xs sm:text-sm uppercase italic tracking-tighter">Historical Payroll Records</span>
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white border border-gray-300 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-blue-800 text-sm">Period {i} - 2026</div>
                            <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold">FINALIZED</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p>Date: Jan {i * 14}, 2026</p>
                            <p>Employees: 42</p>
                            <p>Total Net: $1,240,500.00</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                            <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                <FileText size={12} /> VIEW REPORT
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PayrollHistory;
