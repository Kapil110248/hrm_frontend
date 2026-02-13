import React from 'react';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

const PayrollReview = () => {
    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-700 text-white rounded-sm flex items-center justify-center shadow-sm">
                        <Eye size={14} />
                    </div>
                    <span className="font-black text-gray-700 text-xs sm:text-sm uppercase italic tracking-tighter">Payroll Batch Review</span>
                </div>
            </div>

            <div className="p-4 flex-1">
                <div className="bg-white border border-gray-400 p-8 flex flex-col items-center justify-center h-full text-center opacity-80">
                    <CheckCircle size={48} className="text-green-600 mb-4" />
                    <h2 className="text-lg font-bold text-gray-700">Batch Validation Service</h2>
                    <p className="text-gray-500 max-w-sm mt-2">Review module allows auditing of calculated payroll before finalization. Currently awaiting calculation data.</p>
                </div>
            </div>
        </div>
    );
};

export default PayrollReview;
