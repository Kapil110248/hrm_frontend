import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, LogOut, FileText, Download, Settings } from 'lucide-react';

const CrystalReporting = () => {
    const navigate = useNavigate();
    const [selectedReport, setSelectedReport] = useState(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [config, setConfig] = useState({
        autoIndex: true,
        highFidelity: false,
        legacySupport: true,
        optimization: 'Aggressive Memory Cache'
    });
    const [params, setParams] = useState({
        dateFrom: '',
        dateTo: '',
        department: 'All Departments',
        format: 'PDF'
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastGenerated, setLastGenerated] = useState(null);

    const crystalReports = [
        { id: 'CR001', name: 'Payroll Summary Report', category: 'Payroll', template: 'PayrollSummary.rpt' },
        { id: 'CR002', name: 'Employee Master List', category: 'HR', template: 'EmployeeMaster.rpt' },
        { id: 'CR003', name: 'Statutory Returns', category: 'Compliance', template: 'StatutoryReturns.rpt' },
        { id: 'CR004', name: 'Bank Transfer Advice', category: 'Banking', template: 'BankAdvice.rpt' },
        { id: 'CR005', name: 'P24 - Year End Certificate', category: 'Compliance', template: 'P24Report.rpt' },
        { id: 'CR006', name: 'P45 - Termination Certificate', category: 'Compliance', template: 'P45Report.rpt' },
        { id: 'CR007', name: 'NHT Contribution Report', category: 'Compliance', template: 'NHTReport.rpt' },
        { id: 'CR008', name: 'NIS Contribution Report', category: 'Compliance', template: 'NISReport.rpt' },
        { id: 'CR009', name: 'Department Analysis', category: 'Analytics', template: 'DeptAnalysis.rpt' }
    ];

    const handleGenerate = () => {
        if (!selectedReport) return;
        setIsGenerating(true);
        // Simulate engine processing
        setTimeout(() => {
            setIsGenerating(false);
            setLastGenerated({
                name: selectedReport.name,
                timestamp: new Date().toLocaleString(),
                params: { ...params }
            });
            alert(`SUCCESS: ${selectedReport.name} generated successfully in ${params.format} format.`);
        }, 1500);
    };

    const handleExport = () => {
        if (!lastGenerated) {
            alert("ACTION REQUIRED: Please generate the report before exporting.");
            return;
        }
        alert(`INFO: Exporting ${selectedReport.name} as ${params.format}...`);
    };

    const toggleConfig = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCommitChanges = () => {
        alert("SYSTEM: Engine configuration updated and committed to registry.");
        setIsConfigOpen(false);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs relative">
            {/* Engine Config Modal */}
            {isConfigOpen && (
                <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#D4D0C8] border-2 border-white shadow-2xl w-full max-w-md animate-in zoom-in-95">
                        <div className="bg-[#316AC5] text-white p-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Settings size={14} />
                                <span className="font-bold text-[10px] uppercase tracking-widest italic">V8 Engine Configuration Matrix</span>
                            </div>
                            <button onClick={() => setIsConfigOpen(false)} className="px-2 hover:bg-red-600 transition-colors font-bold uppercase">X</button>
                        </div>
                        <div className="p-6 bg-[#EBE9D8] space-y-4">
                            <div className="bg-white border border-gray-400 p-4 shadow-sm">
                                <h4 className="font-black text-[9px] text-gray-500 uppercase tracking-widest mb-4 border-b pb-1">Global Engine Defaults</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-700">Auto-Index on Startup</span>
                                        <button
                                            onClick={() => toggleConfig('autoIndex')}
                                            className={`w-12 h-6 border border-gray-400 p-0.5 flex transition-colors ${config.autoIndex ? 'bg-green-600 justify-end' : 'bg-gray-400 justify-start'}`}
                                        >
                                            <div className="w-5 h-full bg-white shadow-md border border-gray-200"></div>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-700">High-Fidelity Rendering</span>
                                        <button
                                            onClick={() => toggleConfig('highFidelity')}
                                            className={`w-12 h-6 border border-gray-400 p-0.5 flex transition-colors ${config.highFidelity ? 'bg-green-600 justify-end' : 'bg-gray-400 justify-start'}`}
                                        >
                                            <div className="w-5 h-full bg-white shadow-md border border-gray-200"></div>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-700">Enable Legacy Support</span>
                                        <button
                                            onClick={() => toggleConfig('legacySupport')}
                                            className={`w-12 h-6 border border-gray-400 p-0.5 flex transition-colors ${config.legacySupport ? 'bg-green-600 justify-end' : 'bg-gray-400 justify-start'}`}
                                        >
                                            <div className="w-5 h-full bg-white shadow-md border border-gray-200"></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-400 p-4 shadow-sm">
                                <h4 className="font-black text-[9px] text-gray-500 uppercase tracking-widest mb-4 border-b pb-1">Optimization Layer</h4>
                                <select
                                    value={config.optimization}
                                    onChange={(e) => setConfig({ ...config, optimization: e.target.value })}
                                    className="w-full p-2 border-2 border-gray-200 bg-gray-50 text-[11px] font-bold text-blue-900 outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option>Aggressive Memory Cache</option>
                                    <option>Balanced Performance (Default)</option>
                                    <option>Low Resource Profile</option>
                                </select>
                            </div>
                        </div>
                        <div className="bg-[#D4D0C8] p-3 flex justify-end gap-2 border-t border-gray-400">
                            <button
                                onClick={handleCommitChanges}
                                className="px-10 py-2 bg-white border-2 border-gray-500 text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 active:translate-y-0.5 transition-all shadow-md italic"
                            >
                                Commit Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 py-1 flex items-center justify-between no-print shadow-sm">
                <div className="flex items-center gap-2">
                    <Settings className="text-blue-900" size={16} />
                    <span className="font-black text-gray-700 uppercase tracking-tighter italic">V8 Engine Report Builder</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsConfigOpen(true)}
                        className="px-3 py-1 bg-white border border-gray-400 text-blue-800 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 active:translate-y-0.5 transition-all shadow-sm flex items-center gap-1 group"
                    >
                        <Settings size={12} className="group-hover:rotate-90 transition-transform duration-500" />
                        Engine Config
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-hidden flex flex-col">
                <div className="flex gap-6 h-full">
                    {/* Left: Report List */}
                    <div className="w-96 bg-white border border-gray-400 shadow-xl flex flex-col">
                        <div className="bg-[#316AC5] p-3 border-b border-gray-600">
                            <h3 className="font-black text-white uppercase text-[11px] tracking-widest italic">Report Catalog</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-gray-50 p-1">
                            {crystalReports.map((report) => (
                                <button
                                    key={report.id}
                                    onClick={() => setSelectedReport(report)}
                                    className={`w-full text-left p-3 border border-transparent mb-1 transition-all group ${selectedReport?.id === report.id
                                        ? 'bg-blue-100 border-blue-400 shadow-sm'
                                        : 'hover:bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`font-black text-[11px] uppercase tracking-tighter ${selectedReport?.id === report.id ? 'text-blue-900' : 'text-gray-700'}`}>
                                        {report.name}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[8px] px-1.5 py-0.5 bg-gray-200 text-gray-600 font-bold rounded uppercase">{report.category}</span>
                                        <span className="text-[9px] text-gray-400 font-mono">{report.template}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Report Preview/Configuration */}
                    <div className="flex-1 bg-white border border-gray-400 shadow-2xl p-8 flex flex-col overflow-y-auto relative">
                        {isGenerating && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-50 flex items-center justify-center flex-col gap-4">
                                <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                                <p className="font-black text-blue-900 uppercase tracking-[0.3em] text-[10px] italic animate-pulse">Initializing Reporting Engine...</p>
                            </div>
                        )}

                        {selectedReport ? (
                            <div className="max-w-3xl mx-auto w-full">
                                <div className="mb-8 border-b-4 border-double border-blue-900 pb-6 text-center">
                                    <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter italic">{selectedReport.name}</h2>
                                    <div className="flex justify-center gap-4 mt-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {selectedReport.id}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">|</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TEMPLATE: {selectedReport.template}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 border-2 border-gray-200 shadow-inner mb-8">
                                    <h3 className="font-black text-[10px] text-blue-800 uppercase tracking-[0.2em] mb-6 border-b pb-2 italic">Runtime Parameters</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Start Period</label>
                                            <input
                                                type="date"
                                                value={params.dateFrom}
                                                onChange={(e) => setParams({ ...params, dateFrom: e.target.value })}
                                                className="w-full p-2.5 border border-gray-300 bg-white font-bold text-blue-900 outline-none focus:border-blue-500 transition-colors shadow-sm"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">End Period</label>
                                            <input
                                                type="date"
                                                value={params.dateTo}
                                                onChange={(e) => setParams({ ...params, dateTo: e.target.value })}
                                                className="w-full p-2.5 border border-gray-300 bg-white font-bold text-blue-900 outline-none focus:border-blue-500 transition-colors shadow-sm"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Department Filter</label>
                                            <select
                                                value={params.department}
                                                onChange={(e) => setParams({ ...params, department: e.target.value })}
                                                className="w-full p-2.5 border border-gray-300 bg-white font-bold text-blue-900 outline-none focus:border-blue-500 transition-colors shadow-sm cursor-pointer"
                                            >
                                                <option>All Departments</option>
                                                <option>IT</option>
                                                <option>HR</option>
                                                <option>Finance</option>
                                                <option>Sales</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-gray-500 font-black text-[9px] uppercase tracking-tighter">Output Protocol</label>
                                            <select
                                                value={params.format}
                                                onChange={(e) => setParams({ ...params, format: e.target.value })}
                                                className="w-full p-2.5 border border-gray-300 bg-white font-bold text-blue-900 outline-none focus:border-blue-500 transition-colors shadow-sm cursor-pointer"
                                            >
                                                <option>PDF (Static Document)</option>
                                                <option>EXCEL (Spreadsheet Matrix)</option>
                                                <option>WORD (Rich Text)</option>
                                                <option>RTF (Cross-Platform)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mb-12">
                                    <button
                                        onClick={handleGenerate}
                                        className="flex items-center gap-3 px-8 py-3 bg-green-700 text-white font-black text-[11px] uppercase tracking-widest hover:bg-green-800 active:translate-y-0.5 transition-all shadow-lg italic"
                                    >
                                        <Printer size={18} />
                                        Generate Matrix
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        className="flex items-center gap-3 px-8 py-3 bg-[#316AC5] text-white font-black text-[11px] uppercase tracking-widest hover:bg-blue-800 active:translate-y-0.5 transition-all shadow-lg italic"
                                    >
                                        <Download size={18} />
                                        Export Data
                                    </button>
                                </div>

                                {lastGenerated && (
                                    <div className="bg-blue-50 border-l-4 border-blue-900 p-6 animate-in fade-in slide-in-from-top-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-900 text-white rounded shadow-md">
                                                <FileText size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-blue-900 uppercase text-sm italic tracking-tight">Active Generation Buffer</h4>
                                                <div className="grid grid-cols-2 gap-4 mt-3">
                                                    <div>
                                                        <p className="text-[9px] text-gray-500 font-black uppercase">Report Instance</p>
                                                        <p className="text-xs font-bold text-gray-800">{lastGenerated.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-500 font-black uppercase">Timestamp</p>
                                                        <p className="text-xs font-bold text-gray-800">{lastGenerated.timestamp}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-500 font-black uppercase">Parameters Applied</p>
                                                        <p className="text-xs font-bold text-gray-800 italic">{lastGenerated.params.department} • {lastGenerated.params.format}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">
                                <div className="text-center">
                                    <FileText size={80} className="mx-auto mb-6 opacity-20" />
                                    <p className="font-black uppercase tracking-[0.4em] text-lg italic opacity-50">Select Report Definition</p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Awaiting instruction from Available Reports list...</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-12 flex justify-end">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-3 px-10 py-2.5 bg-white border-2 border-gray-400 text-[11px] font-black text-gray-800 hover:bg-gray-50 transition-all shadow-md active:translate-y-0.5 group uppercase italic"
                            >
                                <LogOut size={16} className="text-gray-600 group-hover:text-red-600" />
                                <span>Close Reporting Engine</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrystalReporting;

