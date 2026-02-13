import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Printer, LogOut, Loader2, UserMinus } from 'lucide-react';
import { api } from '../../services/api';

const P45Report = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const companyStr = localStorage.getItem('selectedCompany');
                const company = companyStr ? JSON.parse(companyStr) : null;
                setSelectedCompany(company);
                if (company) {
                    const res = await api.fetchEmployees(company.id);
                    if (res.success) {
                        setEmployees(res.data);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEmployeeChange = (e) => {
        const emp = employees.find(emp => emp.id === e.target.value);
        setSelectedEmployee(emp || null);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans text-xs">
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-700 text-white rounded-sm flex items-center justify-center shadow-sm">
                        <UserMinus size={14} />
                    </div>
                    <span className="font-black text-gray-700 text-xs sm:text-sm uppercase italic tracking-tighter">P45 Service Termination Certificate</span>
                </div>
                <div className="flex gap-2">
                    {selectedEmployee && (
                        <>
                            <button onClick={() => window.print()} className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm border border-green-700 uppercase tracking-tighter hover:bg-green-700">
                                <Printer size={12} /> Print Cert
                            </button>
                            <button className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm border border-blue-700 uppercase tracking-tighter hover:bg-blue-700">
                                <Download size={12} /> Export P45
                            </button>
                        </>
                    )}
                    <button onClick={() => navigate(-1)} className="px-3 py-1 bg-gray-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm border border-gray-600 uppercase tracking-tighter hover:bg-gray-600">
                        <LogOut size={12} /> Exit Cmd
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-8">
                <div className="max-w-4xl mx-auto flex flex-col gap-6">
                    {/* Control Panel */}
                    <div className="bg-white border-2 border-gray-400 p-6 shadow-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-700"></div>
                        <h2 className="text-xs font-black text-blue-900 mb-4 uppercase tracking-[0.2em] italic border-b pb-2">Termination Protocol Interface</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Select Subject Employee</label>
                                <select
                                    onChange={handleEmployeeChange}
                                    value={selectedEmployee?.id || ''}
                                    className="w-full p-2 border border-blue-300 bg-blue-50/30 text-blue-900 font-bold outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">-- SEARCH TERMINATED INDEX --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.firstName} {emp.lastName} [{emp.employeeId}] - {emp.status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2 opacity-50 pointer-events-none">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Termination Date (ISO)</label>
                                <input type="date" className="p-2 border border-gray-300 bg-gray-50 font-bold" value={new Date().toISOString().split('T')[0]} readOnly />
                            </div>
                        </div>
                    </div>

                    {/* Certificate Preview */}
                    {selectedEmployee ? (
                        <div className="bg-white border-2 border-gray-800 p-12 shadow-2xl relative print:border-0 print:shadow-none min-h-[1000px]">
                            <div className="absolute top-8 right-12 text-center border-2 border-gray-400 p-2 transform rotate-12">
                                <div className="text-[8px] font-black text-gray-400 uppercase leading-none">Form ID</div>
                                <div className="text-sm font-black text-gray-800">P45-V2</div>
                            </div>

                            <div className="text-center mb-12 border-b-4 border-double border-gray-800 pb-8">
                                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-[0.2em]">Government of Jamaica</h1>
                                <h2 className="text-xl font-black text-gray-700 uppercase mt-2">Particulars of Employee Leaving Service</h2>
                                <p className="text-xs font-bold text-gray-500 mt-2 italic uppercase tracking-widest">Tax Administration Jamaica - Year {new Date().getFullYear()}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-8 mb-12">
                                <div className="border border-gray-800 p-6 flex flex-col gap-4">
                                    <div className="text-xs font-black bg-gray-900 text-white px-3 py-1 self-start uppercase tracking-widest mb-2">1. Registered Office Info</div>
                                    <div className="grid grid-cols-2 gap-4 text-[11px] font-bold">
                                        <div className="space-y-1">
                                            <span className="text-gray-400 uppercase text-[9px]">Employer Name:</span>
                                            <p className="uppercase">{selectedCompany?.name || 'SYNCING...'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-gray-400 uppercase text-[9px]">Employer TRN:</span>
                                            <p>{selectedCompany?.trn || '000-000-000'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-gray-800 p-6 flex flex-col gap-4">
                                    <div className="text-xs font-black bg-gray-900 text-white px-3 py-1 self-start uppercase tracking-widest mb-2">2. Employee Details</div>
                                    <div className="grid grid-cols-2 gap-y-6 text-[11px] font-bold">
                                        <div className="space-y-1">
                                            <span className="text-gray-400 uppercase text-[9px]">Family Name:</span>
                                            <p className="uppercase text-lg">{selectedEmployee.lastName}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-gray-400 uppercase text-[9px]">First Name:</span>
                                            <p className="uppercase text-lg">{selectedEmployee.firstName}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-gray-400 uppercase text-[9px]">Employee TRN:</span>
                                            <p>{selectedEmployee.trn || 'X-XXXX-XXXX'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-gray-400 uppercase text-[9px]">NIS Number:</span>
                                            <p>{selectedEmployee.nisNumber || 'X-XXXXXX-X'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-gray-400 uppercase text-[9px]">Terminal Status:</span>
                                            <p className="text-red-700 uppercase italic font-black">{selectedEmployee.status}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-gray-400 uppercase text-[9px]">Leaving Date:</span>
                                            <p>{new Date().toLocaleDateString('en-JM', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-24 p-8 border-t-2 border-gray-200">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-8 flex flex-col items-center">
                                        <div className="w-64 border-b border-gray-800"></div>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Employer Certification Signature</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 border-2 border-gray-800 p-4 mb-2">DATE: {new Date().toLocaleDateString()}</p>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Office of Registry Seal Required</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-[9px] text-gray-300 uppercase tracking-[0.5em] italic">Original Component of HRM Smart Engine v5.1.0</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-100 border-2 border-dashed border-gray-300 h-[600px] flex flex-col items-center justify-center text-center p-12">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                                <Loader2 className="text-gray-400 animate-spin" size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-400 uppercase italic tracking-widest">Awaiting Identity Target</h3>
                            <p className="text-gray-400 mt-4 max-w-sm font-bold text-xs uppercase leading-relaxed">
                                Please select a personnel record from the termination index above to generate the specialized P45 Leaving Service Certificate.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default P45Report;
