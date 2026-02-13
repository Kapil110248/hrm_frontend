import React from 'react';
import { Settings, Save } from 'lucide-react';

const EmployeePayrollSettings = () => {
    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-700 text-white rounded-sm flex items-center justify-center shadow-sm">
                        <Settings size={14} />
                    </div>
                    <span className="font-black text-gray-700 text-xs sm:text-sm uppercase italic tracking-tighter">Individual Payroll Configurations</span>
                </div>
                <button className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-sm text-xs font-bold hover:bg-green-700 shadow-sm border border-green-800">
                    <Save size={12} /> Save
                </button>
            </div>

            <div className="p-4 overflow-auto">
                <div className="max-w-4xl mx-auto bg-white border border-gray-400 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Default Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Standard Payment Method</label>
                            <select className="w-full border border-gray-300 p-2 text-sm rounded-sm">
                                <option>Bank Transfer</option>
                                <option>Cheque</option>
                                <option>Cash</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Tax Calculation Mode</label>
                            <select className="w-full border border-gray-300 p-2 text-sm rounded-sm">
                                <option>Cumulative</option>
                                <option>Period-based</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeePayrollSettings;
