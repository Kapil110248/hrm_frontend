import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Loader2, CheckCircle, Building2 } from 'lucide-react';
import { api } from '../../services/api';

const fmt = (v) => parseFloat(v || 0).toLocaleString('en-JM', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const NHTLetterPage = () => {
    const { employeeId } = useParams();
    const [searchParams] = useSearchParams();
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const navigate = useNavigate();
    const printRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await api.fetchEmployeeStatutoryDetails(employeeId, year);
                if (res.success) {
                    setData(res.data);
                } else {
                    setError(res.message || 'Failed to load data');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [employeeId, year]);

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading NHT Contribution Letter...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-100">
                <div className="text-center p-8 bg-white border rounded shadow">
                    <p className="text-red-600 font-bold">{error || 'No data found.'}</p>
                    <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold">Go Back</button>
                </div>
            </div>
        );
    }

    const { employee, company, ytd, periodBreakdown } = data;
    const today = new Date();
    const letterDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const refNo = `NHT-${year}-${employee.employeeId}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    return (
        <div className="flex flex-col h-full w-full bg-gray-300 font-sans">

            {/* ===== TOOLBAR (no-print) ===== */}
            <div className="no-print bg-[#2d2d2d] px-4 py-2.5 flex items-center justify-between shadow-lg z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="h-5 w-px bg-gray-600"></div>
                    <div>
                        <p className="text-white text-xs font-bold uppercase tracking-widest">NHT Contribution Letter</p>
                        <p className="text-gray-400 text-[10px]">{employee.lastName}, {employee.firstName} &mdash; Tax Year {year}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-[10px] text-gray-500 uppercase tracking-widest font-bold mr-2">Ref: {refNo}</span>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold uppercase transition-all shadow"
                    >
                        <Printer size={14} /> Print Letter
                    </button>
                </div>
            </div>

            {/* ===== LETTER CANVAS ===== */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start print:p-0 print:block print:overflow-visible">
                <div
                    ref={printRef}
                    className="bg-white w-full max-w-[210mm] shadow-2xl print:shadow-none print:max-w-none"
                    style={{ minHeight: '297mm', padding: '18mm 20mm' }}
                >
                    {/* ---- LETTER HEADER ---- */}
                    <div className="flex justify-between items-start border-b-2 border-gray-900 pb-5 mb-6">
                        {/* Company / Employer block */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Building2 size={18} className="text-blue-900" />
                                <span className="text-[9pt] font-black text-blue-900 uppercase tracking-[0.2em]">Employer</span>
                            </div>
                            <h2 className="text-[14pt] font-black text-gray-900 uppercase leading-tight">{company?.name || 'N/A'}</h2>
                            {company?.address && <p className="text-[9pt] text-gray-500 mt-0.5">{company.address}</p>}
                            {company?.trn && <p className="text-[9pt] text-gray-600 font-semibold mt-0.5">TRN: <strong>{company.trn}</strong></p>}
                        </div>
                        {/* Letter Meta block */}
                        <div className="text-right">
                            <p className="text-[9pt] font-black text-gray-400 uppercase tracking-widest">Date Issued</p>
                            <p className="text-[11pt] font-bold text-gray-800">{letterDate}</p>
                            <div className="mt-2 bg-blue-900 text-white px-3 py-1 inline-block">
                                <p className="text-[8pt] font-black uppercase tracking-widest">Reference No.</p>
                                <p className="text-[10pt] font-black tracking-wider">{refNo}</p>
                            </div>
                        </div>
                    </div>

                    {/* ---- LETTER TITLE ---- */}
                    <div className="mb-6 text-center">
                        <div className="inline-block border-2 border-gray-900 px-8 py-2">
                            <p className="text-[9pt] font-black uppercase tracking-[0.3em] text-gray-500">National Housing Trust</p>
                            <h1 className="text-[16pt] font-black text-gray-900 uppercase tracking-tight">Contribution Verification Letter</h1>
                            <p className="text-[9pt] font-bold text-gray-500 uppercase">Tax Year: <span className="text-gray-900">{year}</span></p>
                        </div>
                    </div>

                    {/* ---- SALUTATION ---- */}
                    <p className="text-[10pt] text-gray-700 mb-4 font-serif">
                        <strong>To Whom It May Concern,</strong>
                    </p>
                    <p className="text-[10pt] text-gray-700 mb-6 font-serif leading-relaxed">
                        This letter serves as official confirmation that the employee named hereunder was employed by{' '}
                        <strong>{company?.name}</strong> during the tax year <strong>{year}</strong>, and that the
                        following contributions were remitted on their behalf to the <strong>National Housing Trust (NHT)</strong>{' '}
                        and the <strong>National Insurance Scheme (NIS)</strong> in accordance with the applicable Jamaica statutes.
                    </p>

                    {/* ---- EMPLOYEE DETAILS BOX ---- */}
                    <div className="border border-gray-300 bg-gray-50 p-4 mb-6">
                        <p className="text-[8pt] font-black uppercase tracking-widest text-blue-900 mb-3 border-b border-gray-200 pb-1">Section 1: Employee Particulars</p>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[9.5pt]">
                            <div className="flex justify-between border-b border-dotted border-gray-200 pb-1">
                                <span className="text-gray-500 font-semibold">Full Name</span>
                                <span className="font-black uppercase">{employee.lastName}, {employee.firstName}</span>
                            </div>
                            <div className="flex justify-between border-b border-dotted border-gray-200 pb-1">
                                <span className="text-gray-500 font-semibold">Employee ID</span>
                                <span className="font-black">{employee.employeeId}</span>
                            </div>
                            <div className="flex justify-between border-b border-dotted border-gray-200 pb-1">
                                <span className="text-gray-500 font-semibold">TRN Number</span>
                                <span className="font-black text-blue-900">{employee.trn}</span>
                            </div>
                            <div className="flex justify-between border-b border-dotted border-gray-200 pb-1">
                                <span className="text-gray-500 font-semibold">NIS Number</span>
                                <span className="font-black text-blue-900">{employee.nisNumber}</span>
                            </div>
                            <div className="flex justify-between border-b border-dotted border-gray-200 pb-1">
                                <span className="text-gray-500 font-semibold">NHT Number</span>
                                <span className="font-black text-green-800">{employee.nhtNumber}</span>
                            </div>
                            <div className="flex justify-between border-b border-dotted border-gray-200 pb-1">
                                <span className="text-gray-500 font-semibold">Department</span>
                                <span className="font-black">{employee.department}</span>
                            </div>
                            <div className="flex justify-between border-b border-dotted border-gray-200 pb-1">
                                <span className="text-gray-500 font-semibold">Designation</span>
                                <span className="font-black">{employee.designation}</span>
                            </div>
                            <div className="flex justify-between border-b border-dotted border-gray-200 pb-1">
                                <span className="text-gray-500 font-semibold">Pay Frequency</span>
                                <span className="font-black">{employee.payFrequency}</span>
                            </div>
                        </div>
                    </div>

                    {/* ---- YTD CONTRIBUTION SUMMARY ---- */}
                    <div className="mb-6">
                        <p className="text-[8pt] font-black uppercase tracking-widest text-blue-900 mb-3 border-b-2 border-blue-900 pb-1">
                            Section 2: Year-to-Date Contribution Summary — {year}
                        </p>

                        {/* Gross & Periods Banner */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-gray-900 text-white p-3 text-center">
                                <p className="text-[7pt] font-black uppercase tracking-widest opacity-60 mb-0.5">Total Gross Earnings</p>
                                <p className="text-[13pt] font-black">JMD {fmt(ytd.grossPay)}</p>
                            </div>
                            <div className="bg-blue-900 text-white p-3 text-center">
                                <p className="text-[7pt] font-black uppercase tracking-widest opacity-70 mb-0.5">NIS Contributing Periods</p>
                                <p className="text-[22pt] font-black leading-none">{ytd.totalPeriodsNis}</p>
                                <p className="text-[7pt] opacity-60 uppercase">of {ytd.totalPeriods} pay run(s)</p>
                            </div>
                            <div className="bg-green-800 text-white p-3 text-center">
                                <p className="text-[7pt] font-black uppercase tracking-widest opacity-70 mb-0.5">NHT Contributing Periods</p>
                                <p className="text-[22pt] font-black leading-none">{ytd.totalPeriodsNht}</p>
                                <p className="text-[7pt] opacity-60 uppercase">of {ytd.totalPeriods} pay run(s)</p>
                            </div>
                        </div>

                        {/* NIS Breakdown */}
                        <table className="w-full text-[9pt] mb-3 border border-gray-200">
                            <thead>
                                <tr className="bg-blue-900 text-white">
                                    <th className="p-2 text-left font-black uppercase tracking-widest text-[8pt]" colSpan="2">National Insurance Scheme (NIS) Contributions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="p-2 text-gray-600 font-semibold">Employee Contribution (3%)</td>
                                    <td className="p-2 text-right font-black">JMD {fmt(ytd.nisEmployee)}</td>
                                </tr>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <td className="p-2 text-gray-600 font-semibold">Employer Contribution (3%)</td>
                                    <td className="p-2 text-right font-black">JMD {fmt(ytd.nisEmployer)}</td>
                                </tr>
                                <tr className="bg-blue-50">
                                    <td className="p-2 font-black text-blue-900">Total NIS Remittance</td>
                                    <td className="p-2 text-right font-black text-blue-900 text-[11pt]">JMD {fmt(ytd.nisTotal)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* NHT Breakdown */}
                        <table className="w-full text-[9pt] border border-gray-200">
                            <thead>
                                <tr className="bg-green-800 text-white">
                                    <th className="p-2 text-left font-black uppercase tracking-widest text-[8pt]" colSpan="2">National Housing Trust (NHT) Contributions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="p-2 text-gray-600 font-semibold">Employee Contribution (2%)</td>
                                    <td className="p-2 text-right font-black">JMD {fmt(ytd.nhtEmployee)}</td>
                                </tr>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <td className="p-2 text-gray-600 font-semibold">Employer Contribution (3%)</td>
                                    <td className="p-2 text-right font-black">JMD {fmt(ytd.nhtEmployer)}</td>
                                </tr>
                                <tr className="bg-green-50">
                                    <td className="p-2 font-black text-green-900">Total NHT Remittance</td>
                                    <td className="p-2 text-right font-black text-green-900 text-[11pt]">JMD {fmt(ytd.nhtTotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* ---- PERIOD-BY-PERIOD BREAKDOWN ---- */}
                    {periodBreakdown.length > 0 && (
                        <div className="mb-6">
                            <p className="text-[8pt] font-black uppercase tracking-widest text-gray-600 mb-2 border-b border-gray-200 pb-1">
                                Section 3: Period-by-Period Breakdown ({periodBreakdown.length} period(s))
                            </p>
                            <table className="w-full text-[8pt] border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-gray-300">
                                        <th className="p-1.5 text-left font-black uppercase">Period</th>
                                        <th className="p-1.5 text-right font-black uppercase">Gross</th>
                                        <th className="p-1.5 text-right font-black uppercase text-blue-800">NIS EE</th>
                                        <th className="p-1.5 text-right font-black uppercase text-blue-800">NIS ER</th>
                                        <th className="p-1.5 text-right font-black uppercase text-green-800">NHT EE</th>
                                        <th className="p-1.5 text-right font-black uppercase text-green-800">NHT ER</th>
                                        <th className="p-1.5 text-center font-black uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {periodBreakdown.map((row, i) => (
                                        <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                                            <td className="p-1.5 font-bold">{row.period}</td>
                                            <td className="p-1.5 text-right">{fmt(row.grossSalary)}</td>
                                            <td className="p-1.5 text-right text-blue-700">{fmt(row.nisEmployee)}</td>
                                            <td className="p-1.5 text-right text-blue-700">{fmt(row.nisEmployer)}</td>
                                            <td className="p-1.5 text-right text-green-700">{fmt(row.nhtEmployee)}</td>
                                            <td className="p-1.5 text-right text-green-700">{fmt(row.nhtEmployer)}</td>
                                            <td className="p-1.5 text-center">
                                                <span className={`px-1 py-0.5 text-[7pt] font-bold uppercase rounded ${row.status === 'Finalized' ? 'bg-green-100 text-green-800' :
                                                        row.status === 'Paid' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>{row.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ---- CERTIFICATION BLOCK ---- */}
                    <div className="border-2 border-gray-900 p-4 mb-6 relative overflow-hidden">
                        <div className="absolute top-2 right-3 opacity-5 rotate-12 pointer-events-none">
                            <CheckCircle size={100} />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={16} className="text-gray-700" />
                            <p className="text-[8pt] font-black uppercase tracking-widest text-gray-700">Certification of Accuracy</p>
                        </div>
                        <p className="text-[9pt] text-gray-600 font-serif leading-relaxed">
                            I hereby certify that the above information is <strong>true, accurate, and complete</strong> as maintained
                            in the payroll records of <strong>{company?.name}</strong>. This letter is issued solely for the purpose
                            of verifying NHT contributions for <strong>{employee.lastName}, {employee.firstName}</strong> for the
                            tax year <strong>{year}</strong>.
                        </p>
                    </div>

                    {/* ---- SIGNATURE AREA ---- */}
                    <div className="grid grid-cols-2 gap-16 mt-10">
                        <div>
                            <div className="border-b-2 border-gray-900 h-10 mb-1"></div>
                            <p className="text-[8pt] font-black uppercase tracking-widest text-gray-600">Authorized Signature</p>
                            <p className="text-[8pt] text-gray-400 mt-0.5">Payroll / HR Officer</p>
                        </div>
                        <div>
                            <div className="border-b-2 border-gray-900 h-10 mb-1"></div>
                            <p className="text-[8pt] font-black uppercase tracking-widest text-gray-600">Date</p>
                            <p className="text-[8pt] text-gray-500 mt-0.5">{letterDate}</p>
                        </div>
                    </div>

                    {/* ---- FOOTER ---- */}
                    <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center opacity-40">
                        <p className="text-[7pt] font-bold uppercase tracking-widest text-gray-400">Generated by SmartHRM Compliance Suite &mdash; {company?.name}</p>
                        <p className="text-[7pt] font-bold text-gray-400">{refNo}</p>
                    </div>
                </div>
            </div>

            {/* Print CSS in-component style */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    @page { size: A4; margin: 0; }
                }
            `}</style>
        </div>
    );
};

export default NHTLetterPage;
