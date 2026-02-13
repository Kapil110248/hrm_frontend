import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, FileText, UserMinus, AlertTriangle, Calculator, FileWarning, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const Redundancy = () => {
    const navigate = useNavigate();
    const [empId, setEmpId] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [terminationType, setTerminationType] = useState('Standard Redundancy (Legal)');
    const [factors, setFactors] = useState({
        yearsOfService: true,
        noticePay: true,
        multiplier: true
    });
    const [settlement, setSettlement] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    // Dynamic Data State
    const [employees, setEmployees] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const companyStr = localStorage.getItem('selectedCompany');
                const company = companyStr ? JSON.parse(companyStr) : null;
                if (company) {
                    const res = await api.fetchEmployees(company.id);
                    if (res.success) {
                        setEmployees(res.data.map(e => ({
                            id: e.id,
                            employeeId: e.employeeId,
                            name: `${e.firstName} ${e.lastName}`,
                            dept: e.department?.name || e.department || 'General',
                            salary: parseFloat(e.baseSalary || 0),
                            joinDate: e.joinDate || new Date().toISOString(), // Fallback if missing
                            years: calculateYears(e.joinDate)
                        })));
                    }
                }
            } catch (err) {
                console.error("Failed to load employee directory:", err);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchEmployees();
    }, []);

    const calculateYears = (dateStr) => {
        if (!dateStr) return 0;
        const start = new Date(dateStr);
        const end = new Date();
        const diff = end - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    };

    const handleLoad = () => {
        if (!empId) return;

        // Search by Employee ID (Exact or approximate)
        const emp = employees.find(e =>
            (e.employeeId && e.employeeId.toUpperCase() === empId.toUpperCase()) ||
            (e.id === empId)
        );

        if (emp) {
            setSelectedEmployee(emp);
            setSettlement(null);
        } else {
            alert(`STATION ALERT: Employee ID "${empId}" not found in active master records.`);
        }
    };

    const handleGenerate = async () => {
        if (!selectedEmployee) return;

        try {
            setIsGenerating(true);

            // Call backend API to calculate redundancy
            const response = await api.calculateRedundancy({
                employeeId: selectedEmployee.id,
                terminationType,
                factors
            });

            if (response.success) {
                const data = response.data;
                setSettlement({
                    redundancy: data.redundancyPay,
                    notice: data.noticePay,
                    total: data.totalSettlement,
                    type: terminationType
                });
            } else {
                alert('Failed to calculate settlement. Please try again.');
            }
        } catch (err) {
            console.error('Settlement calculation error:', err);
            alert('Error calculating settlement. Please check console for details.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveSettlement = async () => {
        if (!selectedEmployee || !settlement) return;

        const confirm = window.confirm(
            `CONFIRM REDUNDANCY RECORD:\n\n` +
            `Employee: ${selectedEmployee.name}\n` +
            `Type: ${terminationType}\n` +
            `Total Settlement: $${settlement.total.toLocaleString()}\n\n` +
            `This will create a permanent redundancy record. Continue?`
        );

        if (!confirm) return;

        try {
            setIsSaving(true);
            const response = await api.createRedundancy({
                companyId: selectedCompany.id,
                employeeId: selectedEmployee.id,
                terminationType,
                redundancyPay: settlement.redundancy,
                noticePay: settlement.notice,
                totalSettlement: settlement.total,
                yearsOfService: selectedEmployee.years,
                reason: `${terminationType} - Settlement calculated and approved`,
                processedBy: activeUser.email || 'SYSTEM'
            });

            if (response.success) {
                alert('✓ REDUNDANCY RECORD SAVED SUCCESSFULLY\n\nRecord ID: ' + response.data.id);
                // Reset form
                setSelectedEmployee(null);
                setSettlement(null);
                setEmpId('');
            } else {
                alert('Failed to save redundancy record. Please try again.');
            }
        } catch (err) {
            console.error('Save redundancy error:', err);
            alert('Error saving redundancy record. Please check console for details.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            <div className="bg-fire-red bg-[#8B0000] text-white px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <ShieldAlert size={18} />
                    <span className="font-black italic uppercase tracking-widest text-[10px] sm:text-[11px] text-center sm:text-left">Termination & Redundancy Settlement Station</span>
                </div>
                <div className="flex items-center gap-4">
                    {isLoadingData && <span className="flex items-center gap-1 text-[9px] uppercase font-bold animate-pulse"><Loader2 size={10} className="animate-spin" /> Syncing Master Records...</span>}
                    <div className="text-[8px] sm:text-[9px] font-black border border-white/30 px-2 py-1 italic uppercase whitespace-nowrap">Highly Restricted Access</div>
                </div>
            </div>

            <div className="flex-1 p-3 sm:p-10 flex flex-col items-center overflow-y-auto">
                <div className="w-full max-w-5xl bg-white border-2 sm:border-4 border-gray-400 shadow-2xl p-4 sm:p-10 flex flex-col lg:grid lg:grid-cols-[1fr_350px] gap-8 sm:gap-12">
                    <div>
                        <div className="flex items-center gap-6 mb-10 pb-6 border-b-4 border-red-500">
                            <div className="p-4 bg-red-100 rounded-full text-red-600">
                                <UserMinus size={48} />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-black text-gray-900 italic uppercase leading-none">Employee Redundancy</h1>
                                <p className="text-red-700 font-bold uppercase tracking-widest text-xs mt-2 italic">Legal Settlement & Final Pay Calculation</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-10">
                            <div className="space-y-4">
                                <label className="font-black text-gray-500 uppercase text-[9px]">Select Target Account</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="ENTER EMPLOYEE ID..."
                                        className="flex-1 p-3 border-2 border-gray-300 font-black italic bg-gray-50 focus:border-red-500 outline-none uppercase"
                                        value={empId}
                                        onChange={(e) => setEmpId(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleLoad()}
                                    />
                                    <button
                                        onClick={handleLoad}
                                        disabled={isLoadingData}
                                        className="bg-red-600 text-white px-4 py-3 font-bold hover:bg-black transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >LOAD</button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="font-black text-gray-500 uppercase text-[9px]">Type of Termination</label>
                                <select
                                    className="w-full p-3 border-2 border-gray-300 font-black italic bg-gray-50 focus:border-red-500 outline-none cursor-pointer"
                                    value={terminationType}
                                    onChange={(e) => setTerminationType(e.target.value)}
                                >
                                    <option>Standard Redundancy (Legal)</option>
                                    <option>Voluntary Resignation</option>
                                    <option>Termination for Cause</option>
                                    <option>Retirement Settlement</option>
                                </select>
                            </div>
                        </div>

                        {!selectedEmployee ? (
                            <div className="bg-gray-100 p-4 sm:p-8 border-2 border-dashed border-gray-400 text-center flex flex-col items-center gap-4">
                                <FileWarning size={48} className="text-gray-300" />
                                <p className="font-black italic text-gray-400 text-lg uppercase">Account Profile Not Loaded</p>
                                <p className="max-w-md text-[10px] font-bold text-gray-500 uppercase tracking-tighter opacity-70">
                                    Please search for an employee above to calculate statutory redundancy payments, notice pay, and holiday pay entitlements.
                                </p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-red-900 text-white p-6 shadow-xl border-l-8 border-black flex flex-col sm:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white"><UserMinus size={32} /></div>
                                        <div>
                                            <h2 className="text-2xl font-black italic uppercase leading-none">{selectedEmployee.name}</h2>
                                            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">ID: {selectedEmployee.employeeId} | {selectedEmployee.dept}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase opacity-60">Master Record Tenure</p>
                                        <p className="text-2xl font-black italic">{selectedEmployee.years} YEARS <span className="text-xs opacity-50">OF SERVICE</span></p>
                                    </div>
                                </div>

                                {settlement && (
                                    <div className="mt-8 border-4 border-gray-900 shadow-[10px_10px_0_rgba(0,0,0,0.1)] overflow-hidden">
                                        <div className="bg-gray-900 text-white p-3 font-black uppercase italic text-[11px] flex justify-between">
                                            <span>Calculated Settlement Breakdown</span>
                                            <span className="text-green-400">STATUS: VERIFIED</span>
                                        </div>
                                        <div className="p-6 space-y-4 bg-gray-50">
                                            <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
                                                <span className="font-bold text-gray-500 uppercase">Statutory Redundancy</span>
                                                <span className="font-black text-gray-900">${settlement.redundancy.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
                                                <span className="font-bold text-gray-500 uppercase">Notice Pay (1 Month)</span>
                                                <span className="font-black text-gray-900">${settlement.notice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm pt-4">
                                                <span className="font-black text-red-700 uppercase italic">Final Gross Settlement</span>
                                                <span className="text-3xl font-black text-red-700 italic">${settlement.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#EBE9D8] border-2 border-gray-500 p-6 flex flex-col gap-4 shadow-inner">
                            <h3 className="font-black italic text-blue-900 border-b border-gray-400 pb-2 uppercase tracking-widest text-[11px] flex items-center gap-2">
                                <Calculator size={16} /> Settlement Factors
                            </h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 cursor-pointer"
                                        checked={factors.yearsOfService}
                                        onChange={(e) => setFactors(prev => ({ ...prev, yearsOfService: e.target.checked }))}
                                    />
                                    <span className="font-bold text-gray-700 group-hover:text-red-600 uppercase text-[10px] italic">Include Years of Service (YTD)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 cursor-pointer"
                                        checked={factors.noticePay}
                                        onChange={(e) => setFactors(prev => ({ ...prev, noticePay: e.target.checked }))}
                                    />
                                    <span className="font-bold text-gray-700 group-hover:text-red-600 uppercase text-[10px] italic">Notice Pay Entitlement</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 cursor-pointer"
                                        checked={factors.multiplier}
                                        onChange={(e) => setFactors(prev => ({ ...prev, multiplier: e.target.checked }))}
                                    />
                                    <span className="font-bold text-gray-700 group-hover:text-red-600 uppercase text-[10px] italic">Statutory Redundancy Multiplier</span>
                                </label>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-400">
                                <p className="text-[9px] font-bold text-gray-400 uppercase italic leading-tight">
                                    Statutory redundancy in Jamaica is typically 2 weeks' pay for each year of service (up to 10 years).
                                </p>
                            </div>
                        </div>

                        <div className="bg-red-50 border-2 border-red-200 p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-red-700 font-bold uppercase italic text-[10px]">
                                <AlertTriangle size={14} /> Critical Warning
                            </div>
                            <p className="text-[9px] font-bold text-red-900 tracking-tighter opacity-70 uppercase leading-none">
                                Termination records cannot be reversed once posted. Cross-check with HR legal team.
                            </p>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!selectedEmployee || isGenerating}
                            className={`w-full p-5 font-black italic uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 active:translate-y-1 ${!selectedEmployee || isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-red-900'
                                }`}
                        >
                            {isGenerating ? 'CALCULATING LEGAL SETTLEMENT...' : 'GENERATE SETTLEMENT'}
                        </button>

                        {settlement && (
                            <button
                                onClick={handleSaveSettlement}
                                disabled={isSaving}
                                className={`w-full p-5 font-black italic uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 active:translate-y-1 ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700 text-white hover:bg-green-800'
                                    }`}
                            >
                                {isSaving ? 'SAVING RECORD...' : '✓ SAVE SETTLEMENT RECORD'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white border-t border-gray-400 p-3 sm:p-4 flex flex-col sm:flex-row justify-between px-4 sm:px-10 items-center gap-4 no-print">
                <button className="flex items-center gap-2 font-black italic text-gray-500 hover:text-red-600 uppercase text-[10px] sm:text-xs">
                    <FileText size={18} /> VIEW STATUTORY GUIDELINES
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="w-full sm:w-auto bg-gray-100 border-2 border-gray-400 text-gray-600 px-8 sm:px-12 py-2 sm:py-3 font-black italic hover:bg-gray-200 shadow-md uppercase transition-all"
                >
                    EXIT MODULE
                </button>
            </div>
        </div>
    );
};

export default Redundancy;
