import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grid, Users, DollarSign, Database,
    FileText, Calculator, Settings, ArrowRight,
    Briefcase, Truck
} from 'lucide-react';

const CustomizedModules = () => {
    const navigate = useNavigate();

    const modules = [
        {
            id: 'gang-shift',
            title: 'Gang & Shift Rotation',
            description: 'Manage complex team assignments, shift patterns, and gang allocations for payroll processing.',
            icon: <Users size={24} className="text-blue-600" />,
            path: '/processing/gang-shift',
            status: 'Active',
            category: 'Operations'
        },
        {
            id: 'sales-commission',
            title: 'Sales Commission Engine',
            description: 'Automated calculation of sales shares, commissions, and performance-based payouts.',
            icon: <DollarSign size={24} className="text-green-600" />,
            path: '/processing/sales-share',
            status: 'Active',
            category: 'Finance'
        },
        {
            id: 'mass-update',
            title: 'Mass Data Processor',
            description: 'Bulk update employee records, rates, and static data fields efficiently.',
            icon: <Database size={24} className="text-purple-600" />,
            path: '/processing/mass-updating',
            status: 'Active',
            category: 'Admin Tools'
        },
        {
            id: 'mass-entry',
            title: 'Mass Transaction Entry',
            description: 'High-speed data entry for payroll transactions, allowances, and deductions.',
            icon: <Calculator size={24} className="text-orange-600" />,
            path: '/processing/mass-entry',
            status: 'Active',
            category: 'Data Entry'
        },
        {
            id: 'bank-integrations',
            title: 'Bank Integration Hub',
            description: 'Generate proprietary bank files for BNS, NCB, JMMB, and other local financial institutions.',
            icon: <Briefcase size={24} className="text-indigo-600" />,
            path: '/bank/details',
            status: 'Configured',
            category: 'Banking'
        },
        {
            id: 'system-tools',
            title: 'System Diagnostics',
            description: 'Advanced system checks, database integrity tools, and granular configuration.',
            icon: <Settings size={24} className="text-gray-600" />,
            path: '/tools',
            status: 'Restricted',
            category: 'Maintenance'
        }
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] bg-[#EBE9D8] font-sans">
            {/* Header */}
            <div className="bg-[#EBE9D8] border-b border-white p-4 shadow-sm shrink-0">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 p-2 rounded text-white shadow-sm">
                        <Grid size={20} />
                    </div>
                    <div>
                        <h1 className="text-[#0B4FD7] font-black text-xl uppercase tracking-wider">Customized Modules</h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Installed Components & Extensions</p>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 p-6 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {modules.map((module) => (
                        <div key={module.id} className="bg-white border border-gray-400 shadow-[2px_2px_0_rgba(0,0,0,0.1)] p-5 flex flex-col hover:border-blue-500 transition-colors group h-full">

                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                    {module.icon}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${module.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                                        module.status === 'Configured' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-gray-100 text-gray-500 border-gray-200'
                                    }`}>
                                    {module.status}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-700">{module.title}</h3>
                            <p className="text-xs text-gray-500 mb-6 leading-relaxed flex-1">
                                {module.description}
                            </p>

                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{module.category}</span>
                                <button
                                    onClick={() => navigate(module.path)}
                                    className="flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline uppercase tracking-wide"
                                >
                                    Login Module <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="max-w-7xl mx-auto mt-8 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                        HRM Terminal v2.5.0 • Registered to Island HR Solutions
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomizedModules;
