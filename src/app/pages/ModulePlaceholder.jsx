import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Cog, AlertCircle, Hammer } from 'lucide-react';

const ModulePlaceholder = ({ title }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            {/* Header */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 py-1">
                <span className="font-bold text-gray-700">{title}</span>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="p-8 bg-white border border-gray-400 shadow-[4px_4px_0_rgba(0,0,0,0.1)] max-w-md w-full text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <Cog size={64} className="text-blue-600 animate-[spin_10s_linear_infinite]" />
                            <Hammer size={32} className="text-gray-400 absolute -bottom-2 -right-2 transform rotate-12" />
                        </div>
                    </div>

                    <h2 className="text-lg font-bold text-blue-800 mb-2 uppercase tracking-wide">{title}</h2>
                    <div className="h-0.5 bg-gray-300 w-full mb-4"></div>

                    <div className="flex items-start gap-4 text-left p-4 bg-yellow-50 border border-yellow-200 rounded mb-6">
                        <AlertCircle className="text-yellow-600 shrink-0" size={24} />
                        <div>
                            <p className="font-bold text-yellow-800 mb-1">Module Under Maintenance</p>
                            <p className="text-gray-600 leading-relaxed">
                                The <strong>{title}</strong> module is currently being configured for your station.
                                Full functionality will be restored after the next system update.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white font-bold hover:bg-blue-700 active:translate-y-0.5 transition-all shadow-md"
                    >
                        <LogOut size={16} />
                        BACK TO DASHBOARD
                    </button>

                    <p className="mt-4 text-[10px] text-gray-400 uppercase font-bold italic">HRM Payroll Pro - Module Not Configured</p>
                </div>
            </div>
        </div>
    );
};

export default ModulePlaceholder;
