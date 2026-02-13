import React, { useState } from 'react';
import {
    HelpCircle, Book, MessageSquare, Phone,
    FileText, ExternalLink, ChevronDown, ChevronRight
} from 'lucide-react';

const HelpSupport = () => {
    const [openFaqs, setOpenFaqs] = useState([]);

    const toggleFaq = (index) => {
        setOpenFaqs(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const faqs = [
        {
            question: "How do I reset an employee's password?",
            answer: "Go to the Employee Management screen, select the employee, click 'Edit', and use the 'Reset Password' option in the Security tab."
        },
        {
            question: "Why is the payroll calculation showing pending?",
            answer: "Payroll calculations remain in 'Pending' status until all timecards for the period are approved. Check the Timekeeper module for unapproved entries."
        },
        {
            question: "Can I reprint a payslip from last year?",
            answer: "Yes. Navigate to 'Reports > Payslip Archive', select the tax year and employee, and click 'Print Copy'."
        },
        {
            question: "How do I add a new allowance type?",
            answer: "Allowance types are managed in 'Company Settings > Payroll Engine'. You need Administrator privileges to add new pay codes."
        }
    ];

    const resources = [
        { title: "User Manual PDF", icon: <Book size={18} />, desc: "Complete guide to system functions" },
        { title: "Video Tutorials", icon: <ExternalLink size={18} />, desc: "Step-by-step walkthroughs" },
        { title: "Payroll Regulations", icon: <FileText size={18} />, desc: "Jamaica Tax Guidelines 2025" }
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] bg-[#EBE9D8] font-sans">
            {/* Header */}
            <div className="bg-[#EBE9D8] border-b border-white p-4 shadow-sm shrink-0">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-emerald-600 p-2 rounded text-white shadow-sm">
                        <HelpCircle size={20} />
                    </div>
                    <div>
                        <h1 className="text-emerald-800 font-black text-xl uppercase tracking-wider">Help & Support</h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Documentation & Assistance</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">

                    {/* Left Column: FAQs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-300 shadow-sm p-6 rounded-sm">
                            <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Frequently Asked Questions</h2>

                            <div className="space-y-2">
                                {faqs.map((faq, idx) => (
                                    <div key={idx} className="border border-gray-200 rounded overflow-hidden">
                                        <button
                                            onClick={() => toggleFaq(idx)}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 text-left transition-colors"
                                        >
                                            <span className="font-bold text-xs text-gray-700 uppercase">{faq.question}</span>
                                            {openFaqs.includes(idx) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>
                                        {openFaqs.includes(idx) && (
                                            <div className="p-4 bg-white text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#0B4FD7] text-white p-6 rounded shadow-md flex items-center justify-between overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="font-black text-lg uppercase tracking-widest">Need Live Assistance?</h3>
                                <p className="text-blue-100 text-xs mt-1 max-w-md">Our support team is available Mon-Fri, 9:00 AM - 5:00 PM EST. For critical payroll emergencies, use the priority hotline.</p>
                                <button className="mt-4 bg-white text-blue-700 px-6 py-2 rounded text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-sm">
                                    Start Live Chat
                                </button>
                            </div>
                            <MessageSquare size={120} className="absolute -right-6 -bottom-6 text-white opacity-10 rotate-12" />
                        </div>
                    </div>

                    {/* Right Column: Resources & Contact */}
                    <div className="space-y-6">
                        {/* Resources */}
                        <div className="bg-white border border-gray-300 shadow-sm p-6 rounded-sm">
                            <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-4">Resources</h2>
                            <div className="space-y-3">
                                {resources.map((res, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer group">
                                        <div className="text-gray-400 group-hover:text-blue-600">{res.icon}</div>
                                        <div>
                                            <h4 className="font-bold text-xs text-gray-800">{res.title}</h4>
                                            <p className="text-[10px] text-gray-500 uppercase">{res.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Direct Contact */}
                        <div className="bg-white border border-gray-300 shadow-sm p-6 rounded-sm">
                            <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-4">Contact Support</h2>

                            <div className="space-y-4 text-xs">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-full"><Phone size={14} /></div>
                                    <div>
                                        <p className="font-bold text-gray-800">1-888-HRM-HELP</p>
                                        <p className="text-gray-500">Toll Free Support</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-full"><MessageSquare size={14} /></div>
                                    <div>
                                        <p className="font-bold text-gray-800">support@islandhr.com</p>
                                        <p className="text-gray-500">24/7 Ticket System</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-4 border-gray-100" />

                            <div className="text-center">
                                <p className="text-[10px] text-gray-400">System ID: <span className="font-mono font-bold text-gray-600">SYS-2025-02-06-A</span></p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
