import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Folder, Database, Download, Upload, ShieldCheck,
    History, LogOut, FileCode, CheckCircle2, AlertCircle,
    Loader2, LucideFileJson, LucideFileSpreadsheet, Search
} from 'lucide-react';

const FileManager = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [backups, setBackups] = useState([
        { id: 'OP772', date: '29/01/2026', type: 'BACKUP', size: '45.2 MB', user: 'Admin', status: 'VERIFIED' },
        { id: 'OP771', date: '28/01/2026', type: 'EXPORT', size: '12.4 MB', user: 'Finance', status: 'VERIFIED' },
        { id: 'OP770', date: '27/01/2026', type: 'IMPORT', size: '8.1 MB', user: 'HR_Sys', status: 'COMPLETED' },
    ]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'IMPORT', 'EXPORT', 'BACKUP'
    const [logFilter, setLogFilter] = useState('');
    const pendingOpRef = useRef(null);
    const location = useLocation();

    // Auto-trigger based on URL search params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const action = params.get('action');

        if (action === 'import') {
            handleImportClick();
        } else if (action === 'export') {
            handleExport();
        } else if (action === 'backup') {
            handleBackup();
        } else if (action === 'restore') {
            handleRestore();
        }

        // Clear the URL params after triggering to prevent re-trigger on refresh
        if (action) {
            window.history.replaceState({}, '', location.pathname);
        }
    }, [location.search]);

    const runSimulation = (type, message, callback) => {
        setModalType(type);
        setShowModal(true);
        setIsProcessing(true);
        setProgress(0);
        setStatusText(`Initializing ${type} protocol...`);

        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.random() * 15;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                setStatusText(`CRC Verification Successful. Operation ${type} finalized.`);
                setTimeout(() => {
                    setIsProcessing(false);
                    callback();
                }, 800);
            } else {
                setProgress(currentProgress);
                if (type === 'RESTORE') {
                    if (currentProgress > 20) setStatusText(`Mapping Integrity Points...`);
                    if (currentProgress > 45) setStatusText(`Reconstructing Partition Tables...`);
                    if (currentProgress > 75) setStatusText(`Syncing Logical Indices...`);
                } else {
                    if (currentProgress > 20) setStatusText(`Reading Cluster Headers...`);
                    if (currentProgress > 45) setStatusText(`Processing Data Packets [${Math.floor(currentProgress * 42)} records]...`);
                    if (currentProgress > 75) setStatusText(`Finalizing RSA-4096 Encryption...`);
                }
            }
        }, 200);
    };

    const handleBackup = () => {
        runSimulation('BACKUP', 'Creating system snapshot...', () => {
            const newOp = {
                id: `OP${773 + backups.length}`,
                date: new Date().toLocaleDateString('en-GB'),
                type: 'BACKUP',
                size: '45.8 MB',
                user: 'Admin',
                status: 'VERIFIED'
            };
            setBackups(prev => [newOp, ...prev]);
        });
    };

    const handleRestore = () => {
        runSimulation('RESTORE', 'Scanning cluster indices...', () => {
            alert('SYSTEM RESTORE COMPLETE: Database has been rolled back to the selected integrity point.');
        });
    };

    const handleImportClick = () => {
        pendingOpRef.current = 'import';
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const targetPath = pendingOpRef.current === 'restore' ? '/files/restore' :
                pendingOpRef.current === 'backup' ? '/files/backup' : '/files/import';

            navigate(targetPath, {
                state: {
                    autoStart: true,
                    fileName: file.name,
                    fileSize: file.size
                }
            });
        }
    };

    const handleExport = () => {
        runSimulation('EXPORT', 'Compressing master records...', () => {
            const newOp = {
                id: `OP${773 + backups.length}`,
                date: new Date().toLocaleDateString('en-GB'),
                type: 'EXPORT',
                size: '14.2 MB',
                user: 'Admin',
                status: 'VERIFIED'
            };
            setBackups(prev => [newOp, ...prev]);
            alert('DOWNLOAD READY: Master_Export_2026.xlsx generated and saved to local station.');
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs select-none">
            {/* Hidden Input for Real File Selection */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls,.csv,.xml,.bak,.sql,.zip"
                onChange={handleFileChange}
            />

            {/* Header / Title Bar */}
            <div className="bg-[#0055E5] text-white px-3 py-1.5 flex items-center justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                <div className="flex items-center gap-2">
                    <History size={14} />
                    <span className="font-black uppercase tracking-widest text-[10px]">Station Protocol: 0x882 — File Maintenance</span>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-bold opacity-80">
                    <span>SECURITY: RSA-4096</span>
                    <span className="border-l border-white/30 pl-4 uppercase">Node: JAMAICA-HQ-01</span>
                </div>
            </div>

            <div className="flex-1 p-3 sm:p-6 overflow-hidden flex flex-col md:flex-row gap-4 sm:gap-6 bg-[#D4D0C8]/50">

                {/* Left - Operations Desk */}
                <div className="w-full md:w-80 flex flex-col gap-4">
                    <div className="bg-white border-2 border-gray-500 shadow-[8px_8px_0_rgba(0,0,0,0.1)] flex flex-col">
                        <div className="bg-[#D4D0C8] px-4 py-2 border-b border-gray-400 flex items-center gap-2 font-black text-gray-700 uppercase italic">
                            <Database size={14} className="text-blue-700" /> Primary Ops
                        </div>
                        <div className="p-4 space-y-3">
                            <button
                                onClick={handleBackup}
                                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-200 text-blue-800 font-black hover:from-blue-100 hover:border-blue-400 active:translate-y-0.5 transition-all text-left shadow-sm border-b-2 border-r-2"
                            >
                                <Database size={24} className="shrink-0" />
                                <div className="truncate">
                                    <div className="text-[11px] leading-none mb-1">BACKUP SYSTEM</div>
                                    <div className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">Full Binary Image</div>
                                </div>
                            </button>

                            <button
                                onClick={handleImportClick}
                                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-white border border-green-200 text-green-800 font-black hover:from-green-100 hover:border-green-400 active:translate-y-0.5 transition-all text-left shadow-sm border-b-2 border-r-2"
                            >
                                <LucideFileSpreadsheet size={24} className="shrink-0" />
                                <div className="truncate">
                                    <div className="text-[11px] leading-none mb-1">IMPORT DATA</div>
                                    <div className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">Excel / CSV / XML</div>
                                </div>
                            </button>

                            <button
                                onClick={handleExport}
                                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-white border border-purple-200 text-purple-800 font-black hover:from-purple-100 hover:border-purple-400 active:translate-y-0.5 transition-all text-left shadow-sm border-b-2 border-r-2"
                            >
                                <Download size={24} className="shrink-0" />
                                <div className="truncate">
                                    <div className="text-[11px] leading-none mb-1">EXPORT MASTER</div>
                                    <div className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">Encrypted YTD Archive</div>
                                </div>
                            </button>

                            <button
                                onClick={handleRestore}
                                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-white border border-red-200 text-red-800 font-black hover:from-red-100 hover:border-red-400 active:translate-y-0.5 transition-all text-left shadow-sm border-b-2 border-r-2"
                            >
                                <History size={24} className="shrink-0" />
                                <div className="truncate">
                                    <div className="text-[11px] leading-none mb-1">RESTORE SYSTEM</div>
                                    <div className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">Rollback to Snapshot</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Shield Status Card */}
                    <div className="bg-[#1a1a1a] text-white p-5 border-t-4 border-blue-600 shadow-xl relative group overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldCheck size={20} className="text-blue-400" />
                                <h4 className="font-black uppercase tracking-tighter text-[10px]">Integrity Checkpoint</h4>
                            </div>
                            <p className="text-[9px] leading-relaxed opacity-70 uppercase font-bold tracking-tighter">
                                System state is currently <span className="text-green-400 italic">OPTIMAL</span>. All file operations are monitored and recorded under strict audit protocols.
                            </p>
                        </div>
                        <FileCode className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-125 transition-transform" size={140} />
                    </div>
                </div>

                {/* Right - Audit Log Table */}
                <div className="flex-1 flex flex-col bg-white border-2 border-gray-500 shadow-[12px_12px_0_rgba(0,0,0,0.15)] overflow-hidden">
                    <div className="bg-[#D4D0C8] p-3 border-b border-gray-400 flex items-center justify-between px-4">
                        <div className="flex items-center gap-3 font-black italic text-gray-800 uppercase text-[11px] tracking-widest">
                            <History size={16} className="text-blue-700" />
                            System Transaction Log
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="FILTER LOG..."
                                    className="px-2 py-1 bg-white border border-gray-400 text-[10px] font-bold w-32 focus:w-48 transition-all outline-none"
                                    value={logFilter}
                                    onChange={(e) => setLogFilter(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setIsProcessing(true);
                                    setModalType('SCAN');
                                    setShowModal(true);
                                    setStatusText('Scanning system journals for new transactions...');
                                    let p = 0;
                                    const inv = setInterval(() => {
                                        p += 20;
                                        setProgress(p);
                                        if (p >= 100) {
                                            clearInterval(inv);
                                            setTimeout(() => {
                                                setIsProcessing(false);
                                                setShowModal(false);
                                                alert("SYNC SUCCESS: Audit log has been synchronized with the latest master transactions.");
                                            }, 500);
                                        }
                                    }, 150);
                                }}
                                className="bg-white border-2 border-gray-400 px-3 py-1 font-black text-[10px] uppercase hover:bg-gray-100 active:translate-y-0.5 shadow-sm"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead className="bg-[#F0F0F0] sticky top-0 border-b border-gray-300 font-black text-[10px] text-gray-500 uppercase tracking-widest z-10">
                                <tr>
                                    <th className="p-4 border-r border-gray-200">OP-UUID</th>
                                    <th className="p-4 border-r border-gray-200 text-center">STAMP</th>
                                    <th className="p-4 border-r border-gray-200 text-center">TYPE</th>
                                    <th className="p-4 border-r border-gray-200 text-center">DATA LOAD</th>
                                    <th className="p-4">STATION USER</th>
                                    <th className="p-4 text-right">PROTOCOL</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-bold text-gray-700">
                                {backups.filter(b =>
                                    b.id.toLowerCase().includes(logFilter.toLowerCase()) ||
                                    b.type.toLowerCase().includes(logFilter.toLowerCase()) ||
                                    b.user.toLowerCase().includes(logFilter.toLowerCase())
                                ).map(b => (
                                    <tr key={b.id} className="border-b border-gray-100 hover:bg-blue-50/80 cursor-pointer transition-colors group">
                                        <td className="p-4 border-r border-gray-100 font-mono text-blue-700 tracking-tighter uppercase">{b.id}</td>
                                        <td className="p-4 border-r border-gray-100 text-center font-mono text-[10px]">{b.date}</td>
                                        <td className="p-4 border-r border-gray-100 text-center">
                                            <span className={`px-2 py-0.5 rounded-sm text-[9px] uppercase font-black text-white ${b.type === 'BACKUP' ? 'bg-blue-600' : b.type === 'IMPORT' ? 'bg-green-600' : 'bg-purple-600'
                                                }`}>
                                                {b.type}
                                            </span>
                                        </td>
                                        <td className="p-4 border-r border-gray-100 text-center font-mono opacity-60 italic">{b.size}</td>
                                        <td className="p-4 border-r border-gray-100 font-black italic">{b.user}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-[9px] font-black italic text-green-700 tracking-widest">{b.status}</span>
                                                <CheckCircle2 size={12} className="text-green-600" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-[#D4D0C8] p-3 border-t border-gray-400 flex justify-between items-center px-6">
                        <span className="text-[9px] font-black text-gray-500 uppercase italic">Logged Station Events Root: /sys/engine/file_manager</span>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-[#333333] text-white px-8 py-2 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black shadow-lg border-b-4 border-r-4 border-gray-900 active:translate-y-1 active:border-0 transition-all"
                        >
                            Return to Command
                        </button>
                    </div>
                </div>
            </div>

            {/* Simulation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-[450px] bg-[#EBE9D8] border-2 border-white shadow-[20px_20px_0_rgba(0,0,0,0.4)] animate-in zoom-in duration-200">
                        <div className="bg-[#0055E5] text-white px-3 py-1.5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Execution: {modalType}</span>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-6 mb-8">
                                <div className={`p-4 rounded-full ${isProcessing ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} shadow-inner`}>
                                    {modalType === 'IMPORT' ? <LucideFileSpreadsheet size={32} /> :
                                        modalType === 'EXPORT' ? <Download size={32} /> : <Database size={32} />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter mb-1">
                                        {isProcessing ? 'Operational Step' : 'Protocol Finalized'}
                                    </h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Master File Control Unit</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-[10px] font-black text-gray-700 uppercase italic tracking-tighter">{statusText}</span>
                                    <span className="text-sm font-black text-blue-700">{Math.floor(progress)}%</span>
                                </div>
                                <div className="w-full h-4 bg-white border border-gray-400 p-0.5 shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-800 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-gray-400 uppercase font-mono tracking-tighter">
                                    <span>TASK_REF: 0xFD_{modalType}</span>
                                    <span className="text-right">MEM: {Math.floor(progress * 4)}MB LOAD</span>
                                </div>
                            </div>

                            {!isProcessing && (
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full mt-8 bg-[#0055E5] text-white py-3 font-black uppercase tracking-[0.2em] shadow-lg border-b-4 border-r-4 border-blue-900 active:translate-y-1 active:border-0 transition-all font-sans"
                                >
                                    Dismiss Protocol
                                </button>
                            )}
                        </div>
                        <div className="bg-[#D4D0C8] border-t border-gray-400 px-4 py-1.5 flex justify-end">
                            <div className="flex items-center gap-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">RSA Status:</span>
                                <span className={`text-[8px] font-black uppercase ${isProcessing ? 'text-blue-600 animate-pulse' : 'text-green-600'}`}>
                                    {isProcessing ? 'ENCRYPTING...' : 'SECURE'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileManager;
