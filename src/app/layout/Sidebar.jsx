import React, { useState } from 'react';
import {
    LayoutDashboard, Users, Calculator, FileText,
    Settings, Landmark, ChevronDown, ChevronRight,
    Building2, History, Banknote, ShieldCheck,
    FilePieChart, UserPlus, X
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = ({ userRole, onClose }) => {
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState(['Payroll', 'Reports']);

    const toggleMenu = (title) => {
        setOpenMenus(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        );
    };

    const menuItems = [
        { title: 'Dashboard', icon: <LayoutDashboard size={14} />, path: '/' },
        { title: 'Companies', icon: <Building2 size={14} />, path: '/company/settings', roles: ['ADMIN'] },
        {
            title: 'Employees',
            icon: <Users size={14} />,
            children: [
                { title: 'Directory', path: '/employees' },
                { title: 'Payroll Config', path: '/employees/payroll-settings' },
                { title: 'Leave Control', path: '/leave' },
                { title: 'Attendance Log', path: '/attendance' },
                { title: 'Salary Masters', path: '/salary' },
            ]
        },
        {
            title: 'Processing',
            icon: <Calculator size={14} />,
            children: [
                { title: 'Pay Periods', path: '/payroll/periods' },
                { title: 'Execution Engine', path: '/processing/run-payroll' },
                { title: 'Batch Review', path: '/processing/payroll-review' },
                { title: 'Calculations', path: '/processing/payroll-calculation' },
                { title: 'Historical Log', path: '/payroll/history' },
                { title: 'Advancements', path: '/processing/advance' },
            ]
        },
        {
            title: 'Audit & Reports',
            icon: <FilePieChart size={14} />,
            children: [
                { title: 'Register Summary', path: '/reports/payroll-summary' },
                { title: 'Payslip Archive', path: '/payroll/payslip-preview' },
                { title: 'Statutory P24', path: '/reports/p24' },
                { title: 'Statutory P45', path: '/reports/p45' },
                { title: 'Compliance NHT', path: '/reports/nht' },
                { title: 'Compliance NIS', path: '/reports/nis' },
            ]
        },
        { title: 'Ledger Gateway', icon: <Landmark size={14} />, path: '/bank/details' },
        { title: 'Terminal Configuration', icon: <Settings size={14} />, path: '/company/setup', roles: ['ADMIN'] },
    ];

    const filteredItems = menuItems.filter(item =>
        !item.roles || item.roles.includes(userRole)
    );

    return (
        <div className="w-64 bg-[#222222] text-gray-400 h-full flex flex-col z-20 border-r border-[#333333]">
            {/* Terminal Branding */}
            <div className="h-14 flex items-center justify-between px-6 bg-[#1A1A1A] text-white shrink-0 border-b border-[#333333]">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="font-bold tracking-widest text-[11px] leading-tight uppercase">Island HR Solutions</span>
                        <span className="text-[7px] uppercase tracking-[0.3em] opacity-40 font-black">HRM System</span>
                    </div>
                </div>
                <button onClick={onClose} className="md:hidden p-1 hover:bg-white/10 rounded-full transition-colors"><X size={16} /></button>
            </div>

            {/* Navigation Ledger */}
            <nav className="flex-1 overflow-y-auto py-6">
                {filteredItems.map((item, idx) => (
                    <div key={idx} className="mb-2">
                        {item.children ? (
                            <div>
                                <button
                                    onClick={() => toggleMenu(item.title)}
                                    className={`w-full flex items-center justify-between px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-white ${openMenus.includes(item.title) ? 'text-white' : 'text-gray-500'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        {item.title}
                                    </div>
                                    {openMenus.includes(item.title) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                </button>

                                {openMenus.includes(item.title) && (
                                    <div className="mt-2 mb-4 space-y-1">
                                        {item.children.map((child, cIdx) => (
                                            <NavLink
                                                key={cIdx}
                                                to={child.path}
                                                onClick={onClose}
                                                className={({ isActive }) =>
                                                    `flex items-center px-12 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border-l-2 ${isActive
                                                        ? 'text-white border-white bg-white/5'
                                                        : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                                                    }`
                                                }
                                            >
                                                {child.title}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <NavLink
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border-l-2 ${isActive
                                        ? 'text-white border-white bg-white/5'
                                        : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                                    }`
                                }
                            >
                                {item.icon}
                                {item.title}
                            </NavLink>
                        )}
                    </div>
                ))}
            </nav>

            {/* System Status Footer */}
            <div className="p-4 bg-[#1A1A1A] border-t border-[#333333]">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-sm border border-white/5">
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-black text-gray-300 truncate uppercase tracking-widest">{userRole} AUTHENTICATED</span>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest leading-none">Terminal Session Clear</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
