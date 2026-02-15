import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, Clock, Send, CheckCircle, XCircle, AlertCircle, Loader2, ArrowLeft
} from 'lucide-react';
import { api } from '../../services/api';

const LeaveRequest = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));

    const [formData, setFormData] = useState({
        type: 'Annual Leave',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const [stats, setStats] = useState({
        total: 14,
        used: 0,
        pending: 0
    });

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.fetchEmployeeDashboardStats();
            if (res.success && res.data.employee) {
                const employee = res.data.employee;
                const leavesRes = await api.fetchLeaves({ employeeId: employee.id });
                if (leavesRes.success) {
                    setHistory(leavesRes.data);

                    const used = leavesRes.data
                        .filter(l => l.status === 'Approved')
                        .reduce((sum, l) => {
                            const days = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                            return sum + days;
                        }, 0);

                    const pending = leavesRes.data
                        .filter(l => l.status === 'Pending')
                        .length;

                    setStats({ total: 14, used, pending });
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.startDate || !formData.endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        try {
            setLoading(true);
            const empRes = await api.fetchEmployeeDashboardStats();
            console.log('[DEBUG] Dashboard Stats Res:', empRes);

            const employee = empRes.data?.employee;

            if (!employee) {
                alert("ACCESS DENIED: Your user account is not currently linked to an active Employee Profile. Please contact HR to link your email.");
                setLoading(false);
                return;
            }

            const res = await api.createLeave({
                employeeId: employee.employeeId,
                type: formData.type,
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason,
                status: 'Pending'
            });

            if (res.success) {
                alert("LEAVE REQUEST SUBMITTED: Your application has been sent to HR for verification.");
                setFormData({ type: 'Annual Leave', startDate: '', endDate: '', reason: '' });
                fetchHistory();
            } else {
                alert("SUBMISSION FAILED: " + (res.message || "Unknown server error"));
            }
        } catch (err) {
            console.error('[LEAVE_ERROR]', err);
            alert("SYSTEM ERROR: Failed to transmit request. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#F8FAFC] font-sans p-4 md:p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-white rounded-full transition-all shadow-sm border border-gray-200"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter">Leave Application Portal</h1>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em]">Absence Management & Compliance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Request Form */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Stats Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Availability Summary</h3>
                        <div className="flex justify-between items-end border-b border-gray-100 pb-4 mb-4">
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-blue-600 italic">{(stats.total - stats.used)}</span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Days Available</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-gray-800 uppercase italic">{stats.used} Used</span>
                                <span className="text-[9px] font-bold text-orange-500 uppercase italic">{stats.pending} Request(s) Pending</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="bg-blue-600 h-full transition-all duration-1000"
                                style={{ width: `${(stats.used / stats.total) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Leave Category</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option>Annual Leave</option>
                                    <option>Sick Leave</option>
                                    <option>Casual Leave</option>
                                    <option>Maternity/Paternity</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Justification / Remarks</label>
                                <textarea
                                    rows="3"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="Brief explanation for leave..."
                                    className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-4 rounded-xl font-black uppercase italic tracking-widest shadow-xl transition-all active:scale-95"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Transmit Request</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: History Feed */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Clock size={14} /> Request Lifecycle Feed
                    </h3>

                    <div className="flex flex-col gap-3">
                        {history.length === 0 ? (
                            <div className="p-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                                <AlertCircle className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No transaction history detected</p>
                            </div>
                        ) : (
                            history.map((record) => (
                                <div
                                    key={record.id}
                                    className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${record.status === 'Approved' ? 'bg-green-50 text-green-600' :
                                            record.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                                                'bg-orange-50 text-orange-600'
                                            }`}>
                                            <Calendar size={24} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-800 uppercase italic tracking-tighter">{record.type}</span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:flex flex-col items-end">
                                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Justification</span>
                                            <span className="text-[10px] font-bold text-gray-500 italic max-w-[150px] truncate">{record.reason || 'No remarks provided'}</span>
                                        </div>
                                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic tracking-widest ${record.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                                            record.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                'bg-orange-100 text-orange-700 border border-orange-200'
                                            }`}>
                                            {record.status === 'Approved' ? <CheckCircle size={12} /> :
                                                record.status === 'Rejected' ? <XCircle size={12} /> :
                                                    <Clock size={12} className="animate-pulse" />}
                                            {record.status}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequest;
