import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save as SaveIcon, Edit3, RotateCcw as RevertIcon, LogOut as ExitIcon, Folder } from 'lucide-react';

const clone = (v) => (v && typeof v === 'object' ? (Array.isArray(v) ? v.map(clone) : { ...v, ...Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clone(x)])) }) : v);

const SettingsContext = createContext(null);

const Field = ({ label, children, className = '' }) => (
    <div className={`flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-1 sm:gap-2 sm:items-center ${className}`}>
        <label className="text-[10px] font-bold text-gray-700 uppercase">{label}</label>
        {children}
    </div>
);

const Input = ({ name, list = 'general', type = 'text' }) => {
    const { general, preferences, updateGeneral, updatePreferences, isEditing } = useContext(SettingsContext);
    const v = list === 'general' ? general[name] : preferences[name];
    const set = list === 'general' ? updateGeneral : updatePreferences;
    return (
        <input
            type={type}
            value={v ?? ''}
            onChange={e => set(name, e.target.value)}
            readOnly={!isEditing}
            className="p-1 border border-gray-400 bg-white text-blue-800 font-bold shadow-inner text-[11px]"
        />
    );
};

const CompanySettingsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [isEditing, setIsEditing] = useState(false);
    const savedRef = useRef(null);

    const [general, setGeneral] = useState({
        companyNo: '11',
        name: 'ISLAND HR SOLUTIONS LIMITED',
        description: 'ISLAND HR SOLUTIONS LIMITED',
        tradeName: '1799376.00',
        nisReference: '7741929',
        payeReference: '',
        trn: '002095220',
        frequencyDesc: '',
        addressLine1: 'Bioprist Knowledge Park',
        mailingAddress1: '',
        addressLine2: '4th Floor, 1A Pomento Way',
        mailingAddress2: '',
        phoneNo: '6207645',
        emailAddress: '',
        payCycle: 'Weekly',
        payDay: 'Friday',
        currentPeriod: '2',
        noOfPeriods: '52',
        currentPE: '09/01/2026',
        currentNISE: '05/01/2026',
        year: '2026',
        taxCreditType: 'Annual',
        annualTaxCr: '1,799,376.00',
        prorateAnnualCredit: false
    });

    const [preferences, setPreferences] = useState({
        country: 'Jamaica',
        typeOfPayroll: 'Employee',
        periodClearingGL: '',
        periodSuspenseGL: '',
        useGLFormatting: false,
        deductionsInExcessOfNetPay: 'Auto-Loan',
        defaultRentalTransCode: 'FN001',
        rentalAddonPct: '0.00',
        defaultWageType: 'Hourly',
        autoCalculateBasicPay: true,
        defaultRegularHours: '40.00',
        defaultPayDisbursementType: 'Electronic Transfer',
        currency: 'JMD',
        nisAnnualCeiling: '5,000,000.00',
        payAdviceFormat: '0',
        defaultBackupPath: '',
        suppressDisplayOfRental: false,
        probationaryPeriod: '3',
        probationaryUnit: 'Month(s)',
        autoUpdateStatusAfterProbation: false,
        pensionPctTaxableCeiling: '20.00',
        integrateHRMForWages: true
    });

    const [taxScheme, setTaxScheme] = useState('Employee');
    const [taxRates, setTaxRates] = useState([
        { taxId: 'EDTAX', eeRate: '2.250', erRate: '3.500', femStart: '18', femEnd: '60', maleStart: '18', maleEnd: '65' },
        { taxId: 'HEART', eeRate: '0.000', erRate: '3.000', femStart: '0', femEnd: '0', maleStart: '0', maleEnd: '0' },
        { taxId: 'ITAX', eeRate: '25.000', erRate: '0.000', femStart: '1', femEnd: '200', maleStart: '1', maleEnd: '200' },
        { taxId: 'NHT', eeRate: '2.000', erRate: '3.000', femStart: '18', femEnd: '60', maleStart: '18', maleEnd: '65' },
        { taxId: 'NIS', eeRate: '3.000', erRate: '3.000', femStart: '18', femEnd: '60', maleStart: '18', maleEnd: '65' }
    ]);

    const [ytd, setYtd] = useState({
        taxableGross: '3,189,390.67',
        nonTaxableGross: '0.00',
        regularPay: '1,913,580.01',
        overtimePay: '0.00',
        totalDed: '33,979.92',
        incomeTaxEE: '540,724.78',
        incomeTaxER: '0.0000',
        heartEE: '0.0000',
        heartER: '95,681.74',
        nisEE: '64,510.11',
        nisER: '64,510.11',
        nhtEE: '63,787.80',
        nhtER: '95,681.74',
        educationTaxEE: '69,876.43',
        educationTaxER: '108,696.65',
        pensionEE: '19,261.20',
        pensionER: '0.00'
    });

    const buildSnapshot = () => ({
        general: clone(general),
        preferences: clone(preferences),
        taxScheme,
        taxRates: clone(taxRates),
        ytd: clone(ytd)
    });

    useEffect(() => {
        const loadSettings = () => {
            try {
                const saved = localStorage.getItem('company_settings_v1');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    savedRef.current = parsed;
                    setGeneral(parsed.general);
                    setPreferences(parsed.preferences);
                    setTaxScheme(parsed.taxScheme);
                    setTaxRates(parsed.taxRates);
                    setYtd(parsed.ytd);
                } else {
                    savedRef.current = buildSnapshot();
                }
            } catch (e) {
                console.error("Failed to load settings", e);
                savedRef.current = buildSnapshot();
            }
        };

        if (savedRef.current === null) {
            loadSettings();
        }
    }, []);

    const updateGeneral = (field, value) => setGeneral(prev => ({ ...prev, [field]: value }));
    const updatePreferences = (field, value) => setPreferences(prev => ({ ...prev, [field]: value }));
    const updateYtd = (field, value) => setYtd(prev => ({ ...prev, [field]: value }));

    const handleSave = () => {
        const snapshot = buildSnapshot();
        savedRef.current = snapshot;
        // Persist to localStorage to ensure data survives reload
        try {
            localStorage.setItem('company_settings_v1', JSON.stringify(snapshot));
            // Also update main app settings if needed
            alert('Settings saved successfully!');
        } catch (e) {
            console.error('Save failed', e);
        }
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleRevert = () => {
        const s = savedRef.current;
        if (s) {
            setGeneral(clone(s.general));
            setPreferences(clone(s.preferences));
            setTaxScheme(s.taxScheme);
            setTaxRates(clone(s.taxRates));
            setYtd(clone(s.ytd));
            alert('Changes reverted to last save.');
        }
        setIsEditing(false);
    };

    const handleExit = () => {
        // Navigate to dashboard instead of back to ensure we don't get stuck
        navigate('/');
    };



    return (
        <SettingsContext.Provider value={{ general, preferences, updateGeneral, updatePreferences, isEditing }}>
            <div className="flex flex-col h-full w-full bg-[#F5F5F7] font-sans text-xs">
                <div className="border-b border-gray-300 px-6 py-4 bg-white">
                    <span className="font-bold text-gray-800 text-sm uppercase tracking-tight">Company Settings</span>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white px-2">
                    {[
                        { id: 'general', label: 'General Info' },
                        { id: 'preferences', label: 'Configuration' },
                        { id: 'tax', label: 'Taxation' },
                        { id: 'ytd', label: 'YTD Totals' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-4 py-3 font-bold text-[10px] uppercase tracking-wider transition-colors ${activeTab === t.id ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-auto p-6 min-w-0 pb-20 sm:pb-4">
                    {activeTab === 'general' && (
                        <div className="space-y-8 max-w-4xl">
                            <section>
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Registration Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                                    <Field label="Company No."><Input name="companyNo" list="general" /></Field>
                                    <Field label="Name"><Input name="name" list="general" /></Field>
                                    <Field label="Description"><Input name="description" list="general" /></Field>
                                    <Field label="Trade Name"><Input name="tradeName" list="general" /></Field>
                                    <Field label="NIS Ref"><Input name="nisReference" list="general" /></Field>
                                    <Field label="PAYE Ref"><Input name="payeReference" list="general" /></Field>
                                    <Field label="TRN"><Input name="trn" list="general" /></Field>
                                    <Field label="Freq Code"><Input name="frequencyDesc" list="general" /></Field>
                                </div>
                            </section>
                            <section>
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Communication</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                                    <Field label="Address 1"><Input name="addressLine1" list="general" /></Field>
                                    <Field label="Mailing 1"><Input name="mailingAddress1" list="general" /></Field>
                                    <Field label="Address 2"><Input name="addressLine2" list="general" /></Field>
                                    <Field label="Mailing 2"><Input name="mailingAddress2" list="general" /></Field>
                                    <Field label="Phone"><Input name="phoneNo" list="general" /></Field>
                                    <Field label="Email"><Input name="emailAddress" list="general" /></Field>
                                </div>
                            </section>
                            <section>
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Cycle Parameters</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                                    <Field label="Pay Cycle">
                                        <select
                                            value={general.payCycle}
                                            onChange={e => {
                                                const v = e.target.value;
                                                const suggested = v === 'Weekly' ? '52' : v === 'Bi-Weekly' ? '26' : '12';
                                                setGeneral(prev => ({ ...prev, payCycle: v, noOfPeriods: suggested }));
                                            }}
                                            disabled={!isEditing}
                                            className="p-1 border border-gray-300 rounded bg-white font-medium text-[11px]"
                                        >
                                            <option>Weekly</option>
                                            <option>Bi-Weekly</option>
                                            <option>Monthly</option>
                                        </select>
                                    </Field>
                                    <Field label="Pay Day">
                                        <select value={general.payDay} onChange={e => updateGeneral('payDay', e.target.value)} disabled={!isEditing} className="p-1 border border-gray-300 rounded bg-white font-medium text-[11px]">
                                            <option>Friday</option>
                                            <option>Monday</option>
                                            <option>Last Day</option>
                                        </select>
                                    </Field>
                                    <Field label="Period #"><input type="number" value={general.currentPeriod} onChange={e => updateGeneral('currentPeriod', e.target.value)} readOnly={!isEditing} className="p-1 border border-gray-300 rounded bg-white font-medium w-20" /></Field>
                                    <Field label="Max Periods">
                                        <div className="flex flex-col gap-0.5">
                                            <input type="number" value={general.noOfPeriods} onChange={e => updateGeneral('noOfPeriods', e.target.value)} readOnly={!isEditing} className="p-1 border border-gray-300 rounded bg-white font-medium w-20" />
                                        </div>
                                    </Field>
                                    <Field label="Current P/E"><Input name="currentPE" list="general" /></Field>
                                    <Field label="NIS Date"><Input name="currentNISE" list="general" /></Field>
                                    <Field label="Year"><input type="number" value={general.year} onChange={e => updateGeneral('year', e.target.value)} readOnly={!isEditing} className="p-1 border border-gray-300 rounded bg-white font-medium w-20" /></Field>
                                    <Field label="Credit Type">
                                        <select value={general.taxCreditType} onChange={e => updateGeneral('taxCreditType', e.target.value)} disabled={!isEditing} className="p-1 border border-gray-300 rounded bg-white font-medium text-[11px]">
                                            <option>Annual</option>
                                            <option>Period</option>
                                        </select>
                                    </Field>
                                    <Field label="Annual Cr."><Input name="annualTaxCr" list="general" /></Field>
                                    <Field label="Prorate Credit">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={general.prorateAnnualCredit}
                                                onChange={e => updateGeneral('prorateAnnualCredit', e.target.checked)}
                                                disabled={!isEditing}
                                                className="w-4 h-4 border border-gray-300 rounded"
                                            />
                                            <span className="text-[9px] text-gray-400 uppercase font-bold">Prorate for mid-year joiners</span>
                                        </div>
                                    </Field>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="space-y-6 max-w-4xl">
                            <section className="bg-white border border-gray-200 rounded p-6 shadow-sm">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Technical Policy</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    <Field label="Jurisdiction">
                                        <select value={preferences.country} onChange={e => updatePreferences('country', e.target.value)} disabled={!isEditing} className="p-1 border border-gray-300 rounded bg-white font-medium text-[11px]">
                                            <option>Jamaica</option>
                                            <option>Other</option>
                                        </select>
                                    </Field>
                                    <Field label="Payroll Type">
                                        <select value={preferences.typeOfPayroll} onChange={e => updatePreferences('typeOfPayroll', e.target.value)} disabled={!isEditing} className="p-1 border border-gray-300 rounded bg-white font-medium text-[11px]">
                                            <option>Employee</option>
                                            <option>Contractor</option>
                                        </select>
                                    </Field>
                                    <Field label="Exceed Net Pay">
                                        <select value={preferences.deductionsInExcessOfNetPay} onChange={e => updatePreferences('deductionsInExcessOfNetPay', e.target.value)} disabled={!isEditing} className="p-1 border border-gray-300 rounded bg-white font-medium text-[11px]">
                                            <option>Auto-Loan</option>
                                            <option>Carry Forward</option>
                                            <option>Stop</option>
                                        </select>
                                    </Field>
                                    <Field label="Wage Type">
                                        <select value={preferences.defaultWageType} onChange={e => updatePreferences('defaultWageType', e.target.value)} disabled={!isEditing} className="p-1 border border-gray-300 rounded bg-white font-medium text-[11px]">
                                            <option>Hourly</option>
                                            <option>Salary</option>
                                        </select>
                                    </Field>
                                    <Field label="Disbursement">
                                        <select value={preferences.defaultPayDisbursementType} onChange={e => updatePreferences('defaultPayDisbursementType', e.target.value)} disabled={!isEditing} className="p-1 border border-gray-300 rounded bg-white font-medium text-[11px]">
                                            <option>Electronic Transfer</option>
                                            <option>Cheque</option>
                                            <option>Cash</option>
                                        </select>
                                    </Field>
                                    <Field label="Currency">
                                        <select value={preferences.currency} onChange={e => updatePreferences('currency', e.target.value)} disabled={!isEditing} className="p-1 border border-gray-300 rounded bg-white font-medium text-[11px]">
                                            <option>JMD</option>
                                            <option>USD</option>
                                        </select>
                                    </Field>
                                    <Field label="NIS Ceiling"><Input name="nisAnnualCeiling" list="preferences" /></Field>
                                    <Field label="Auto Calc.">
                                        <input type="checkbox" checked={preferences.autoCalculateBasicPay} onChange={e => updatePreferences('autoCalculateBasicPay', e.target.checked)} disabled={!isEditing} className="w-4 h-4" />
                                    </Field>
                                    <Field label="HRM Integr.">
                                        <input type="checkbox" checked={preferences.integrateHRMForWages} onChange={e => updatePreferences('integrateHRMForWages', e.target.checked)} disabled={!isEditing} className="w-4 h-4" />
                                    </Field>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'tax' && (
                        <div className="space-y-6 max-w-5xl">
                            <div className="flex items-center gap-4 bg-white p-4 rounded border border-gray-200 shadow-sm">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Selected Scheme</span>
                                <select value={taxScheme} onChange={e => setTaxScheme(e.target.value)} disabled={!isEditing} className="p-1 border border-gray-300 rounded bg-white font-bold text-[11px] w-32">
                                    <option>Employee</option>
                                    <option>Employer</option>
                                </select>
                            </div>
                            <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
                                <table className="w-full border-collapse text-[10px]">
                                    <thead className="bg-gray-50 text-gray-400 border-b border-gray-200">
                                        <tr>
                                            <th className="p-3 text-left font-bold uppercase tracking-wider">Tax ID</th>
                                            <th className="p-3 text-right font-bold uppercase tracking-wider">EE %</th>
                                            <th className="p-3 text-right font-bold uppercase tracking-wider">ER %</th>
                                            <th className="p-3 text-right font-bold uppercase tracking-wider">F. Min</th>
                                            <th className="p-3 text-right font-bold uppercase tracking-wider">F. Max</th>
                                            <th className="p-3 text-right font-bold uppercase tracking-wider">M. Min</th>
                                            <th className="p-3 text-right font-bold uppercase tracking-wider">M. Max</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {taxRates.map((row) => (
                                            <tr key={row.taxId}>
                                                <td className="p-3 font-bold text-gray-700">{row.taxId}</td>
                                                <td className="p-3 text-right font-medium">{row.eeRate}</td>
                                                <td className="p-3 text-right font-medium">{row.erRate}</td>
                                                <td className="p-3 text-right font-medium">{row.femStart}</td>
                                                <td className="p-3 text-right font-medium">{row.femEnd}</td>
                                                <td className="p-3 text-right font-medium">{row.maleStart}</td>
                                                <td className="p-3 text-right font-medium">{row.maleEnd}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ytd' && (
                        <div className="space-y-6 max-w-4xl">
                            <section className="bg-white border border-gray-200 rounded p-6 shadow-sm">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Cumulative Pay</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                                    <Field label="Taxable Gross">
                                        <input type="text" value={ytd.taxableGross} onChange={e => updateYtd('taxableGross', e.target.value)} readOnly={!isEditing} className="p-1 border border-gray-300 rounded bg-gray-50 text-gray-800 font-bold text-[11px] w-full" />
                                    </Field>
                                    <Field label="Exempt Gross">
                                        <input type="text" value={ytd.nonTaxableGross} onChange={e => updateYtd('nonTaxableGross', e.target.value)} readOnly={!isEditing} className="p-1 border border-gray-300 rounded bg-gray-50 text-gray-800 font-bold text-[11px] w-full" />
                                    </Field>
                                    <Field label="Regular Pay">
                                        <input type="text" value={ytd.regularPay} onChange={e => updateYtd('regularPay', e.target.value)} readOnly={!isEditing} className="p-1 border border-gray-300 rounded bg-gray-50 text-gray-800 font-bold text-[11px] w-full" />
                                    </Field>
                                    <Field label="Overtime">
                                        <input type="text" value={ytd.overtimePay} onChange={e => updateYtd('overtimePay', e.target.value)} readOnly={!isEditing} className="p-1 border border-gray-300 rounded bg-gray-50 text-gray-800 font-bold text-[11px] w-full" />
                                    </Field>
                                    <Field label="Total Deduct.">
                                        <input type="text" value={ytd.totalDed} onChange={e => updateYtd('totalDed', e.target.value)} readOnly={!isEditing} className="p-1 border border-gray-300 rounded bg-gray-50 text-gray-800 font-bold text-[11px] w-full" />
                                    </Field>
                                </div>
                            </section>
                            <section className="bg-white border border-gray-200 rounded p-6 shadow-sm">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Statutory Totals</h3>
                                <div className="overflow-x-auto max-w-2xl border border-gray-200 rounded">
                                    <table className="w-full border-collapse text-[10px]">
                                        <thead className="bg-gray-50 text-gray-400 border-b border-gray-200">
                                            <tr>
                                                <th className="p-3 text-left font-bold uppercase tracking-wider"></th>
                                                <th className="p-3 text-right font-bold uppercase tracking-wider">Employee</th>
                                                <th className="p-3 text-right font-bold uppercase tracking-wider">Employer</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {['incomeTax', 'heart', 'nis', 'nht', 'educationTax', 'pension'].map((tax) => (
                                                <tr key={tax}>
                                                    <td className="p-3 font-bold text-gray-700 capitalize">{tax.replace(/([A-Z])/g, ' $1')}</td>
                                                    <td className="p-2">
                                                        <input type="text" value={ytd[`${tax}EE`]} onChange={e => updateYtd(`${tax}EE`, e.target.value)} readOnly={!isEditing} className="p-1 border border-gray-200 rounded bg-white text-gray-800 font-medium text-right w-full" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="text" value={ytd[`${tax}ER`]} onChange={e => updateYtd(`${tax}ER`, e.target.value)} readOnly={!isEditing} className="p-1 border border-gray-200 rounded bg-white text-gray-800 font-medium text-right w-full" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-100 border-t border-gray-200 px-6 py-4 flex gap-4 justify-start flex-wrap sticky bottom-0 z-20">
                    <button onClick={handleSave} className="px-6 py-2 bg-gray-800 text-white font-bold text-[10px] uppercase tracking-widest rounded hover:bg-gray-900 shadow-sm transition-colors">
                        Save Changes
                    </button>
                    <button onClick={handleEdit} className="px-6 py-2 bg-white text-gray-600 border border-gray-300 font-bold text-[10px] uppercase tracking-widest rounded hover:bg-gray-50 shadow-sm transition-colors">
                        Modify Fields
                    </button>
                    <button onClick={handleRevert} className="px-6 py-2 bg-white text-gray-600 border border-gray-300 font-bold text-[10px] uppercase tracking-widest rounded hover:bg-gray-50 shadow-sm transition-colors">
                        Revert
                    </button>
                    <button onClick={handleExit} className="px-6 py-2 bg-white text-gray-400 font-bold text-[10px] uppercase tracking-widest rounded hover:text-gray-600 transition-colors">
                        Exit
                    </button>
                </div>
            </div>
        </SettingsContext.Provider>
    );
};

export default CompanySettingsPage;
