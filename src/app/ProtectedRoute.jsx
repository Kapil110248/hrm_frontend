import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ user, allowedRoles, children }) => {
    const navigate = useNavigate();
    // 1. If no user is logged in, redirect to login (or let MainLayout handle it, but safer here)
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // 2. If user role is not in the allowed list
    if (!allowedRoles.includes(user.role)) {
        return (
            <div className="flex items-center justify-center min-h-screen w-full bg-[#EBE9D8]/50 backdrop-blur-[2px] p-4">
                <div className="w-full max-w-[450px] bg-[#D4D0C8] border-2 border-white border-b-gray-800 border-r-gray-800 shadow-xl flex flex-col animate-in zoom-in-95 duration-200">
                    {/* Classic Blue Title Bar */}
                    <div className="h-7 bg-[#316AC5] flex items-center justify-between px-1.5 py-1">
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                            </div>
                            <span className="text-white text-[11px] font-bold tracking-tight">System Security Restriction</span>
                        </div>
                        <div className="flex gap-0.5">
                            <button className="w-[18px] h-[14px] bg-[#D4D0C8] border border-white border-b-gray-800 border-r-gray-800 text-black text-[9px] flex items-center justify-center font-bold hover:bg-gray-100 active:border-gray-800 active:border-b-white active:border-r-white">?</button>
                            <button onClick={() => navigate(-1)} className="w-[18px] h-[14px] bg-[#D4D0C8] border border-white border-b-gray-800 border-r-gray-800 text-black text-[9px] flex items-center justify-center font-bold hover:bg-gray-100 active:border-gray-800 active:border-b-white active:border-r-white">X</button>
                        </div>
                    </div>

                    <div className="p-6 flex gap-6 mt-1">
                        {/* Error Icon */}
                        <div className="shrink-0">
                            <div className="w-10 h-10 bg-white border border-gray-400 rounded-full flex items-center justify-center shadow-inner">
                                <span className="text-red-600 text-2xl font-black">!</span>
                            </div>
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold text-gray-800 leading-tight">Access Denied</h2>
                                <p className="text-[11px] text-gray-600 font-medium">Insufficient Authorization Profile</p>
                            </div>

                            <div className="text-[12px] text-gray-800 leading-relaxed font-medium">
                                Your current session profile <span className="font-bold underline decoration-red-400">"{user.role}"</span> is not authorized to access the requested module:
                                <div className="mt-2 p-2 bg-white border border-gray-300 font-mono text-[10px] text-red-700 shadow-inner break-all">
                                    PATH: {window.location.pathname}
                                </div>
                            </div>

                            <p className="text-[11px] text-gray-500 italic">
                                Please contact your System Administrator to request elevated privileges for this sector.
                            </p>
                        </div>
                    </div>

                    {/* Button Footer */}
                    <div className="bg-[#D4D0C8] p-4 flex justify-end gap-2 border-t border-gray-100/30">
                        <button
                            onClick={() => navigate('/')}
                            className="min-w-[80px] px-4 py-1.5 bg-[#D4D0C8] border-2 border-white border-b-gray-800 border-r-gray-800 text-[11px] font-bold text-gray-800 hover:bg-gray-100 active:border-gray-800 active:border-b-white active:border-r-white transition-colors"
                        >
                            Return Home
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="min-w-[80px] px-4 py-1.5 bg-[#D4D0C8] border-2 border-white border-b-gray-800 border-r-gray-800 text-[11px] font-bold text-gray-800 hover:bg-gray-100 active:border-gray-800 active:border-b-white active:border-r-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Authorized
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
