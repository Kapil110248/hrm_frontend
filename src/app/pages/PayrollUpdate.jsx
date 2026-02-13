import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, AlertCircle, FileText, Database, ShieldCheck, LogOut, RefreshCw, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';

const PayrollUpdate = () => {
    const navigate = useNavigate();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [period, setPeriod] = useState('2026-02');
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    const handleUpdate = async () => {
        if (!selectedCompany.id) {
            alert("No company selected. Please select a company first.");
            return;
        }

        try {
            setIsUpdating(true);
            const response = await api.finalizeBatch({
                companyId: selectedCompany.id,
                period: period
            });

            if (response.success) {
                setTimeout(() => {
                    setIsUpdating(false);
                    setIsFinished(true);
                    alert(`✅ SUCCESS: ${response.data.count} records finalized for ${period}.`);
                }, 1500);
            } else {
                alert("Update failed: " + response.message);
                setIsUpdating(false);
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred during the update process.");
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-2 flex flex-col xs:flex-row items-center justify-between gap-2">
                <span className="font-bold text-gray-700 uppercase italic text-[10px] text-center xs:text-left">Payroll System Control Hub</span>
                <span className="text-[10px] font-bold text-red-600 animate-pulse uppercase tracking-widest text-center">Master Link Active</span>
            </div>

            <div className="flex-1 p-4 sm:p-12 flex flex-col items-center overflow-y-auto">
                <div className="w-full max-w-3xl bg-white border-2 border-gray-500 shadow-[8px_8px_0_rgba(0,0,0,0.1)] sm:shadow-[12px_12px_0_rgba(0,0,0,0.1)] p-4 sm:p-10 my-4">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-8 sm:mb-10 pb-6 border-b-2 border-red-600 relative overflow-hidden">
                        <div className="sm:absolute top-0 right-0 p-2 bg-red-600 text-white font-black italic text-[10px] uppercase tracking-widest sm:rotate-12 sm:translate-x-4 sm:-translate-y-4 mb-2 sm:mb-0 w-full sm:w-auto text-center">Critical</div>
                        <div className="p-4 bg-red-100 rounded-lg text-red-600 shadow-inner border border-red-200 shrink-0">
                            <Upload size={32} className="sm:hidden" />
                            <Upload size={48} className="hidden sm:block" />
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-xl sm:text-3xl font-black text-gray-900 italic uppercase leading-none tracking-tighter">Payroll Master Update</h1>
                            <p className="text-red-700 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] mt-3 sm:mt-2 italic flex items-center justify-center sm:justify-start gap-2">
                                <span className="w-2 h-2 bg-red-600 rounded-full animate-ping shrink-0"></span>
                                Operation Level 4: Permanent Data Posting
                            </p>
                        </div>
                    </div>

                    {!isFinished ? (
                        <div className="space-y-8">
                            <div className="bg-yellow-50 border-2 border-yellow-200 p-6 flex items-start gap-4">
                                <AlertCircle className="text-yellow-600 shrink-0" size={24} />
                                <div className="space-y-2">
                                    <p className="font-black text-yellow-900 uppercase italic">Pre-Update Verification</p>
                                    <ul className="text-[10px] font-bold text-yellow-800 space-y-1 uppercase tracking-tight opacity-80">
                                        <li>• Calculation register has been reviewed and verified.</li>
                                        <li>• Bank disbursement files have been successfully generated.</li>
                                        <li>• System backup has been performed in the last 24 hours.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="p-4 bg-gray-50 border border-gray-300 space-y-3">
                                    <h3 className="font-black text-gray-400 uppercase text-[9px]">Target Pay Period</h3>
                                    <div className="flex items-center gap-3 bg-white border border-gray-200 px-3 py-1 shadow-inner rounded-sm ring-1 ring-gray-200">
                                        <RefreshCw size={14} className="text-blue-600" />
                                        <input
                                            type="month"
                                            value={period}
                                            onChange={(e) => setPeriod(e.target.value)}
                                            className="bg-transparent outline-none font-black text-blue-900 text-xs w-full uppercase"
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 border border-gray-300 space-y-3">
                                    <h3 className="font-black text-gray-400 uppercase text-[9px]">Posting Destination</h3>
                                    <div className="flex items-center gap-3">
                                        <Database className="text-blue-600 shrink-0" size={20} />
                                        <div className="font-black italic text-gray-700 text-[11px] sm:text-xs">PR-MASTER-DB-{period.split('-')[0]}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 border border-gray-300 space-y-3">
                                <h3 className="font-black text-gray-400 uppercase text-[9px]">Security Protocol</h3>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="text-green-600 shrink-0" size={20} />
                                    <div className="font-black italic text-gray-700 text-[11px] sm:text-xs">ENCRYPTED KEY SIGNED - {selectedCompany.code || 'SYS'}</div>
                                </div>
                            </div>

                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating}
                                className={`w-full p-4 sm:p-6 font-black italic text-sm sm:text-xl uppercase tracking-widest sm:tracking-[0.2em] shadow-2xl transition-all flex flex-col items-center justify-center gap-2 ${isUpdating ? 'bg-gray-400 text-gray-200 cursor-wait' : 'bg-red-600 text-white hover:bg-red-700 active:translate-y-1'
                                    }`}
                            >
                                {isUpdating ? (
                                    <>
                                        <RefreshCw size={24} className="animate-spin sm:hidden" />
                                        <RefreshCw size={32} className="animate-spin hidden sm:block" />
                                        <span className="text-center">COMMITTING TO MASTER DATA...</span>
                                    </>
                                ) : (
                                    <span className="text-center">POST & UPDATE MASTER RECORDS</span>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center space-y-8 animate-in zoom-in duration-500">
                            <div className="p-6 sm:p-10 bg-green-50 border-4 border-green-500 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse"></div>
                                <CheckCircle size={48} className="text-green-600 mb-4 mx-auto sm:hidden" />
                                <CheckCircle size={80} className="text-green-600 mb-4 mx-auto hidden sm:block" />
                                <h2 className="text-xl sm:text-3xl font-black text-green-900 italic uppercase tracking-tighter leading-tight">LEDGER UPDATED SUCCESSFULLY</h2>
                                <p className="font-bold text-green-700 uppercase mt-4 sm:mt-2 tracking-widest text-[9px] sm:text-[10px]">All employee salary history has been permanently committed to Master Database.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => {
                                        alert("PREPARING AUDIT: Generating Master Posting Register for the current commitment session...");
                                        navigate('/payroll/register/print');
                                    }}
                                    className="flex-1 p-4 sm:p-6 bg-blue-900 text-white font-black italic uppercase tracking-widest hover:bg-black transition-all border-b-4 border-blue-950 flex flex-col items-center shadow-lg active:translate-y-1"
                                >
                                    <span className="text-[10px] opacity-70">GENERATE REPORT</span>
                                    <span className="text-xs sm:text-base">PRINT POSTING AUDIT</span>
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="flex-1 p-4 sm:p-6 bg-gray-100 text-gray-800 font-black italic uppercase tracking-widest hover:bg-gray-200 transition-all border border-gray-400 border-b-4 border-gray-500 flex flex-col items-center"
                                >
                                    <span className="text-[10px] opacity-70">STATION CONTROL</span>
                                    <span className="text-xs sm:text-base">BACK TO DASHBOARD</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white border-t border-gray-400 p-2 sm:p-3 flex flex-col xs:flex-row justify-between items-center px-4 sm:px-6 gap-3 no-print">
                <button
                    onClick={() => alert("HISTORY: Accessing previous payroll commitment logs...")}
                    className="flex items-center gap-2 p-1.5 font-black italic text-gray-500 hover:text-blue-700 transition-colors text-[10px] sm:text-xs"
                >
                    <FileText size={16} /> VIEW PREVIOUS UPDATES
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="w-full xs:w-auto bg-gray-100 border border-gray-400 text-gray-600 px-8 py-2 font-black italic hover:bg-gray-200 text-[10px] sm:text-xs"
                >
                    CLOSE MODULE
                </button>
            </div>
        </div>
    );
};

export default PayrollUpdate;
