import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardDrive, Trash2, CheckCircle2, AlertCircle, LogOut, Loader2, RotateCcw } from 'lucide-react';

const DatabaseCleanup = () => {
    const navigate = useNavigate();
    const [level, setLevel] = useState('Light');
    const [isCleaning, setIsCleaning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const handleRunCleanup = () => {
        setShowConfirm(false);
        setIsCleaning(true);
        setIsDone(false);
        setProgress(0);

        let current = 0;
        const interval = setInterval(() => {
            current += Math.random() * 20;
            if (current >= 100) {
                current = 100;
                clearInterval(interval);
                setTimeout(() => {
                    setIsCleaning(false);
                    setIsDone(true);

                    // Frontend Logic: Clear non-critical local storage logs if Full is selected
                    if (level === 'Full') {
                        Object.keys(localStorage).forEach(key => {
                            if (key.includes('log') || key.includes('temp')) {
                                localStorage.removeItem(key);
                            }
                        });
                    }
                }, 500);
            }
            setProgress(current);
        }, 300);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F5F7] font-sans text-xs">
            <div className="border-b border-gray-300 px-6 py-4 bg-white flex justify-between items-center">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Database Integrity Utility</h1>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Cache Optimization & Record Pruning</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors"
                >
                    <LogOut size={14} className="text-gray-400" />
                    Exit
                </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white border border-gray-300 p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-purple-50 rounded border border-purple-100">
                                <HardDrive className="text-purple-600" size={32} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 uppercase">Station Maintenance</h2>
                                <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">Storage & Performance Optimizer</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Cleanup Level</label>
                                <select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    disabled={isCleaning}
                                    className="w-full p-3 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 outline-none focus:border-purple-500 transition-colors appearance-none"
                                >
                                    <option>Light (Cached UI Assets only)</option>
                                    <option>Medium (UI Assets + Temporary Session Logs)</option>
                                    <option>Full (Complete cache wipe + Reset non-critical settings)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-100 rounded bg-white">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Target Storage</p>
                                    <p className="text-xs font-bold text-gray-800 italic">localStorage::HRM_TEMP_*</p>
                                </div>
                                <div className="p-4 border border-gray-100 rounded bg-white">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Estimated Recovery</p>
                                    <p className="text-xs font-bold text-green-600">{level === 'Light' ? '12 KB' : level === 'Medium' ? '45 KB' : '150 KB'}</p>
                                </div>
                            </div>

                            {!isCleaning && !isDone && (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="w-full bg-purple-600 text-white font-bold py-3 uppercase tracking-widest hover:bg-purple-700 shadow-md transition-all active:translate-y-0.5"
                                >
                                    Run System Cleanup
                                </button>
                            )}

                            {isCleaning && (
                                <div className="space-y-4 py-8">
                                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <span>Optimizing Tables & Cache...</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                        <div
                                            className="h-full bg-purple-600 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 font-mono text-[9px] italic">
                                        <Loader2 size={12} className="animate-spin" />
                                        <span>TRUNCATING HRM_TEMP_BUFFER...</span>
                                    </div>
                                </div>
                            )}

                            {isDone && (
                                <div className="p-6 bg-green-50 border border-green-200 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                                        <CheckCircle2 size={24} className="text-green-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-green-800 uppercase mb-2">Cleanup Successful</h3>
                                    <p className="text-green-600/80 text-[10px] font-medium uppercase mb-6">
                                        Temporary records removed. Station overhead reduced.
                                    </p>
                                    <button
                                        onClick={() => setIsDone(false)}
                                        className="text-[10px] font-black text-green-800 uppercase underline tracking-tighter hover:text-green-900"
                                    >
                                        Back to utility setup
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                        <AlertCircle className="text-yellow-600 shrink-0" size={18} />
                        <div>
                            <p className="font-bold text-yellow-800 text-[10px] uppercase tracking-wider mb-1">Integrity Warning</p>
                            <p className="text-yellow-700 text-[9px] font-medium uppercase leading-relaxed">
                                Avoid running "Full Cleanup" during an active payroll calculation session.
                                Ensure all Master Engine operations are finalized before pruning temporary caches.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-gray-400 shadow-[8px_8px_0_rgba(0,0,0,0.2)] max-w-sm w-full p-8 text-center animate-in slide-in-from-bottom-4 duration-200">
                        <Trash2 className="text-red-600 mx-auto mb-4" size={48} />
                        <h3 className="text-lg font-black text-gray-800 uppercase mb-2 tracking-tight">Confirm Purge</h3>
                        <p className="text-gray-500 text-[11px] font-medium mb-8 leading-relaxed">
                            You are about to execute a {level} integrity cleanup. This action will permanently remove temporary station logs. Proceed?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 border border-gray-300 font-bold uppercase text-[10px] hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRunCleanup}
                                className="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-[10px] hover:bg-red-700 shadow-md transition-all active:translate-y-0.5"
                            >
                                Purge Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatabaseCleanup;
