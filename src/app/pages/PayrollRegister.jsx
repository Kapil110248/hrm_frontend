import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Printer, LogOut, FileText } from 'lucide-react';
import { api } from '../../services/api';

const PayrollRegister = () => {
    const navigate = useNavigate();

    // Order Options state
    const [orderOptions, setOrderOptions] = useState({
        primaryOrder: 'None',
        primarySort: 'Ascending',
        secondaryOrder: 'None',
        secondarySort: 'Ascending',
        tertiaryOrder: 'None',
        tertiarySort: 'Ascending'
    });

    // Report Options state
    const [reportOptions, setReportOptions] = useState({
        displayYTDCurrentTrans: false,
        displayPensionRate: false,
        displayPaymentDetails: false,
        displayJobTitle: false,
        displayEmployeesPaidOnly: false,
        convertToLocalCurrency: false,
        printWideFormat: false,
        inputNarratives: false,
        displayPensionSeparately: false,
        displayPayPeriod: false
    });

    // Filter Options state
    const [filterOptions, setFilterOptions] = useState({
        payPeriod: '3',
        ofYear: '2026',
        paySeries: '',
        payGrade: '',
        employee: '',
        department: '',
        branch: '',
        location: ''
    });

    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
    const [isCompiling, setIsCompiling] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const companyStr = localStorage.getItem('selectedCompany');
                const company = companyStr ? JSON.parse(companyStr) : null;
                if (company) {
                    const [empRes, deptRes] = await Promise.all([
                        api.fetchEmployees(company.id),
                        api.fetchDepartments(company.id)
                    ]);
                    if (empRes.success) setEmployees(empRes.data);
                    if (deptRes.success) setDepartments(deptRes.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleOrderChange = (field, value) => {
        setOrderOptions(prev => ({ ...prev, [field]: value }));
        triggerRecompile();
    };

    const handleReportChange = (field) => {
        setReportOptions(prev => ({ ...prev, [field]: !prev[field] }));
        triggerRecompile();
    };

    const handleFilterChange = (field, value) => {
        setFilterOptions(prev => ({ ...prev, [field]: value }));
        triggerRecompile();
    };

    const triggerRecompile = () => {
        setIsCompiling(true);
        setTimeout(() => {
            setIsCompiling(false);
            setLastUpdated(new Date().toLocaleTimeString());
        }, 600);
    };

    const handlePreview = () => {
        navigate('/payroll/register/print', {
            state: {
                filterOptions,
                reportOptions,
                orderOptions
            }
        });
    };

    const handleExcelExport = async () => {
        const confirmExport = window.confirm("PREPARING DATA EXCHANGE: Convert matrix display to Excel (.csv) format?");
        if (!confirmExport) return;

        try {
            const companyStr = localStorage.getItem('selectedCompany');
            const company = companyStr ? JSON.parse(companyStr) : null;

            if (!company) {
                alert("ERROR: No company selected.");
                return;
            }

            // Construct period string compatible with backend (e.g. "Feb-2026" or "3-2026")
            let periodParam = filterOptions.payPeriod;
            if ((periodParam.length <= 2) && !isNaN(periodParam)) {
                const date = new Date();
                date.setMonth(parseInt(periodParam) - 1);
                periodParam = `${date.toLocaleString('default', { month: 'short' })}-${filterOptions.ofYear}`;
            }

            const res = await api.fetchPayrolls({
                companyId: company.id,
                period: periodParam
            });

            if (res.success && res.data && res.data.length > 0) {
                let filteredData = res.data;

                // Client-side filtering
                if (filterOptions.department && !filterOptions.department.includes('ALL')) {
                    filteredData = filteredData.filter(p =>
                        (p.employee?.department?.name === filterOptions.department) ||
                        (p.employee?.department === filterOptions.department)
                    );
                }

                if (filterOptions.branch && !filterOptions.branch.includes('ALL')) {
                    filteredData = filteredData.filter(p => p.employee?.branch === filterOptions.branch);
                }

                if (filterOptions.employee && !filterOptions.employee.includes('ALL')) {
                    const searchName = filterOptions.employee.split('[')[0].trim().toLowerCase();
                    const searchId = filterOptions.employee.match(/\[(.*?)\]/)?.[1]?.toLowerCase();

                    filteredData = filteredData.filter(p => {
                        const fName = p.employee?.firstName?.toLowerCase() || '';
                        const lName = p.employee?.lastName?.toLowerCase() || '';
                        const empId = p.employee?.employeeId?.toLowerCase() || '';
                        const fullName = `${fName} ${lName}`;

                        if (searchId) return empId.includes(searchId);
                        return fullName.includes(searchName);
                    });
                }

                if (filteredData.length === 0) {
                    alert("EXPORT NOTICE: No records match the current filter criteria.");
                    return;
                }

                const csvHeader = "Payroll Register Export\n" +
                    "Period," + filterOptions.payPeriod + "\n" +
                    "Year," + filterOptions.ofYear + "\n" +
                    "Sequence," + orderOptions.primaryOrder + " / " + orderOptions.secondaryOrder + "\n" +
                    "Employee ID,Name,Department,Branch,Gross Salary,Deductions,Tax,Net Pay,Status\n";

                const csvRows = filteredData.map(p => {
                    const name = `"${p.employee?.firstName} ${p.employee?.lastName}"`;
                    const dept = `"${p.employee?.department?.name || p.employee?.department || ''}"`;
                    const branch = `"${p.employee?.branch || ''}"`;
                    return `${p.employee?.employeeId || ''},${name},${dept},${branch},${p.grossSalary},${p.deductions},${p.tax},${p.netSalary},${p.status}`;
                }).join("\n");

                const csvContent = csvHeader + csvRows;

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `Payroll_Register_${periodParam}.csv`);
                link.click();

                alert(`SUCCESS: Export complete. ${filteredData.length} records processed.`);
            } else {
                alert("EXPORT WARNING: No payroll records found for the specified period.");
            }
        } catch (error) {
            console.error("Export failed:", error);
            alert("EXPORT ERROR: Failed to retrieve data from server.");
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#EBE9D8] font-sans">
            {/* Header */}
            <div className="bg-[#D4D0C8] border-b border-gray-400 px-3 py-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-700 text-white rounded-sm flex items-center justify-center shadow-sm">
                        <FileText size={14} />
                    </div>
                    <span className="font-black text-gray-700 text-xs sm:text-sm uppercase italic tracking-tighter">Payroll Register Core Engine</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-widest animate-pulse hidden sm:inline">Server Sync Active</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto">
                <div className="max-w-6xl mx-auto flex flex-col xl:flex-row gap-6">

                    {/* Main Configuration Content */}
                    <div className="flex-1 flex flex-col gap-6">

                        {/* Order Options Section */}
                        <fieldset className="border border-gray-400 p-3 sm:p-5 rounded-sm relative pt-6 sm:pt-8 bg-white/40 shadow-sm border-b-2 border-r-2">
                            <legend className="text-blue-700 px-3 font-black absolute -top-3 left-4 bg-[#EBE9D8] uppercase tracking-tighter text-[10px] sm:text-[11px] border border-gray-300 shadow-sm">
                                Sequence & Order Controls
                            </legend>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {/* Primary Order */}
                                {[
                                    { label: 'Primary Sequence', field: 'primaryOrder', sort: 'primarySort' },
                                    { label: 'Secondary Sequence', field: 'secondaryOrder', sort: 'secondarySort' },
                                    { label: 'Tertiary Sequence', field: 'tertiaryOrder', sort: 'tertiarySort' }
                                ].map((ord, i) => (
                                    <div key={ord.field} className={`flex flex-col gap-2.5 ${i > 0 ? 'sm:border-l sm:pl-6 border-gray-200' : ''}`}>
                                        <label className="text-gray-500 font-black uppercase text-[9px] tracking-widest">{ord.label}</label>
                                        <select
                                            value={orderOptions[ord.field]}
                                            onChange={(e) => handleOrderChange(ord.field, e.target.value)}
                                            className="p-2 border border-blue-300 bg-white text-blue-900 font-black shadow-inner focus:ring-1 focus:ring-blue-500 outline-none text-xs rounded-sm"
                                        >
                                            <option value="None">None (Default)</option>
                                            <option value="Employee ID">Employee ID</option>
                                            <option value="Department">Departmental Unit</option>
                                            <option value="Branch">Location / Branch</option>
                                        </select>
                                        <div className="flex gap-4 p-1">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name={ord.sort}
                                                    checked={orderOptions[ord.sort] === 'Ascending'}
                                                    onChange={() => handleOrderChange(ord.sort, 'Ascending')}
                                                    className="w-4 h-4 cursor-pointer accent-blue-600"
                                                />
                                                <span className="group-hover:text-blue-700 font-black text-[10px] uppercase tracking-tighter">Ascending</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name={ord.sort}
                                                    checked={orderOptions[ord.sort] === 'Descending'}
                                                    onChange={() => handleOrderChange(ord.sort, 'Descending')}
                                                    className="w-4 h-4 cursor-pointer accent-blue-600"
                                                />
                                                <span className="group-hover:text-blue-700 font-black text-[10px] uppercase tracking-tighter">Descending</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </fieldset>

                        {/* Report & Filter Container */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Report Options Section */}
                            <fieldset className="border border-gray-400 p-4 sm:p-6 rounded-sm relative pt-6 sm:pt-8 bg-white/40 shadow-sm border-b-2 border-r-2">
                                <legend className="text-blue-700 px-3 font-black absolute -top-3 left-4 bg-[#EBE9D8] uppercase tracking-tighter text-[10px] sm:text-[11px] border border-gray-300 shadow-sm">
                                    Display Matrix Options
                                </legend>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                                    {[
                                        { id: 'displayYTDCurrentTrans', label: 'YTD For Current Trans Only' },
                                        { id: 'inputNarratives', label: 'Include Logic Narratives' },
                                        { id: 'displayPensionRate', label: 'Show Pensioner Rate' },
                                        { id: 'displayPensionSeparately', label: 'Separate Pension (Vol/Req)' },
                                        { id: 'displayPaymentDetails', label: 'Show Bank Disbursement Info' },
                                        { id: 'displayPayPeriod', label: 'Show Pay Period Ident' },
                                        { id: 'displayJobTitle', label: 'Include Personnel Job Titles' },
                                        { id: 'displayEmployeesPaidOnly', label: 'Paid Personnel Records Only' },
                                        { id: 'convertToLocalCurrency', label: 'FX Master Conversion' },
                                        { id: 'printWideFormat', label: 'Wide Landscape Format' }
                                    ].map(opt => (
                                        <label key={opt.id} className="flex items-center gap-3 cursor-pointer group hover:bg-white/60 p-1.5 sm:p-2 rounded transition-colors border border-transparent hover:border-gray-200">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 cursor-pointer accent-blue-600 shrink-0"
                                                checked={reportOptions[opt.id]}
                                                onChange={() => handleReportChange(opt.id)}
                                            />
                                            <span className="text-[10px] font-black text-gray-700 group-hover:text-blue-800 leading-tight uppercase tracking-tight">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            {/* Filter Options Section */}
                            <fieldset className="border border-gray-400 p-4 sm:p-6 rounded-sm relative pt-6 sm:pt-8 bg-white/40 shadow-sm border-b-2 border-r-2">
                                <legend className="text-blue-700 px-3 font-black absolute -top-3 left-4 bg-[#EBE9D8] uppercase tracking-tighter text-[10px] sm:text-[11px] border border-gray-300 shadow-sm">
                                    Strategic Scope Filtering
                                </legend>

                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-wrap items-center gap-4 bg-[#D4D0C8]/30 p-3 border border-gray-300 shadow-inner rounded-sm">
                                        <div className="flex items-center gap-2">
                                            <label className="text-gray-500 font-black uppercase text-[9px] tracking-widest">Period</label>
                                            <input
                                                type="text"
                                                value={filterOptions.payPeriod}
                                                onChange={(e) => handleFilterChange('payPeriod', e.target.value)}
                                                className="w-12 p-1.5 border border-blue-200 bg-white text-blue-900 font-black text-center shadow-inner"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest">Master Year</span>
                                            <input
                                                type="text"
                                                value={filterOptions.ofYear}
                                                onChange={(e) => handleFilterChange('ofYear', e.target.value)}
                                                className="w-20 p-1.5 border border-blue-200 bg-white text-blue-900 font-black text-center shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    {[
                                        { id: 'paySeries', label: 'Pay Series', options: ['-- ALL ACTIVE SERIES --', 'Weekly (W01)', 'Bi-Weekly (B01)', 'Monthly (M01)'] },
                                        { id: 'payGrade', label: 'Hierarchy', options: ['-- ALL SERVICE GRADES --', 'GRADE 1', 'GRADE 2', 'GRADE 3', 'EXECUTIVE'] },
                                        { id: 'employee', label: 'Personnel', options: ['-- ALL STAFF MEMBERS --', ...employees.map(e => `${e.firstName} ${e.lastName} [${e.employeeId}]`)] },
                                        { id: 'department', label: 'Unit / Dept', options: ['-- ALL COST CENTERS --', ...departments.map(d => d.name)] },
                                        { id: 'branch', label: 'Location', options: ['-- ALL REGIONAL BRANCHES --', 'Kingston HQ', 'Montego Bay', 'Ocho Rios'] }
                                    ].map(filter => (
                                        <div key={filter.id} className="flex flex-col gap-1.5">
                                            <label className="text-gray-500 font-black uppercase text-[9px] tracking-[0.2em]">{filter.label}</label>
                                            <select
                                                value={filterOptions[filter.id]}
                                                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                                                className="w-full p-2.5 border border-gray-300 bg-white text-blue-900 font-black shadow-sm outline-none text-[11px] uppercase tracking-tight rounded-sm"
                                            >
                                                {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                        </div>

                        {/* Live Preview Pane */}
                        <div className="bg-white border-2 border-gray-500 shadow-lg p-4 relative overflow-hidden flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-black text-blue-900 uppercase italic text-[11px] flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isCompiling ? 'bg-orange-500 animate-ping' : 'bg-green-500'}`}></div>
                                    Live Matrix Strategy Preview
                                </span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase italic">Last Compiled: {lastUpdated}</span>
                            </div>

                            <div className="bg-gray-50 p-4 border border-dashed border-gray-300 min-h-[140px] flex flex-col gap-3">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase">Sort Hierarchy</p>
                                        <p className="text-[10px] font-black italic text-blue-800 uppercase tracking-tighter">
                                            {orderOptions.primaryOrder} <span className="text-gray-400">→</span> {orderOptions.secondaryOrder}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase">Scope Target</p>
                                        <p className="text-[10px] font-black italic text-gray-800 uppercase tracking-tighter truncate">
                                            {filterOptions.department === '-- ALL COST CENTERS --' ? 'FULL UNIT' : filterOptions.department}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase">Matrix Mode</p>
                                        <p className="text-[10px] font-black italic text-gray-800 uppercase tracking-tighter">
                                            {reportOptions.printWideFormat ? 'LANDSCAPE (A3)' : 'PORTRAIT (A4)'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase">Deduction Logic</p>
                                        <p className="text-[10px] font-black italic text-green-700 uppercase tracking-tighter">
                                            {reportOptions.displayPensionSeparately ? 'SPLIT PENSION' : 'STANDARD PENSION'}
                                        </p>
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-2">
                                    {Object.entries(reportOptions).filter(([_, v]) => v).map(([k]) => (
                                        <span key={k} className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full font-black uppercase text-[7px] tracking-widest italic animate-in fade-in zoom-in duration-300">
                                            {k.replace('display', '').replace(/([A-Z])/g, ' $1').trim()} ACTIVE
                                        </span>
                                    ))}
                                    {Object.values(reportOptions).every(v => !v) && <span className="text-[9px] italic text-gray-300 uppercase font-bold tracking-widest">No matrix overrides active. Using default Engine logic.</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Hub - Side on Desktop, Bottom Sticky on Mobile */}
                    <div className="flex flex-row xl:flex-col gap-3 w-full xl:w-32 shrink-0 mt-4 xl:mt-0 mb-6 xl:mb-0">
                        <button
                            onClick={handlePreview}
                            className="flex-1 xl:flex-none flex flex-col items-center justify-center p-4 border border-gray-400 border-b-4 border-r-4 border-gray-600 bg-white text-blue-900 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:translate-y-1 active:border-b-0 active:border-r-0 group rounded-sm"
                        >
                            <Eye size={28} className="text-blue-600 group-hover:text-white mb-2 transition-transform group-hover:scale-110" />
                            <span className="font-black uppercase tracking-[0.1em] text-[10px]">Preview</span>
                        </button>

                        <button
                            onClick={handleExcelExport}
                            className="flex-1 xl:flex-none flex flex-col items-center justify-center p-4 border border-gray-400 border-b-4 border-r-4 border-gray-600 bg-white text-gray-800 hover:bg-gray-800 hover:text-white transition-all shadow-lg active:translate-y-1 active:border-b-0 active:border-r-0 group rounded-sm"
                        >
                            <Printer size={28} className="text-gray-700 group-hover:text-white mb-2 transition-transform group-hover:scale-110" />
                            <span className="font-black uppercase tracking-[0.1em] text-[10px]">Excel / CSV</span>
                        </button>

                        <div className="hidden xl:block xl:flex-1"></div>

                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 xl:flex-none flex flex-col items-center justify-center p-4 border border-gray-400 border-b-4 border-r-4 border-gray-600 bg-white text-red-700 hover:bg-red-600 hover:text-white transition-all shadow-lg active:translate-y-1 active:border-b-0 active:border-r-0 group rounded-sm"
                        >
                            <LogOut size={28} className="text-red-600 group-hover:text-white mb-2 transition-transform group-hover:scale-110" />
                            <span className="font-black uppercase tracking-[0.1em] text-[10px]">Exit Cmd</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Footer - Fully Responsive */}
            <div className="bg-[#D4D0C8] border-t border-gray-400 px-3 sm:px-6 py-2 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 text-[9px] font-black text-gray-500 shadow-inner">
                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-center sm:justify-start">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_green]"></div> DB: HRM_{filterOptions.ofYear}_LIVE</span>
                    <span className="border-l border-gray-400 pl-4 uppercase">PERIOD: {filterOptions.payPeriod}-{filterOptions.ofYear}</span>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-center sm:justify-end border-t sm:border-t-0 border-gray-300 pt-2 sm:pt-0">
                    <span className="uppercase tracking-widest hidden xs:inline">Operator: ADMIN-01</span>
                    <span className="text-blue-800 font-black tracking-tighter italic">SMARTHRM ENGINE v5.1.0-A</span>
                </div>
            </div>
        </div>
    );
};

export default PayrollRegister;
