import React, { useState } from 'react';
import { Search, User, FileText, Settings, ArrowRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');

    // Dynamic Search Index (Navigation & Modules)
    const searchData = [
        // Employees
        { id: 1, title: 'Employee Directory', subtitle: 'Manage staff records and profiles', path: '/employees', type: 'Employee' },
        { id: 2, title: 'Attendance Ledger', subtitle: 'Daily check-in/out registers', path: '/attendance', type: 'Employee' },
        { id: 3, title: 'Leave Applications', subtitle: 'Holidays, Sick Leave, CASUAL', path: '/leave', type: 'Employee' },

        // Payroll & Finance
        { id: 4, title: 'Payroll Register', subtitle: 'Master pay sheets and totals', path: '/payroll/register', type: 'Report' },
        { id: 5, title: 'Salary Management', subtitle: 'Base pay and contract settings', path: '/salary', type: 'Employee' },
        { id: 6, title: 'Payroll Calculation', subtitle: 'Run Jamaica Tax Engine', path: '/processing/payroll-calculation', type: 'Page' },
        { id: 7, title: 'Processing Status', subtitle: 'System validation and errors', path: '/processing/status', type: 'Page' },
        { id: 8, title: 'Payslip Management', subtitle: 'Generate and dispatch slips', path: '/payslips/manage', type: 'Page' },

        // Reports
        { id: 9, title: 'Employee Report', subtitle: 'Staff list with demographics', path: '/reports/employee', type: 'Report' },
        { id: 10, title: 'Attendance Summary', subtitle: 'Work hour breakdowns', path: '/reports/attendance', type: 'Report' },
        { id: 11, title: 'Salary Report', subtitle: 'Pay structure analysis', path: '/reports/salary', type: 'Report' },
        { id: 12, title: 'Regulatory Hub', subtitle: 'NHT, NIS, S01, S02 Returns', path: '/reports/hub', type: 'Report' },

        // Tools
        { id: 13, title: 'System Search', subtitle: 'Global lookup tool', path: '/search', type: 'Page' },
        { id: 14, title: 'Help & Knowledge', subtitle: 'Documentation and support', path: '/help', type: 'Page' },
        { id: 15, title: 'File Manager', subtitle: 'Uploads and downloads', path: '/files', type: 'Page' },
        { id: 16, title: 'System Logs', subtitle: 'Audit trail explorer', path: '/tools/audit', type: 'Page' },
        { id: 17, title: 'Cheque Printing', subtitle: 'Physical payment slips batch/single', path: '/processing/cheque-printing', type: 'Page' },
        { id: 18, title: 'Bank Transfers (BNS)', subtitle: 'Generate bank advice files', path: '/banking/bns', type: 'Page' },
        { id: 19, title: 'S01 Monthly Return', subtitle: 'Statutory monthly payroll filing', path: '/statutory/s01', type: 'Report' },
        { id: 20, title: 'P45 Termination', subtitle: 'Statutory termination certificate', path: '/statutory/p45', type: 'Report' },
    ];

    const filteredResults = searchData.filter(item => {
        const matchesTerm = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'All' || item.type === category;
        return matchesTerm && matchesCategory;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'Employee': return <User size={16} className="text-blue-600" />;
            case 'Page': return <FileText size={16} className="text-gray-600" />;
            case 'Report': return <FileText size={16} className="text-green-600" />;
            case 'Setting': return <Settings size={16} className="text-gray-600" />;
            default: return <Search size={16} />;
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] bg-[#EBE9D8] font-sans pb-6">
            <div className="flex flex-col items-center justify-center pt-6 pb-4 px-4 sticky top-0 bg-[#EBE9D8] z-10 border-b border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                        <Search size={24} className="text-white" />
                    </div>
                    <h1 className="text-xl font-black text-[#0B4FD7] uppercase tracking-wider">Global System Search</h1>
                </div>

                <div className="w-full max-w-2xl relative">
                    <input
                        type="text"
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search employees, reports, pages, or transactions..."
                        className="w-full p-3 rounded shadow-[2px_2px_0_rgba(0,0,0,0.1)] border-2 border-blue-100 focus:border-blue-600 focus:shadow-[4px_4px_0_rgba(11,79,215,0.2)] outline-none text-base font-bold text-gray-700 transition-all uppercase placeholder:normal-case"
                    />
                </div>

                <div className="flex gap-2 mt-3">
                    {['All', 'Employee', 'Page', 'Report', 'Transaction'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${category === cat
                                ? 'bg-[#0B4FD7] text-white shadow-sm'
                                : 'bg-white text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-auto px-4 pt-6">
                <div className="max-w-5xl mx-auto">
                    {searchTerm && filteredResults.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="font-bold">No results found for "{searchTerm}"</p>
                            <p className="text-xs mt-1">Try checking your spelling or using different keywords.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredResults.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    className="bg-white border border-gray-200 p-2.5 rounded hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all group flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-gray-50 rounded group-hover:bg-blue-50 transition-colors">
                                            {getIcon(item.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-[13px] group-hover:text-blue-700 leading-tight">{item.title}</h3>
                                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{item.subtitle}</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!searchTerm && (
                        <div className="text-center py-8">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type above to begin searching...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
