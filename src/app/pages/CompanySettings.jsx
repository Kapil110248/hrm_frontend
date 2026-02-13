import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Save, LogOut, Edit, Folder, Info, Settings,
    ShieldAlert, Database, Building2, Globe,
    Hash, Landmark, UserCheck, Loader2
} from 'lucide-react';
import { api } from '../../services/api';

const CompanySettings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('General');
    const [isEditing, setIsEditing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    const [formData, setFormData] = useState({
        companyName: '',
        abbrv: '',
        trn: '',
        nisNumber: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        sector: 'Private',
        currency: 'JMD',
        fiscalYearStart: 'January',

        // Tax Rates & Rules (Stored in settings JSON)
        incomeTaxThreshold: '1500000',
        nisRateEE: '3.0',
        nisRateER: '3.0',
        nhtRateEE: '2.0',
        nhtRateER: '3.0',
        educationTaxEE: '2.25',
        educationTaxER: '3.5',
        incomeTaxRate: '25.0',
        highIncomeTaxRate: '30.0',
        highIncomeThreshold: '6000000',

        // Configuration
        autoEmailSlips: true,
        passwordProtectSlips: true,
        payslipPasswordType: 'TRN',
        roundNetPay: true
    });

    useEffect(() => {
        const fetchCompanyData = async () => {
            if (!selectedCompany.id) return;
            try {
                setLoading(true);
                // We use getCompanies and find the current one, or if we had a getCompanyById we'd use that.
                // Assuming companies include settings JSON.
                const response = await api.fetchCompanies();
                if (response.success) {
                    const company = response.data.find(c => c.id === selectedCompany.id);
                    if (company) {
                        const settings = company.settings || {};
                        setFormData({
                            companyName: company.name || '',
                            abbrv: company.code || '',
                            trn: company.trn || '',
                            nisNumber: settings.nisNumber || '',
                            address: company.address || '',
                            phone: company.phone || '',
                            email: company.email || '',
                            website: settings.website || '',
                            sector: settings.sector || 'Private',
                            currency: settings.currency || 'JMD',
                            fiscalYearStart: settings.fiscalYearStart || 'January',

                            incomeTaxThreshold: settings.incomeTaxThreshold || '1500000',
                            nisRateEE: settings.nisRateEE || '3.0',
                            nisRateER: settings.nisRateER || '3.0',
                            nhtRateEE: settings.nhtRateEE || '2.0',
                            nhtRateER: settings.nhtRateER || '3.0',
                            educationTaxEE: settings.educationTaxEE || '2.25',
                            educationTaxER: settings.educationTaxER || '3.5',
                            incomeTaxRate: settings.incomeTaxRate || '25.0',
                            highIncomeTaxRate: settings.highIncomeTaxRate || '30.0',
                            highIncomeThreshold: settings.highIncomeThreshold || '6000000',

                            autoEmailSlips: settings.autoEmailSlips ?? true,
                            passwordProtectSlips: settings.passwordProtectSlips ?? true,
                            payslipPasswordType: settings.payslipPasswordType || 'TRN',
                            roundNetPay: settings.roundNetPay ?? true
                        });
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyData();
    }, [selectedCompany.id]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const settings = {
                nisNumber: formData.nisNumber,
                website: formData.website,
                sector: formData.sector,
                currency: formData.currency,
                fiscalYearStart: formData.fiscalYearStart,
                incomeTaxThreshold: formData.incomeTaxThreshold,
                nisRateEE: formData.nisRateEE,
                nisRateER: formData.nisRateER,
                nhtRateEE: formData.nhtRateEE,
                nhtRateER: formData.nhtRateER,
                educationTaxEE: formData.educationTaxEE,
                educationTaxER: formData.educationTaxER,
                incomeTaxRate: formData.incomeTaxRate,
                highIncomeTaxRate: formData.highIncomeTaxRate,
                highIncomeThreshold: formData.highIncomeThreshold,
                autoEmailSlips: formData.autoEmailSlips,
                passwordProtectSlips: formData.passwordProtectSlips,
                payslipPasswordType: formData.payslipPasswordType,
                roundNetPay: formData.roundNetPay
            };

            const payload = {
                name: formData.companyName,
                code: formData.abbrv,
                trn: formData.trn,
                address: formData.address,
                phone: formData.phone,
                email: formData.email,
                settings: settings
            };

            const response = await api.updateCompany(selectedCompany.id, payload);
            if (response.success) {
                alert('Settings saved successfully!');
                // Update local storage if name changed
                const updatedCompany = { ...selectedCompany, name: formData.companyName, code: formData.abbrv };
                localStorage.setItem('selectedCompany', JSON.stringify(updatedCompany));
                setSelectedCompany(updatedCompany);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F5F7] font-sans">
            {/* Header / Title Bar */}
            <div className="border-b border-gray-300 px-6 py-4">
                <h1 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Master Configuration</h1>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Jamaica Compliance Engine</p>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
                <div className="flex flex-col lg:flex-row gap-6 flex-1 max-w-7xl mx-auto w-full">

                    {/* Sidebar Tabs */}
                    <div className="flex flex-row lg:flex-col gap-1 w-full lg:w-48 shrink-0 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab('General')}
                            className={`p-3 flex items-center gap-3 text-left transition-all rounded ${activeTab === 'General' ? 'bg-gray-800 text-white' : 'hover:bg-gray-200 text-gray-600'}`}
                        >
                            <Info size={14} />
                            <span className="font-bold text-[10px] uppercase">General Info</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('Tax')}
                            className={`p-3 flex items-center gap-3 text-left transition-all rounded ${activeTab === 'Tax' ? 'bg-gray-800 text-white' : 'hover:bg-gray-200 text-gray-600'}`}
                        >
                            <ShieldAlert size={14} />
                            <span className="font-bold text-[10px] uppercase">Compliance</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('Payroll')}
                            className={`p-3 flex items-center gap-3 text-left transition-all rounded ${activeTab === 'Payroll' ? 'bg-gray-800 text-white' : 'hover:bg-gray-200 text-gray-600'}`}
                        >
                            <Settings size={14} />
                            <span className="font-bold text-[10px] uppercase">Payroll Engine</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('System')}
                            className={`p-3 flex items-center gap-3 text-left transition-all rounded ${activeTab === 'System' ? 'bg-gray-800 text-white' : 'hover:bg-gray-200 text-gray-600'}`}
                        >
                            <Database size={14} />
                            <span className="font-bold text-[10px] uppercase">Integrations</span>
                        </button>
                    </div>

                    {/* Main Settings Panel */}
                    <div className="flex-1 bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-gray-50 p-4 border-b border-gray-200">
                            <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">{activeTab} Configuration</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8">

                            {activeTab === 'General' && (
                                <div className="max-w-2xl flex flex-col gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company Name</label>
                                            <input value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm font-medium text-gray-700" placeholder="Legal Entity Name" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Abbrv.</label>
                                            <input value={formData.abbrv} onChange={(e) => handleInputChange('abbrv', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm font-medium text-gray-700 uppercase" placeholder="e.g. IHSL" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">TRN</label>
                                            <input value={formData.trn} onChange={(e) => handleInputChange('trn', e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-sm font-bold text-gray-800" placeholder="000-000-000" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">NIS Employer #</label>
                                            <input value={formData.nisNumber} onChange={(e) => handleInputChange('nisNumber', e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-sm font-bold text-gray-800" placeholder="P-0000000" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Corporate Address</label>
                                        <textarea value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm font-medium text-gray-700 h-20" placeholder="Physical location"></textarea>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Tax' && (
                                <div className="max-w-3xl flex flex-col gap-6">
                                    <div className="bg-gray-50 border border-gray-200 p-4 rounded mb-4">
                                        <div className="flex gap-3">
                                            <ShieldAlert className="text-gray-400" size={18} />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Compliance Advisory</p>
                                                <p className="text-[10px] text-gray-500 font-medium">Define statutory deduction rates for Jamaica (NIS, NHT, Education Tax, PAYE).</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-[10px] text-gray-400 border-b border-gray-100 pb-2 uppercase tracking-widest">Deduction Rates (%)</h4>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase">NIS (EE)</label>
                                                    <input type="number" value={formData.nisRateEE} onChange={(e) => handleInputChange('nisRateEE', e.target.value)} className="p-2 border border-gray-200 rounded text-xs font-bold text-right" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase">NIS (ER)</label>
                                                    <input type="number" value={formData.nisRateER} onChange={(e) => handleInputChange('nisRateER', e.target.value)} className="p-2 border border-gray-200 rounded text-xs font-bold text-right" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase">NHT (EE)</label>
                                                    <input type="number" value={formData.nhtRateEE} onChange={(e) => handleInputChange('nhtRateEE', e.target.value)} className="p-2 border border-gray-200 rounded text-xs font-bold text-right" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase">NHT (ER)</label>
                                                    <input type="number" value={formData.nhtRateER} onChange={(e) => handleInputChange('nhtRateER', e.target.value)} className="p-2 border border-gray-200 rounded text-xs font-bold text-right" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-bold text-[10px] text-gray-400 border-b border-gray-100 pb-2 uppercase tracking-widest">Annual Thresholds (JMD)</h4>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-[9px] font-bold text-gray-500 uppercase">Income Tax Threshold</label>
                                                <input type="number" value={formData.incomeTaxThreshold} onChange={(e) => handleInputChange('incomeTaxThreshold', e.target.value)} className="p-3 border border-gray-300 rounded bg-gray-50 font-bold text-gray-800 text-lg text-right" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase">Base Rate (%)</label>
                                                    <input type="number" value={formData.incomeTaxRate} onChange={(e) => handleInputChange('incomeTaxRate', e.target.value)} className="p-2 border border-gray-200 rounded text-xs font-bold text-right" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase">High Rate (%)</label>
                                                    <input type="number" value={formData.highIncomeTaxRate} onChange={(e) => handleInputChange('highIncomeTaxRate', e.target.value)} className="p-2 border border-gray-200 rounded text-xs font-bold text-right" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Payroll' && (
                                <div className="max-w-2xl flex flex-col gap-6">
                                    <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2 uppercase text-[10px] tracking-widest">Automation & Delivery</h4>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded">
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-700 uppercase">Auto-Email Payslips</p>
                                                <p className="text-[9px] text-gray-400 font-medium">Dispatch slips after payroll finalization.</p>
                                            </div>
                                            <input type="checkbox" checked={formData.autoEmailSlips} onChange={(e) => handleInputChange('autoEmailSlips', e.target.checked)} className="w-4 h-4" />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded">
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-700 uppercase">PDF Security</p>
                                                <p className="text-[9px] text-gray-400 font-medium">Apply password protection to output files.</p>
                                            </div>
                                            <input type="checkbox" checked={formData.passwordProtectSlips} onChange={(e) => handleInputChange('passwordProtectSlips', e.target.checked)} className="w-4 h-4" />
                                        </div>

                                        <div className="flex flex-col gap-2 p-4 bg-gray-100 border border-gray-200 rounded">
                                            <label className="text-[10px] font-bold text-gray-600 uppercase">Encryption Logic</label>
                                            <select value={formData.payslipPasswordType} onChange={(e) => handleInputChange('payslipPasswordType', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-xs font-medium">
                                                <option value="TRN">Employee TRN</option>
                                                <option value="DOB">Date of Birth (YYYYMMDD)</option>
                                                <option value="EMP_ID">System Employee ID</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Actions Bar */}
                        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
                            <button onClick={() => navigate('/')} className="px-6 py-2 rounded text-[10px] font-bold uppercase text-gray-500 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-gray-800 text-white px-8 py-2 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-gray-900 transition-colors flex items-center gap-2"
                            >
                                {loading && <Loader2 size={14} className="animate-spin" />}
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CompanySettings;
