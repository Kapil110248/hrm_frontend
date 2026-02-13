import React from 'react';
import { Play, Settings, AlertTriangle } from 'lucide-react';

const RunPayroll = () => {
    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-700 text-white rounded-sm flex items-center justify-center shadow-sm">
                        <Play size={14} />
                    </div>
                    <span className="font-black text-gray-700 text-xs sm:text-sm uppercase italic tracking-tighter">Run Payroll Process</span>
                </div>
            </div>

            <div className="p-8 flex items-center justify-center flex-1">
                <div className="max-w-md w-full bg-white border border-gray-400 p-6 shadow-lg rounded-sm text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                        <Settings size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Initialize Payroll Run</h2>
                    <p className="text-sm text-gray-600 mb-6">You are about to calculate payroll for Period 3 (2026). This process will process timesheets and generate payslips.</p>

                    <button className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-sm hover:bg-blue-700 shadow-md active:translate-y-0.5 transition-all">
                        START CALCULATION ENGINE
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-amber-600 text-xs font-semibold bg-amber-50 p-2 border border-amber-200 rounded">
                        <AlertTriangle size={14} />
                        <span>Warning: Ensure all timesheets are approved.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunPayroll;
