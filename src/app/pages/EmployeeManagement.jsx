import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
    Save, LogOut, Plus, Trash2, RefreshCw, Search,
    User, DollarSign, ShieldCheck, Phone, MapPin, Briefcase,
    CreditCard, FileText, Mail, Clock, Calendar, History,
    Download, FileSpreadsheet
} from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const EmployeeManagement = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Personal');
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    // ... (rest of state logic remains identical to preserve functionality as per rules)
    const [formData, setFormData] = useState({
        employeeId: '', firstName: '', lastName: '', middleName: '', email: '', phone: '', dob: '', gender: 'Male', maritalStatus: 'Single',
        street: '', city: '', parish: '', country: 'Jamaica',
        trn: '', nisNumber: '', nhtNumber: '',
        emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
        department: '', designation: '', joinDate: '', status: 'Active', employmentType: 'Full-Time',
        payFrequency: 'Monthly', currency: 'JMD', paymentMethod: 'Bank Transfer', bankName: '', bankAccount: '',
        salaryType: 'Salaried', baseSalary: '0', hourlyRate: '0',
        lunchAllowance: '0', travelAllowance: '0', healthInsurance: '0', pensionPercent: '0', unionDues: '0',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [payrollHistory, setPayrollHistory] = useState([]);
    const [users, setUsers] = useState([]);
    const [linkedUser, setLinkedUser] = useState(null);
    const [userFormData, setUserFormData] = useState({ username: '', password: '', role: 'STAFF' });

    const fetchData = async () => {
        if (!selectedCompany.id) return;
        setIsLoading(true);
        try {
            const res = await api.fetchEmployees(selectedCompany.id);
            if (res.success) setEmployees(res.data);

            const deptRes = await api.fetchDepartments(selectedCompany.id);
            if (deptRes.success) setDepartments(deptRes.data);

            const userRes = await api.fetchUsers();
            if (userRes.success) setUsers(userRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedCompany.id]);

    const fetchHistory = async (employeeId) => {
        try {
            const res = await api.fetchPayrolls({ employeeId });
            if (res.success) setPayrollHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEmployees = async () => {
        if (!selectedCompany.id) return;
        try {
            const res = await api.fetchEmployees(selectedCompany.id);
            if (res.success) setEmployees(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    const handleNew = () => {
        setFormData({
            employeeId: '', firstName: '', lastName: '', middleName: '', email: '', phone: '', dob: '', gender: 'Male', maritalStatus: 'Single',
            street: '', city: '', parish: '', country: 'Jamaica',
            trn: '', nisNumber: '', nhtNumber: '',
            emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
            department: '', designation: '', joinDate: '', status: 'Active', employmentType: 'Full-Time',
            payFrequency: 'Monthly', currency: 'JMD', paymentMethod: 'Bank Transfer', bankName: '', bankAccount: '',
            salaryType: 'Salaried', baseSalary: '0', hourlyRate: '0',
            lunchAllowance: '0', travelAllowance: '0', healthInsurance: '0', pensionPercent: '0', unionDues: '0',
        });
        setSelectedRow(null);
        setPayrollHistory([]);
        setIsEditing(true);
    };
    /* ... rest of logic ... */
    const handleSave = async () => {
        if (!formData.employeeId || !formData.firstName || !formData.lastName) {
            alert('Employee ID, First Name, and Last Name are required.');
            return;
        }

        if (!selectedCompany.id) {
            alert('Session error: No company context found. Please re-select company.');
            return;
        }

        setIsLoading(true);
        try {
            const dataToSave = { ...formData, companyId: selectedCompany.id };
            let res;
            if (selectedRow) {
                res = await api.updateEmployee(selectedRow, dataToSave);
            } else {
                res = await api.createEmployee(dataToSave);
            }

            if (res.success) {
                await fetchEmployees();
                setIsEditing(false);
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert(err.message || 'Action failed. Please check your network connection.');
        } finally {
            setIsLoading(false);
        }
    };
    const handleRowClick = (emp) => {
        setSelectedRow(emp.id);
        fetchHistory(emp.id);
        const initialForm = {
            employeeId: '', firstName: '', lastName: '', middleName: '', email: '', phone: '', dob: '', gender: 'Male', maritalStatus: 'Single',
            street: '', city: '', parish: '', country: 'Jamaica',
            trn: '', nisNumber: '', nhtNumber: '',
            emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
            department: '', designation: '', joinDate: '', status: 'Active', employmentType: 'Full-Time',
            payFrequency: 'Monthly', currency: 'JMD', paymentMethod: 'Bank Transfer', bankName: '', bankAccount: '',
            salaryType: 'Salaried', baseSalary: '0', hourlyRate: '0',
            lunchAllowance: '0', travelAllowance: '0', healthInsurance: '0', pensionPercent: '0', unionDues: '0',
        };

        setFormData({
            ...initialForm,
            ...emp,
            dob: emp.dob ? emp.dob.split('T')[0] : '',
            joinDate: emp.joinDate ? emp.joinDate.split('T')[0] : '',
            department: emp.departmentId || '',
            baseSalary: emp.baseSalary ? emp.baseSalary.toString() : '0',
            hourlyRate: emp.hourlyRate ? emp.hourlyRate.toString() : '0',
            lunchAllowance: emp.lunchAllowance ? emp.lunchAllowance.toString() : '0',
            travelAllowance: emp.travelAllowance ? emp.travelAllowance.toString() : '0',
            healthInsurance: emp.healthInsurance ? emp.healthInsurance.toString() : '0',
            pensionPercent: emp.pensionPercent ? emp.pensionPercent.toString() : '0',
            unionDues: emp.unionDues ? emp.unionDues.toString() : '0',
        });

        // Find linked user
        const user = users.find(u => u.email === emp.email);
        setLinkedUser(user || null);
        setUserFormData({
            username: user ? user.username : `${emp.firstName} ${emp.lastName}`,
            password: '',
            role: user ? user.role : 'STAFF'
        });

        setIsEditing(false);
    };
    const filteredEmployees = employees.filter(emp => emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-JM', { minimumFractionDigits: 2 }).format(val || 0);
    };

    const handleExportExcel = () => {
        const dataToExport = employees.map(emp => ({
            'Employee ID': emp.employeeId,
            'First Name': emp.firstName,
            'Last Name': emp.lastName,
            'Email': emp.email,
            'Phone': emp.phone,
            'Designation': emp.designation,
            'Department': departments.find(d => d.id === emp.departmentId)?.name || 'N/A',
            'Join Date': emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : 'N/A',
            'Status': emp.status
        }));
        exportToExcel(dataToExport, `Employee_Directory_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportPDF = () => {
        const columns = [
            { header: 'ID', accessor: 'employeeId' },
            { header: 'First Name', accessor: 'firstName' },
            { header: 'Last Name', accessor: 'lastName' },
            { header: 'Designation', accessor: 'designation' },
            { header: 'Status', accessor: 'status' }
        ];
        exportToPDF(columns, employees, `Employee_Directory_${new Date().toISOString().split('T')[0]}`, 'Personnel Directory Master List');
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#F5F5F7] font-sans text-gray-900">
            {/* Action Bar */}
            <div className="bg-white border-b border-gray-300 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-20">
                <div className="flex flex-col">
                    <h1 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Personnel Directory</h1>
                    <p className="text-gray-400 text-[9px] uppercase font-bold tracking-widest">Master Employee Files</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 p-1 rounded-md mr-2 border border-gray-200">
                        <button
                            onClick={handleExportExcel}
                            title="Export to Excel"
                            className="p-2 text-green-700 hover:bg-white hover:shadow-sm rounded transition-all group border border-transparent hover:border-green-200"
                        >
                            <FileSpreadsheet size={16} />
                        </button>
                        <button
                            onClick={handleExportPDF}
                            title="Export to PDF"
                            className="p-2 text-red-700 hover:bg-white hover:shadow-sm rounded transition-all group border border-transparent hover:border-red-200"
                        >
                            <FileText size={16} />
                        </button>
                    </div>
                    <button onClick={handleNew} className="px-4 py-2 bg-gray-800 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors">
                        Add Record
                    </button>
                    {isEditing ? (
                        <button onClick={handleSave} className="px-4 py-2 bg-gray-800 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors">
                            Commit Changes
                        </button>
                    ) : (
                        <button
                            onClick={() => { if (!selectedRow) return; setIsEditing(true); }}
                            className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors ${selectedRow ? 'bg-gray-800 text-white hover:bg-gray-900' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        >
                            Modify Data
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-1 bg-white border-2 border-gray-400 text-[11px] font-black text-gray-800 hover:bg-gray-50 transition-all shadow-sm active:translate-y-0.5 group"
                    >
                        <LogOut size={14} className="text-gray-600 group-hover:text-red-600" />
                        <span>Close</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* List Panel */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-300" size={12} />
                            <input
                                type="text"
                                placeholder="Search by ID or Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded text-[11px] focus:outline-none focus:border-gray-400 text-gray-700 font-medium"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {isLoading && employees.length === 0 && (
                            <div className="p-8 text-center">
                                <RefreshCw className="animate-spin mx-auto text-gray-300 mb-2" size={20} />
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Synchronizing...</span>
                            </div>
                        )}
                        {filteredEmployees.map(emp => (
                            <div
                                key={emp.id}
                                onClick={() => handleRowClick(emp)}
                                className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${selectedRow === emp.id ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-[11px] uppercase truncate">{emp.firstName} {emp.lastName}</span>
                                    <span className={`text-[8px] font-black uppercase tracking-tighter shrink-0 ${emp.status === 'Active' ? 'text-green-500' : 'text-gray-400'}`}>{emp.status}</span>
                                </div>
                                <div className={`text-[9px] font-bold uppercase tracking-widest ${selectedRow === emp.id ? 'text-gray-400' : 'text-gray-400'}`}>
                                    {emp.employeeId} — {emp.designation}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details Panel */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-sm rounded overflow-hidden">
                        {/* Tab Bar */}
                        <div className="flex border-b border-gray-200 bg-gray-50 px-2">
                            {[
                                { id: 'Personal', label: 'Identity' },
                                { id: 'Employment', label: 'Job Role' },
                                { id: 'Payroll', label: 'Salary Config' },
                                { id: 'Statutory', label: 'Taxation' },
                                { id: 'Security', label: 'Login Access' },
                                { id: 'History', label: 'Ledger Audit' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === tab.id
                                        ? 'text-gray-900 border-b-2 border-gray-900'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 min-h-[500px]">
                            {activeTab === 'Personal' && (
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    <SectionTitle title="Identity" />
                                    <InputField label="First Name" value={formData.firstName} onChange={(v) => handleInputChange('firstName', v)} disabled={!isEditing} />
                                    <InputField label="Last Name" value={formData.lastName} onChange={(v) => handleInputChange('lastName', v)} disabled={!isEditing} />
                                    <InputField label="Employee ID" value={formData.employeeId} onChange={(v) => handleInputChange('employeeId', v)} disabled={!isEditing} />
                                    <InputField label="DOB" type="date" value={formData.dob} onChange={(v) => handleInputChange('dob', v)} disabled={!isEditing} />

                                    <SectionTitle title="Communication" />
                                    <InputField label="Email" type="email" value={formData.email} onChange={(v) => handleInputChange('email', v)} disabled={!isEditing} />
                                    <InputField label="Phone" value={formData.phone} onChange={(v) => handleInputChange('phone', v)} disabled={!isEditing} />
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Street Address</label>
                                        <input type="text" value={formData.street} onChange={(e) => handleInputChange('street', e.target.value)} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded text-sm font-medium focus:ring-0 focus:border-gray-500 outline-none" />
                                    </div>
                                    <InputField label="Parish" value={formData.parish} onChange={(v) => handleInputChange('parish', v)} disabled={!isEditing} />
                                    <InputField label="City" value={formData.city} onChange={(v) => handleInputChange('city', v)} disabled={!isEditing} />
                                </div>
                            )}

                            {activeTab === 'Employment' && (
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    <SectionTitle title="Job Profile" />
                                    <div className="flex flex-col">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Department</label>
                                        <select
                                            value={formData.department}
                                            onChange={(e) => handleInputChange('department', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full p-2 border border-gray-300 rounded text-sm font-medium focus:ring-0 focus:border-gray-500 outline-none disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                                        >
                                            <option value="">Select...</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputField label="Designation" value={formData.designation} onChange={(v) => handleInputChange('designation', v)} disabled={!isEditing} />
                                    <InputField label="Join Date" type="date" value={formData.joinDate} onChange={(v) => handleInputChange('joinDate', v)} disabled={!isEditing} />
                                    <SelectField label="Status" value={formData.status} onChange={(v) => handleInputChange('status', v)} options={['Active', 'On Leave', 'Resigned']} disabled={!isEditing} />
                                </div>
                            )}

                            {activeTab === 'Payroll' && (
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    <SectionTitle title="Disbursement" />
                                    <SelectField label="Method" value={formData.paymentMethod} onChange={(v) => handleInputChange('paymentMethod', v)} options={['Bank Transfer', 'Cheque']} disabled={!isEditing} />
                                    <SelectField label="Frequency" value={formData.payFrequency} onChange={(v) => handleInputChange('payFrequency', v)} options={['Weekly', 'Monthly']} disabled={!isEditing} />

                                    <div className="col-span-2 p-4 bg-gray-50 border border-gray-200 rounded grid grid-cols-2 gap-8">
                                        <SelectField label="Salary Type" value={formData.salaryType} onChange={(v) => handleInputChange('salaryType', v)} options={['Salaried', 'Hourly']} disabled={!isEditing} />
                                        <InputField label="Base Rate (JMD)" type="number" value={formData.salaryType === 'Salaried' ? formData.baseSalary : formData.hourlyRate} onChange={(v) => handleInputChange(formData.salaryType === 'Salaried' ? 'baseSalary' : 'hourlyRate', v)} disabled={!isEditing} />
                                    </div>

                                    <SectionTitle title="Bank Integration" />
                                    <SelectField label="Bank" value={formData.bankName} onChange={(v) => handleInputChange('bankName', v)} options={['NCB', 'Scotiabank', 'JN Bank']} disabled={!isEditing} />
                                    <InputField label="Account #" value={formData.bankAccount} onChange={(v) => handleInputChange('bankAccount', v)} disabled={!isEditing} />
                                </div>
                            )}

                            {activeTab === 'Statutory' && (
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    <SectionTitle title="Government Identifiers" />
                                    <div className="space-y-4">
                                        <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                                                <label className="block text-[11px] font-black text-blue-900 uppercase tracking-[0.2em]">TRN (Taxpayer Registration Number)</label>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.trn}
                                                onChange={(e) => handleInputChange('trn', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="XXX-XXX-XXX"
                                                className="w-full p-2.5 border border-gray-300 rounded bg-white text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100/50 disabled:text-gray-500 transition-all font-mono"
                                            />
                                            <p className="mt-2 text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">
                                                Essential for payroll tax compliance. Issued by <span className="text-blue-700">Tax Administration Jamaica (TAJ)</span>.
                                            </p>
                                        </div>

                                        <div className="bg-green-50/50 p-4 border border-green-100 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
                                                <label className="block text-[11px] font-black text-green-900 uppercase tracking-[0.2em]">NIS Number (Social Security)</label>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.nisNumber}
                                                onChange={(e) => handleInputChange('nisNumber', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="X-XX-XX-XX-X"
                                                className="w-full p-2.5 border border-gray-300 rounded bg-white text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100/50 disabled:text-gray-500 transition-all font-mono"
                                            />
                                            <p className="mt-2 text-[9px] text-green-700 font-bold uppercase tracking-wider leading-relaxed">
                                                National Insurance Scheme reference for social security benefits and pension tracking.
                                            </p>
                                        </div>

                                        <div className="bg-orange-50/50 p-4 border border-orange-100 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-6 bg-orange-600 rounded-full"></div>
                                                <label className="block text-[11px] font-black text-orange-900 uppercase tracking-[0.2em]">NHT Number (Housing Trust)</label>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.nhtNumber}
                                                onChange={(e) => handleInputChange('nhtNumber', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="XXXXXXXXX"
                                                className="w-full p-2.5 border border-gray-300 rounded bg-white text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-100/50 disabled:text-gray-500 transition-all font-mono"
                                            />
                                            <p className="mt-2 text-[9px] text-orange-700 font-bold uppercase tracking-wider leading-relaxed">
                                                National Housing Trust identification for housing contribution deductions.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Security' && (
                                <div className="space-y-8">
                                    <SectionTitle title="Login Provisioning" />
                                    {!formData.email ? (
                                        <div className="p-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded">
                                            <Mail className="mx-auto text-gray-300 mb-2" size={32} />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email required to provision login</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                            <div className="col-span-2 flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${linkedUser ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                    <ShieldCheck size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-800 uppercase tracking-widest">
                                                        {linkedUser ? 'LOGIN ACTIVE' : 'NO LOGIN DETECTED'}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-gray-400">
                                                        {linkedUser ? `System account linked to ${formData.email}` : `Click "Provision" to enable dashboard access for ${formData.email}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <InputField
                                                label="System Username"
                                                value={userFormData.username}
                                                onChange={(v) => setUserFormData({ ...userFormData, username: v })}
                                                disabled={!isEditing}
                                            />
                                            <SelectField
                                                label="Access Role"
                                                value={userFormData.role}
                                                onChange={(v) => setUserFormData({ ...userFormData, role: v })}
                                                options={['STAFF', 'FINANCE', 'HR_MANAGER', 'ADMIN']}
                                                disabled={!isEditing}
                                            />
                                            <div className="col-span-2">
                                                <InputField
                                                    label={linkedUser ? "Reset Password (Leave blank to keep current)" : "Initial Password"}
                                                    type="password"
                                                    value={userFormData.password}
                                                    onChange={(v) => setUserFormData({ ...userFormData, password: v })}
                                                    disabled={!isEditing}
                                                />
                                            </div>

                                            {isEditing && (
                                                <div className="col-span-2 flex justify-end">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                setIsLoading(true);
                                                                const payload = {
                                                                    ...userFormData,
                                                                    email: formData.email
                                                                };
                                                                let res;
                                                                if (linkedUser) {
                                                                    res = await api.updateSystemUser(linkedUser.id, payload);
                                                                } else {
                                                                    if (!userFormData.password) {
                                                                        alert("Password is required for new accounts.");
                                                                        setIsLoading(false);
                                                                        return;
                                                                    }
                                                                    res = await api.createSystemUser(payload);
                                                                }

                                                                if (res.success) {
                                                                    alert(linkedUser ? "User updated successfully." : "User provisioned successfully!");
                                                                    const userRes = await api.fetchUsers();
                                                                    if (userRes.success) {
                                                                        setUsers(userRes.data);
                                                                        const newUser = userRes.data.find(u => u.email === formData.email);
                                                                        setLinkedUser(newUser);
                                                                    }
                                                                } else {
                                                                    alert(res.message);
                                                                }
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert("Login provisioning failed.");
                                                            } finally {
                                                                setIsLoading(false);
                                                            }
                                                        }}
                                                        className="px-6 py-2 bg-blue-600 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all active:scale-95"
                                                    >
                                                        {linkedUser ? "Update Identity" : "Provision Login"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'History' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payroll Audit Log</h3>
                                    </div>
                                    <div className="border border-gray-200 rounded overflow-hidden">
                                        <table className="w-full text-[10px] text-left">
                                            <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-4 py-3">Period</th>
                                                    <th className="px-4 py-3">Posted</th>
                                                    <th className="px-4 py-3 text-right">Gross</th>
                                                    <th className="px-4 py-3 text-right">Net</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                                {payrollHistory.length > 0 ? (
                                                    payrollHistory.map(item => (
                                                        <tr key={item.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 uppercase">{item.month} {item.year}</td>
                                                            <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                                                            <td className="px-4 py-3 text-right">{formatCurrency(item.grossSalary)}</td>
                                                            <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(item.netSalary)}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-400 italic">No payroll history recorded for this employee.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionTitle = ({ title }) => (
    <div className="col-span-2 pb-2 border-b border-gray-100 mb-2 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</div>
);

const InputField = ({ label, value, onChange, type = "text", disabled = false, placeholder = "" }) => (
    <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full p-2 border border-gray-300 rounded text-sm font-medium focus:ring-0 focus:border-gray-500 outline-none disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
        />
    </div>
);

const SelectField = ({ label, value, onChange, options, disabled = false }) => (
    <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full p-2 border border-gray-300 rounded text-sm font-medium focus:ring-0 focus:border-gray-500 outline-none disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
        >
            <option value="">Select...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default EmployeeManagement;
