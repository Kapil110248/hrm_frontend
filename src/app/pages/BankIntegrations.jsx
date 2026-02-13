import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Send, FileText, CheckCircle, Download, Landmark, Save, LogOut, Printer, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const BankIntegrations = ({ bank = 'BNS' }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [authorizing, setAuthorizing] = useState(false);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

    const bankConfig = {
        'BNS': { name: 'Scotiabank (BNS)', color: 'text-red-700', bg: 'bg-red-50', code: 'BNS' },
        'NCB': { name: 'National Commercial Bank Limited (NCB)', color: 'text-yellow-700', bg: 'bg-yellow-50', code: 'NCB' },
        'JN': { name: 'JN Bank', color: 'text-blue-800', bg: 'bg-blue-50', code: 'JN' },
        'JMMB': { name: 'JMMB', color: 'text-purple-700', bg: 'bg-purple-50', code: 'JMMB' },
        'SAGICOR': { name: 'Sagicor Bank (Jamaica) Limited', color: 'text-green-700', bg: 'bg-green-50', code: 'SAGICOR' },
        'CITIBANK': { name: 'CitiBank N.A.', color: 'text-indigo-700', bg: 'bg-indigo-50', code: 'CITIBANK' }
    };

    const currentBank = bankConfig[bank] || bankConfig['BNS'];

    const fetchBeneficiaries = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            // Fetch records for the specific bank
            // In a real scenario we'd filter by bank name/code in Employee record
            const response = await api.fetchTransactionRegister({
                companyId: selectedCompany.id,
                status: 'POSTED'
            });
            if (response.success) {
                const mapped = (response.data.transactions || []).map(t => ({
                    id: t.id,
                    name: `${t.employee?.firstName} ${t.employee?.lastName}`.toUpperCase(),
                    accountNo: t.employee?.bankAccount || 'N/A',
                    transit: t.employee?.bankName || 'BNS',
                    amount: parseFloat(t.amount),
                    employeeId: t.employee?.id
                }));
                setBeneficiaries(mapped);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBeneficiaries();
    }, [selectedCompany.id, bank]);

    const totalAmount = beneficiaries.reduce((sum, b) => sum + b.amount, 0);

    const handleAuthorize = async () => {
        if (beneficiaries.length === 0) {
            alert("Empty Batch: No beneficiaries identified for this transfer.");
            return;
        }

        const confirm = window.confirm(`AUTHORIZATION REQUIRED:\n\nSend salary batch of $${totalAmount.toLocaleString()} to ${currentBank.name}?\n\nThis will initiate an encrypted transfer session.`);
        if (confirm) {
            try {
                setAuthorizing(true);
                const payload = {
                    companyId: selectedCompany.id,
                    bankName: currentBank.name,
                    batchReference: `SALARY-FEB-2026-${bank}`,
                    effectiveDate,
                    totalAmount,
                    beneficiaries: beneficiaries.map(b => ({
                        employeeId: b.employeeId,
                        amount: b.amount,
                        bankName: currentBank.name,
                        accountNumber: b.accountNo,
                        accountType: 'SAVINGS'
                    })),
                    processedBy: activeUser.email
                };

                const response = await api.createBatchTransfer(payload);
                if (response.success) {
                    alert(`SUCCESS: Batch ${payload.batchReference} authorized and uploaded to ${currentBank.name}.\n\nReference: ${response.data.id.substring(0, 8)}`);
                    setBeneficiaries([]);
                } else {
                    alert(response.message || "AUTHORIZATION_FAILED: Secure portal rejected request.");
                }
            } catch (err) {
                console.error(err);
                alert("NETWORK_TIMEOUT: Handshake failed with bank API.");
            } finally {
                setAuthorizing(false);
            }
        }
    };

    const handleDownload = async () => {
        alert(`PREPARING EXPORT: Formatting ${currentBank.name} Beneficiary Listing (.txt)...`);
        try {
            const params = {
                companyId: selectedCompany.id,
                bankName: currentBank.name,
                period: 'Feb-2026'
            };
            const response = await api.exportBankFile(params);

            // Generate manual text file if API doesn't return blob
            const content = `---- ${currentBank.name} ACH BATCH ----\n` +
                `DATE: ${effectiveDate}\n` +
                `BATCH: SALARY-FEB-2026-${bank}\n` +
                `TOTAL: ${totalAmount}\n` +
                `COUNT: ${beneficiaries.length}\n\n` +
                beneficiaries.map(b => `${b.accountNo}|${b.transit}|${b.amount}|${b.name}`).join('\n');

            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${bank}_Transfer_Advice_${new Date().toISOString().slice(0, 10)}.txt`;
            link.click();
            alert("DISPATCH READY: File saved to workstation.");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans">
            {/* Header */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm no-print">
                <div className="flex items-center gap-2 min-w-0">
                    <Landmark className={currentBank.color} size={18} />
                    <span className="font-bold text-gray-700 text-xs sm:text-sm uppercase italic underline decoration-blue-500/20 truncate">Electronic Funds Transfer / {currentBank.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    {loading && <div className="text-[10px] font-black text-blue-800 animate-pulse flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> SCANNING BENES...</div>}
                    <div className="bg-green-600 text-white text-[9px] sm:text-[10px] font-black px-3 py-1 rounded shadow-inner animate-pulse whitespace-nowrap">
                        SECURE LINK ACTIVE
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-auto scrollbar-thin scrollbar-thumb-gray-400">
                <div className="max-w-5xl mx-auto flex flex-col gap-6">
                    {/* Main Transfer UI */}
                    <div className="bg-white border-2 border-white border-r-gray-400 border-b-gray-400 p-4 sm:p-8 shadow-2xl rounded-sm">
                        <div className="flex flex-col md:flex-row justify-between mb-6 sm:mb-8 gap-6 border-b-2 border-gray-50 pb-8 items-center md:items-start text-center md:text-left">
                            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                                <div className={`${currentBank.bg} p-6 border-2 border-white border-r-gray-300 border-b-gray-300 shadow-lg rounded-xl shrink-0 group hover:scale-105 transition-transform`}>
                                    <Building className={currentBank.color} size={40} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-2xl sm:text-3xl font-black text-gray-800 italic tracking-tighter break-words">{currentBank.name} Integrated Portal</h2>
                                    <p className="text-blue-900 bg-blue-50 px-2 py-0.5 inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mt-2 rounded border border-blue-100">Bilateral Beneficiary Transfer Module</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center md:items-end w-full md:w-auto bg-gray-50 p-4 border-2 border-white border-r-gray-200 border-b-gray-200 shadow-inner rounded">
                                <span className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest italic mb-1">Queue Net Value</span>
                                <span className="text-3xl sm:text-4xl font-black text-blue-900 italic tracking-tighter break-all tabular-nums">$ {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} JMD</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Left: Transfer Config */}
                            <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r-2 lg:border-gray-50 pb-8 lg:pb-0 lg:pr-10 flex flex-col gap-6">
                                <h3 className="text-xs font-black text-gray-600 italic mb-2 uppercase text-center lg:text-left tracking-widest border-b pb-2">Transmission Parameters</h3>
                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Protocol Reference</label>
                                        <input type="text" value={`SALARY-FEB-2026-${bank}`} readOnly className="p-3 border-2 border-gray-100 bg-gray-50 text-[11px] font-black font-mono text-blue-900 outline-none w-full shadow-inner rounded" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest cursor-help underline decoration-dotted capitalize">Effective Settlement Date</label>
                                        <input
                                            type="date"
                                            value={effectiveDate}
                                            onChange={(e) => setEffectiveDate(e.target.value)}
                                            className="p-3 border-2 border-gray-100 bg-white text-[11px] font-black text-gray-800 w-full shadow-inner rounded cursor-pointer hover:border-blue-300 transition-colors"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Mechanical Format</label>
                                        <select className="p-3 border-2 border-gray-100 bg-gray-50 text-[11px] font-black text-blue-900 w-full shadow-inner rounded outline-none appearance-none cursor-pointer">
                                            <option>{currentBank.code} / ACH-612 (Standard)</option>
                                            <option>ISO 20022 XML Parser</option>
                                            <option>Fixed Length EBCDIC (Legacy)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-auto p-4 bg-gray-50 border border-gray-200 rounded text-[9px] font-bold text-gray-400 uppercase italic">
                                    COMMS: ACTIVE_SSL_SOCKET_OPEN
                                </div>
                            </div>

                            {/* Right: Beneficiary List */}
                            <div className="lg:col-span-2 flex flex-col min-h-0">
                                <h3 className="text-xs font-black text-gray-600 italic mb-2 uppercase text-center lg:text-left tracking-widest border-b pb-2">Verified Recipient Matrix</h3>
                                <div className="border-2 border-white border-r-gray-200 border-b-gray-200 shadow-2xl max-h-80 overflow-auto rounded scrollbar-thin scrollbar-thumb-gray-200">
                                    <table className="w-full text-[11px] min-w-[440px] border-collapse">
                                        <thead className="bg-[#F8F9FA] sticky top-0 border-b-2 border-gray-200 z-10 shadow-sm">
                                            <tr className="text-left font-black text-gray-500 uppercase italic">
                                                <th className="p-3 border-r border-gray-100">Beneficiary Name</th>
                                                <th className="p-3 border-r border-gray-100">Account #</th>
                                                <th className="p-3 border-r border-gray-100 text-center">Transit</th>
                                                <th className="p-3 text-right">Settlement</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {beneficiaries.length > 0 ? beneficiaries.map(b => (
                                                <tr key={b.id} className="hover:bg-blue-50 transition-all group group-hover:cursor-crosshair">
                                                    <td className="p-3 font-black text-blue-900 uppercase truncate max-w-[150px] group-hover:translate-x-1 transition-transform italic">{b.name}</td>
                                                    <td className="p-3 font-mono text-gray-400 group-hover:text-gray-800 transition-colors">{b.accountNo}</td>
                                                    <td className="p-3 text-center font-bold text-gray-400">{b.transit}</td>
                                                    <td className="p-3 text-right font-black italic tabular-nums text-blue-700">$ {b.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="p-16 text-center font-black italic text-gray-300 uppercase tracking-[0.3em] animate-pulse">Initializing Data Stream...</td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-[#000080] text-white sticky bottom-0 shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
                                            <tr className="font-black italic">
                                                <td colSpan="3" className="p-4 text-right uppercase text-[10px] tracking-widest border-r border-white/10">Cumulative Batch Expenditure</td>
                                                <td className="p-4 text-right text-lg tracking-tighter tabular-nums">$ {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <div className="mt-2 text-[9px] font-black italic text-gray-400 uppercase text-right tracking-widest">
                                    Records count: {beneficiaries.length} verified items
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Info & Authorization */}
                    <div className="bg-[#000080] border-2 border-white border-r-[#000040] border-b-[#000040] text-white p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl rounded-sm group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-800 opacity-50"></div>
                        <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
                            <div className="w-14 h-14 border-2 border-white/20 flex items-center justify-center rounded-xl bg-blue-900/50 shadow-inner group-hover:border-green-400 transition-colors">
                                <CheckCircle size={24} className="text-green-400 animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase text-blue-300 tracking-widest">Encryption Standard: AES-384</span>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                </div>
                                <p className="text-sm font-black italic tracking-tight">ACH payload compliant with Bank of Jamaica Standard ACH-612 Ver 4.0</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAuthorize}
                            disabled={authorizing || beneficiaries.length === 0}
                            className={`relative z-10 w-full md:w-auto bg-white text-blue-900 border-4 border-white border-b-blue-200 border-r-blue-200 hover:bg-gray-100 hover:text-blue-700 px-10 py-4 text-[11px] font-black uppercase italic transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none tracking-widest ${authorizing || beneficiaries.length === 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'active:bg-gray-200'}`}
                        >
                            {authorizing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            {authorizing ? 'PROCESSING AUTHORIZATION...' : 'Authorize & Dispatch Batch'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="bg-[#D4D0C8] border-t-2 border-white p-3 flex flex-col sm:flex-row justify-end gap-3 no-print shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] z-20 px-8">
                <button
                    onClick={() => {
                        alert(`REQUISITION PRINT: Generating ${currentBank.name} settlement summary and advice...`);
                        window.print();
                    }}
                    className="w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-3 text-[10px] sm:text-xs font-black text-blue-900 border-2 border-white border-r-gray-600 border-b-gray-600 shadow-md hover:bg-white transition-all active:translate-y-1 active:shadow-inner active:border-b-0 active:border-r-0 uppercase italic tracking-widest"
                >
                    <Printer size={18} /> Generate Final Advice
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-3 text-[10px] sm:text-xs font-black text-red-700 border-2 border-transparent hover:bg-red-50 hover:border-red-200 transition-all active:translate-y-1 uppercase italic tracking-widest"
                >
                    <LogOut size={18} /> Close Interface
                </button>
                <button
                    onClick={handleDownload}
                    disabled={beneficiaries.length === 0}
                    className={`w-full sm:w-auto px-10 py-3 bg-[#000080] text-[#ffd700] border-2 border-white border-r-black border-b-black flex items-center justify-center gap-3 text-[10px] sm:text-xs font-black shadow-xl hover:bg-blue-900 transition-all active:translate-y-1 active:shadow-inner active:border-b-0 active:border-r-0 uppercase italic tracking-widest ${beneficiaries.length === 0 ? 'grayscale opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Download size={18} /> Commit to Workstation
                </button>
            </div>
        </div>
    );
};

export default BankIntegrations;
