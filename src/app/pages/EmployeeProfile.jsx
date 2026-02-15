import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, MapPin, Landmark, Save, ArrowLeft, Loader2, ShieldCheck, Info, Lock
} from 'lucide-react';
import { api } from '../../services/api';

const EmployeeProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [employee, setEmployee] = useState(null);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));

    // Password Management State
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [formData, setFormData] = useState({
        phone: '',
        street: '',
        city: '',
        parish: '',
        bankName: '',
        bankAccount: ''
    });

    const handlePasswordUpdate = async () => {
        if (!passwordData.current || !passwordData.new) return;
        if (passwordData.new !== passwordData.confirm) {
            alert("New passwords do not match.");
            return;
        }

        try {
            setPasswordLoading(true);
            const res = await api.changePassword({
                currentPassword: passwordData.current,
                newPassword: passwordData.new
            });

            if (res.success) {
                alert("SECURITY UPDATE: Access credentials have been successfully rotated.");
                setPasswordData({ current: '', new: '', confirm: '' });
            }
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to update password. Verify current credentials.");
        } finally {
            setPasswordLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            setFetching(true);
            const res = await api.fetchEmployeeDashboardStats();
            if (res.success && res.data.employee) {
                const record = res.data.employee;
                setEmployee(record);
                setFormData({
                    phone: record.phone || '',
                    street: record.street || '',
                    city: record.city || '',
                    parish: record.parish || '',
                    bankName: record.bankName || '',
                    bankAccount: record.bankAccount || ''
                });
            }
        } catch (err) {
            console.error('Profile fetch failed', err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!employee) return;

        try {
            setLoading(true);
            const res = await api.updateSelfProfile(formData);
            if (res.success) {
                alert("PROFILE UPDATED: Personal and banking records synchronized in the master ledger.");
                fetchProfile();
            }
        } catch (err) {
            console.error(err);
            alert("Update failed. Please contact system administrator.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Authenticating Registry...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-[#F3F4F6] font-sans p-4 md:p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-white rounded-full transition-all border border-gray-200 shadow-sm"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter">Personnel Profile Control</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Identity & Fiscal Routing Management</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Identity Card */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden relative">
                        <div className="h-24 bg-gradient-to-br from-blue-600 to-blue-800 relative">
                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                                <User size={48} className="text-gray-200" />
                            </div>
                        </div>
                        <div className="pt-14 pb-8 px-6 text-center">
                            <h2 className="text-xl font-black text-gray-800 uppercase italic tracking-tight">{employee?.firstName} {employee?.lastName}</h2>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">{employee?.designation || 'EMPLOYEE'}</p>

                            <div className="mt-6 flex flex-col gap-3 text-left border-t border-gray-100 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-50 p-2 rounded-lg text-gray-400"><Info size={14} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-gray-400 uppercase">Employee ID</span>
                                        <span className="text-xs font-bold text-gray-700 uppercase">{employee?.employeeId}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-50 p-2 rounded-lg text-gray-400"><Mail size={14} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-gray-400 uppercase">Sync Email</span>
                                        <span className="text-xs font-bold text-gray-700">{employee?.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-50 p-2 rounded-lg text-gray-400"><ShieldCheck size={14} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-gray-400 uppercase">Registry Status</span>
                                        <span className="text-xs font-bold text-green-600 uppercase italic">{employee?.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-900 p-6 rounded-2xl text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <ShieldCheck size={120} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-2">Security Protocol</h4>
                        <p className="text-xs font-medium leading-relaxed italic">
                            Updating sensitive fiscal data requires system-wide re-encryption. Ensure all banking details are accurate to avoid remittance failures.
                        </p>
                    </div>
                </div>

                {/* Right: Settings Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10 flex flex-col gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                            <Save size={200} />
                        </div>

                        {/* Section 1: Contact & Location */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-black text-gray-800 uppercase italic tracking-widest border-b-2 border-blue-600 w-fit pb-1 pr-6 flex items-center gap-2">
                                <Phone size={14} className="text-blue-600" /> Contact & Location
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5 focus-within:translate-x-1 transition-transform">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Interface</span>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="+1 876..."
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 focus-within:translate-x-1 transition-transform">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Settlement/Parish</span>
                                    <input
                                        type="text"
                                        value={formData.parish}
                                        onChange={(e) => setFormData({ ...formData, parish: e.target.value })}
                                        className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="e.g. St. James"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 focus-within:translate-x-1 transition-transform">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Residence (Street Address)</span>
                                <input
                                    type="text"
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                    className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Enter full street address..."
                                />
                            </div>
                        </div>

                        {/* Section 2: Fiscal Routing */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-black text-gray-800 uppercase italic tracking-widest border-b-2 border-blue-600 w-fit pb-1 pr-6 flex items-center gap-2">
                                <Landmark size={14} className="text-blue-600" /> Fiscal Routing (Banking)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5 focus-within:translate-x-1 transition-transform">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Financial Institution</span>
                                    <input
                                        type="text"
                                        value={formData.bankName}
                                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                        className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="e.g. NCB/BNS"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 focus-within:translate-x-1 transition-transform">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Acct. Logic/Number</span>
                                    <input
                                        type="text"
                                        value={formData.bankAccount}
                                        onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                                        className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                                        placeholder="XXX-XXX-XXX"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Security & Access */}
                        <div className="flex flex-col gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                            <h3 className="text-xs font-black text-gray-800 uppercase italic tracking-widest border-b-2 border-red-500 w-fit pb-1 pr-6 flex items-center gap-2">
                                <Lock size={14} className="text-red-500" /> Security Access Code
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1.5 focus-within:translate-x-1 transition-transform">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</span>
                                    <input
                                        type="password"
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                        className="p-3 border border-gray-200 rounded-xl bg-white text-xs font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 focus-within:translate-x-1 transition-transform">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</span>
                                    <input
                                        type="password"
                                        value={passwordData.new}
                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                        className="p-3 border border-gray-200 rounded-xl bg-white text-xs font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 focus-within:translate-x-1 transition-transform">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New</span>
                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            value={passwordData.confirm}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-xl bg-white text-xs font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={handlePasswordUpdate}
                                            disabled={passwordLoading || !passwordData.current || !passwordData.new}
                                            className="px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors shadow-lg"
                                        >
                                            {passwordLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-8 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-gray-300 uppercase italic tracking-widest">Master Ledger Update</span>
                                <span className="text-[9px] font-bold text-gray-400">Verifying change set...</span>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-10 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl text-xs font-black uppercase italic tracking-widest shadow-2xl transition-all active:translate-y-1"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Synchronize Profile</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
