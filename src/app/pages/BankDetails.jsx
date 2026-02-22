import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, Plus, Edit, RefreshCw, X, Search, Folder, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const BankDetails = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ACCOUNTS'); // 'ACCOUNTS' or 'BENEFICIARIES'
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    // --- STATE FOR BANK ACCOUNTS ---
    const [bankAccounts, setBankAccounts] = useState([]);
    const [accountForm, setAccountForm] = useState({
        bank: '',
        bankBranch: '',
        companyACNo: '',
        identificationNo: '',
        glAccount: '',
        exportPath: ''
    });

    // --- STATE FOR BENEFICIARIES ---
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [beneficiaryForm, setBeneficiaryForm] = useState({
        name: '',
        description: '',
        accountNumber: '',
        bankName: '',
        currency: 'JMD',
        remitTotal: '0.00',
        includeInExport: true
    });

    // --- FETCH DATA ---
    const fetchBankAccounts = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const response = await api.fetchBankAccounts({ companyId: selectedCompany.id });
            if (response.success) {
                setBankAccounts(response.data.map(acc => ({
                    id: acc.id,
                    bank: acc.bankName,
                    branch: acc.bankBranch,
                    accountNo: acc.accountNumber,
                    identificationNo: acc.identificationNo,
                    glAccount: acc.glAccount,
                    exportPath: acc.exportPath
                })));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBeneficiaries = async () => {
        if (!selectedCompany.id) return;
        try {
            setLoading(true);
            const response = await api.fetchBeneficiaries(selectedCompany.id);
            if (response.success) {
                setBeneficiaries(response.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'ACCOUNTS') {
            fetchBankAccounts();
        } else {
            fetchBeneficiaries();
        }
        // Reset selection when tab changes
        setSelectedRow(null);
        setIsEditing(false);
        setSearchTerm('');
    }, [activeTab, selectedCompany.id]);

    // --- FORM HANDLERS ---
    const handleInputChange = (field, value) => {
        if (activeTab === 'ACCOUNTS') {
            setAccountForm(prev => ({ ...prev, [field]: value }));
        } else {
            setBeneficiaryForm(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleNew = () => {
        if (activeTab === 'ACCOUNTS') {
            setAccountForm({
                bank: '',
                bankBranch: '',
                companyACNo: '',
                identificationNo: '',
                glAccount: '',
                exportPath: ''
            });
        } else {
            setBeneficiaryForm({
                name: '',
                description: '',
                accountNumber: '',
                bankName: '',
                currency: 'JMD',
                remitTotal: '0.00',
                includeInExport: true
            });
        }
        setSelectedRow(null);
        setIsEditing(true);
    };

    const handleEdit = () => {
        if (!selectedRow) {
            alert("STATION ALERT: Please select a record from the list to edit.");
            return;
        }
        setIsEditing(true);
    };

    const handleDelete = async () => {
        if (!selectedRow) {
            alert("STATION ALERT: Please select a record to delete.");
            return;
        }
        if (window.confirm("CRITICAL WARNING: This will permanently DELETE this record. Continue?")) {
            try {
                setLoading(true);
                let response;
                if (activeTab === 'ACCOUNTS') {
                    response = await api.deleteBankAccount(selectedRow);
                } else {
                    response = await api.deleteBeneficiary(selectedRow);
                }

                if (response.success) {
                    alert("✓ RECORD DELETED SUCCESSFULLY");
                    activeTab === 'ACCOUNTS' ? fetchBankAccounts() : fetchBeneficiaries();
                    setSelectedRow(null);
                    handleNew();
                    setIsEditing(false);
                }
            } catch (err) {
                console.error(err);
                alert("ERROR: Failed to delete record.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async () => {
        // Validation
        if (activeTab === 'ACCOUNTS') {
            if (!accountForm.bankBranch || !accountForm.companyACNo) {
                alert("STATION ALERT: Bank Branch and Account Number are required.");
                return;
            }
        } else {
            if (!beneficiaryForm.name || !beneficiaryForm.accountNumber) {
                alert("STATION ALERT: Name and Account Number are required.");
                return;
            }
        }

        try {
            setLoading(true);
            let response;

            // PAYLOAD CONSTRUCTION
            if (activeTab === 'ACCOUNTS') {
                const payload = {
                    companyId: selectedCompany.id,
                    bankName: accountForm.bank,
                    bankBranch: accountForm.bankBranch,
                    accountNumber: accountForm.companyACNo,
                    identificationNo: accountForm.identificationNo,
                    glAccount: accountForm.glAccount,
                    exportPath: accountForm.exportPath
                };

                if (selectedRow) {
                    response = await api.updateBankAccount(selectedRow, payload);
                } else {
                    response = await api.createBankAccount(payload);
                }
            } else {
                const payload = {
                    companyId: selectedCompany.id,
                    name: beneficiaryForm.name,
                    description: beneficiaryForm.description,
                    accountNumber: beneficiaryForm.accountNumber,
                    bankName: beneficiaryForm.bankName,
                    currency: beneficiaryForm.currency,
                    remitTotal: beneficiaryForm.remitTotal,
                    includeInExport: beneficiaryForm.includeInExport
                };

                if (selectedRow) {
                    response = await api.updateBeneficiary(selectedRow, payload);
                } else {
                    response = await api.createBeneficiary(payload);
                }
            }

            if (response.success) {
                alert("✓ RECORD SAVED SUCCESSFULLY");
                activeTab === 'ACCOUNTS' ? fetchBankAccounts() : fetchBeneficiaries();
                if (!selectedRow) handleNew(); // Clear form if it was a new entry
                setIsEditing(false);
            }
        } catch (err) {
            console.error(err);
            alert("ERROR: Failed to save record.");
        } finally {
            setLoading(false);
        }
    };

    // --- ROW SELECTION ---
    const handleRowClick = (id) => {
        setSelectedRow(id);
        if (activeTab === 'ACCOUNTS') {
            const account = bankAccounts.find(a => a.id === id);
            if (account) {
                setAccountForm({
                    bank: account.bank,
                    bankBranch: account.branch,
                    companyACNo: account.accountNo,
                    identificationNo: account.identificationNo,
                    glAccount: account.glAccount || '',
                    exportPath: account.exportPath || ''
                });
            }
        } else {
            const ben = beneficiaries.find(b => b.id === id);
            if (ben) {
                setBeneficiaryForm({
                    name: ben.name,
                    description: ben.description || '',
                    accountNumber: ben.accountNumber,
                    bankName: ben.bankName || '',
                    currency: ben.currency || 'JMD',
                    remitTotal: ben.remitTotal || '0.00',
                    includeInExport: ben.includeInExport
                });
            }
        }
    };

    const btnClass = "flex flex-col items-center justify-center p-1.5 sm:p-2 border border-gray-400 border-b-2 border-r-2 border-gray-500 bg-[#E0DCCF] hover:bg-gray-200 active:border-0 active:translate-y-0.5 touch-manipulation min-w-[48px] sm:min-w-[5rem]";

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs min-w-0">
            {/* Header with Tabs */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 sm:px-4 py-1.5 flex gap-4 items-center">
                <span className="font-bold text-gray-700 text-[11px] sm:text-xs">Bank Configuration Mode:</span>
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab('ACCOUNTS')}
                        className={`px-3 py-1 font-bold text-[10px] uppercase rounded-t border-t border-l border-r border-gray-400 ${activeTab === 'ACCOUNTS' ? 'bg-[#EBE9D8] z-10 -mb-[1px] pb-1.5' : 'bg-gray-300 text-gray-500'}`}
                    >
                        Company Accounts
                    </button>
                    <button
                        onClick={() => setActiveTab('BENEFICIARIES')}
                        className={`px-3 py-1 font-bold text-[10px] uppercase rounded-t border-t border-l border-r border-gray-400 ${activeTab === 'BENEFICIARIES' ? 'bg-[#EBE9D8] z-10 -mb-[1px] pb-1.5' : 'bg-gray-300 text-gray-500'}`}
                    >
                        Beneficiaries
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-3 sm:p-4 overflow-auto min-w-0">
                <div className="grid grid-cols-1 lg:grid-cols-[380px_90px_1fr] gap-4 h-full min-h-0">

                    {/* Left Side - Form Fields */}
                    <div className="flex flex-col min-w-0">
                        <fieldset className="border border-gray-400 p-4 rounded-md bg-[#F0EEE0] shadow-sm relative pt-6 mb-4">
                            <legend className="text-white bg-[#316AC5] px-3 py-1 font-bold absolute -top-3 left-4 border border-[#26539a] text-[10px] sm:text-xs shadow-sm uppercase tracking-wider">
                                {activeTab === 'ACCOUNTS' ? 'Electronic Transfer Information' : 'Beneficiary Details'}
                            </legend>

                            <div className="space-y-3 mt-2">
                                {activeTab === 'ACCOUNTS' ? (
                                    <>
                                        {[
                                            { label: 'Bank', field: 'bank' },
                                            { label: 'Bank Branch', field: 'bankBranch' },
                                            { label: 'Company A/C No.', field: 'companyACNo' },
                                            { label: 'Identification No.', field: 'identificationNo' },
                                            { label: 'GL Account', field: 'glAccount' },
                                            { label: 'Export Path', field: 'exportPath' }
                                        ].map((item) => (
                                            <div key={item.field} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-3 items-center">
                                                <label className="text-gray-700 font-bold text-right text-[10px] sm:text-xs uppercase tracking-tighter">
                                                    {item.label}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={accountForm[item.field]}
                                                    onChange={(e) => handleInputChange(item.field, e.target.value)}
                                                    className={`p-1.5 border border-gray-400 bg-white text-blue-900 font-bold shadow-inner w-full text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all ${!isEditing ? 'opacity-70 bg-gray-50' : 'bg-white'}`}
                                                    readOnly={!isEditing}
                                                />
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {[
                                            { label: 'Beneficiary Name', field: 'name' },
                                            { label: 'Description', field: 'description' },
                                            { label: 'Target Account #', field: 'accountNumber' },
                                            { label: 'Target Bank', field: 'bankName' },
                                            { label: 'Currency', field: 'currency' },
                                            { label: 'Remit Total', field: 'remitTotal', type: 'number' }
                                        ].map((item) => (
                                            <div key={item.field} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-3 items-center">
                                                <label className="text-gray-700 font-bold text-right text-[10px] sm:text-xs uppercase tracking-tighter">
                                                    {item.label}
                                                </label>
                                                <input
                                                    type={item.type || "text"}
                                                    value={beneficiaryForm[item.field]}
                                                    onChange={(e) => handleInputChange(item.field, e.target.value)}
                                                    className={`p-1.5 border border-gray-400 bg-white text-blue-900 font-bold shadow-inner w-full text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all ${!isEditing ? 'opacity-70 bg-gray-50' : 'bg-white'}`}
                                                    readOnly={!isEditing}
                                                />
                                            </div>
                                        ))}
                                        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-3 items-center mt-2">
                                            <label className="text-gray-700 font-bold text-right text-[10px] sm:text-xs uppercase tracking-tighter">
                                                Include in Export
                                            </label>
                                            <input
                                                type="checkbox"
                                                checked={beneficiaryForm.includeInExport}
                                                onChange={(e) => handleInputChange('includeInExport', e.target.checked)}
                                                className="w-4 h-4"
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </fieldset>

                        <div className="mt-auto p-3 bg-blue-50 border border-blue-200 text-[9px] font-bold text-blue-800 uppercase italic">
                            * {activeTab === 'ACCOUNTS' ? 'Define Source Accounts' : 'Define Destination Payees'}
                        </div>
                    </div>

                    {/* Middle - Action Buttons */}
                    <div className="flex flex-row lg:flex-col gap-2 shrink-0 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
                        <button onClick={() => {
                            const term = prompt("Enter search term:");
                            if (term !== null) setSearchTerm(term);
                        }} className={btnClass}>
                            <Search className="text-blue-700 mb-1" size={20} />
                            <span className="font-bold text-[10px]">SEARCH</span>
                        </button>
                        <button onClick={handleDelete} className={btnClass}>
                            <X className="text-red-600 mb-1" size={20} />
                            <span className="font-bold text-[10px]">DELETE</span>
                        </button>
                        <button onClick={handleSave} className={btnClass}>
                            {selectedRow ? <RefreshCw className="text-green-700 mb-1" size={20} /> : <Save className="text-emerald-700 mb-1" size={20} />}
                            <span className="font-bold text-[10px]">{selectedRow ? 'UPDATE' : 'SAVE'}</span>
                        </button>
                        <button onClick={handleEdit} className={btnClass}>
                            <Edit className="text-blue-600 mb-1" size={20} />
                            <span className="font-bold text-[10px]">EDIT</span>
                        </button>
                        <button onClick={handleNew} className={btnClass}>
                            <Plus className="text-orange-600 mb-1" size={20} />
                            <span className="font-bold text-[10px]">NEW</span>
                        </button>

                        <div className="hidden lg:block h-px bg-gray-400 my-1 mx-2"></div>

                        <button onClick={() => navigate(-1)} className={btnClass}>
                            <LogOut className="text-red-700 mb-1" size={20} />
                            <span className="font-bold text-[10px]">EXIT</span>
                        </button>
                    </div>

                    {/* Right Side - Table Container */}
                    <div className="flex flex-col min-w-0 h-full relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                            </div>
                        )}
                        <div className="bg-white border border-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] flex-1 overflow-hidden flex flex-col rounded-sm">
                            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-1.5 flex justify-between items-center shrink-0">
                                <span className="font-bold text-gray-700 uppercase tracking-tighter text-[10px]">
                                    {activeTab === 'ACCOUNTS' ? 'Company Accounts List' : 'Beneficiary Payment List'}
                                </span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase">
                                    {activeTab === 'ACCOUNTS' ? bankAccounts.length : beneficiaries.length} Record(s)
                                </span>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <table className="w-full border-collapse min-w-[500px]">
                                    <thead className="bg-[#EBE9D8] border-b border-gray-400 text-[10px] text-gray-700 font-bold sticky top-0 z-10">
                                        <tr>
                                            {activeTab === 'ACCOUNTS' ? (
                                                <>
                                                    <th className="border-r border-gray-400 p-2 text-left uppercase tracking-tighter w-1/4">Bank Name</th>
                                                    <th className="border-r border-gray-400 p-2 text-left uppercase tracking-tighter w-1/4">Branch</th>
                                                    <th className="border-r border-gray-400 p-2 text-left uppercase tracking-tighter w-1/4">Account #</th>
                                                    <th className="p-2 text-left uppercase tracking-tighter w-1/4">Export Path</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="border-r border-gray-400 p-2 text-left uppercase tracking-tighter w-1/4">Beneficiary</th>
                                                    <th className="border-r border-gray-400 p-2 text-left uppercase tracking-tighter w-1/4">Description</th>
                                                    <th className="border-r border-gray-400 p-2 text-center uppercase tracking-tighter w-16">Include</th>
                                                    <th className="border-r border-gray-400 p-2 text-left uppercase tracking-tighter w-1/4">Account #</th>
                                                    <th className="p-2 text-right uppercase tracking-tighter w-1/5">Remit Total</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="text-[11px] font-bold">
                                        {(activeTab === 'ACCOUNTS' ? bankAccounts : beneficiaries)
                                            .filter(item => {
                                                const search = searchTerm.toLowerCase();
                                                if (!search) return true;
                                                if (activeTab === 'ACCOUNTS') {
                                                    return item.branch?.toLowerCase().includes(search) || item.accountNo?.includes(search) || item.bank?.toLowerCase().includes(search);
                                                } else {
                                                    return item.name?.toLowerCase().includes(search) || item.accountNumber?.includes(search);
                                                }
                                            })
                                            .map((item) => (
                                                <tr
                                                    key={item.id}
                                                    onClick={() => handleRowClick(item.id)}
                                                    className={`cursor-pointer transition-colors ${selectedRow === item.id
                                                        ? 'bg-[#316AC5] text-white'
                                                        : 'odd:bg-[#F2F7FF] even:bg-white hover:bg-yellow-50'
                                                        }`}
                                                >
                                                    {activeTab === 'ACCOUNTS' ? (
                                                        <>
                                                            <td className="border-r border-gray-200 p-2 truncate">{item.bank || '-'}</td>
                                                            <td className="border-r border-gray-200 p-2 truncate">{item.branch}</td>
                                                            <td className="border-r border-gray-200 p-2 truncate font-mono">{item.accountNo}</td>
                                                            <td className="p-2 truncate text-gray-500">{item.exportPath}</td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="border-r border-gray-200 p-2 truncate">{item.name}</td>
                                                            <td className="border-r border-gray-200 p-2 truncate">{item.description}</td>
                                                            <td className="border-r border-gray-200 p-2 text-center">
                                                                <input type="checkbox" checked={item.includeInExport} readOnly className="w-3.5 h-3.5" />
                                                            </td>
                                                            <td className="border-r border-gray-200 p-2 truncate font-mono">{item.accountNumber}</td>
                                                            <td className="p-2 text-right truncate tabular-nums">{item.remitTotal}</td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        {/* Fill empty space */}
                                        {[...Array(Math.max(0, 15 - (activeTab === 'ACCOUNTS' ? bankAccounts.length : beneficiaries.length)))].map((_, i) => (
                                            <tr key={`empty-${i}`} className="h-8 border-b border-gray-100 last:border-0">
                                                <td className="border-r border-gray-100"></td>
                                                <td className="border-r border-gray-100"></td>
                                                <td className="border-r border-gray-100"></td>
                                                <td className="border-r border-gray-100"></td>
                                                {activeTab === 'BENEFICIARIES' && <td></td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankDetails;
