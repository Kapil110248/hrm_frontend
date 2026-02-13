import React, { useState } from 'react';
import { Key, XCircle, User, Briefcase, DollarSign, Shield, Users } from 'lucide-react';
import { api } from '../services/api';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();

        // Demo shortcuts based on username only for now, or real api call
        setIsLoading(true);
        setError(null);

        try {
            const result = await api.login(username, password || 'demo'); // Default pass for demo
            if (result.success) {
                onLogin(result.data.user);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const quickLogin = (role) => {
        let email = 'admin@islandhr.com';
        let pass = 'admin123';

        if (role === 'hr') {
            email = 'hr@islandhr.com';
            pass = 'hr123';
        } else if (role === 'finance') {
            email = 'finance@islandhr.com';
            pass = 'finance123';
        } else if (role === 'employee') {
            email = 'staff@islandhr.com';
            pass = 'staff123';
        }

        setUsername(email);
        setPassword(pass);
        setError(null);
    };

    const handleExit = () => {
        setUsername('');
        setPassword('');
        setError(null);
    };

    return (
        <div className="w-full max-w-[600px] mx-auto bg-[#EBE9D8] border border-gray-400 shadow-[8px_8px_0_rgba(0,0,0,0.2)] font-sans">
            {/* Title Bar */}
            <div className="bg-gradient-to-r from-[#0055E5] to-[#003399] text-white px-3 py-1.5 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <Shield size={14} className="text-blue-200" />
                    <span className="text-xs font-bold tracking-wide text-shadow">User Verification</span>
                </div>
                <button
                    onClick={handleExit}
                    className="hover:bg-red-500 rounded px-1.5 text-white/80 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Content - Mobile First Layout */}
            <div className="flex flex-col sm:flex-row min-h-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-300">

                {/* Left Side: Login Form */}
                <div className="p-4 sm:p-6 w-full sm:w-[60%]">
                    <div className="flex gap-4 h-full">
                        {/* Vertical Accent Strip (Desktop only) */}
                        <div className="hidden sm:block w-1.5 bg-gradient-to-b from-blue-500 to-transparent  opacity-30 h-full"></div>

                        <form onSubmit={handleLogin} className="flex-1 flex flex-col justify-center gap-4">
                            <div>
                                <h1 className="text-gray-800 font-extrabold text-xl sm:text-2xl tracking-tighter">System Access</h1>
                                <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Secure Identity Verification Required</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2.5 text-[10px] font-black flex items-center gap-2 animate-pulse">
                                    <XCircle size={16} className="shrink-0" /> {error}
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">User Identity</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            name="username"
                                            autoComplete="username"
                                            autoFocus
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full px-4 py-2.5 sm:py-2 border-2 border-gray-200 focus:border-blue-500 bg-white text-sm font-bold text-gray-800 outline-none shadow-sm transition-all rounded"
                                            placeholder="Enter ID..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Password</label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            name="password"
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 sm:py-2 border-2 border-gray-200 focus:border-blue-500 bg-white text-sm font-bold text-gray-800 outline-none shadow-sm transition-all rounded"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                <button
                                    onClick={(e) => handleLogin(e)}
                                    disabled={isLoading}
                                    className="flex-1 bg-[#0055E5] hover:bg-blue-700 text-white py-3 sm:py-2 px-6 font-black text-[11px] uppercase tracking-widest shadow-sm active:translate-y-0.5 transition-all flex items-center justify-center gap-3 "
                                >
                                    {isLoading ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin"></span>
                                    ) : (
                                        <>
                                            <span>Sign In</span> <Briefcase size={14} />
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExit}
                                    className="flex-1 bg-white border-2 border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-600 hover:text-red-700 py-3 sm:py-2 px-6 font-black text-[11px] uppercase tracking-widest active:translate-y-0.5 transition-all flex items-center justify-center gap-3  shadow-sm"
                                >
                                    <span>Reset</span> <XCircle size={14} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                {/* Right/Bottom Side: Quick Access */}
                <div className="w-full sm:w-[40%] bg-gray-50/50 p-4 sm:p-6 flex flex-col justify-center">
                    <div className="text-[9px] font-black text-gray-400 uppercase mb-4 text-center tracking-[0.3em] flex items-center gap-3 before:content-[''] before:h-px before:flex-1 before:bg-gray-200 after:content-[''] after:h-px after:flex-1 after:bg-gray-200">
                        Quick Start
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
                        <button onClick={() => quickLogin('admin')} className="group flex items-center gap-3 p-2.5  bg-white border border-gray-200 hover:border-red-400 hover:shadow-md transition-all w-full active:scale-95">
                            <div className="p-1.5 bg-red-100 rounded text-red-600 group-hover:scale-110 transition-transform">
                                <Shield size={14} />
                            </div>
                            <span className="text-[10px] font-black text-gray-600 group-hover:text-red-800 text-left flex-1 uppercase tracking-tighter">Admin</span>
                        </button>
                        <button onClick={() => quickLogin('hr')} className="group flex items-center gap-3 p-2.5  bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all w-full active:scale-95">
                            <div className="p-1.5 bg-blue-100 rounded text-blue-600 group-hover:scale-110 transition-transform">
                                <Users size={14} />
                            </div>
                            <span className="text-[10px] font-black text-gray-600 group-hover:text-blue-800 text-left flex-1 uppercase tracking-tighter">HR Mgr</span>
                        </button>
                        <button onClick={() => quickLogin('finance')} className="group flex items-center gap-3 p-2.5  bg-white border border-gray-200 hover:border-green-400 hover:shadow-md transition-all w-full active:scale-95">
                            <div className="p-1.5 bg-green-100 rounded text-green-600 group-hover:scale-110 transition-transform">
                                <DollarSign size={14} />
                            </div>
                            <span className="text-[10px] font-black text-gray-600 group-hover:text-green-800 text-left flex-1 uppercase tracking-tighter">Finance</span>
                        </button>
                        <button onClick={() => quickLogin('employee')} className="group flex items-center gap-3 p-2.5  bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all w-full active:scale-95">
                            <div className="p-1.5 bg-purple-100 rounded text-purple-600 group-hover:scale-110 transition-transform">
                                <User size={14} />
                            </div>
                            <span className="text-[10px] font-black text-gray-600 group-hover:text-purple-800 text-left flex-1 uppercase tracking-tighter">Staff</span>
                        </button>
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-[8px] font-bold text-gray-400 uppercase italic">Multi-Tenant Employee Portal v4.2</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
