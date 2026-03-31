import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Download, Upload, CheckCircle, Printer,
    Save, LogOut, ShieldCheck, Landmark, Search, Loader2
} from 'lucide-react';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';

const JamaicaStatutory = ({ type = 'S01' }) => {
    const navigate = useNavigate();
    const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [loading, setLoading] = useState(false);
    const [payrollData, setPayrollData] = useState([]);
    const [company, setCompany] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [validationWarnings, setValidationWarnings] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showPreview, setShowPreview] = useState(false);

    // Helper to format period for API (YYYY-MM to MMM-YYYY)
    const formatPeriodForApi = (p) => {
        if (!p) return '';
        const [year, month] = p.split('-');
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const monthIndex = parseInt(month) - 1;
        return `${monthNames[monthIndex]}-${year}`;
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            const companyStr = localStorage.getItem('selectedCompany');
            const c = companyStr ? JSON.parse(companyStr) : null;
            setCompany(c);

            if (!c) return;

            // If P45, fetch employees as well
            if (type === 'P45') {
                try {
                    const empRes = await api.fetchEmployees(c.id);
                    if (empRes.success) {
                        setEmployees(empRes.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch employees", err);
                }
            }
        };
        fetchInitialData();
    }, [type]);

    useEffect(() => {
        const fetchReportData = async () => {
            if (!company) return;

            setLoading(true);
            try {
                const [year] = period.split('-');
                let res;

                if (type === 'S02' || type === 'NIS-NHT') {
                    // For Annual reports, fetch the yearly summary
                    res = await api.fetchStatutorySummary({
                        companyId: company.id,
                        year: year
                    });
                } else {
                    // For Monthly reports (S01, P45)
                    const params = { companyId: company.id };
                    if (type !== 'P45') {
                        params.period = formatPeriodForApi(period);
                    }
                    if (selectedEmployeeId) {
                        params.employeeId = selectedEmployeeId;
                    }
                    res = await api.fetchPayrolls(params);
                }

                if (res.success) {
                    const data = res.data;
                    const warnings = [];
                    const clean = [];

                    data.forEach(p => {
                        const emp = p.employee || p; // Handle different structures for S01 vs S02
                        const name = p.employeeName || `${emp.firstName} ${emp.lastName}`;
                        const trn = emp.trn || '';

                        const errors = [];
                        if (!trn) errors.push("Missing TRN");
                        else if (!/^\d{9}$/.test(trn.replace(/\D/g, ''))) errors.push("TRN must be exactly 9 digits");

                        if (!emp.nisNumber) errors.push("Missing NIS");
                        if (!emp.nhtNumber) errors.push("Missing NHT");
                        if (!emp.dob) errors.push("Missing Date of Birth");

                        if (errors.length > 0) {
                            warnings.push(`Employee ${name} excluded: ${errors.join(', ')}`);
                        } else {
                            clean.push(p);
                        }
                    });

                    setValidationWarnings(warnings);
                    setFilteredData(clean);
                    setPayrollData(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [period, type, selectedEmployeeId, company]);

    const reports = {
        'P45': {
            title: 'P45 - Employee Termination Certificate',
            formCode: 'F-P45-TAJ',
            fields: [
                {
                    label: 'Cumulative Gross Pay',
                    category: 'Financials',
                    value: (data) => {
                        const [year] = period.split('-');
                        const yearData = data.filter(p => p.period.includes(year) && p.employeeId === selectedEmployeeId);
                        return yearData.reduce((sum, p) => sum + parseFloat(p.grossSalary || 0), 0).toFixed(2);
                    }
                },
                {
                    label: 'Cumulative Income Tax',
                    category: 'Financials',
                    value: (data) => {
                        const [year] = period.split('-');
                        const yearData = data.filter(p => p.period.includes(year) && p.employeeId === selectedEmployeeId);
                        return yearData.reduce((sum, p) => sum + parseFloat(p.tax || 0), 0).toFixed(2);
                    }
                },
                {
                    label: 'Total PAYE (This Period)',
                    category: 'Financials',
                    value: (data) => {
                        const current = data.find(p => p.period === formatPeriodForApi(period) && p.employeeId === selectedEmployeeId);
                        return parseFloat(current?.paye || 0).toFixed(2);
                    }
                },
                { label: 'Employer TRN', category: 'Entity', value: () => company?.trn || 'NOT_FOUND' },
                {
                    label: 'Employee TRN',
                    category: 'Entity',
                    value: () => {
                        const emp = employees.find(e => e.id === selectedEmployeeId);
                        return emp?.trn || 'NOT_FOUND';
                    }
                },
                {
                    label: 'NIS Number',
                    category: 'Entity',
                    value: () => {
                        const emp = employees.find(e => e.id === selectedEmployeeId);
                        return emp?.nisNumber || emp?.nis || 'NOT_FOUND';
                    }
                }
            ]
        },
        'NIS-NHT': {
            title: 'NIS / NHT Statutory Contributions',
            formCode: 'F-NIS/NHT-ANNUAL',
            fields: [
                { label: 'Gross Pay for Period', category: 'Financials', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.grossSalary || 0), 0).toFixed(2) },
                // Use stored NIS/NHT for Employee
                { label: 'NIS Employee (3%)', category: 'Financials', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.nis || 0), 0).toFixed(2) },
                // Calculate Employer NIS (3% of Gross)
                { label: 'NIS Employer (3%)', category: 'Financials', value: (data) => data.reduce((sum, p) => sum + (parseFloat(p.grossSalary || 0) * 0.03), 0).toFixed(2) },
                // Use stored NHT for Employee
                { label: 'NHT Employee (2%)', category: 'Financials', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.nht || 0), 0).toFixed(2) },
                // Calculate Employer NHT (3% of Gross)
                { label: 'NHT Employer (3%)', category: 'Financials', value: (data) => data.reduce((sum, p) => sum + (parseFloat(p.grossSalary || 0) * 0.03), 0).toFixed(2) }
            ]
        },
        'S01': {
            title: 'S01 - Monthly Statutory Remittance',
            formCode: 'F-S01-MONTHLY',
            fields: [
                // PAYE (Income Tax) - Use stored value
                { label: 'PAYE Liability', category: 'Taxation', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.paye || 0), 0).toFixed(2) },
                // Ed Tax Employee (2.25%) - Use stored value
                { label: 'Education Tax (EE 2.25%)', category: 'Taxation', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.edTax || 0), 0).toFixed(2) },
                // Ed Tax Employer (3.5%) - Calculated on (Gross - NIS) to match backend logic for Ed Tax Base
                {
                    label: 'Education Tax (ER 3.5%)', category: 'Taxation', value: (data) => data.reduce((sum, p) => {
                        const gross = parseFloat(p.grossSalary || 0);
                        const nis = parseFloat(p.nis || 0);
                        const statIncome = gross - nis;
                        return sum + (statIncome > 0 ? statIncome * 0.035 : 0);
                    }, 0).toFixed(2)
                },
                // NIS Total (EE stored + ER calculated)
                {
                    label: 'NIS Total (6%)', category: 'Social Security', value: (data) => data.reduce((sum, p) => {
                        const gross = parseFloat(p.grossSalary || 0);
                        const ee = parseFloat(p.nis || 0);
                        const er = gross * 0.03;
                        return sum + ee + er;
                    }, 0).toFixed(2)
                },
                // NHT Total (EE stored + ER calculated)
                {
                    label: 'NHT Total (5%)', category: 'Housing', value: (data) => data.reduce((sum, p) => {
                        const gross = parseFloat(p.grossSalary || 0);
                        const ee = parseFloat(p.nht || 0);
                        const er = gross * 0.03;
                        return sum + ee + er;
                    }, 0).toFixed(2)
                },
                // HEART (3% of Gross) - Employer only
                { label: 'HEART Trust (3%)', category: 'Social Security', value: (data) => data.reduce((sum, p) => sum + (parseFloat(p.grossSalary || 0) * 0.03), 0).toFixed(2) }
            ]
        },
        'S02': {
            title: 'S02 - Annual Statutory Declaration',
            formCode: 'F-S02-YEARLY',
            fields: [
                { label: 'Total NHT Withheld', category: 'Financials', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.nhtEmployee || 0), 0).toFixed(2) }
            ]
        },
        'Pension': {
            title: 'Pension Contribution Report',
            formCode: 'F-PENSION-ANNUAL',
            fields: [
                { label: 'Total Gross Emoluments', category: 'Financials', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.grossSalary || 0), 0).toFixed(2) },
                { label: 'Employee Pension Contribution', category: 'Deductions', value: (data) => data.reduce((sum, p) => sum + parseFloat(p.pension || 0), 0).toFixed(2) },
                { 
                    label: 'Employer Matching Contribution', 
                    category: 'Deductions', 
                    value: (data) => data.reduce((sum, p) => sum + parseFloat(p.pension || 0), 0).toFixed(2) 
                },
                {
                    label: 'Total Pension Remittance',
                    category: 'Summary',
                    value: (data) => {
                        const total = data.reduce((sum, p) => sum + (parseFloat(p.pension || 0) * 2), 0);
                        return total.toFixed(2);
                    }
                }
            ]
        },
        'TaxUpload': {
            title: 'Tax Website Upload Center',
            formCode: 'TAJ-FILE-PACKET',
            description: 'Generate and validate official returns for Tax Administration Jamaica (TAJ) website upload.',
            filings: [
                { id: 'S01', name: 'S01 - Monthly Remittance', format: 'Excel (Standard)', taCode: 'RA01' },
                { id: 'S02', name: 'S02 - Annual Declaration', format: 'Excel (Annual)', taCode: 'RA02' },
                { id: 'P24', name: 'P24 - Year End Certificates', format: 'PDF/Excel Batch', taCode: 'RA24' },
                { id: 'P45', name: 'P45 - Departure Certificate', format: 'PDF (Single)', taCode: 'RA45' }
            ],
            fields: [] // Hub view uses different rendering logic
        }
    };

    const currentReport = reports[type] || reports['S01'];

    const handleExportExcel = () => {
        if (!filteredData || filteredData.length === 0) {
            alert("No finalized payroll data found for the selected period.");
            return;
        }

        let dataToExport = [];
        let fileName = `${type}_Report_${period}`;

        const formatDate = (date) => {
            if (!date) return 'N/A';
            return new Date(date).toISOString().split('T')[0];
        };

        if (type === 'S01') {
            dataToExport = filteredData.map(p => ({
                'TRN': p.employee?.trn?.replace(/\D/g, '') || '',
                'Employee Name': `${p.employee?.firstName} ${p.employee?.lastName}`,
                'Date Of Birth': formatDate(p.employee?.dob),
                'Gross Emoluments': parseFloat(p.grossSalary || 0).toFixed(2),
                'PAYE': parseFloat(p.paye || 0).toFixed(2),
                'Employee NIS Contribution': parseFloat(p.nis || 0).toFixed(2),
                'Employer NIS Contribution': (parseFloat(p.grossSalary || 0) * 0.03).toFixed(2),
                'NHT Contribution': parseFloat(p.nht || 0).toFixed(2),
                'Education Tax': parseFloat(p.edTax || 0).toFixed(2)
            }));
            const [year, month] = period.split('-');
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            fileName = `S01_Schedule_A_${monthNames[parseInt(month) - 1]}-${year}`;
        }
        else if (type === 'S02') {
            dataToExport = filteredData.map(p => ({
                'TRN': p.trn?.replace(/\D/g, '') || '',
                'Employee Name': p.employeeName,
                'Date Of Birth': formatDate(p.dob),
                'Total Gross Emoluments': parseFloat(p.grossPay || 0).toFixed(2),
                'Total PAYE': parseFloat(p.paye || 0).toFixed(2),
                'Total Employee NIS': parseFloat(p.nisEmployee || 0).toFixed(2),
                'Total Employer NIS': parseFloat(p.nisEmployer || 0).toFixed(2),
                'Total NHT': parseFloat(p.nhtEmployee || 0).toFixed(2),
                'Total Education Tax': parseFloat(p.edTax || 0).toFixed(2)
            }));
            fileName = `S02_Schedule_A_${period.split('-')[0]}`;
        }
        else {
            dataToExport = currentReport.fields.map(f => ({
                'Category': f.category,
                'Field': f.label,
                'Value': f.value ? f.value(filteredData) : '0.00'
            }));
        }

        const ws = XLSX.utils.json_to_sheet(dataToExport);

        // --- PREVENT SCIENTIFIC NOTATION FOR TRN ---
        // Iterate through the TRN column (column A) and ensure it's treated as a string
        if (type === 'S01' || type === 'S02') {
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let R = range.s.r + 1; R <= range.e.r; ++R) {
                const cellRef = XLSX.utils.encode_cell({ c: 0, r: R });
                if (ws[cellRef]) {
                    ws[cellRef].t = 's'; // Force type to string
                }
            }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Schedule A');

        // Auto-size columns
        const wscols = Object.keys(dataToExport[0]).map(key => ({
            wch: Math.max(key.length, 15)
        }));
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, `${fileName}.xlsx`);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#525659] font-sans selection:bg-blue-200 relative overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-black/30 z-[100] flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="animate-spin text-white" size={48} />
                </div>
            )}

            {/* Report Toolbar */}
            <div className="bg-[#323639] border-b border-black px-2 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between no-print shadow-xl z-20 gap-3 sm:gap-0">
                <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 shrink-0">
                        <FileText className="text-white" size={16} />
                        <span className="text-white text-[10px] sm:text-xs font-black uppercase tracking-tighter truncate max-w-[150px] sm:max-w-none">{currentReport.title}</span>
                    </div>
                    <div className="h-6 w-px bg-gray-600 shrink-0 hidden sm:block"></div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-black text-gray-400 uppercase italic">
                            {(type === 'S02' || type === 'NIS-NHT') ? 'Filing Year:' : 'Filing Period:'}
                        </span>
                        {(type === 'S02' || type === 'NIS-NHT') ? (
                            <input
                                type="number"
                                value={period.split('-')[0]}
                                onChange={(e) => setPeriod(`${e.target.value}-01`)}
                                className="bg-[#202124] border border-gray-700 text-blue-400 text-[9px] sm:text-[10px] font-black p-1 rounded focus:outline-none w-20"
                                min="2000"
                                max="2100"
                            />
                        ) : (
                            <input
                                type="month"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="bg-[#202124] border border-gray-700 text-blue-400 text-[9px] sm:text-[10px] font-black p-1 rounded focus:outline-none"
                            />
                        )}
                    </div>
                    {type === 'P45' && (
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] font-black text-gray-400 uppercase italic">Employee:</span>
                            <select
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                className="bg-[#202124] border border-gray-700 text-white text-[9px] sm:text-[10px] font-black p-1 rounded focus:outline-none max-w-[150px]"
                            >
                                <option value="">--- SELECT ---</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex-1 sm:flex-none p-1.5 sm:p-1 px-3 sm:px-4 ${showPreview ? 'bg-blue-600' : 'bg-[#202124]'} hover:opacity-80 text-white rounded text-[9px] sm:text-[10px] font-black uppercase border border-gray-600 transition-all flex items-center justify-center gap-2`}
                    >
                        <Search size={12} /> <span className="sm:inline">{showPreview ? 'Show Form' : 'Data Preview'}</span>
                    </button>
                    <button onClick={() => window.print()} className="flex-1 sm:flex-none p-1.5 sm:p-1 px-3 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] sm:text-[10px] font-black uppercase shadow-inner transition-all flex items-center justify-center gap-2">
                        <Printer size={12} /> <span className="sm:inline">Print</span>
                    </button>
                    <button className="flex-1 sm:flex-none p-1.5 sm:p-1 px-3 sm:px-4 bg-gray-700 hover:bg-gray-600 text-white rounded text-[9px] sm:text-[10px] font-black uppercase border border-gray-600 transition-all flex items-center justify-center gap-2">
                        <Download size={12} /> <span className="sm:inline">Export</span>
                    </button>
                    <button onClick={handleExportExcel} className="flex-1 sm:flex-none p-1.5 sm:p-1 px-3 sm:px-4 bg-green-700 hover:bg-green-600 text-white rounded text-[9px] sm:text-[10px] font-black uppercase border border-green-600 transition-all flex items-center justify-center gap-2">
                        <Download size={12} /> <span className="sm:inline">Excel</span>
                    </button>
                    <div className="h-6 w-px bg-gray-600 mx-1 hidden sm:block"></div>
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors p-1">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* Validation Warnings Panel */}
            {validationWarnings.length > 0 && (
                <div className="mx-4 mt-4 p-4 bg-red-950/40 border border-red-500/50 rounded-lg no-print">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="text-red-400" size={16} />
                        <span className="text-red-400 text-xs font-black uppercase tracking-widest">Data Validation Warnings</span>
                    </div>
                    <div className="space-y-1">
                        {validationWarnings.map((warning, i) => (
                            <p key={i} className="text-red-200/70 text-[10px] sm:text-[11px] font-medium leading-relaxed">
                                {warning}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* View Area */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-8 lg:p-12 flex justify-center bg-[#525659]">
                {showPreview ? (
                    <div className="bg-[#1e1e1e] w-full max-w-6xl rounded-lg shadow-2xl border border-gray-800 overflow-hidden flex flex-col h-fit">
                        <div className="bg-[#2d2d2d] p-4 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Search size={16} className="text-blue-400" />
                                RAW SCHEDULE A PREVIEW
                            </h3>
                            <span className="text-gray-400 text-[10px] font-bold">Total Rows: {filteredData.length}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] text-gray-300">
                                <thead className="bg-[#252526] text-gray-500 uppercase font-black text-[9px] border-b border-gray-800">
                                    <tr>
                                        <th className="px-4 py-3">TRN</th>
                                        <th className="px-4 py-3">Employee Name</th>
                                        <th className="px-4 py-3">DOB</th>
                                        <th className="px-4 py-3 text-right">{type === 'S02' ? 'Annual Gross' : 'Gross Pay'}</th>
                                        <th className="px-4 py-3 text-right">PAYE</th>
                                        <th className="px-4 py-3 text-right">EE NIS</th>
                                        <th className="px-4 py-3 text-right">ER NIS</th>
                                        <th className="px-4 py-3 text-right">NHT</th>
                                        <th className="px-4 py-3 text-right">Ed Tax</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredData.map((p, i) => {
                                        const emp = p.employee || p;
                                        const name = p.employeeName || `${emp.firstName} ${emp.lastName}`;
                                        const gross = parseFloat(p.grossSalary || p.grossPay || 0);
                                        const nisE = parseFloat(p.nis || p.nisEmployee || 0);
                                        const nisR = p.nisEmployer ? parseFloat(p.nisEmployer) : (gross * 0.03);
                                        const trn = (emp.trn || '').replace(/\D/g, '');

                                        return (
                                            <tr key={i} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-4 py-3 font-mono text-blue-400 font-bold">{trn}</td>
                                                <td className="px-4 py-3 text-white font-bold">{name}</td>
                                                <td className="px-4 py-3">{new Date(emp.dob).toISOString().split('T')[0]}</td>
                                                <td className="px-4 py-3 text-right tabular-nums text-green-400 font-bold">${gross.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right tabular-nums">${parseFloat(p.paye || 0).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right tabular-nums">${nisE.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right tabular-nums text-blue-300/80 italic">${nisR.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right tabular-nums">${parseFloat(p.nht || p.nhtEmployee || 0).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right tabular-nums">${parseFloat(p.edTax || 0).toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-[#252526] p-4 text-[10px] text-gray-500 italic border-t border-gray-800">
                            * This preview reflects the exact numeric values and text formatting that will be pushed to the Excel generator.
                        </div>
                    </div>
                ) : type === 'TaxUpload' ? (
                    <div className="bg-[#1e1e1e] w-full max-w-5xl rounded-lg shadow-2xl border border-gray-800 p-8 flex flex-col gap-6">
                        <div className="flex justify-between items-start border-b border-gray-800 pb-6">
                            <div>
                                <h1 className="text-2xl font-black text-white italic tracking-tighter mb-1">TAJ FILING HUB</h1>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Tax Administration Jamaica Upload Manager</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1 italic">Reporting Entity</span>
                                <span className="text-sm font-black text-white uppercase italic">{company?.name || 'SMARTHRM_ORG_NODE'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {currentReport.filings.map((filing, idx) => {
                                const isReady = validationWarnings.length === 0;
                                return (
                                    <div key={idx} className="bg-[#252526] p-6 border border-gray-800 rounded-lg hover:border-blue-500/50 transition-all group relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-white font-black text-sm uppercase italic tracking-tight mb-1">{filing.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase">Format:</span>
                                                    <span className="text-[9px] font-black text-blue-400 uppercase italic">{filing.format}</span>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isReady ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                                                {isReady ? 'STATUS: READY' : 'STATUS: CHECK REQD'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mt-6">
                                            <button 
                                                onClick={() => {
                                                    alert(`Navigating to ${filing.id} for download...`);
                                                    const path = filing.id === 'S01' ? '/statutory/s01' : 
                                                               filing.id === 'S02' ? '/statutory/s02' :
                                                               filing.id === 'P24' ? '/statutory/p24' : '/statutory/p45';
                                                    navigate(path);
                                                }}
                                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                OPEN FILING
                                            </button>
                                            <div className="w-10 h-10 border border-gray-700 rounded flex items-center justify-center text-gray-500 group-hover:text-blue-400 transition-colors">
                                                <Download size={16} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 p-6 bg-blue-950/20 border border-blue-500/30 rounded-lg">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="text-blue-400 shrink-0" size={20} />
                                <div>
                                    <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Technical Filing Note</h4>
                                    <p className="text-[10px] text-blue-200/60 font-medium leading-relaxed italic">
                                        All files generated from this hub conform to the current <span className="text-blue-300 font-bold underline">Revenue Administration Act</span> requirements. 
                                        Please ensure your TAJ login token is active before uploading. For P24/P45 files, please verify employee TRNs in the Readiness panel above.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white w-full max-w-[8.5in] min-h-[11in] shadow-2xl p-6 sm:p-12 md:p-16 flex flex-col relative overflow-hidden">
                        {/* Watermark Logo */}
                        <div className="absolute top-8 sm:top-16 right-8 sm:right-16 opacity-[0.03] pointer-events-none">
                            <div className="w-16 h-16 sm:w-64 sm:h-64 border-[10px] border-blue-900 rounded-full flex items-center justify-center font-black text-blue-900 text-2xl sm:text-9xl italic">S</div>
                        </div>

                        <div className="mb-8 sm:mb-12 border-b-2 border-blue-900 pb-6 sm:pb-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                                <div>
                                    <h1 className="text-xl sm:text-3xl font-black text-blue-900 italic tracking-tighter leading-none mb-1">OFFICIAL RETURN</h1>
                                    <p className="text-[10px] sm:text-[12px] font-black text-gray-500 uppercase tracking-[0.1em] sm:tracking-[0.2em]">{currentReport.title}</p>
                                    <div className="mt-4 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase">FORM CODE: <span className="text-gray-800">{currentReport.formCode}</span></div>
                                    {(type === 'S02' || type === 'NIS-NHT') && (
                                        <div className="mt-2 text-[12px] sm:text-[14px] font-black text-blue-800 uppercase italic">YEAR: {period.split('-')[0]}</div>
                                    )}
                                </div>
                                <div className="sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                    <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase leading-none">Government of Jamaica</p>
                                    <p className="text-[10px] sm:text-[11px] font-black text-blue-900 uppercase mt-1">Tax Administration Jamaica (TAJ)</p>
                                    <div className="mt-4 text-[9px] sm:text-[10px] font-bold text-gray-400 italic">Snapshot Date: {new Date().toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-10">
                            {Array.from(new Set(currentReport.fields.map(f => f.category))).map((cat, idx) => (
                                <div key={idx} className="space-y-4">
                                    <h3 className="text-[9px] sm:text-[11px] font-black text-blue-900 uppercase tracking-widest border-l-4 border-blue-900 pl-2 sm:pl-3 bg-gray-50 py-1.5 flex justify-between items-center">
                                        <span>Section {idx + 1}: {cat}</span>
                                        <span className="text-[8px] opacity-40 font-bold">{company?.name || 'SYNC_ID_LIVE'}</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 px-4">
                                        {currentReport.fields.filter(f => f.category === cat).map((field, fIdx) => (
                                            <div key={fIdx} className="flex flex-col border-b border-gray-100 pb-2 group hover:border-blue-200 transition-colors">
                                                <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">{field.label}</span>
                                                <div className="text-[11px] sm:text-sm font-black text-gray-800 uppercase tabular-nums py-1 flex items-center justify-between">
                                                    <span>$</span>
                                                    <span>{field.value ? field.value(filteredData) : '0.00'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {payrollData.length === 0 && !loading && (
                                <div className="p-12 text-center border-2 border-dashed border-gray-100 italic font-bold text-gray-300 uppercase tracking-widest text-[10px]">
                                    No payroll transmission found for the selected period. Report values defaulted to zero sequence.
                                </div>
                            )}
                        </div>

                        <div className="mt-20 p-6 border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-6 italic relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none rotate-12">
                                <ShieldCheck size={120} />
                            </div>
                            <ShieldCheck className="text-blue-900 shrink-0 mx-auto sm:mx-0 relative z-10" size={24} />
                            <div className="w-full relative z-10">
                                <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase italic mb-1 text-center sm:text-left tracking-widest">Certification of Accuracy</p>
                                <p className="text-[10px] sm:text-[11px] text-gray-600 leading-relaxed font-bold text-center sm:text-left">
                                    I hereby certify that the information provided in this statutory return is true and correct, and has been computed in accordance with the <span className="text-blue-900 font-black">Tax Administration Act of Jamaica</span> using the SmartHRM Engine v5.1.
                                </p>
                                <div className="mt-12 flex flex-col sm:flex-row justify-between items-center sm:items-end border-t border-gray-300 pt-4 gap-4 sm:gap-0">
                                    <div className="text-center w-full sm:w-auto">
                                        <div className="w-48 border-b-2 border-gray-900 pb-1 font-mono italic text-xs uppercase text-gray-400">Electronic Sign</div>
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1 block">Authorized Agent</span>
                                    </div>
                                    <div className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Stamp: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center opacity-30 gap-2 sm:gap-0">
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Official Payroll Protocol Audit Document — Year {new Date().getFullYear()}</span>
                            <div className="flex items-center gap-2">
                                <Landmark size={12} className="text-gray-400" />
                                <span className="text-[8px] font-black text-gray-400 italic">SMARTHRM COMPLIANCE SUITE</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JamaicaStatutory;
