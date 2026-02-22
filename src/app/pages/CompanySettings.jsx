import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Save, LogOut, Edit, Folder, Info, Settings, X,
    ShieldAlert, Database, Building2, Globe,
    Hash, Landmark, UserCheck, Loader2
} from 'lucide-react';
import { api } from '../../services/api';
import apiClient from '../../api/apiClient';

const CompanySettings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('General');
    const [isEditing, setIsEditing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    const [formData, setFormData] = useState({
        companyName: '',
        description: '',
        abbrv: '',
        trn: '',
        nisNumber: '',
        payeReference: '',
        tradeName: '',
        address: '',
        addressLine2: '',
        mailingAddress1: '',
        mailingAddress2: '',
        phone: '',
        website: '',
        sector: 'Private',
        currency: 'JMD',
        fiscalYearStart: 'January',

        // Cycle Info (Image 4)
        payCycle: 'Monthly',
        payDay: 'Wednesday',
        currentPeriod: '1',
        noOfPeriods: '12',

        // Tax Rates & Rules (Stored in settings JSON)
        incomeTaxThreshold: '1500000',
        nisRateEE: '3.0',
        nisRateER: '3.0',
        nisAnnualCeiling: '5000000',
        nhtRateEE: '2.0',
        nhtRateER: '3.0',
        educationTaxEE: '2.25',
        educationTaxER: '3.5',
        heartRateER: '3.0',
        incomeTaxRate: '25.0',
        highIncomeTaxRate: '30.0',
        highIncomeThreshold: '6000000',

        // Configuration (Image 2)
        autoEmailSlips: true,
        passwordProtectSlips: true,
        payslipPasswordType: 'TRN',
        roundNetPay: true,
        periodClearingGL: '',
        periodSuspenseGL: '',
        probationaryPeriod: '3',
        probationaryUnit: 'Month(s)',
        pensionPctTaxableCeiling: '20.0',
        s01ExportPath: 'C:\\MICROBRIDGE SOFTWARE\\SMARTPA',

        // Missing Config from Screenshot 3
        glExportType: 'Generic CSV',
        glExportPath: '',
        useDualTaxFree: false,
        primaryTaxFree: '0.00',
        secondTaxFree: '0.00',
        graduatedIncomeTax: true,
        logo: null,
        logoPublicId: null,

        // Missing General Info from Latest Screenshot
        frequencyDesc: '',
        currentPe: '',
        payYear: new Date().getFullYear().toString(),
        annualTaxCr: '0.00',
        currentNisE: '',
        taxCreditType: 'Annual'
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
                            description: settings.description || '',
                            abbrv: company.code || '',
                            trn: company.trn || '',
                            nisNumber: settings.nisNumber || '',
                            payeReference: settings.payeReference || '',
                            tradeName: settings.tradeName || '',
                            address: company.address || '',
                            addressLine2: company.addressLine2 || '',
                            mailingAddress1: company.mailingAddress1 || '',
                            mailingAddress2: company.mailingAddress2 || '',
                            phone: company.phone || '',
                            email: company.email || '',
                            website: settings.website || '',
                            sector: settings.sector || 'Private',
                            currency: settings.currency || 'JMD',
                            fiscalYearStart: settings.fiscalYearStart || 'January',

                            payCycle: settings.payCycle || 'Monthly',
                            payDay: settings.payDay || 'Wednesday',
                            currentPeriod: settings.currentPeriod || '1',
                            noOfPeriods: settings.noOfPeriods || '12',

                            // Missing from Screenshot
                            frequencyDesc: settings.frequencyDesc || '',
                            currentPe: settings.currentPe || '',
                            payYear: settings.payYear || new Date().getFullYear().toString(),
                            annualTaxCr: settings.annualTaxCr || '0.00',
                            currentNisE: settings.currentNisE || '',
                            taxCreditType: settings.taxCreditType || 'Annual',

                            incomeTaxThreshold: settings.incomeTaxThreshold || '1500000',
                            nisRateEE: settings.nisRateEE || '3.0',
                            nisRateER: settings.nisRateER || '3.0',
                            nisAnnualCeiling: settings.nisAnnualCeiling || '5000000',
                            nhtRateEE: settings.nhtRateEE || '2.0',
                            nhtRateER: settings.nhtRateER || '3.0',
                            educationTaxEE: settings.educationTaxEE || '2.25',
                            educationTaxER: settings.educationTaxER || '3.5',
                            heartRateER: settings.heartRateER || '3.0',
                            incomeTaxRate: settings.incomeTaxRate || '25.0',
                            highIncomeTaxRate: settings.highIncomeTaxRate || '30.0',
                            highIncomeThreshold: settings.highIncomeThreshold || '6000000',

                            autoEmailSlips: settings.autoEmailSlips ?? true,
                            passwordProtectSlips: settings.passwordProtectSlips ?? true,
                            payslipPasswordType: settings.payslipPasswordType || 'TRN',
                            roundNetPay: settings.roundNetPay ?? true,
                            periodClearingGL: settings.periodClearingGL || '',
                            periodSuspenseGL: settings.periodSuspenseGL || '',
                            probationaryPeriod: settings.probationaryPeriod || '3',
                            probationaryUnit: settings.probationaryUnit || 'Month(s)',
                            pensionPctTaxableCeiling: settings.pensionPctTaxableCeiling || '20.0',
                            s01ExportPath: settings.s01ExportPath || 'C:\\MICROBRIDGE SOFTWARE\\SMARTPA',
                            glExportType: settings.glExportType || 'Generic CSV',
                            glExportPath: settings.glExportPath || '',
                            useDualTaxFree: settings.useDualTaxFree ?? false,
                            primaryTaxFree: settings.primaryTaxFree || '0.00',
                            secondTaxFree: settings.secondTaxFree || '0.00',
                            graduatedIncomeTax: settings.graduatedIncomeTax ?? true,
                            logo: settings.logo || null,
                            logoPublicId: settings.logoPublicId || null
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

    const logoInputRef = useRef(null);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLogoUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLogoUploading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64 = reader.result;
                    const res = await apiClient.post('/upload/logo', { data: base64 });
                    if (res?.url) {
                        setFormData(prev => ({ ...prev, logo: res.url, logoPublicId: res.publicId }));
                    } else {
                        console.error('Upload response missing url:', res);
                        alert('Upload succeeded but no image URL returned.');
                    }
                } catch (err) {
                    console.error('Logo upload failed:', err);
                    alert('Failed to upload logo: ' + (err?.error || err?.message || 'Unknown error'));
                } finally {
                    setLogoUploading(false);
                    if (logoInputRef.current) logoInputRef.current.value = '';
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Logo upload failed:', err);
            alert('Failed to upload logo.');
            setLogoUploading(false);
            if (logoInputRef.current) logoInputRef.current.value = '';
        }
    }, []);

    const handleLogoDelete = useCallback(async (publicId) => {
        if (!publicId) {
            setFormData(prev => ({ ...prev, logo: null, logoPublicId: null }));
            return;
        }
        try {
            await apiClient.delete('/upload/logo', { data: { publicId } });
        } catch (err) {
            console.error('Delete logo error:', err);
        }
        setFormData(prev => ({ ...prev, logo: null, logoPublicId: null }));
    }, []);

    const handleSave = async () => {
        try {
            setLoading(true);
            const settings = {
                description: formData.description,
                nisNumber: formData.nisNumber,
                payeReference: formData.payeReference,
                tradeName: formData.tradeName,
                website: formData.website,
                sector: formData.sector,
                currency: formData.currency,
                fiscalYearStart: formData.fiscalYearStart,
                payCycle: formData.payCycle,
                payDay: formData.payDay,
                currentPeriod: formData.currentPeriod,
                noOfPeriods: formData.noOfPeriods,
                frequencyDesc: formData.frequencyDesc,
                currentPe: formData.currentPe,
                payYear: formData.payYear,
                annualTaxCr: formData.annualTaxCr,
                currentNisE: formData.currentNisE,
                taxCreditType: formData.taxCreditType,
                incomeTaxThreshold: formData.incomeTaxThreshold,
                nisRateEE: formData.nisRateEE,
                nisRateER: formData.nisRateER,
                nisAnnualCeiling: formData.nisAnnualCeiling,
                nhtRateEE: formData.nhtRateEE,
                nhtRateER: formData.nhtRateER,
                educationTaxEE: formData.educationTaxEE,
                educationTaxER: formData.educationTaxER,
                heartRateER: formData.heartRateER,
                incomeTaxRate: formData.incomeTaxRate,
                highIncomeTaxRate: formData.highIncomeTaxRate,
                highIncomeThreshold: formData.highIncomeThreshold,
                autoEmailSlips: formData.autoEmailSlips,
                passwordProtectSlips: formData.passwordProtectSlips,
                payslipPasswordType: formData.payslipPasswordType,
                roundNetPay: formData.roundNetPay,
                periodClearingGL: formData.periodClearingGL,
                periodSuspenseGL: formData.periodSuspenseGL,
                probationaryPeriod: formData.probationaryPeriod,
                probationaryUnit: formData.probationaryUnit,
                pensionPctTaxableCeiling: formData.pensionPctTaxableCeiling,
                s01ExportPath: formData.s01ExportPath,
                glExportType: formData.glExportType,
                glExportPath: formData.glExportPath,
                useDualTaxFree: formData.useDualTaxFree,
                primaryTaxFree: formData.primaryTaxFree,
                secondTaxFree: formData.secondTaxFree,
                graduatedIncomeTax: formData.graduatedIncomeTax,
                logo: formData.logo,
                logoPublicId: formData.logoPublicId
            };

            const payload = {
                name: formData.companyName,
                code: formData.abbrv,
                trn: formData.trn,
                address: formData.address,
                addressLine2: formData.addressLine2,
                mailingAddress1: formData.mailingAddress1,
                mailingAddress2: formData.mailingAddress2,
                phone: formData.phone,
                email: formData.email,
                logo: formData.logo,
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
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company No.</label>
                                            <input value={selectedCompany.id?.slice(0, 4) || '3'} readOnly className="w-full p-2 border border-gray-300 rounded text-sm font-bold bg-gray-50 text-gray-500" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Corporate Name</label>
                                            <input value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm font-bold text-blue-900 shadow-inner" placeholder="Legal Entity Name" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                                        <input value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm font-bold text-blue-900 shadow-inner" placeholder="Company description..." />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trade Name</label>
                                        <input value={formData.tradeName} onChange={(e) => handleInputChange('tradeName', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm font-bold text-blue-900" placeholder="Trading As..." />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">NIS Reference</label>
                                            <input value={formData.nisNumber} onChange={(e) => handleInputChange('nisNumber', e.target.value)} className="w-full p-2 border border-blue-200 bg-blue-50/30 rounded text-sm font-bold text-gray-800" placeholder="P-0000000" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">PAYE Reference</label>
                                            <input value={formData.payeReference} onChange={(e) => handleInputChange('payeReference', e.target.value)} className="w-full p-2 border border-blue-200 bg-blue-50/30 rounded text-sm font-bold text-gray-800" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">TRN</label>
                                            <input value={formData.trn} onChange={(e) => handleInputChange('trn', e.target.value)} className="w-full p-2 border border-blue-200 bg-blue-50/30 rounded text-sm font-bold text-gray-800" placeholder="000-000-000" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Frequency Desc.</label>
                                            <input value={formData.frequencyDesc} onChange={(e) => handleInputChange('frequencyDesc', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm font-medium text-gray-700" />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 p-4 border border-gray-200 rounded">
                                        <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-200 pb-1">Contact Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address Line 1</label>
                                                    <input value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className="w-full p-2 border border-blue-200 bg-blue-50/10 rounded text-sm font-medium text-gray-700" placeholder="Street Address" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address Line 2</label>
                                                    <input value={formData.addressLine2} onChange={(e) => handleInputChange('addressLine2', e.target.value)} className="w-full p-2 border border-blue-200 bg-blue-50/10 rounded text-sm font-medium text-gray-700" placeholder="City / Parish" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone No.</label>
                                                    <input value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm font-medium text-gray-700" placeholder="876-..." />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mailing Address 1</label>
                                                    <input value={formData.mailingAddress1} onChange={(e) => handleInputChange('mailingAddress1', e.target.value)} className="w-full p-2 border border-blue-200 bg-blue-50/10 rounded text-sm font-medium text-gray-700" placeholder="P.O. Box or Street" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mailing Address 2</label>
                                                    <input value={formData.mailingAddress2} onChange={(e) => handleInputChange('mailingAddress2', e.target.value)} className="w-full p-2 border border-blue-200 bg-blue-50/10 rounded text-sm font-medium text-gray-700" placeholder="City / Parish" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                                    <input value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm font-medium text-gray-700" placeholder="corporate@company.com" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pay Cycle Info (Image 4 Bottom) */}
                                    <div className="bg-blue-50/50 p-4 border border-blue-100 rounded">
                                        <h4 className="text-[9px] font-black text-blue-900 uppercase tracking-widest mb-3">Pay Cycle Parameters</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[8px] font-bold text-gray-500 uppercase">Pay Cycle</label>
                                                <select value={formData.payCycle} onChange={(e) => handleInputChange('payCycle', e.target.value)} className="p-1.5 border border-gray-300 rounded text-xs bg-white">
                                                    <option>Weekly</option>
                                                    <option>Bi-Weekly</option>
                                                    <option>Monthly</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[8px] font-bold text-gray-500 uppercase">Pay Day</label>
                                                <input value={formData.payDay} onChange={(e) => handleInputChange('payDay', e.target.value)} className="p-1.5 border border-gray-300 rounded text-xs" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[8px] font-bold text-gray-500 uppercase">Current Period</label>
                                                <input type="number" value={formData.currentPeriod} onChange={(e) => handleInputChange('currentPeriod', e.target.value)} className="p-1.5 border border-gray-300 rounded text-xs text-center font-bold" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[8px] font-bold text-gray-500 uppercase">No. of Periods</label>
                                                <input type="number" value={formData.noOfPeriods} onChange={(e) => handleInputChange('noOfPeriods', e.target.value)} className="p-1.5 border border-gray-300 rounded text-xs text-center font-bold bg-gray-50" />
                                            </div>

                                            {/* New Fields from Screenshot */}
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[8px] font-bold text-gray-500 uppercase">Current P/E</label>
                                                <input value={formData.currentPe} onChange={(e) => handleInputChange('currentPe', e.target.value)} className="p-1.5 border border-gray-300 rounded text-xs" placeholder="DD/MM/YYYY" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[8px] font-bold text-gray-500 uppercase">Current NIS/E</label>
                                                <input value={formData.currentNisE} onChange={(e) => handleInputChange('currentNisE', e.target.value)} className="p-1.5 border border-gray-300 rounded text-xs" placeholder="DD/MM/YYYY" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[8px] font-bold text-gray-500 uppercase">Year</label>
                                                <input type="number" value={formData.payYear} onChange={(e) => handleInputChange('payYear', e.target.value)} className="p-1.5 border border-gray-300 rounded text-xs font-bold" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[8px] font-bold text-gray-500 uppercase">Tax Credit Type</label>
                                                <select value={formData.taxCreditType} onChange={(e) => handleInputChange('taxCreditType', e.target.value)} className="p-1.5 border border-gray-300 rounded text-xs bg-white">
                                                    <option value="Annual">Annual</option>
                                                    <option value="Period">Period</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[8px] font-bold text-gray-500 uppercase">Annual Tax Cr.</label>
                                                <input value={formData.annualTaxCr} onChange={(e) => handleInputChange('annualTaxCr', e.target.value)} className="p-1.5 border border-gray-300 rounded text-xs text-right tabular-nums" />
                                            </div>
                                        </div>
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
                                                    <input type="number" step="0.001" value={formData.nisRateEE} onChange={(e) => handleInputChange('nisRateEE', e.target.value)} className="p-2 border border-gray-200 rounded text-xs font-bold text-right tabular-nums bg-white shadow-inner" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase">NIS (ER)</label>
                                                    <input type="number" step="0.001" value={formData.nisRateER} onChange={(e) => handleInputChange('nisRateER', e.target.value)} className="p-2 border border-gray-200 rounded text-xs font-bold text-right tabular-nums bg-white shadow-inner" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase">NHT (EE)</label>
                                                    <input type="number" step="0.001" value={formData.nhtRateEE} onChange={(e) => handleInputChange('nhtRateEE', e.target.value)} className="p-2 border border-gray-200 rounded text-xs font-bold text-right tabular-nums" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase">NHT (ER)</label>
                                                    <input type="number" step="0.001" value={formData.nhtRateER} onChange={(e) => handleInputChange('nhtRateER', e.target.value)} className="p-2 border border-gray-200 rounded text-xs font-bold text-right tabular-nums" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase text-blue-800 italic">Education EE</label>
                                                    <input type="number" step="0.001" value={formData.educationTaxEE} onChange={(e) => handleInputChange('educationTaxEE', e.target.value)} className="p-2 border border-blue-100 rounded text-xs font-bold text-right tabular-nums bg-blue-50/20" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase text-blue-800 italic">Education ER</label>
                                                    <input type="number" step="0.001" value={formData.educationTaxER} onChange={(e) => handleInputChange('educationTaxER', e.target.value)} className="p-2 border border-blue-100 rounded text-xs font-bold text-right tabular-nums bg-blue-50/20" />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1 pt-2">
                                                <label className="text-[9px] font-black text-rose-800 uppercase tracking-widest">HEART Trust (ER Only)</label>
                                                <input type="number" step="0.001" value={formData.heartRateER} onChange={(e) => handleInputChange('heartRateER', e.target.value)} className="p-2 border border-rose-200 rounded text-xs font-black text-right tabular-nums bg-rose-50/30" />
                                                <p className="text-[8px] text-rose-400 font-bold uppercase mt-1 italic">Note: Employer only statutory contribution</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-bold text-[10px] text-gray-400 border-b border-gray-100 pb-2 uppercase tracking-widest">Thresholds & PAYE</h4>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-[9px] font-bold text-gray-500 uppercase">Annual Tax Free Threshold</label>
                                                <input type="number" value={formData.incomeTaxThreshold} onChange={(e) => handleInputChange('incomeTaxThreshold', e.target.value)} className="p-3 border border-gray-300 rounded bg-gray-50 font-bold text-blue-900 text-lg text-right shadow-inner" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase italic">Base PAYE (%)</label>
                                                    <input type="number" step="0.001" value={formData.incomeTaxRate} onChange={(e) => handleInputChange('incomeTaxRate', e.target.value)} className="p-2 border border-gray-200 rounded text-xs font-bold text-right tabular-nums" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase italic">High PAYE (%)</label>
                                                    <input type="number" step="0.001" value={formData.highIncomeTaxRate} onChange={(e) => handleInputChange('highIncomeTaxRate', e.target.value)} className="p-2 border border-gray-200 rounded text-xs font-bold text-right tabular-nums" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[9px] font-bold text-gray-500 uppercase">NIS Annual Ceiling</label>
                                                <input type="number" value={formData.nisAnnualCeiling} onChange={(e) => handleInputChange('nisAnnualCeiling', e.target.value)} className="p-2 border border-gray-200 rounded text-xs font-bold text-right tabular-nums bg-gray-50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Payroll' && (
                                <div className="max-w-2xl flex flex-col gap-6">
                                    <div className="space-y-6">
                                        <section className="space-y-4">
                                            <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                                                <Building2 size={12} /> GL Account Mapping
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase">Period Clearing GL</label>
                                                    <input value={formData.periodClearingGL} onChange={(e) => handleInputChange('periodClearingGL', e.target.value)} className="p-2 border border-gray-300 rounded text-xs font-mono shadow-inner" placeholder="XXX-XXX-XXXX" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase">Period Suspense GL</label>
                                                    <input value={formData.periodSuspenseGL} onChange={(e) => handleInputChange('periodSuspenseGL', e.target.value)} className="p-2 border border-gray-300 rounded text-xs font-mono shadow-inner" placeholder="XXX-XXX-XXXX" />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-4">
                                            <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                                                <UserCheck size={12} /> Employment Policies
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase">Probation Period</label>
                                                    <div className="flex gap-2">
                                                        <input type="number" value={formData.probationaryPeriod} onChange={(e) => handleInputChange('probationaryPeriod', e.target.value)} className="w-20 p-2 border border-gray-300 rounded text-xs font-bold text-center" />
                                                        <select value={formData.probationaryUnit} onChange={(e) => handleInputChange('probationaryUnit', e.target.value)} className="flex-1 p-2 border border-gray-300 rounded text-xs bg-white">
                                                            <option>Month(s)</option>
                                                            <option>Week(s)</option>
                                                            <option>Day(s)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-500 uppercase">Pension Taxable Ceiling (%)</label>
                                                    <input type="number" step="0.1" value={formData.pensionPctTaxableCeiling} onChange={(e) => handleInputChange('pensionPctTaxableCeiling', e.target.value)} className="p-2 border border-gray-300 rounded text-xs font-bold text-right tabular-nums shadow-inner" />
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'System' && (
                                <div className="max-w-4xl flex flex-col gap-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Left Column */}
                                        <div className="space-y-6">
                                            {/* GL Export Section */}
                                            <section className="space-y-4">
                                                <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                                                    <Database size={12} /> GL Export
                                                </h4>
                                                <div className="space-y-3 bg-gray-50/50 p-4 rounded border border-gray-200">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[9px] font-bold text-gray-600 uppercase">GL Export Type</label>
                                                        <select value={formData.glExportType} onChange={(e) => handleInputChange('glExportType', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-[10px] bg-white">
                                                            <option>Generic CSV</option>
                                                            <option>QuickBooks</option>
                                                            <option>Sage 50</option>
                                                            <option>Microsoft Dynamics</option>
                                                            <option>ACCPAC</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[9px] font-bold text-gray-600 uppercase">Export Path</label>
                                                        <div className="flex gap-2">
                                                            <input value={formData.glExportPath} onChange={(e) => handleInputChange('glExportPath', e.target.value)} className="flex-1 p-2 border border-gray-300 rounded text-[10px] font-mono" />
                                                            <button className="p-2 border border-gray-300 rounded hover:bg-white text-gray-400 hover:text-blue-900 transition-colors">
                                                                <Folder size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            {/* Tax Free Income Section */}
                                            <section className="space-y-4">
                                                <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                                                    <Landmark size={12} /> Tax Preferences
                                                </h4>
                                                <div className="bg-gray-50/50 p-4 rounded border border-gray-200 space-y-4">
                                                    <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                                        <input type="checkbox" checked={formData.useDualTaxFree} onChange={(e) => handleInputChange('useDualTaxFree', e.target.checked)} className="w-3.5 h-3.5 rounded text-blue-900 focus:ring-blue-900" />
                                                        <label className="text-[10px] font-bold text-gray-700 uppercase">Use dual tax free income</label>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <label className={`text-[9px] font-bold uppercase ${formData.useDualTaxFree ? 'text-gray-600' : 'text-gray-400'}`}>Primary Tax Free</label>
                                                            <input type="number" disabled={!formData.useDualTaxFree} value={formData.primaryTaxFree} onChange={(e) => handleInputChange('primaryTaxFree', e.target.value)} className="p-2 border border-gray-300 rounded text-right tabular-nums text-xs font-bold disabled:bg-gray-100" />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <label className={`text-[9px] font-bold uppercase ${formData.useDualTaxFree ? 'text-gray-600' : 'text-gray-400'}`}>Second. Tax Free</label>
                                                            <input type="number" disabled={!formData.useDualTaxFree} value={formData.secondTaxFree} onChange={(e) => handleInputChange('secondTaxFree', e.target.value)} className="p-2 border border-gray-300 rounded text-right tabular-nums text-xs font-bold disabled:bg-gray-100" />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 pt-2">
                                                        <input type="checkbox" checked={formData.graduatedIncomeTax} onChange={(e) => handleInputChange('graduatedIncomeTax', e.target.checked)} className="w-3.5 h-3.5 rounded text-blue-900 focus:ring-blue-900" />
                                                        <label className="text-[10px] font-bold text-gray-700 uppercase">Graduated Income Tax</label>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-6">
                                            {/* Logo Section */}
                                            <section className="space-y-4">
                                                <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                                                    <Globe size={12} /> Branding
                                                </h4>
                                                <div className="bg-gray-50/50 p-4 rounded border border-gray-200 flex gap-4 items-start">
                                                    {/* Hidden file input */}
                                                    <input
                                                        ref={logoInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleLogoUpload}
                                                    />
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => logoInputRef.current?.click()}
                                                            disabled={logoUploading}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-[10px] font-bold uppercase text-gray-600 transition-colors shadow-sm disabled:opacity-50"
                                                        >
                                                            {logoUploading ? <Loader2 size={12} className="animate-spin" /> : <Folder size={12} />}
                                                            {logoUploading ? 'Uploading...' : 'Add Picture'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleLogoDelete(formData.logoPublicId)}
                                                            disabled={!formData.logo || logoUploading}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-rose-50 text-[10px] font-bold uppercase text-rose-600 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-40"
                                                        >
                                                            <X size={12} /> Delete Picture
                                                        </button>
                                                    </div>
                                                    <div className="flex-1 h-32 border-2 border-dashed border-gray-300 rounded bg-white flex items-center justify-center relative overflow-hidden">
                                                        {logoUploading ? (
                                                            <div className="text-center p-4">
                                                                <Loader2 size={24} className="animate-spin text-blue-400 mx-auto mb-1" />
                                                                <span className="text-[9px] text-gray-400 uppercase">Uploading...</span>
                                                            </div>
                                                        ) : formData.logo ? (
                                                            <img src={formData.logo} alt="Company Logo" className="object-contain max-h-full max-w-full p-2" />
                                                        ) : (
                                                            <div className="text-center p-4">
                                                                <span className="text-4xl font-black text-gray-100 block mb-1">LOGO</span>
                                                                <span className="text-[9px] text-gray-400 uppercase">No Image Loaded</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </section>

                                            {/* Integration / S01 Section */}
                                            <section className="space-y-4">
                                                <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                                                    <Settings size={12} /> S01 Export
                                                </h4>

                                                <div className="space-y-2">
                                                    <div className="flex flex-col gap-1 p-3 bg-gray-50/50 border border-gray-200 rounded">
                                                        <label className="text-[9px] font-bold text-gray-600 uppercase">S01 Export Root Path</label>
                                                        <div className="flex gap-2">
                                                            <input value={formData.s01ExportPath} onChange={(e) => handleInputChange('s01ExportPath', e.target.value)} className="flex-1 p-2 border border-gray-300 rounded text-[10px] font-bold tabular-nums" />
                                                            <button className="p-2 border border-gray-300 rounded hover:bg-white text-gray-400 hover:text-blue-900 transition-colors">
                                                                <Folder size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="space-y-4">
                                                <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-2 uppercase text-[10px] tracking-widest">Automation & Delivery</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between p-3 bg-blue-50/20 border border-blue-100 rounded">
                                                        <div className="flex items-center gap-3">
                                                            <input type="checkbox" checked={formData.autoEmailSlips} onChange={(e) => handleInputChange('autoEmailSlips', e.target.checked)} className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900" />
                                                            <div>
                                                                <p className="text-[10px] font-bold text-gray-700 uppercase leading-none">Auto-Email Payslips</p>
                                                                <p className="text-[8px] text-gray-400 font-medium mt-1">Dispatch slips after payroll finalization.</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-1 p-3 bg-gray-50/50 border border-gray-200 rounded">
                                                        <label className="text-[9px] font-bold text-gray-600 uppercase">Encryption Logic</label>
                                                        <select value={formData.payslipPasswordType} onChange={(e) => handleInputChange('payslipPasswordType', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-[10px] font-bold bg-white">
                                                            <option value="TRN">Employee TRN</option>
                                                            <option value="DOB">Date of Birth (YYYYMMDD)</option>
                                                            <option value="EMP_ID">System Employee ID</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </section>
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
