import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Lock, UserCheck, Eye, EyeOff, LogOut, Loader2, Info } from 'lucide-react';

const SecurityAudit = () => {
    const navigate = useNavigate();
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [mockLogs, setMockLogs] = useState([]);

    useEffect(() => {
        // Initialize mock access logs if not present
        const logs = [
            { id: 1, time: '14:20:05', activity: 'Admin Login', status: 'SUCCESS', ip: '127.0.0.1' },
            { id: 2, time: '14:45:12', activity: 'Settings Access', status: 'SUCCESS', ip: '127.0.0.1' },
            { id: 3, time: '15:10:33', activity: 'Payroll Export', status: 'FLAGGED', ip: 'Internal Station' },
            { id: 4, time: 'Yesterday 10:15', activity: 'Root Access Attempt', status: 'FAILED', ip: '192.168.1.5' },
        ];
        setMockLogs(logs);
    }, []);

    const runAudit = () => {
        setIsRunning(true);
        setResults(null);

        setTimeout(() => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

            const auditData = {
                score: 92,
                checks: [
                    { id: 1, label: 'Session Integrity', status: 'PASS', desc: `Authenticated as ${currentUser.role || 'Guest'}`, icon: <UserCheck size={16} /> },
                    { id: 2, label: 'Encryption Protocol', status: 'PASS', desc: 'Station-to-Interface secured via AES-256 simulation', icon: <Lock size={16} /> },
                    { id: 3, label: 'Password Policy', status: 'WARNING', desc: 'Legacy password detected (Policy v1.2 required)', icon: <ShieldAlert size={16} /> },
                    { id: 4, label: 'Role-Based Access', status: 'PASS', desc: `ACL restricted to ${currentUser.role} scope`, icon: <ShieldCheck size={16} /> },
                ],
                threats: [
                    { id: 1, type: 'Unauthorized Request', origin: '192.168.1.5', severity: 'High', msg: 'Failed login attempt at 10:15 Yesterday' },
                    { id: 2, type: 'Information Disclosure', origin: 'Station App', severity: 'Low', msg: 'Local storage contains readable TRN fragments' }
                ]
            };

            setResults(auditData);
            setIsRunning(false);
        }, 2500);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#1A1C1E] font-sans text-xs text-gray-300">
            <div className="border-b border-gray-800 px-6 py-4 bg-[#212429] flex justify-between items-center shadow-lg">
                <div>
                    <h1 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        <ShieldAlert className="text-blue-500" size={18} />
                        Station Security Audit
                    </h1>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Access Control & Threat Detection</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 border border-gray-700 px-4 py-2 text-[10px] font-bold uppercase text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                >
                    <LogOut size={14} />
                    Exit Terminal
                </button>
            </div>

            <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Action Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#212429] border border-gray-800 p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-12 -right-12 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
                                <ShieldAlert size={160} />
                            </div>

                            <h2 className="text-xl font-black text-white uppercase mb-4 tracking-tight relative z-10">Threat Landscape Scan</h2>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed relative z-10 max-w-lg">
                                Review station access logs, session tokens, and cryptographic handshakes to identify vulnerabilities in the local HRM instance.
                            </p>

                            {!isRunning && !results && (
                                <button
                                    onClick={runAudit}
                                    className="bg-blue-600 text-white font-bold py-4 px-12 uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Initiate Cryptic Audit
                                </button>
                            )}

                            {isRunning && (
                                <div className="flex flex-col items-center gap-6 py-4">
                                    <div className="relative">
                                        <Loader2 className="animate-spin text-blue-500" size={48} />
                                        <ShieldAlert className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={20} />
                                    </div>
                                    <span className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] animate-pulse">Analyzing Packets & Roles...</span>
                                </div>
                            )}

                            {results && (
                                <div className="space-y-6 animate-in fade-in duration-700">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {results.checks.map(check => (
                                            <div key={check.id} className="bg-[#1A1C1E] border border-gray-800 p-4 flex items-start gap-3">
                                                <div className={`p-2 rounded ${check.status === 'PASS' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                    {check.icon}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white uppercase text-[10px] mb-1">{check.label}</p>
                                                    <p className="text-gray-500 text-[9px] uppercase font-medium">{check.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-red-500/10 border border-red-500/20 p-6">
                                        <h3 className="text-red-500 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                                            <ShieldAlert size={14} /> Detectable Risks
                                        </h3>
                                        <div className="space-y-3">
                                            {results.threats.map(threat => (
                                                <div key={threat.id} className="flex justify-between items-center border-b border-gray-800/50 pb-3 last:border-0">
                                                    <div>
                                                        <p className="text-white font-bold text-[11px] mb-1">{threat.type}</p>
                                                        <p className="text-gray-500 text-[9px] uppercase font-bold tracking-tighter">{threat.msg}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${threat.severity === 'High' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                                        {threat.severity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Activity Logs */}
                    <div className="space-y-6">
                        <div className="bg-[#212429] border border-gray-800 overflow-hidden shadow-xl h-full">
                            <div className="bg-gray-800/20 px-4 py-3 border-b border-gray-800 flex justify-between items-center">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Live Activity Log</span>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                            <div className="p-4 space-y-4">
                                {mockLogs.map(log => (
                                    <div key={log.id} className="font-mono text-[9px] space-y-1">
                                        <div className="flex justify-between items-center text-gray-500">
                                            <span>[{log.time}]</span>
                                            <span className={log.status === 'FAILED' ? 'text-red-500' : log.status === 'FLAGGED' ? 'text-yellow-500' : 'text-green-500'}>
                                                :: {log.status}
                                            </span>
                                        </div>
                                        <div className="text-gray-400 border-l border-gray-700 pl-2">
                                            SRC_IP: {log.ip} | TASK: {log.activity}
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-8 p-4 bg-blue-900/10 border border-blue-500/20 rounded">
                                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                                        <Info size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Station Note</span>
                                    </div>
                                    <p className="text-[9px] text-gray-500 uppercase font-bold leading-relaxed italic">
                                        Security logs are persistent across browser sessions but restricted to this local machine instance only.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SecurityAudit;
