import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Calendar, Clock, DollarSign, FileText,
    Download, ArrowRight, Shield, Award
} from 'lucide-react';

const EmployeeDashboard = () => {
    const navigate = useNavigate();

    const stats = [
        { label: 'Next Pay Date', value: 'Jan 28', icon: null, sub: 'in 4 days' },
        { label: 'Leave Balance', value: '14 Days', icon: null, sub: 'Vacation Time' },
        { label: 'Net Pay (Last)', value: '$124k', icon: null, sub: 'Dec 2025' },
        { label: 'Tax Status', value: 'Compliant', icon: null, sub: 'P24 Available' },
    ];

    const quickActions = [
        { label: 'My Payslips', icon: <FileText size={18} />, path: '/employee/payslips', desc: 'View & Download History' },
        { label: 'Request Leave', icon: <Calendar size={18} />, path: '/leave/request', desc: 'Submit Vacation Request' },
        { label: 'Tax Documents', icon: <FileText size={18} />, path: '/employee/tax-docs', desc: 'P24 & P45 Forms' },
        { label: 'Update Profile', icon: <User size={18} />, path: '/employee/profile', desc: 'Address & Banking Info' },
    ];

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F5F7] font-sans p-4 md:p-6 overflow-y-auto">
            {/* Header */}
            <div className="border-b border-gray-300 pb-4 mb-6">
                <h1 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
                    Employee Self-Service Portal
                </h1>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Personnel Record Management</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-3 border border-gray-300 rounded shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none truncate">{stat.label}</span>
                            <span className="text-lg font-bold text-gray-800 tracking-tight">{stat.value}</span>
                            <span className="text-[8px] font-medium text-gray-400 uppercase italic truncate">{stat.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Quick Action Desk */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 pb-1">
                        Employee Actions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (action.path.includes('leave') || action.path.includes('tax') || action.path.includes('profile')) {
                                        alert('Module integration pending');
                                    } else {
                                        navigate(action.path);
                                    }
                                }}
                                className="bg-white p-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-left flex items-center gap-3 group"
                            >
                                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                                    {action.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">{action.label}</span>
                                    <span className="text-[9px] text-gray-400 font-medium">{action.desc}</span>
                                </div>
                                <ArrowRight className="ml-auto text-gray-300 transition-colors" size={14} />
                            </button>
                        ))}
                    </div>

                    {/* Announcement Card */}
                    <div className="mt-4 bg-gray-100 border border-gray-300 p-4 rounded flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="text-gray-500">
                                <Award size={16} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Notice Board</h4>
                                <p className="text-xs font-medium text-gray-700 leading-tight">Annual Assessment Reports are now available for review.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/employee/documents')}
                            className="bg-gray-700 text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-gray-800 transition-colors whitespace-nowrap"
                        >
                            View Documents
                        </button>
                    </div>
                </div>

                {/* Right: Recent Files */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 pb-1">
                        Recent Documents
                    </h3>
                    <div className="bg-white border border-gray-300 rounded p-4 flex-1 shadow-sm">
                        <div className="flex flex-col gap-4">
                            {[
                                { name: 'Payslip_Jan26.pdf', date: '2 days ago', type: 'PAY' },
                                { name: 'Payslip_Dec25.pdf', date: '1 month ago', type: 'PAY' },
                                { name: 'P24_2025.pdf', date: '1 month ago', type: 'TAX' },
                                { name: 'Contract_JD.pdf', date: '1 year ago', type: 'HR' },
                            ].map((file, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 p-1">
                                    <div className="flex items-center gap-3">
                                        <div className="text-gray-400">
                                            <FileText size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-gray-800">{file.name}</span>
                                            <span className="text-[9px] text-gray-400 uppercase tracking-tight">{file.date}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const content = `DOCUMENT: ${file.name}
                                            
Type: ${file.type}
Date: ${file.date}

This is a sample document from the Employee Self-Service Portal.
Generated by SmartHRM System.

In production, this would download the actual document from the server.`;

                                            const blob = new Blob([content], { type: 'text/plain' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = file.name;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                        }}
                                        className="text-gray-400 hover:text-gray-800 transition-colors"
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
