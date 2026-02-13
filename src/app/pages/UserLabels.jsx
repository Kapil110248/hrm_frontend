import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Type, Save, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';

const UserLabels = () => {
    const navigate = useNavigate();
    const [selectedCompany, setSelectedCompany] = useState(null);

    // Default labels
    const defaultLabels = {
        trn: 'TRN',
        nis: 'NIS',
        nht: 'NHT',
        edTax: 'Education Tax',
        jwas: 'JWAS'
    };

    const [labels, setLabels] = useState(defaultLabels);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const storedCompany = localStorage.getItem('selectedCompany');
        if (storedCompany) {
            setSelectedCompany(JSON.parse(storedCompany));
        }
    }, []);

    useEffect(() => {
        if (selectedCompany?.id) {
            loadCompanySettings();
        }
    }, [selectedCompany]);

    const loadCompanySettings = async () => {
        setIsLoading(true);
        try {
            const res = await api.fetchCompanies();
            if (res.data) {
                const company = res.data.find(c => c.id === selectedCompany.id);
                if (company && company.settings && company.settings.labels) {
                    setLabels({ ...defaultLabels, ...company.settings.labels });
                }
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        localStorage.setItem('customLabels', JSON.stringify(labels));
    }, [labels]);

    const handleInputChange = (key, value) => {
        setLabels(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleReset = () => {
        if (window.confirm("Restore all field labels to system defaults?")) {
            setLabels(defaultLabels);
        }
    };

    const handleSave = async () => {
        if (!selectedCompany?.id) return;
        setIsSaving(true);
        try {
            const settingsPayload = {
                labels: labels
            };

            const res = await api.updateCompany(selectedCompany.id, {
                settings: settingsPayload
            });

            if (res.success) {
                alert("Interface labels updated successfully.");
            } else {
                alert("Failed to update labels: " + res.message);
            }
        } catch (error) {
            console.error("Save failed", error);
            alert("Error saving labels");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading settings...</div>;

    return (
        <div className="h-[calc(100vh-70px)] flex flex-col bg-[#EBE9D8] font-sans overflow-hidden">
            {/* Header */}
            <div className="bg-[#EBE9D8] border-b border-white p-2 shadow-sm shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-[#0B4FD7] font-black text-lg uppercase tracking-wider flex items-center gap-2">
                        <Type size={18} /> Field Label Customization
                    </h1>
                </div>
                <p className="text-xs text-gray-600 font-bold px-1">
                    Customize how statutory fields appear on reports and entry screens.
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-auto flex justify-center">
                <div className="w-full max-w-lg bg-white border-2 border-white shadow-[2px_2px_0_rgba(0,0,0,0.1)] p-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase border-b border-gray-300 pb-2 mb-6">
                        Statutory Deductions & IDs
                    </h2>

                    <div className="space-y-6">
                        {/* TRN */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <label className="text-xs font-bold text-right text-gray-700">Tax Registration Number</label>
                            <div className="col-span-2">
                                <input
                                    type="text"
                                    value={labels.trn}
                                    onChange={(e) => handleInputChange('trn', e.target.value)}
                                    className="w-full border-b-2 border-gray-300 bg-gray-50 px-2 py-1 outline-none focus:border-[#0B4FD7] text-sm font-bold transition-colors"
                                    placeholder="Default: TRN"
                                />
                                <div className="text-[10px] text-gray-400 mt-1">System Default: {defaultLabels.trn}</div>
                            </div>
                        </div>

                        {/* NIS */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <label className="text-xs font-bold text-right text-gray-700">National Insurance</label>
                            <div className="col-span-2">
                                <input
                                    type="text"
                                    value={labels.nis}
                                    onChange={(e) => handleInputChange('nis', e.target.value)}
                                    className="w-full border-b-2 border-gray-300 bg-gray-50 px-2 py-1 outline-none focus:border-[#0B4FD7] text-sm font-bold transition-colors"
                                    placeholder="Default: NIS"
                                />
                                <div className="text-[10px] text-gray-400 mt-1">System Default: {defaultLabels.nis}</div>
                            </div>
                        </div>

                        {/* NHT */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <label className="text-xs font-bold text-right text-gray-700">Housing Trust</label>
                            <div className="col-span-2">
                                <input
                                    type="text"
                                    value={labels.nht}
                                    onChange={(e) => handleInputChange('nht', e.target.value)}
                                    className="w-full border-b-2 border-gray-300 bg-gray-50 px-2 py-1 outline-none focus:border-[#0B4FD7] text-sm font-bold transition-colors"
                                    placeholder="Default: NHT"
                                />
                                <div className="text-[10px] text-gray-400 mt-1">System Default: {defaultLabels.nht}</div>
                            </div>
                        </div>

                        {/* Ed Tax */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <label className="text-xs font-bold text-right text-gray-700">Education Tax</label>
                            <div className="col-span-2">
                                <input
                                    type="text"
                                    value={labels.edTax}
                                    onChange={(e) => handleInputChange('edTax', e.target.value)}
                                    className="w-full border-b-2 border-gray-300 bg-gray-50 px-2 py-1 outline-none focus:border-[#0B4FD7] text-sm font-bold transition-colors"
                                    placeholder="Default: Education Tax"
                                />
                                <div className="text-[10px] text-gray-400 mt-1">System Default: {defaultLabels.edTax}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors uppercase"
                        >
                            <RotateCcw size={14} /> Reset Defaults
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2 bg-[#0B4FD7] text-white border-2 border-blue-400 border-r-blue-800 border-b-blue-800 shadow-sm active:translate-y-0.5 text-xs font-bold uppercase hover:bg-[#003CB3]"
                        >
                            <Save size={14} className={isSaving ? "animate-spin" : ""} /> {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLabels;
