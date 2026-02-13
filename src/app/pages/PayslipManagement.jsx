import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Search, Send, Download, Eye,
    CheckCircle2, AlertTriangle, ShieldCheck, Loader2, X, AlertOctagon, Mail
} from 'lucide-react';
import { api } from '../../services/api';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600'
    };

    return (
        <div className={`fixed bottom-4 right-4 ${bgColors[type] || 'bg-gray-800'} text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 z-50 animate-fade-in-up`}>
            {type === 'success' && <CheckCircle2 size={18} />}
            {type === 'error' && <AlertOctagon size={18} />}
            <span className="font-bold text-xs uppercase tracking-wide">{message}</span>
            <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-full p-1"><X size={14} /></button>
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded shadow-2xl border border-gray-200 overflow-hidden transform transition-all scale-100">
                <div className="bg-[#D4D0C8] px-4 py-2 border-b border-gray-300 flex justify-between items-center">
                    <h3 className="font-black text-gray-700 uppercase text-xs tracking-wider">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 bg-[#EBE9D8]">
                    {children}
                </div>
            </div>
        </div>
    );
};

const PayslipManagement = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('Feb-2026');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(null); // ID of payslip being sent
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    const [payslips, setPayslips] = useState([]);
    const [toast, setToast] = useState(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchPayslips = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const response = await api.fetchPayrolls({
                companyId: selectedCompany.id,
                period: selectedPeriod
            });
            if (response.success) {
                setPayslips(response.data.map(p => ({
                    id: p.id,
                    empId: p.employee?.employeeId,
                    name: `${p.employee?.firstName} ${p.employee?.lastName}`,
                    period: p.period,
                    trn: p.employee?.trn || 'XXX-XXX-XXX',
                    status: p.status,
                    sent: p.status === 'Sent'
                })));
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to fetch payslip data.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayslips();
    }, [selectedCompany.id, selectedPeriod]);

    const handleGenerate = async () => {
        setShowGenerateModal(false);
        try {
            setGenerating(true);
            const response = await api.generatePayrolls({
                companyId: selectedCompany.id,
                period: selectedPeriod
            });
            if (response.success) {
                showToast(`${response.data.count} payslips generated successfully!`, "success");
                fetchPayslips();
            } else {
                showToast(response.message || "Failed to generate payslips.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error generating payslips.", "error");
        } finally {
            setGenerating(false);
        }
    };

    const handleSendEmail = async (id) => {
        try {
            setSending(id);
            const response = await api.sendPayslipEmail(id);
            if (response.success) {
                showToast("Payslip emailed securely.", "success");
                fetchPayslips();
            } else {
                showToast("Failed to send email.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Network error sending email.", "error");
        } finally {
            setSending(null);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Confirm Generation">
                <div className="flex flex-col gap-4">
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-900 text-xs flex items-start gap-2">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <div>
                             This will calculate payroll and generate payslips for ALL employees for <strong>{selectedPeriod}</strong>. Existing records may be overwritten.
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-2">
                        <button 
                            onClick={() => setShowGenerateModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-bold uppercase text-[10px] rounded-sm hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleGenerate}
                            className="px-4 py-2 bg-blue-800 text-white font-bold uppercase text-[10px] rounded-sm hover:bg-blue-900 transition-colors shadow-sm"
                        >
                            Confirm Generation
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Header */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="text-blue-700" size={18} />
                    <span className="font-black text-gray-700 text-sm uppercase italic">Payslip Management Center</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Period:</span>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="text-xs font-bold p-1 border border-gray-400 outline-none"
                    >
                        <option value="Feb-2026">February 2026</option>
                        <option value="Jan-2026">January 2026</option>
                        <option value="Dec-2025">December 2025</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
                {/* Security Note */}
                <div className="bg-yellow-50 border border-yellow-200 p-3 flex items-center gap-3  shadow-sm transition-all hover:bg-yellow-100">
                    <ShieldCheck className="text-orange-500" size={24} />
                    <div>
                        <h4 className="text-xs font-black text-orange-800 uppercase italic tracking-tighter">Security Protocol Active</h4>
                        <p className="text-[10px] font-bold text-gray-600">Generated payslips are automatically password protected. The default password is the employee's TRN unless overridden.</p>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-2 border border-gray-400 shadow-sm gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-1/3 bg-gray-50 px-2 py-1 border border-gray-200 focus-within:border-blue-400 transition-colors shadow-inner">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Employee..."
                            className="bg-transparent text-xs font-bold w-full p-1 outline-none italic uppercase"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        disabled={generating}
                        className="w-full sm:w-auto px-6 py-2 flex items-center justify-center gap-3 bg-[#E0DCCF] hover:bg-white text-xs font-black uppercase text-blue-900 shadow-md border-2 border-white border-r-gray-600 border-b-gray-600 active:translate-y-0.5 active:border-b-0 active:border-r-0 transition-all tracking-widest disabled:opacity-50 group"
                    >
                        {generating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} className="text-green-600 group-hover:scale-110 transition-transform" />}
                        {generating ? 'GENERATING...' : 'Generate for Period'}
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 bg-white border border-gray-400 shadow-2xl overflow-auto scrollbar-thin scrollbar-thumb-gray-300">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="bg-[#D4D0C8] sticky top-0 border-b border-gray-400 text-[10px] font-black text-gray-600 uppercase italic">
                            <tr>
                                <th className="p-3 border-r border-gray-300">Employee</th>
                                <th className="p-3 border-r border-gray-300">Period</th>
                                <th className="p-3 border-r border-gray-300">Security (TRN)</th>
                                <th className="p-3 border-r border-gray-300">Status</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-bold text-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center italic font-black text-gray-300 uppercase tracking-[0.3em] animate-pulse">Scanning Secure Vault...</td>
                                </tr>
                            ) : payslips.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center italic font-black text-gray-300 uppercase tracking-[0.3em]">No records found for this period.</td>
                                </tr>
                            ) : payslips
                                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(row => (
                                    <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors group">
                                        <td className="p-3 border-r border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="uppercase font-black text-blue-900 group-hover:translate-x-1 transition-transform">{row.name}</span>
                                                <span className="text-[9px] text-gray-400 italic tracking-tighter">{row.empId}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 border-r border-gray-100 text-gray-500 italic">{row.period}</td>
                                        <td className="p-3 border-r border-gray-100 font-mono text-gray-400 group-hover:text-blue-600 transition-colors">
                                            TRN-XX-{row.trn.slice(-4)}
                                        </td>
                                        <td className="p-3 border-r border-gray-100">
                                            <span className={`px-3 py-1 text-[9px] font-black uppercase italic border shadow-sm ${row.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                row.status === 'Generated' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-4">
                                                <button
                                                    onClick={() => navigate('/payroll/payslip-preview', { state: { payrollId: row.id } })}
                                                    className="p-1.5 bg-gray-50 border border-gray-300 rounded hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm active:translate-y-0.5"
                                                    title="View PDF"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleSendEmail(row.id)}
                                                    disabled={sending === row.id}
                                                    className={`p-1.5 border rounded transition-all shadow-sm active:translate-y-0.5 ${row.sent ? 'bg-green-50 text-green-700 border-green-300' : 'bg-gray-50 text-gray-400 border-gray-300 hover:bg-blue-50 hover:text-blue-700'}`}
                                                    title="Send Email"
                                                >
                                                    {sending === row.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PayslipManagement;
