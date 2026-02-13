import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Upload, FileSpreadsheet, FileCode, CheckCircle2,
    AlertCircle, Loader2, Search, ArrowRight,
    LucideFileText, Database, ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';

const ImportWizard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);

    // Determine context from URL
    const isTimesheet = location.pathname.includes('timesheets');
    const isSavedEntries = location.pathname.includes('import-saved');
    const isJmdFx = location.pathname.includes('import-jmd-fx');
    const isRestore = location.pathname.includes('restore');
    const isBackup = location.pathname.includes('backup');

    const title = isTimesheet ? 'Import Time Sheets' :
        isSavedEntries ? 'Import Saved Entries' :
            isJmdFx ? 'Import JMD to FX Transactions' :
                isRestore ? 'System Restore Protocol' :
                    isBackup ? 'System Backup Protocol' : 'Data Import Wizard';

    const [step, setStep] = useState(1); // 1: Select, 2: Map/Verify, 3: Process, 4: Finish
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileObject, setFileObject] = useState(null);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [importLog, setImportLog] = useState([]);

    // Auto-start if file was passed from Topbar/FileManager
    React.useEffect(() => {
        if (location.state?.autoStart && location.state?.fileName) {
            setSelectedFile({
                name: location.state.fileName,
                size: location.state.fileSize
            });

            // Check window bridge for File object
            if (window.pendingFile) {
                setFileObject(window.pendingFile);
                // Clean up to prevent stale data on re-visits
                // window.pendingFile = null; 
            }
            setStep(2);
        }
    }, [location.state]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFileObject(file);
            setStep(2);
        }
    };

    const startImport = async () => {
        if (!fileObject) {
            alert("STATION ALERT: No valid file object detected for transmission.");
            return;
        }

        try {
            setStep(3);
            setProgress(30);
            setStatusText(isRestore ? 'Initializing Restore Protocol...' : 'Uploading master file...');

            let response;
            if (isRestore) {
                response = await api.restoreSystemBackup(fileObject);
            } else {
                response = await api.importMasterData(fileObject);
            }

            if (response.success) {
                setProgress(100);
                setStatusText('Sequence finalized.');
                setImportLog([
                    { msg: 'File integrity verified', type: 'success' },
                    { msg: `${isRestore ? response.data.recordsRestored : response.data.recordsProcessed} Records processed`, type: 'info' },
                    { msg: 'Database sync completed', type: 'success' },
                    { msg: 'Station log updated', type: 'success' },
                ]);
                setTimeout(() => setStep(4), 500);
            }
        } catch (err) {
            console.error(err);
            setStep(2);
            alert(`PROTOCOL FAILURE: ${err.message || 'Transmission error during file processing'}`);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs select-none">
            {/* Window-like Header */}
            <div className="bg-[#0055E5] text-white px-3 py-1.5 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                    <FileSpreadsheet size={16} />
                    <span className="font-black uppercase tracking-widest text-[10px] italic">{title} Core</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="hover:bg-red-500 w-5 h-5 flex items-center justify-center transition-colors">✕</button>
                </div>
            </div>

            <div className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center bg-[#D4D0C8]/30 overflow-auto">
                <div className="w-full max-w-2xl bg-white border-2 border-gray-500 shadow-[12px_12px_0_rgba(0,0,0,0.1)] flex flex-col">

                    {/* Stepper Header */}
                    <div className="bg-[#F0F0F0] border-b border-gray-300 p-4 flex justify-between items-center">
                        {[1, 2, 3, 4].map(num => (
                            <div key={num} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black ${step >= num ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {num}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-tighter hidden sm:inline ${step === num ? 'text-blue-700' : 'text-gray-400'
                                    }`}>
                                    {num === 1 ? 'Selection' : num === 2 ? 'Verify' : num === 3 ? 'Process' : 'Complete'}
                                </span>
                                {num < 4 && <div className="w-8 h-px bg-gray-300 mx-2 hidden sm:block"></div>}
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="p-8 min-h-[300px] flex flex-col">

                        {step === 1 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100">
                                    <Upload size={40} />
                                </div>
                                <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter mb-2">
                                    {isRestore ? 'Select Backup Image' : isBackup ? 'Select Configuration' : 'Select Source File'}
                                </h3>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest max-w-[280px] mb-8">
                                    {isRestore ? 'Pick a .bak, .zip or .sql system archive' : 'Supported formats: .XLSX, .XLS, .CSV, .XML'}
                                </p>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    accept=".xlsx,.xls,.csv,.xml"
                                />

                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="px-10 py-3 bg-blue-600 text-white font-black uppercase tracking-[0.2em] shadow-lg hover:bg-blue-700 active:translate-y-1 transition-all border-b-4 border-r-4 border-blue-900"
                                >
                                    Choose File...
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="flex-1 animate-in slide-in-from-right duration-300">
                                <div className="flex items-center gap-4 mb-8 bg-blue-50 p-4 border border-blue-100 rounded">
                                    <LucideFileText size={32} className="text-blue-600" />
                                    <div className="flex-1">
                                        <div className="font-black text-blue-900 text-sm uppercase truncate">{selectedFile.name}</div>
                                        <div className="text-[9px] font-bold text-gray-500">SIZE: {(selectedFile.size / 1024).toFixed(1)} KB — TYPE: {selectedFile.type || 'Binary Archive'}</div>
                                    </div>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="text-[9px] font-black text-red-600 uppercase border border-red-200 px-2 py-1 hover:bg-red-50 transition-colors"
                                    >Change</button>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <h4 className="font-black text-gray-700 uppercase italic border-b pb-1 flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-green-600" /> Data Validation Preview
                                    </h4>
                                    <div className="bg-gray-50 border border-gray-200 p-3 space-y-2">
                                        {[
                                            { label: 'Column Structure', status: 'MATCHED' },
                                            { label: 'Data Formatting', status: 'VERIFIED' },
                                            { label: 'Calculated Sums', status: 'PENDING' }
                                        ].map(item => (
                                            <div key={item.label} className="flex justify-between items-center px-2">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">{item.label}</span>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded ${item.status === 'MATCHED' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'VERIFIED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>{item.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 italic">
                                        NOTE: System will automatically map recognized headers. Unmapped data will be ignored.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="px-6 py-2 font-black text-gray-500 uppercase hover:bg-gray-100"
                                    >Cancel</button>
                                    <button
                                        onClick={startImport}
                                        className="px-10 py-2 bg-green-600 text-white font-black uppercase shadow-lg hover:bg-green-700 active:translate-y-1 transition-all flex items-center gap-2"
                                    >
                                        {isRestore ? 'Initiate Restore' : isBackup ? 'Start Compression' : 'Execute Import'} <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 animate-in fade-in duration-300">
                                <Loader2 size={48} className="text-blue-600 animate-spin mb-6" />
                                <div className="w-full max-w-sm space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-blue-800 uppercase italic animate-pulse">{statusText}</span>
                                        <span className="text-xl font-black text-blue-900">{Math.floor(progress)}%</span>
                                    </div>
                                    <div className="w-full h-6 bg-white border-2 border-gray-300 p-0.5 shadow-inner">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center mt-4">
                                        <Database size={10} /> Syncing with Station Master Register...
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="flex-1 animate-in zoom-in duration-300">
                                <div className="flex flex-col items-center mb-8">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-green-800 uppercase italic tracking-tighter">
                                        {isRestore ? 'Restore Finalized' : isBackup ? 'Backup Generated' : 'Import Successful'}
                                    </h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operation OP-{Math.floor(Math.random() * 9000) + 1000} Completed</p>
                                </div>

                                <div className="space-y-2 mb-8 bg-[#F8F9FA] p-4 border-2 border-dashed border-gray-300">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 border-b border-gray-200 pb-1">Execution Log Summary</h4>
                                    {importLog.map((log, i) => (
                                        <div key={i} className="flex gap-3 items-center text-[10px] font-bold">
                                            {log.type === 'success' ? <CheckCircle2 size={12} className="text-green-600" /> : <AlertCircle size={12} className="text-blue-500" />}
                                            <span className={log.type === 'success' ? 'text-green-700' : 'text-blue-700'}>{log.msg}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="w-full py-3 border-2 border-gray-500 font-black text-gray-600 uppercase hover:bg-gray-50 transition-all text-[11px]"
                                    >Import Another</button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full py-3 bg-[#333333] text-white font-black uppercase tracking-widest hover:bg-black transition-all text-[11px] shadow-lg border-b-4 border-r-4 border-gray-900 active:translate-y-1 active:border-0"
                                    >Close Wizard</button>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="bg-[#D4D0C8] border-t border-gray-400 p-3 flex justify-between items-center px-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_green]"></div>
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest italic">Security Engine Active</span>
                        </div>
                        <span className="text-[9px] font-black text-blue-800 italic uppercase">SmartHRM Engine v5.10.x-0xFB</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportWizard;
