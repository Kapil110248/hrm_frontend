import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, Plus, Edit, RefreshCw, X, Search, Folder, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const BankDetails = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    // Form fields state
    const [formData, setFormData] = useState({
        bank: '',
        bankBranch: '',
        companyACNo: '',
        identificationNo: '',
        glAccount: '',
        exportPath: ''
    });

    // Bank accounts table data
    const [bankAccounts, setBankAccounts] = useState([]);

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

    useEffect(() => {
        fetchBankAccounts();
    }, [selectedCompany.id]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNew = () => {
        setFormData({
            bank: '',
            bankBranch: '',
            companyACNo: '',
            identificationNo: '',
            glAccount: '',
            exportPath: ''
        });
        setSelectedRow(null);
        setIsEditing(true);
    };

    const handleEnter = async () => {
        if (formData.bankBranch && formData.companyACNo) {
            try {
                setLoading(true);
                const payload = {
                    companyId: selectedCompany.id,
                    bankName: formData.bank,
                    bankBranch: formData.bankBranch,
                    accountNumber: formData.companyACNo,
                    identificationNo: formData.identificationNo,
                    glAccount: formData.glAccount,
                    exportPath: formData.exportPath
                };
                const response = await api.createBankAccount(payload);
                if (response.success) {
                    fetchBankAccounts();
                    handleNew();
                    setIsEditing(false);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = () => {
        if (selectedRow) {
            const account = bankAccounts.find(a => a.id === selectedRow);
            if (account) {
                // We need to fetch the full details for GL Account and Export Path if they are in the table item, 
                // but since they are not in the mapped table item, we should find in the original API response or let it be.
                // For now, we'll just use what we have in the item.
                setFormData({
                    bank: account.bank,
                    bankBranch: account.branch,
                    companyACNo: account.accountNo,
                    identificationNo: account.identificationNo,
                    glAccount: account.glAccount || '',
                    exportPath: account.exportPath || ''
                });
                setIsEditing(true);
            }
        }
    };

    const handleUpdate = async () => {
        if (selectedRow) {
            try {
                setLoading(true);
                const payload = {
                    bankName: formData.bank,
                    bankBranch: formData.bankBranch,
                    accountNumber: formData.companyACNo,
                    identificationNo: formData.identificationNo,
                    glAccount: formData.glAccount,
                    exportPath: formData.exportPath
                };
                const response = await api.updateBankAccount(selectedRow, payload);
                if (response.success) {
                    fetchBankAccounts();
                    setIsEditing(false);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDelete = async () => {
        if (selectedRow && window.confirm("DELETE BANK ACCOUNT: Are you sure?")) {
            try {
                setLoading(true);
                const response = await api.deleteBankAccount(selectedRow);
                if (response.success) {
                    fetchBankAccounts();
                    setSelectedRow(null);
                    handleNew();
                    setIsEditing(false);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRowClick = (id) => {
        setSelectedRow(id);
        const account = bankAccounts.find(a => a.id === id);
        if (account) {
            setFormData({
                bank: account.bank,
                bankBranch: account.branch,
                companyACNo: account.accountNo,
                identificationNo: account.identificationNo,
                glAccount: account.glAccount || '',
                exportPath: account.exportPath || ''
            });
        }
    };

    const btnClass = "flex flex-col items-center justify-center p-1.5 sm:p-2 border border-gray-400 border-b-2 border-r-2 border-gray-500 bg-[#E0DCCF] hover:bg-gray-200 active:border-0 active:translate-y-0.5 touch-manipulation min-w-[48px] sm:min-w-[5rem]";

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs min-w-0">
            {/* Header - responsive */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-2 sm:px-4 py-1.5">
                <span className="font-bold text-gray-700 text-[11px] sm:text-xs truncate block">Bank Information</span>
            </div>

            {/* Content Area - grid-based layout to prevent overlap */}
            <div className="flex-1 p-3 sm:p-4 overflow-auto min-w-0">
                <div className="grid grid-cols-1 lg:grid-cols-[380px_90px_1fr] gap-4 h-full min-h-0">

                    {/* Left Side - Form Fields */}
                    <div className="flex flex-col min-w-0">
                        <fieldset className="border border-gray-400 p-4 rounded-md bg-[#F0EEE0] shadow-sm relative pt-6 mb-4">
                            <legend className="text-white bg-[#316AC5] px-3 py-1 font-bold absolute -top-3 left-4 border border-[#26539a] text-[10px] sm:text-xs shadow-sm uppercase tracking-wider">
                                Electronic Transfer Information
                            </legend>

                            <div className="space-y-3 mt-2">
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
                                            value={formData[item.field]}
                                            onChange={(e) => handleInputChange(item.field, e.target.value)}
                                            className={`p-1.5 border border-gray-400 bg-white text-blue-900 font-bold shadow-inner w-full text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all ${!isEditing ? 'opacity-70 bg-gray-50' : 'bg-white'}`}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                ))}
                            </div>
                        </fieldset>

                        {/* Status/Help text if needed */}
                        <div className="mt-auto p-3 bg-blue-50 border border-blue-200 text-[9px] font-bold text-blue-800 uppercase italic">
                            * Fill all required fields before clicking Update or Enter
                        </div>
                    </div>

                    {/* Middle - Action Buttons (Properly spaced) */}
                    <div className="flex flex-row lg:flex-col gap-2 shrink-0 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
                        <button onClick={() => {
                            const term = prompt("Enter search term (Branch or Account No):");
                            if (term !== null) setSearchTerm(term);
                        }} className={btnClass}>
                            <Search className="text-blue-700 mb-1" size={20} />
                            <span className="font-bold text-[10px]">SEARCH</span>
                        </button>
                        <button onClick={handleDelete} className={btnClass}>
                            <X className="text-red-600 mb-1" size={20} />
                            <span className="font-bold text-[10px]">DELETE</span>
                        </button>
                        <button onClick={handleUpdate} className={btnClass}>
                            <RefreshCw className="text-green-700 mb-1" size={20} />
                            <span className="font-bold text-[10px]">UPDATE</span>
                        </button>
                        <button onClick={handleEdit} className={btnClass}>
                            <Edit className="text-blue-600 mb-1" size={20} />
                            <span className="font-bold text-[10px]">EDIT</span>
                        </button>
                        <button onClick={handleEnter} className={btnClass}>
                            <Folder className="text-gray-700 mb-1" size={20} />
                            <span className="font-bold text-[10px]">ENTER</span>
                        </button>
                        <button onClick={handleNew} className={btnClass}>
                            <Plus className="text-orange-600 mb-1" size={20} />
                            <span className="font-bold text-[10px]">NEW</span>
                        </button>

                        {/* Separator for desktop */}
                        <div className="hidden lg:block h-px bg-gray-400 my-1 mx-2"></div>

                        <button onClick={handleUpdate} className={btnClass}>
                            <Save className="text-emerald-700 mb-1" size={20} />
                            <span className="font-bold text-[10px]">SAVE</span>
                        </button>
                        <button onClick={() => navigate(-1)} className={btnClass}>
                            <LogOut className="text-red-700 mb-1" size={20} />
                            <span className="font-bold text-[10px]">EXIT</span>
                        </button>
                    </div>

                    {/* Right Side - Table Container (Ensured no overlap) */}
                    <div className="flex flex-col min-w-0 h-full relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                            </div>
                        )}
                        <div className="bg-white border border-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] flex-1 overflow-hidden flex flex-col rounded-sm">
                            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-1.5 flex justify-between items-center shrink-0">
                                <span className="font-bold text-gray-700 uppercase tracking-tighter text-[10px]">Bank Accounts List</span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase">{bankAccounts.length} Record(s)</span>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <table className="w-full border-collapse min-w-[500px]">
                                    <thead className="bg-[#EBE9D8] border-b border-gray-400 text-[10px] text-gray-700 font-bold sticky top-0 z-10">
                                        <tr>
                                            <th className="border-r border-gray-400 p-2 text-left uppercase tracking-tighter w-1/4">Bank Name</th>
                                            <th className="border-r border-gray-400 p-2 text-left uppercase tracking-tighter w-1/4">Branch Name</th>
                                            <th className="border-r border-gray-400 p-2 text-left uppercase tracking-tighter w-1/4">Account Number</th>
                                            <th className="p-2 text-left uppercase tracking-tighter w-1/4">Identification</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[11px] font-bold">
                                        {bankAccounts
                                            .filter(acc =>
                                                acc.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                acc.accountNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                (acc.bank && acc.bank.toLowerCase().includes(searchTerm.toLowerCase()))
                                            )
                                            .map((account) => (
                                                <tr
                                                    key={account.id}
                                                    onClick={() => handleRowClick(account.id)}
                                                    className={`cursor-pointer transition-colors ${selectedRow === account.id
                                                        ? 'bg-[#316AC5] text-white'
                                                        : 'odd:bg-[#F2F7FF] even:bg-white hover:bg-yellow-50'
                                                        }`}
                                                >
                                                    <td className="border-r border-gray-200 p-2 truncate">{account.bank || '-'}</td>
                                                    <td className="border-r border-gray-200 p-2 truncate">{account.branch}</td>
                                                    <td className="border-r border-gray-200 p-2 truncate font-mono">{account.accountNo}</td>
                                                    <td className="p-2 truncate">{account.identificationNo}</td>
                                                </tr>
                                            ))}
                                        {/* Fill empty space */}
                                        {[...Array(Math.max(0, 15 - bankAccounts.length))].map((_, i) => (
                                            <tr key={`empty-${i}`} className="h-8 border-b border-gray-100 last:border-0">
                                                <td className="border-r border-gray-100"></td>
                                                <td className="border-r border-gray-100"></td>
                                                <td className="border-r border-gray-100"></td>
                                                <td></td>
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
