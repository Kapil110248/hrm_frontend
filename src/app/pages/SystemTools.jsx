import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hammer, Calculator, ShieldAlert, Cpu, HardDrive, Settings, LogOut, ChevronRight, Activity } from 'lucide-react';

const SystemTools = () => {
    const navigate = useNavigate();

    const tools = [
        { id: 'calc', name: 'Financial Calculator', icon: <Calculator size={20} />, desc: 'Payroll and tax calculation helper', path: '/processing/payroll-calculation' },
        { id: 'diag', name: 'System Diagnostics', icon: <Cpu size={20} />, desc: 'Check station and database health', path: '/tools/diagnostics' },
        { id: 'clean', name: 'Database Cleanup', icon: <HardDrive size={20} />, desc: 'Purge old logs and optimize tables', path: '/tools/cleanup' },
        { id: 'sec', name: 'Security Audit', icon: <ShieldAlert size={20} />, desc: 'Scan for unauthorized access attempts', path: '/tools/security' },
    ];

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F5F7] font-sans">
            <div className="border-b border-gray-300 px-6 py-4">
                <h1 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Station Utility Toolkit</h1>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">System Diagnostics & Maintenance</p>
            </div>

            <div className="flex-1 p-6 md:p-12 overflow-y-auto">
                <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => navigate(tool.path)}
                            className="bg-white border border-gray-300 p-6 flex items-start gap-4 shadow-sm hover:bg-gray-50 transition-colors group text-left"
                        >
                            <div className="p-3 bg-gray-100 text-gray-500 rounded border border-gray-200 group-hover:text-gray-700 transition-colors">
                                {tool.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-800 uppercase mb-1">{tool.name}</h3>
                                <p className="text-gray-400 font-medium text-[10px] uppercase tracking-tight">{tool.desc}</p>
                            </div>
                            <ChevronRight className="text-gray-300 self-center" size={18} />
                        </button>
                    ))}
                </div>

                <div className="mt-8 w-full max-w-4xl mx-auto bg-gray-100 border border-gray-300 p-6 rounded flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Automated Maintenance</h4>
                        <p className="font-medium text-gray-400 uppercase text-[9px] mt-1">Last full optimization: 21/01/2026</p>
                    </div>
                    <button className="bg-gray-700 text-white px-6 py-2 rounded text-[10px] font-bold uppercase hover:bg-gray-800 transition-colors tracking-widest">
                        Run Diagnostics
                    </button>
                </div>
            </div>

            <div className="border-t border-gray-300 p-4 flex justify-end px-6 no-print bg-white">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 border border-gray-300 px-6 py-2 text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors"
                >
                    <LogOut size={14} className="text-gray-400" />
                    Back to Terminal
                </button>
            </div>
        </div>
    );
};

export default SystemTools;
