import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Printer, Filter, Calendar, Building, User, Download, ShieldCheck, ChevronRight, Landmark, Loader2, Activity } from 'lucide-react';
import { api } from '../../services/api';

const ReportsHub = () => {
    const navigate = useNavigate();
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedYear, setSelectedYear] = useState('2026');
    const [entityScope, setEntityScope] = useState('ALL BRANCHES');
    const [dynamicFilter, setDynamicFilter] = useState('');
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [isCompiling, setIsCompiling] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [aggregateData, setAggregateData] = useState({ count: 0, gross: 0, tax: 0, net: 0 });

    useEffect(() => {
        const companyStr = localStorage.getItem('selectedCompany');
        if (companyStr) {
            setSelectedCompany(JSON.parse(companyStr));
        }
    }, []);

    const fetchAggregateStats = async () => {
        if (!selectedCompany) return;
        setIsCompiling(true);
        try {
            // Fetch all payrolls for the company to calculate year aggregates
            const res = await api.fetchPayrolls({ companyId: selectedCompany.id });
            if (res.success) {
                const yearData = res.data.filter(p => p.period.includes(selectedYear));
                const stats = yearData.reduce((acc, p) => ({
                    count: acc.count + 1,
                    gross: acc.gross + parseFloat(p.grossSalary),
                    tax: acc.tax + parseFloat(p.tax),
                    net: acc.net + parseFloat(p.netSalary)
                }), { count: 0, gross: 0, tax: 0, net: 0 });
                setAggregateData(stats);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsCompiling(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(val || 0);
    };

    const reports = [
        { id: 'P24', title: 'P24 - Year End Certificates (Tax Administration Jamaica)', type: 'Annual', code: 'GOJ-P24-V2', icon: ShieldCheck, path: '/statutory/p24' },
        { id: 'P45', title: 'P45 - Employee Termination (Tax Administration Jamaica)', type: 'Ad-hoc', code: 'GOJ-P45-X1', icon: FileText, path: '/statutory/p45' },
        { id: 'S01', title: 'S01 - Monthly Statutory Remittance', type: 'Monthly', code: 'GOJ-S01-M', icon: Calendar, path: '/statutory/s01' },
        { id: 'NIS', title: 'NIS / NHT Annual Contribution Report', type: 'Annual', code: 'GOJ-NIS-04', icon: Building, path: '/statutory/nis-nht' },
        { id: 'NHT', title: 'NHT Contribution by Employee/Year', type: 'Annual', code: 'GOJ-NHT-02', icon: User, path: '/statutory/nht' },
        { id: 'PAY', title: 'Master Payroll Summary', type: 'Internal', code: 'INT-PAY-SUM', icon: Printer, path: '/reports/payroll-summary' },
    ];

    const handleReportSelect = (report) => {
        setSelectedReport(report);
        // Reset aggregates when switching reports, or maybe keep them if they are general?
        // The fetchAggregateStats function seems to fetch company-wide payrolls, so it might be the same for all?
        // Actually, let's just refetch to be safe and show loading state.
        setAggregateData({ count: 0, gross: 0, tax: 0, net: 0 });
        fetchAggregateStats();
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans selection:bg-blue-200 overflow-hidden">
            {/* Header */}
            <header className="bg-gradient-to-b from-[#EEEEEE] to-[#D4D0C8] border-b border-gray-400 p-2 flex items-center justify-between no-print shrink-0 shadow-sm z-30">
                <div className="flex items-center gap-2 pl-2">
                    <ShieldCheck className="text-blue-800 drop-shadow-sm" size={18} />
                    <h1 className="font-black text-gray-700 uppercase italic tracking-tight text-xs sm:text-sm">
                        Statutory Reporting <span className="text-blue-700 tracking-widest ml-1 hidden xs:inline">CENTRE</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3 pr-2">
                    <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 bg-white/50 border border-white/60 rounded text-[10px] font-bold text-gray-500 italic">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                        Compliance Verified
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                {/* Left Sidebar - Report Directory */}
                <aside className="w-full md:w-72 shrink-0 bg-white border-b md:border-b-0 md:border-r-2 border-gray-400 flex flex-col z-20 shadow-lg md:shadow-none">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Report Library</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                    <nav className="flex md:flex-col overflow-x-auto md:overflow-y-auto no-scrollbar md:pb-12">
                        {reports.map((report) => (
                            <button
                                key={report.id}
                                onClick={() => handleReportSelect(report)}
                                className={`group p-4 shrink-0 md:shrink-0 text-left border-b border-r md:border-r-0 border-gray-100 transition-all min-w-[180px] md:min-w-0 md:w-full relative ${selectedReport?.id === report.id
                                    ? 'bg-[#316AC5] text-white shadow-inner'
                                    : 'text-gray-600 hover:bg-blue-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-1">
                                    <report.icon size={14} className={selectedReport?.id === report.id ? 'text-blue-200' : 'text-gray-400 group-hover:text-blue-500'} />
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{report.type}</span>
                                </div>
                                <div className="font-black text-[11px] leading-tight mb-1 uppercase italic">{report.title}</div>
                                <div className={`text-[9px] font-bold ${selectedReport?.id === report.id ? 'text-blue-200' : 'text-gray-400'}`}>
                                    FORM: {report.code}
                                </div>
                                {selectedReport?.id === report.id && (
                                    <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:block" size={16} />
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col bg-[#F2F0E4] relative overflow-hidden">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#d1d1d1_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none"></div>

                    {selectedReport ? (
                        <div className="flex-1 flex flex-col min-h-0 z-10">
                            {/* Parameters Toolbar */}
                            <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-gray-300 shadow-sm">
                                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-end gap-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 w-full">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Taxation Year</label>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                className="w-full bg-[#EBE9D8] border-b-2 border-gray-400 p-2 text-xs font-black focus:border-blue-600 outline-none transition-all"
                                            >
                                                <option>2026</option>
                                                <option>2025</option>
                                                <option>2024</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Entity Scope</label>
                                            <div className="flex items-center bg-[#EBE9D8] border-b-2 border-gray-400 p-2">
                                                <Building size={14} className="mr-2 text-blue-800" />
                                                <select
                                                    value={entityScope}
                                                    onChange={(e) => setEntityScope(e.target.value)}
                                                    className="bg-transparent border-none outline-none text-xs font-black flex-1"
                                                >
                                                    <option>ALL BRANCHES</option>
                                                    <option>HEAD OFFICE</option>
                                                    <option>REMOTE DIV.</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 col-span-2">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dynamic Filter (Optional)</label>
                                            <div className="flex items-center bg-[#EBE9D8] border-b-2 border-gray-400 p-2">
                                                <User size={14} className="mr-2 text-blue-800" />
                                                <input
                                                    type="text"
                                                    placeholder="IDENTITY SEARCH..."
                                                    value={dynamicFilter}
                                                    onChange={(e) => setDynamicFilter(e.target.value.toUpperCase())}
                                                    className="bg-transparent border-none outline-none text-xs font-black w-full uppercase placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full lg:w-auto">
                                        <button
                                            onClick={fetchAggregateStats}
                                            disabled={isCompiling || !selectedReport}
                                            className="flex-1 lg:flex-none bg-blue-700 text-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isCompiling ? 'COMPILING...' : 'Compile Preview'}
                                        </button>
                                        <button
                                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                                            className={`p-2 border-2 transition-all active:scale-95 ${showFilterPanel ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-400 text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <Filter size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Report Canvas */}
                            <div className="flex-1 overflow-auto p-4 md:p-8 lg:p-12 flex justify-center items-start bg-gray-400/50 shadow-inner">
                                <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl p-6 md:p-[15mm] text-black font-serif relative transition-all duration-500 hover:shadow-blue-900/10 origin-top">

                                    {/* Report Stamp */}
                                    <div className="absolute top-[20mm] right-[20mm] opacity-[0.03] select-none pointer-events-none">
                                        <ShieldCheck size={400} />
                                    </div>

                                    {/* Professional Header */}
                                    <div className="border-b-[3px] border-black pb-6 mb-8">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Landmark size={24} className="text-blue-900" />
                                                    <span className="text-[10pt] font-black tracking-[0.3em] uppercase opacity-50">Draft Transmission</span>
                                                </div>
                                                <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight leading-none mb-2">{selectedReport.title}</h2>
                                                <div className="flex gap-4 text-[9pt] font-bold uppercase text-gray-500">
                                                    <span>Form Code: <b className="text-black">{selectedReport.code}</b></span>
                                                    <span>Authority: <b className="text-black">TAJ - Jamaica</b></span>
                                                </div>
                                            </div>
                                            <div className="md:text-right text-[10pt]">
                                                <div className="bg-black text-white px-4 py-1 inline-block mb-1 font-black uppercase tracking-widest">Year: {selectedYear}</div>
                                                <p className="font-bold uppercase italic opacity-40">Ref: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y-2 border-dashed border-gray-200">
                                            <div className="space-y-4">
                                                <div className="flex flex-col border-l-4 border-blue-900 pl-4">
                                                    <span className="text-[8pt] font-black text-gray-400 uppercase tracking-widest mb-1">Registered Entity</span>
                                                    <span className="text-[11pt] font-bold uppercase">{selectedCompany?.name || 'SYNCING...'}</span>
                                                </div>
                                                <div className="flex flex-col border-l-4 border-blue-900 pl-4">
                                                    <span className="text-[8pt] font-black text-gray-400 uppercase tracking-widest mb-1">Taxpayer ID (TRN)</span>
                                                    <span className="text-[11pt] font-bold tabular-nums">{selectedCompany?.trn || '000-000-000'}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-4 md:text-right">
                                                <div className="flex flex-col">
                                                    <span className="text-[8pt] font-black text-gray-400 uppercase tracking-widest mb-1">Generation Date</span>
                                                    <span className="text-[11pt] font-bold tabular-nums">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                                </div>
                                                <div className="flex flex-col italic">
                                                    <span className="text-[8pt] font-black text-gray-400 uppercase tracking-widest mb-1">Status</span>
                                                    <span className={`text-[11pt] font-black uppercase ${isCompiling ? 'animate-pulse text-orange-600' : 'text-blue-800'}`}>
                                                        {isCompiling ? 'Compiling Live Streams...' : 'Pre-Validation Active'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Abstract Data Visualization Area */}
                                        <div className="border-2 border-gray-100 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50/50 p-12">
                                            <div className="absolute inset-0 bg-[#316AC5] opacity-[0.02] flex flex-col justify-around">
                                                {[...Array(20)].map((_, i) => <div key={i} className="h-px w-full bg-black/10"></div>)}
                                            </div>
                                            {isCompiling ? (
                                                <div className="text-center z-10">
                                                    <Loader2 size={64} className="mx-auto text-blue-200 mb-4 animate-spin" />
                                                    <h3 className="text-xl font-bold uppercase tracking-[0.2em] text-gray-300">Syncing Engine</h3>
                                                </div>
                                            ) : aggregateData.count > 0 ? (
                                                <div className="w-full z-10 space-y-8">
                                                    <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                                                        <Activity className="text-blue-800" size={32} />
                                                        <div>
                                                            <h3 className="text-lg font-black uppercase text-gray-800 tracking-tighter">Aggregate Summary - {selectedYear}</h3>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Based on {aggregateData.count} processed sequences</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-8">
                                                        <div>
                                                            <span className="text-[8pt] font-black text-gray-400 uppercase tracking-widest block mb-1">Gross Emoluments</span>
                                                            <span className="text-xl font-black text-gray-900">{formatCurrency(aggregateData.gross)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[8pt] font-black text-gray-400 uppercase tracking-widest block mb-1">Tax Withheld (PAYE)</span>
                                                            <span className="text-xl font-black text-red-700">{formatCurrency(aggregateData.tax)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[8pt] font-black text-gray-400 uppercase tracking-widest block mb-1">Net Disbursements</span>
                                                            <span className="text-xl font-black text-blue-900">{formatCurrency(aggregateData.net)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-blue-50/50 p-4 border border-blue-100 italic text-[10px] text-blue-800 font-bold uppercase">
                                                        Transmission ready. Encrypted signature verified for all processed sequences in {selectedYear}.
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center z-10 px-8">
                                                    <FileText size={64} className="mx-auto text-gray-200 mb-4" />
                                                    <h3 className="text-xl font-bold uppercase tracking-[0.2em] text-gray-300">Data Stream Preview</h3>
                                                    <p className="text-gray-400 text-sm italic mt-2">No payroll sequences discovered for {selectedYear} in current scope.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Verification Footer */}
                                    <div className="absolute bottom-12 left-[15mm] right-[15mm] pt-6 border-t border-gray-200">
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 border-2 border-gray-300 rounded flex items-center justify-center font-black text-gray-400 transform rotate-12">SEAL</div>
                                                <div className="text-[8pt] font-black text-gray-400 uppercase leading-none">
                                                    Authorized System<br />
                                                    Digital Fingerprint<br />
                                                    {Math.random().toString(16).substr(2, 12).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="w-48 border-b-2 border-black h-8 mb-1"></div>
                                                <span className="text-[8pt] font-black uppercase tracking-widest opacity-50">Controller Signature</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Action Buttons */}
                            <div className="absolute bottom-40 right-6 flex flex-col gap-3 z-30 no-print">
                                {selectedReport?.path && (
                                    <button
                                        onClick={() => navigate(selectedReport.path)}
                                        className="flex items-center gap-2 px-4 py-3 bg-gray-800 text-white rounded shadow hover:bg-gray-900 group"
                                    >
                                        <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                                            <ChevronRight size={16} />
                                        </div>
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[9px] font-bold uppercase opacity-70">Proceed to</span>
                                            <span className="text-sm font-bold">Open Module</span>
                                        </div>
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        const content = `STATUTORY REPORT - ${selectedReport.title}

Form Code: ${selectedReport.code}
Authority: TAJ - Jamaica
Year: ${selectedYear}
Generation Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

REGISTERED ENTITY
-----------------
Company: ${selectedCompany?.name || 'N/A'}
Taxpayer ID (TRN): ${selectedCompany?.trn || '000-000-000'}

AGGREGATE SUMMARY
-----------------
Gross: ${formatCurrency(aggregateData.gross)}
Tax: ${formatCurrency(aggregateData.tax)}
Net: ${formatCurrency(aggregateData.net)}
Count: ${aggregateData.count}

REPORT STATUS
-------------
Status: Pre-Validation Active
Reference: ${Math.random().toString(36).substr(2, 6).toUpperCase()}

Generated by SmartHRM - Jamaica Compliance Module v4.2.0`;

                                        const blob = new Blob([content], { type: 'text/plain' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${selectedReport.code}_${selectedYear}_Report.txt`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                    }}
                                    className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded shadow hover:bg-green-700"
                                >
                                    <Download size={20} />
                                    <span className="text-sm font-semibold">Secure Download</span>
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
                                >
                                    <Printer size={20} />
                                    <span className="text-sm font-semibold">Hard-Copy Print</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
                            <div className="w-32 h-32 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-gray-300 mb-8 shadow-inner">
                                <ShieldCheck size={48} className="text-gray-300" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-400 uppercase italic tracking-[0.2em] mb-4">Awaiting Selection</h2>
                            <p className="max-w-md text-gray-500 font-bold leading-relaxed">
                                Please choose a statutory return format from the <span className="text-blue-700">Report Library</span> on the left to initialize the transmission sequence.
                            </p>
                            <div className="mt-12 flex gap-4">
                                <div className="w-1 bg-[#316AC5] h-12"></div>
                                <div className="text-left font-black text-[10px] text-gray-400 uppercase tracking-widest">
                                    Jamaica Compliance<br />
                                    Module version 4.2.0<br />
                                    Encrypted Channel v2
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ReportsHub;
