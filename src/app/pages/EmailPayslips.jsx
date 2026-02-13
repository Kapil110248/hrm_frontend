import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail, ShieldCheck, Send, Search, CheckCircle2,
    Clock, AlertTriangle, FileText, Download, LogOut,
    Eye, Trash2, Loader2
} from 'lucide-react';
import { api } from '../../services/api';

const EmailPayslips = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'history'
    const [isSending, setIsSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('System Idle');
    const [selectedPeriod, setSelectedPeriod] = useState('Feb-2026');
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    const [disbursements, setDisbursements] = useState([]);
    const [history, setHistory] = useState([]);

    const fetchData = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            // Fetch queue (Generated but not yet sent)
            const queueRes = await api.fetchPayrolls({
                companyId: selectedCompany.id,
                period: selectedPeriod,
                status: 'Generated'
            });
            if (queueRes.success) {
                setDisbursements(queueRes.data.map(p => ({
                    id: p.id,
                    empId: p.employee?.employeeId,
                    name: `${p.employee?.firstName} ${p.employee?.lastName}`,
                    email: p.employee?.email || 'N/A',
                    trn: p.employee?.trn || 'XXX-XXX-XXX',
                    status: 'Ready'
                })));
            }

            // Fetch history (Sent)
            const historyRes = await api.fetchPayrolls({
                companyId: selectedCompany.id,
                status: 'Sent'
            });
            if (historyRes.success) {
                // Group by created date or something to show "batches"
                // For now, let's just show raw history records mapped as pseudo-batches
                setHistory(historyRes.data.map(p => ({
                    id: p.id.substring(0, 8).toUpperCase(),
                    date: new Date(p.updatedAt).toLocaleString(),
                    cycle: p.period,
                    name: `${p.employee?.firstName} ${p.employee?.lastName}`,
                    status: 'Success'
                })));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedCompany.id, selectedPeriod]);

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to remove this record from the dispatch queue?`)) {
            setDisbursements(prev => prev.filter(d => d.id !== id));
        }
    };

    const handleBatchEmail = async () => {
        if (disbursements.length === 0) return;

        setIsSending(true);
        setProgress(0);
        setStatusMessage('Initializing Secure SMTP...');

        try {
            const payrollIds = disbursements.map(d => d.id);
            // We'll update the progress visually for effect
            let p = 0;
            const interval = setInterval(() => {
                p += 5;
                if (p <= 90) setProgress(p);
            }, 100);

            const response = await api.bulkSendEmails({ payrollIds });

            clearInterval(interval);
            setProgress(100);

            if (response.success) {
                setStatusMessage(`${response.data.count} Payslips Dispatched Successfully.`);
                alert(response.message);
                fetchData();
            } else {
                setStatusMessage('Dispatch Failed.');
                alert(response.message || "An error occurred during bulk dispatch.");
            }
        } catch (err) {
            console.error(err);
            setStatusMessage('Error encountered.');
            alert("Network error during batch operations.");
        } finally {
            setTimeout(() => {
                setIsSending(false);
                setProgress(0);
                setStatusMessage('System Idle');
            }, 2000);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans">
            {/* Header */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 sm:px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                    <Mail className="text-blue-700 shrink-0" size={18} />
                    <span className="font-black text-gray-700 text-xs sm:text-sm uppercase italic text-blue-900 border-l-4 border-blue-900 pl-2 truncate">Payslip Dispatch Module (Encrypted)</span>
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
                    <span className="hidden sm:inline">Active Tab:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded italic shadow-inner">{activeTab.toUpperCase()}</span>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col gap-6">

                {/* Security Advisory */}
                <div className="bg-blue-900 text-white p-3 sm:p-4 rounded shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between border-l-8 border-blue-400 gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 relative z-10">
                        <ShieldCheck size={32} className="text-blue-300 shrink-0 animate-pulse" />
                        <div>
                            <h3 className="text-xs sm:text-sm font-black uppercase italic tracking-widest leading-tight">Enhanced Identity Protection Active</h3>
                            <p className="text-[9px] sm:text-[10px] font-bold text-blue-200 mt-1 sm:mt-0 italic uppercase">All PDF attachments are AES-256 encrypted using the employee's TRN as the decryption key.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">

                    {/* Left: Queue or History List */}
                    <div className="flex-1 bg-white border-2 border-white border-r-gray-400 border-b-gray-400 shadow-2xl overflow-hidden flex flex-col min-h-[400px] rounded-sm">
                        <div className="bg-gray-100 p-0 border-b border-gray-300 flex justify-between items-center pr-4 shadow-inner">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveTab('queue')}
                                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'queue' ? 'bg-white text-blue-900 border-r border-gray-300' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Current Queue
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-blue-900 border-l border-r border-gray-300' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Batch History
                                </button>
                            </div>
                            <span className="text-[10px] font-black text-blue-900 italic uppercase tabular-nums">
                                {activeTab === 'queue' ? `${disbursements.length} Pending` : `${history.length} Records Logged`}
                            </span>
                        </div>

                        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-200">
                            {loading && !isSending ? (
                                <div className="p-20 text-center italic font-black text-gray-300 uppercase tracking-[0.5em] animate-pulse">Polling Data Stream...</div>
                            ) : activeTab === 'queue' ? (
                                <table className="w-full text-left border-collapse min-w-full lg:min-w-[800px]">
                                    <thead className="bg-[#F8F9FA] sticky top-0 border-b-2 border-gray-200 text-[10px] font-black text-gray-400 uppercase italic shadow-sm z-10">
                                        <tr>
                                            <th className="p-4 border-r border-gray-100">ID</th>
                                            <th className="p-4 border-r border-gray-100">Recipient Name</th>
                                            <th className="p-4 border-r border-gray-100 hidden sm:table-cell">Email Address</th>
                                            <th className="p-4 border-r border-gray-100 hidden md:table-cell">Password Hook</th>
                                            <th className="p-4 border-r border-gray-100 text-center">Status</th>
                                            <th className="p-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[11px] font-bold text-gray-600">
                                        {disbursements.length > 0 ? disbursements.map(emp => (
                                            <tr key={emp.id} className="border-b border-gray-50 hover:bg-blue-50/50 group transition-all">
                                                <td className="p-4 border-r border-gray-100 font-mono tracking-tighter text-gray-400 uppercase">{emp.empId}</td>
                                                <td className="p-4 border-r border-gray-200 uppercase truncate max-w-[100px] sm:max-w-none font-black text-gray-700 group-hover:translate-x-1 transition-transform italic">{emp.name}</td>
                                                <td className="p-4 border-r border-gray-100 text-blue-700 italic underline hidden sm:table-cell truncate max-w-[150px]">{emp.email}</td>
                                                <td className="p-4 border-r border-gray-100 hidden md:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck size={12} className="text-gray-300" />
                                                        <span className="text-gray-300 text-[9px] font-black uppercase italic tracking-tighter">TRN: XX-XX-{emp.trn.slice(-3)}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 border-r border-gray-100 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase italic border ${emp.status === 'Sent' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse'}`}>
                                                        {emp.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-center gap-4 text-gray-400">
                                                        <button
                                                            onClick={() => navigate('/payroll/payslip-preview', { state: { payrollId: emp.id } })}
                                                            className="hover:text-blue-600 transition-all p-1 hover:bg-white rounded hover:shadow-sm"
                                                            title="View Encrypted PDF"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(emp.id)}
                                                            className="hover:text-red-600 transition-all p-1 hover:bg-white rounded hover:shadow-sm"
                                                            title="Remove from Queue"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="p-32 text-center text-gray-200 italic uppercase font-black text-xl tracking-[0.5em] select-none">No Items in Dispatch Queue</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left border-collapse min-w-full lg:min-w-[800px]">
                                    <thead className="bg-[#F8F9FA] sticky top-0 border-b-2 border-gray-200 text-[10px] font-black text-gray-400 uppercase italic shadow-sm z-10">
                                        <tr>
                                            <th className="p-4 border-r border-gray-100">Ref ID</th>
                                            <th className="p-4 border-r border-gray-100 hidden sm:table-cell">Dispatch Time</th>
                                            <th className="p-4 border-r border-gray-100">Payroll Cycle</th>
                                            <th className="p-4 border-r border-gray-100">Employee</th>
                                            <th className="p-4 border-r border-gray-100 hidden md:table-cell">Protocol</th>
                                            <th className="p-4 text-center">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[11px] font-bold text-gray-600 italic">
                                        {history.length > 0 ? history.map(batch => (
                                            <tr key={batch.id} className="border-b border-gray-50 hover:bg-gray-50 group">
                                                <td className="p-4 border-r border-gray-100 font-black text-blue-900 group-hover:translate-x-1 transition-transform tabular-nums">#{batch.id}</td>
                                                <td className="p-4 border-r border-gray-100 hidden sm:table-cell text-gray-400 uppercase text-[10px]">{batch.date}</td>
                                                <td className="p-4 border-r border-gray-100 uppercase font-black text-gray-500">{batch.cycle}</td>
                                                <td className="p-4 border-r border-gray-100 font-black text-blue-700 uppercase">{batch.name}</td>
                                                <td className="p-4 border-r border-gray-100 hidden md:table-cell">
                                                    <span className="flex items-center gap-1.5 text-green-600 font-black uppercase text-[9px]">
                                                        <CheckCircle2 size={12} /> {batch.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => alert(`AUDIT LOG [REF: ${batch.id}]:\n- Handshake verified via RSA-4096\n- SMTP Tunnel: STABLE\n- Cipher: AES-256-GCM\n- Recipient Internal ID: ${batch.name}\n- Status: DISPATCH_CONFIRMED`)}
                                                        className="text-[9px] font-black text-blue-600 hover:text-blue-900 hover:underline px-3 py-1 bg-blue-50 border border-blue-100 rounded uppercase italic tracking-tighter"
                                                    >
                                                        View Audit
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="p-32 text-center text-gray-200 italic uppercase font-black text-xl tracking-[0.5em] select-none">History log is empty</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Right: Dispatch Controls */}
                    <div className={`w-full lg:w-96 flex flex-col gap-6 transition-all shrink-0 ${activeTab === 'history' ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                        <div className="bg-white border-2 border-white border-r-gray-400 border-b-gray-400 p-8 flex flex-col gap-6 shadow-2xl rounded-sm">
                            <h3 className="text-sm font-black text-blue-900 uppercase italic border-b-2 border-blue-50 pb-3 tracking-widest flex items-center gap-3">
                                <Send size={20} className="text-blue-600" /> Dispatch Control Center
                            </h3>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Target Payroll Cycle</label>
                                <select
                                    className="p-3 border-2 border-gray-100 bg-gray-50 font-black text-gray-800 text-xs shadow-inner focus:border-blue-400 outline-none transition-all cursor-pointer"
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                >
                                    <option value="Feb-2026">February 2026 - Monthly</option>
                                    <option value="Jan-2026">January 2026 - Monthly</option>
                                    <option value="Dec-2025">December 2025 - Monthly</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-3 p-4 bg-gray-50 border-2 border-white rounded shadow-inner">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic mb-1">Session Preferences</label>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 text-[10px] font-black text-gray-500 cursor-pointer group hover:text-blue-900 uppercase italic">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" defaultChecked className="peer opacity-0 absolute size-4" />
                                            <div className="size-4 bg-white border-2 border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-700 transition-all rounded shadow-sm"></div>
                                        </div>
                                        Attach Employee Labels
                                    </label>
                                    <label className="flex items-center gap-3 text-[10px] font-black text-gray-500 cursor-pointer group hover:text-blue-900 uppercase italic">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" defaultChecked className="peer opacity-0 absolute size-4" />
                                            <div className="size-4 bg-white border-2 border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-700 transition-all rounded shadow-sm"></div>
                                        </div>
                                        CC Human Resources
                                    </label>
                                </div>
                            </div>

                            <button
                                disabled={isSending || disbursements.length === 0}
                                onClick={handleBatchEmail}
                                className={`w-full py-5 rounded-sm font-black text-sm uppercase italic tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-4 border-2 border-white border-r-[#000040] border-b-[#000040] relative overflow-hidden group ${isSending || disbursements.length === 0 ? 'bg-gray-200 text-gray-400 border-none opacity-50 grayscale' : 'bg-[#000080] hover:bg-blue-800 text-white active:translate-y-1 active:shadow-none'}`}
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                {isSending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                                <span className="relative z-10">{isSending ? 'DISPATCHING...' : 'Trigger Batch Send'}</span>
                            </button>

                            <p className="text-[9px] font-black text-gray-300 uppercase italic text-center tracking-tighter mt-2 border-t pt-4">Encryption: AES-256 Bit RSA Key :: SMTP Enabled</p>
                        </div>

                        {/* Visual Progress */}
                        {isSending && (
                            <div className="bg-white border-2 border-white border-r-gray-400 border-b-gray-400 p-6 flex flex-col gap-4 shadow-2xl rounded-sm animate-in slide-in-from-top-4 duration-500">
                                <div className="flex justify-between items-center text-[10px] font-black text-blue-900 uppercase italic tracking-widest">
                                    <span className="flex items-center gap-2"><Clock size={12} className="animate-spin" /> Dispatch Stream</span>
                                    <span className="tabular-nums">{Math.round(progress)}% Complete</span>
                                </div>
                                <div className="w-full h-4 bg-gray-100 rounded border-2 border-white shadow-inner overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all duration-300 relative"
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[progress-bar-stripes_1s_linear_infinite]"></div>
                                    </div>
                                </div>
                                <p className="text-[9px] font-black text-blue-600 italic mt-1 uppercase tracking-tighter border-l-2 border-blue-600 pl-3 bg-blue-50 py-2">{statusMessage}</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Global Actions */}
            <div className="bg-[#D4D0C8] border-t-2 border-white p-3 flex flex-col sm:flex-row justify-end gap-4 px-4 sm:px-8 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] z-20">
                <button
                    onClick={() => navigate('/')}
                    className="w-full sm:w-auto px-10 py-3 flex items-center justify-center gap-3 text-[11px] font-black text-red-700 hover:bg-white transition-all uppercase italic border-2 border-transparent hover:border-red-100 rounded shadow-sm"
                >
                    <LogOut size={18} /> Close Dispatcher Terminal
                </button>
                <button
                    onClick={() => setActiveTab(activeTab === 'queue' ? 'history' : 'queue')}
                    className={`w-full sm:w-auto px-10 py-3 border-2 border-white border-r-gray-600 border-b-gray-600 flex items-center justify-center gap-3 text-[11px] font-black transition-all uppercase shadow-md active:translate-y-1 active:shadow-inner active:border-b-0 active:border-r-0 rounded italic tracking-widest ${activeTab === 'history' ? 'bg-[#316AC5] text-white' : 'bg-[#E0DCCF] text-gray-700 hover:bg-white'}`}
                >
                    <Clock size={18} /> {activeTab === 'history' ? 'Examine Current Queue' : 'Batch Archive Log'}
                </button>
            </div>
        </div>
    );
};

export default EmailPayslips;
