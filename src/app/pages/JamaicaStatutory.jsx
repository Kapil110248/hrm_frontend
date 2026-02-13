import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Download, Upload, CheckCircle, Printer,
    Save, LogOut, ShieldCheck, Landmark, Search, Loader2
} from 'lucide-react';
import { api } from '../../services/api';

const JamaicaStatutory = ({ type = 'S01' }) => {
    const navigate = useNavigate();
    const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [loading, setLoading] = useState(false);
    const [payrollData, setPayrollData] = useState([]);
    const [company, setCompany] = useState(null);

    useEffect(() => {
        const fetchReportData = async () => {
            const companyStr = localStorage.getItem('selectedCompany');
            const c = companyStr ? JSON.parse(companyStr) : null;
            setCompany(c);

            if (!c) return;

            setLoading(true);
            try {
                // Convert YYYY-MM to Month-YYYY for backend (e.g. Feb-2026)
                const date = new Date(period + '-01');
                const periodParam = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;

                const res = await api.fetchPayrolls({
                    companyId: c.id,
                    period: periodParam
                });

                if (res.success) {
                    setPayrollData(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [period, type]);

    const reports = {
        'P45': {
            title: 'P45 - Employee Termination Certificate',
            formCode: 'F-P45-TAJ',
            fields: [
                { label: 'Cumulative Gross Pay', category: 'Financials', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.grossSalary), 0).toFixed(2) },
                { label: 'Cumulative Income Tax', category: 'Financials', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.tax), 0).toFixed(2) },
                { label: 'Employer TRN', category: 'Entity', value: () => company?.trn || 'NOT_FOUND' }
            ]
        },
        'NIS-NHT': {
            title: 'NIS / NHT Statutory Contributions',
            formCode: 'F-NIS/NHT-ANNUAL',
            fields: [
                { label: 'Gross Pay for Period', category: 'Financials', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.grossSalary), 0).toFixed(2) },
                { label: 'NIS Employer (3%)', category: 'Financials', value: (data) => (data.reduce((sum, p) => sum + parseFloat(p.grossSalary), 0) * 0.03).toFixed(2) },
                { label: 'NIS Employee (3%)', category: 'Financials', value: (data) => (data.reduce((sum, p) => sum + parseFloat(p.grossSalary), 0) * 0.03).toFixed(2) },
                { label: 'NHT Employer (3%)', category: 'Financials', value: (data) => (data.reduce((sum, p) => sum + parseFloat(p.grossSalary), 0) * 0.03).toFixed(2) },
                { label: 'NHT Employee (2%)', category: 'Financials', value: (data) => (data.reduce((sum, p) => sum + parseFloat(p.grossSalary), 0) * 0.02).toFixed(2) }
            ]
        },
        'S01': {
            title: 'S01 - Monthly Statutory Remittance',
            formCode: 'F-S01-MONTHLY',
            fields: [
                { label: 'PAYE Liability', category: 'Taxation', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.tax), 0).toFixed(2) },
                { label: 'Education Tax (ER 3.5%)', category: 'Taxation', value: (data) => (data.reduce((sum, p) => sum + parseFloat(p.grossSalary), 0) * 0.035).toFixed(2) },
                { label: 'Education Tax (EE 2.25%)', category: 'Taxation', value: (data) => (data.reduce((sum, p) => sum + parseFloat(p.grossSalary), 0) * 0.0225).toFixed(2) },
                { label: 'NIS Total (6%)', category: 'Social Security', value: (data) => (data.reduce((sum, p) => sum + parseFloat(p.grossSalary), 0) * 0.06).toFixed(2) },
                { label: 'NHT Total (5%)', category: 'Housing', value: (data) => (data.reduce((sum, p) => sum + parseFloat(p.grossSalary), 0) * 0.05).toFixed(2) },
                { label: 'HEART Trust (3%)', category: 'Social Security', value: (data) => (data.reduce((sum, p) => sum + parseFloat(p.grossSalary), 0) * 0.03).toFixed(2) }
            ]
        },
        'S02': {
            title: 'S02 - Annual Statutory Declaration',
            formCode: 'F-S02-YEARLY',
            fields: [
                { label: 'Total Annual Gross', category: 'Financials', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.grossSalary), 0).toFixed(2) },
                { label: 'Total PAYE Withheld', category: 'Financials', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.tax), 0).toFixed(2) }
            ]
        }
    };

    const currentReport = reports[type] || reports['S01'];

    return (
        <div className="flex flex-col h-full w-full bg-[#525659] font-sans selection:bg-blue-200 relative overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-black/30 z-[100] flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="animate-spin text-white" size={48} />
                </div>
            )}

            {/* Report Toolbar */}
            <div className="bg-[#323639] border-b border-black px-2 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between no-print shadow-xl z-20 gap-3 sm:gap-0">
                <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 shrink-0">
                        <FileText className="text-white" size={16} />
                        <span className="text-white text-[10px] sm:text-xs font-black uppercase tracking-tighter truncate max-w-[150px] sm:max-w-none">{currentReport.title}</span>
                    </div>
                    <div className="h-6 w-px bg-gray-600 shrink-0 hidden sm:block"></div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-black text-gray-400 uppercase italic">Filing Period:</span>
                        <input
                            type="month"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="bg-[#202124] border border-gray-700 text-blue-400 text-[9px] sm:text-[10px] font-black p-1 rounded focus:outline-none"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button onClick={() => window.print()} className="flex-1 sm:flex-none p-1.5 sm:p-1 px-3 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] sm:text-[10px] font-black uppercase shadow-inner transition-all flex items-center justify-center gap-2">
                        <Printer size={12} /> <span className="sm:inline">Print</span>
                    </button>
                    <button className="flex-1 sm:flex-none p-1.5 sm:p-1 px-3 sm:px-4 bg-gray-700 hover:bg-gray-600 text-white rounded text-[9px] sm:text-[10px] font-black uppercase border border-gray-600 transition-all flex items-center justify-center gap-2">
                        <Download size={12} /> <span className="sm:inline">Export</span>
                    </button>
                    <div className="h-6 w-px bg-gray-600 mx-1 hidden sm:block"></div>
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors p-1">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* View Area */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-8 lg:p-12 flex justify-center bg-[#525659]">
                <div className="bg-white w-full max-w-[8.5in] min-h-[11in] shadow-2xl p-6 sm:p-12 md:p-16 flex flex-col relative overflow-hidden">

                    {/* Watermark Logo */}
                    <div className="absolute top-8 sm:top-16 right-8 sm:right-16 opacity-[0.03] pointer-events-none">
                        <div className="w-16 h-16 sm:w-64 sm:h-64 border-[10px] border-blue-900 rounded-full flex items-center justify-center font-black text-blue-900 text-2xl sm:text-9xl italic">S</div>
                    </div>

                    <div className="mb-8 sm:mb-12 border-b-2 border-blue-900 pb-6 sm:pb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                            <div>
                                <h1 className="text-xl sm:text-3xl font-black text-blue-900 italic tracking-tighter leading-none mb-1">OFFICIAL RETURN</h1>
                                <p className="text-[10px] sm:text-[12px] font-black text-gray-500 uppercase tracking-[0.1em] sm:tracking-[0.2em]">{currentReport.title}</p>
                                <div className="mt-4 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase">FORM CODE: <span className="text-gray-800">{currentReport.formCode}</span></div>
                            </div>
                            <div className="sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase leading-none">Government of Jamaica</p>
                                <p className="text-[10px] sm:text-[11px] font-black text-blue-900 uppercase mt-1">Tax Administration Jamaica (TAJ)</p>
                                <div className="mt-4 text-[9px] sm:text-[10px] font-bold text-gray-400 italic">Snapshot Date: {new Date().toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-10">
                        {Array.from(new Set(currentReport.fields.map(f => f.category))).map((cat, idx) => (
                            <div key={idx} className="space-y-4">
                                <h3 className="text-[9px] sm:text-[11px] font-black text-blue-900 uppercase tracking-widest border-l-4 border-blue-900 pl-2 sm:pl-3 bg-gray-50 py-1.5 flex justify-between items-center">
                                    <span>Section {idx + 1}: {cat}</span>
                                    <span className="text-[8px] opacity-40 font-bold">{company?.name || 'SYNC_ID_LIVE'}</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 px-4">
                                    {currentReport.fields.filter(f => f.category === cat).map((field, fIdx) => (
                                        <div key={fIdx} className="flex flex-col border-b border-gray-100 pb-2 group hover:border-blue-200 transition-colors">
                                            <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">{field.label}</span>
                                            <div className="text-[11px] sm:text-sm font-black text-gray-800 uppercase tabular-nums py-1 flex items-center justify-between">
                                                <span>$</span>
                                                <span>{field.value ? field.value(payrollData) : '0.00'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {payrollData.length === 0 && !loading && (
                            <div className="p-12 text-center border-2 border-dashed border-gray-100 italic font-bold text-gray-300 uppercase tracking-widest text-[10px]">
                                No payroll transmission found for the selected period. Report values defaulted to zero sequence.
                            </div>
                        )}
                    </div>

                    <div className="mt-20 p-6 border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-6 italic relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none rotate-12">
                            <ShieldCheck size={120} />
                        </div>
                        <ShieldCheck className="text-blue-900 shrink-0 mx-auto sm:mx-0 relative z-10" size={24} />
                        <div className="w-full relative z-10">
                            <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase italic mb-1 text-center sm:text-left tracking-widest">Certification of Accuracy</p>
                            <p className="text-[10px] sm:text-[11px] text-gray-600 leading-relaxed font-bold text-center sm:text-left">
                                I hereby certify that the information provided in this statutory return is true and correct, and has been computed in accordance with the <span className="text-blue-900 font-black">Tax Administration Act of Jamaica</span> using the SmartHRM Engine v5.1.
                            </p>
                            <div className="mt-12 flex flex-col sm:flex-row justify-between items-center sm:items-end border-t border-gray-300 pt-4 gap-4 sm:gap-0">
                                <div className="text-center w-full sm:w-auto">
                                    <div className="w-48 border-b-2 border-gray-900 pb-1 font-mono italic text-xs uppercase text-gray-400">Electronic Sign</div>
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1 block">Authorized Agent</span>
                                </div>
                                <div className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Stamp: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center opacity-30 gap-2 sm:gap-0">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Official Payroll Protocol Audit Document — Year {new Date().getFullYear()}</span>
                        <div className="flex items-center gap-2">
                            <Landmark size={12} className="text-gray-400" />
                            <span className="text-[8px] font-black text-gray-400 italic">SMARTHRM COMPLIANCE SUITE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JamaicaStatutory;
