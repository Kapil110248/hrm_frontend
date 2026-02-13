import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Search, User, ArrowLeft, Printer, Download, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const PayslipPreview = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.fetchPayrolls({
                companyId: selectedCompany.id
            });
            if (response.success) {
                const mapped = response.data.map(p => ({
                    id: p.id,
                    empId: p.employee?.employeeId,
                    name: `${p.employee?.firstName} ${p.employee?.lastName}`,
                    period: p.period,
                    trn: p.employee?.trn || 'XXX-XXX-XXX',
                    department: p.employee?.department?.name || 'GEN',
                    gross: parseFloat(p.grossSalary),
                    net: parseFloat(p.netSalary),
                    tax: parseFloat(p.tax),
                    deductions: parseFloat(p.deductions),
                    date: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()
                }));
                setEmployees(mapped);

                // Set initially selected from location state or first record
                const targetId = location.state?.payrollId;
                const found = targetId ? mapped.find(e => e.id === targetId) : mapped[0];
                setSelectedEmp(found);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedCompany.id]);

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.empId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && !selectedEmp) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-[#EBE9D8]">
                <div className="text-center">
                    <Loader2 className="size-12 text-blue-800 animate-spin mx-auto mb-4" />
                    <p className="font-black text-gray-700 italic uppercase tracking-widest">Accessing Secure Vault...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-2 flex items-center justify-between shadow-sm no-print">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                        <ArrowLeft size={18} className="text-gray-600" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-700 text-white rounded-sm flex items-center justify-center shadow-sm">
                            <FileText size={14} />
                        </div>
                        <span className="font-black text-gray-700 text-xs sm:text-sm uppercase italic tracking-tighter">Secure Payslip Previewer V2.0</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-1.5 bg-white border-2 border-white border-r-gray-600 border-b-gray-600 font-black uppercase text-[10px] hover:bg-gray-50 active:translate-y-0.5 transition-all shadow-sm italic text-blue-900">
                        <Printer size={14} /> Commit to Print
                    </button>
                </div>
            </div>

            <div className="flex h-full overflow-hidden">
                {/* Sidebar List */}
                <div className="w-72 bg-white border-r border-gray-300 flex flex-col no-print shrink-0 shadow-inner">
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <div className="relative group">
                            <Search size={14} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="FILTER SECURE LIST..."
                                className="w-full pl-9 pr-2 py-2.5 text-[10px] font-black border-2 border-gray-200 bg-white focus:bg-white outline-none focus:border-blue-400 uppercase italic transition-all shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                        {filteredEmployees.map(emp => (
                            <div
                                key={emp.id}
                                onClick={() => setSelectedEmp(emp)}
                                className={`p-4 border-b border-gray-50 cursor-pointer flex items-center gap-4 transition-all hover:bg-blue-50/50 group ${selectedEmp?.id === emp.id ? 'bg-blue-50 border-r-4 border-r-blue-600 shadow-md' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2 ${selectedEmp?.id === emp.id ? 'bg-blue-600 text-white border-blue-400' : 'bg-gray-100 text-gray-400 border-white'}`}>
                                    <User size={18} />
                                </div>
                                <div className="truncate flex-1">
                                    <div className={`text-[11px] font-black uppercase tracking-tight ${selectedEmp?.id === emp.id ? 'text-blue-900' : 'text-gray-700'}`}>{emp.name}</div>
                                    <div className="text-[9px] font-black text-gray-400 group-hover:text-blue-400 transition-colors italic uppercase">{emp.empId} • {emp.period}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-gray-200/50 p-4 sm:p-8 overflow-auto flex justify-center bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] scrollbar-thin scrollbar-thumb-gray-400">
                    {selectedEmp ? (
                        <div className="bg-white shadow-[0_0_60px_rgba(0,0,0,0.1)] w-full max-w-2xl min-h-[842px] border border-gray-300 p-8 sm:p-16 relative flex flex-col rounded-sm">
                            {/* Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none rotate-[-45deg]">
                                <h1 className="text-8xl font-black uppercase italic tracking-[1em]">SYSTEM_DOCK</h1>
                            </div>

                            {/* Header Section */}
                            <div className="flex justify-between items-start border-b-4 border-gray-900 pb-8 mb-10 relative z-10">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 leading-none tracking-tighter uppercase italic">{activeUser.companyName || 'ISLAND HR SOLUTIONS'}</h2>
                                    <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-[0.3em] italic">Electronic Remittance Docket :: Station PR-042</p>
                                </div>
                                <div className="text-right">
                                    <span className="bg-gray-900 text-white px-4 py-1.5 text-[10px] font-black italic tracking-[0.2em] uppercase rounded-sm shadow-md">CONFIDENTIAL</span>
                                    <p className="text-[10px] font-black text-gray-900 mt-3 uppercase italic tracking-widest">DOCKET END: {selectedEmp.period.toUpperCase()}</p>
                                </div>
                            </div>

                            {/* Employee Details Grid */}
                            <div className="grid grid-cols-2 gap-10 mb-10 bg-gray-50/80 p-6 border-2 border-white rounded-lg shadow-inner relative z-10">
                                <div className="border-r border-gray-200 px-2">
                                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2 italic">Employee Identification</p>
                                    <p className="text-lg font-black text-gray-900 uppercase italic tracking-tight underline decoration-blue-500/30 underline-offset-4">{selectedEmp.name}</p>
                                    <p className="text-xs font-black text-gray-400 mt-1 uppercase tracking-widest">{selectedEmp.empId}</p>
                                </div>
                                <div className="text-right px-2">
                                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2 italic">Assignment / Cost Center</p>
                                    <p className="text-lg font-black text-gray-900 uppercase italic tracking-tight">{selectedEmp.department}</p>
                                    <p className="text-xs font-black text-gray-400 mt-1 uppercase tracking-widest">TRN: XX-XX-{selectedEmp.trn.slice(-3)}</p>
                                </div>
                            </div>

                            {/* Earnings Section */}
                            <div className="flex-1 space-y-12 relative z-10">
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <h4 className="border-b-2 border-gray-900 text-xs font-black uppercase italic mb-4 flex justify-between pb-1 tracking-widest">
                                        <span className="bg-gray-900 text-white px-3 py-0.5">01 // Gross Remittances</span>
                                        <span className="text-gray-900 self-end">Amount (JMD)</span>
                                    </h4>
                                    <div className="space-y-3 px-2">
                                        <div className="flex justify-between text-sm font-black text-gray-800 italic uppercase">
                                            <span>Consolidated Gross Compensation</span>
                                            <span className="tabular-nums">$ {selectedEmp.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
                                    <h4 className="border-b-2 border-gray-900 text-xs font-black uppercase italic mb-4 flex justify-between pb-1 tracking-widest">
                                        <span className="bg-gray-900 text-white px-3 py-0.5">02 // Statutory Obligations</span>
                                        <span className="text-gray-900 self-end">Liability (JMD)</span>
                                    </h4>
                                    <div className="space-y-4 px-2">
                                        <div className="flex justify-between text-xs font-black text-red-700 italic uppercase">
                                            <span>Statutory Taxation (PAYE)</span>
                                            <span className="tabular-nums">({selectedEmp.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })})</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-black text-red-700 italic uppercase">
                                            <span>Aggregate Deductions</span>
                                            <span className="tabular-nums">({selectedEmp.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Totals Section */}
                            <div className="mt-auto border-t-4 border-gray-900 pt-8 relative z-10">
                                <div className="flex justify-between items-center bg-[#000080] p-6 text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] italic mb-1 text-blue-200">Final Net Liquidation</span>
                                        <span className="text-xs font-bold text-blue-300/50 uppercase tracking-widest">Electronic Fund Transfer Approved</span>
                                    </div>
                                    <span className="text-3xl font-black italic tracking-tighter tabular-nums drop-shadow-md">$ {selectedEmp.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between mt-6 text-[9px] font-black text-gray-400 italic uppercase tracking-tighter">
                                    <p>Authentication Hash: {selectedEmp.id.substring(0, 16)}...</p>
                                    <p className="text-right">
                                        Valid System Docket :: {selectedEmp.date}
                                        <br />Decrypted session {new Date().toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-20 text-center italic font-black text-gray-300 uppercase tracking-[0.5em]">Inventory cache is empty or inaccessible.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayslipPreview;
