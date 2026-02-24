import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Download, Printer, Search, Loader2, LogOut, ArrowLeft
} from 'lucide-react';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';

const ConsolidatedStatutoryReport = () => {
    const navigate = useNavigate();
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [company, setCompany] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [s01ExportPath, setS01ExportPath] = useState('');

    useEffect(() => {
        const companyStr = localStorage.getItem('selectedCompany');
        if (companyStr) {
            const c = JSON.parse(companyStr);
            setCompany(c);
            // Also load the s01ExportPath from company settings
            const loadS01Path = async () => {
                try {
                    const res = await api.fetchCompanies();
                    if (res.success) {
                        const found = res.data.find(x => x.id === c.id);
                        if (found?.settings?.s01ExportPath) {
                            setS01ExportPath(found.settings.s01ExportPath);
                        }
                    }
                } catch (e) { /* silent */ }
            };
            loadS01Path();
        }
    }, []);

    useEffect(() => {
        if (!company || !year) return;
        fetchData();
    }, [company, year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.fetchStatutorySummary({ companyId: company.id, year });
            if (res.success) {
                setReportData(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        const companyCode = (company?.name || 'COMPANY').replace(/\s+/g, '_').toUpperCase();
        const filename = `S01_${companyCode}_${year}.xlsx`;

        const dataToExport = reportData.map(row => ({
            'Employee Name': row.employeeName,
            'TRN': row.trn,
            'Gross Pay ($)': row.grossPay.toFixed(2),
            'WKS NIS': row.wksNis,
            'NIS EE 3% ($)': row.nisEmployee.toFixed(2),
            'NIS ER 3% ($)': row.nisEmployer.toFixed(2),
            'Total NIS ($)': row.nisTotal.toFixed(2),
            'WKS NHT': row.wksNht,
            'NHT EE 2% ($)': row.nhtEmployee.toFixed(2),
            'NHT ER 3% ($)': row.nhtEmployer.toFixed(2),
            'Total NHT ($)': row.nhtTotal.toFixed(2)
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Statutory_${year}`);
        XLSX.writeFile(wb, filename);

        // Show save tip
        const savePath = s01ExportPath || 'your Desktop';
        setTimeout(() => {
            alert(`✅ File "${filename}" is downloading.\n\nSave it to:\n${savePath}\n\nYou can then upload it to the TAJ S01 portal.`);
        }, 300);
    };

    const filteredData = reportData.filter(d =>
        (d.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.trn || '').includes(searchTerm)
    );

    // Calculate Grand Totals
    const totals = filteredData.reduce((acc, curr) => ({
        grossPay: acc.grossPay + curr.grossPay,
        nisEmployee: acc.nisEmployee + curr.nisEmployee,
        nisEmployer: acc.nisEmployer + curr.nisEmployer,
        nisTotal: acc.nisTotal + curr.nisTotal,
        nhtEmployee: acc.nhtEmployee + curr.nhtEmployee,
        nhtEmployer: acc.nhtEmployer + curr.nhtEmployer,
        nhtTotal: acc.nhtTotal + curr.nhtTotal
    }), {
        grossPay: 0, nisEmployee: 0, nisEmployer: 0, nisTotal: 0,
        nhtEmployee: 0, nhtEmployer: 0, nhtTotal: 0
    });

    return (
        <div className="flex flex-col h-full w-full bg-[#f4f6f8] font-sans relative overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-white/60 z-[100] flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                </div>
            )}

            {/* Header / Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-20 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-1.5 rounded-lg">
                            <FileText className="text-blue-700" size={18} />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Consolidated Statutory (NIS/NHT)</h1>
                            <p className="text-[10px] text-gray-500 font-semibold">{company?.name}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded px-2 bg-gray-50">
                        <span className="text-[10px] text-gray-500 font-bold mr-2 uppercase">Year:</span>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="bg-transparent text-sm font-bold text-blue-700 w-20 py-1 outline-none"
                            min="2000"
                            max="2100"
                        />
                    </div>

                    <div className="flex items-center border border-gray-300 rounded px-2 bg-gray-50">
                        <Search size={14} className="text-gray-400 mr-1" />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent text-xs py-1.5 outline-none w-48"
                        />
                    </div>

                    <div className="h-6 w-px bg-gray-300 mx-2"></div>

                    <button onClick={() => window.print()} className="p-1.5 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-bold uppercase transition-all flex items-center gap-2 shadow-sm">
                        <Printer size={14} /> Print
                    </button>
                    <button onClick={handleExportExcel} className="p-1.5 px-3 bg-green-600 border border-green-700 hover:bg-green-700 text-white rounded text-xs font-bold uppercase transition-all flex items-center gap-2 shadow-sm">
                        <Download size={14} /> EXCEL
                    </button>
                </div>
            </div>

            {/* S01 Export Path Info Banner */}
            {s01ExportPath && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-3 no-print">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></div>
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                        S01 Export Path:
                        <span className="font-mono text-amber-900 ml-2 normal-case text-[11px] bg-amber-100 px-2 py-0.5 rounded">{s01ExportPath}</span>
                    </p>
                    <p className="text-[9px] text-amber-600 font-medium ml-2">→ When you click EXCEL, save the file to this path, then upload it to the TAJ S01 portal.</p>
                </div>
            )}

            {/* List View Container */}
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
                <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden flex flex-col min-w-max h-full print:border-none print:shadow-none print:w-full print:h-auto print:overflow-visible">

                    {/* Print Header */}
                    <div className="hidden print:block p-4 border-b-2 border-gray-900 mb-4">
                        <h2 className="text-xl font-black uppercase text-center mb-1">CONSOLIDATED STATUTORY REPORT</h2>
                        <h3 className="text-sm font-bold text-center text-gray-600">COMPANY: {company?.name} | YEAR: {year}</h3>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead className="bg-[#f8fafc] sticky top-0 z-10 print:static shadow-sm print:shadow-none">
                                <tr>
                                    <th className="p-2 border-b border-r border-gray-200 text-[10px] font-black uppercase text-gray-600" rowSpan="2">Employee Name</th>
                                    <th className="p-2 border-b border-r border-gray-200 text-[10px] font-black uppercase text-gray-600" rowSpan="2">TRN</th>
                                    <th className="p-2 border-b border-r border-gray-200 text-[10px] font-black uppercase text-gray-600 text-right" rowSpan="2">Gross Pay</th>
                                    <th className="p-2 border-b border-r border-gray-200 text-[10px] font-black uppercase text-center text-blue-900 bg-blue-50/50" colSpan="4">National Insurance Scheme (NIS)</th>
                                    <th className="p-2 border-b border-gray-200 text-[10px] font-black uppercase text-center text-green-900 bg-green-50/50" colSpan="4">National Housing Trust (NHT)</th>
                                </tr>
                                <tr>
                                    <th className="p-2 border-b border-r border-gray-200 text-[9px] font-bold uppercase text-gray-500 text-center bg-blue-50/50">WKS</th>
                                    <th className="p-2 border-b border-r border-gray-200 text-[9px] font-bold uppercase text-gray-500 text-right bg-blue-50/50">EE (3%)</th>
                                    <th className="p-2 border-b border-r border-gray-200 text-[9px] font-bold uppercase text-gray-500 text-right bg-blue-50/50">ER (3%)</th>
                                    <th className="p-2 border-b border-r border-gray-200 text-[9px] font-bold uppercase text-gray-800 text-right bg-blue-100/50">TOTAL</th>

                                    <th className="p-2 border-b border-r border-gray-200 text-[9px] font-bold uppercase text-gray-500 text-center bg-green-50/50">WKS</th>
                                    <th className="p-2 border-b border-r border-gray-200 text-[9px] font-bold uppercase text-gray-500 text-right bg-green-50/50">EE (2%)</th>
                                    <th className="p-2 border-b border-r border-gray-200 text-[9px] font-bold uppercase text-gray-500 text-right bg-green-50/50">ER (3%)</th>
                                    <th className="p-2 border-b border-gray-200 text-[9px] font-bold uppercase text-gray-800 text-right bg-green-100/50">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row) => (
                                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                                        <td className="p-2 border-r border-gray-100 py-1.5">
                                            <div className="text-[11px] font-bold text-blue-700 cursor-pointer hover:underline" onClick={() => navigate(`/reports/nht-letter/${row.id}?year=${year}`)}>
                                                {row.employeeName}
                                            </div>
                                        </td>
                                        <td className="p-2 border-r border-gray-100 text-[10px] font-mono text-gray-600">{row.trn}</td>
                                        <td className="p-2 border-r border-gray-100 text-[11px] font-semibold text-right">{row.grossPay.toFixed(2)}</td>

                                        {/* NIS */}
                                        <td className="p-2 border-r border-gray-100 text-[10px] font-bold text-center bg-blue-50/20">{row.wksNis}</td>
                                        <td className="p-2 border-r border-gray-100 text-[10px] text-right bg-blue-50/20">{row.nisEmployee.toFixed(2)}</td>
                                        <td className="p-2 border-r border-gray-100 text-[10px] text-right bg-blue-50/20">{row.nisEmployer.toFixed(2)}</td>
                                        <td className="p-2 border-r border-gray-100 text-[10px] font-bold text-right bg-blue-100/20">{row.nisTotal.toFixed(2)}</td>

                                        {/* NHT */}
                                        <td className="p-2 border-r border-gray-100 text-[10px] font-bold text-center bg-green-50/20">{row.wksNht}</td>
                                        <td className="p-2 border-r border-gray-100 text-[10px] text-right bg-green-50/20">{row.nhtEmployee.toFixed(2)}</td>
                                        <td className="p-2 border-r border-gray-100 text-[10px] text-right bg-green-50/20">{row.nhtEmployer.toFixed(2)}</td>
                                        <td className="p-2 text-[10px] font-bold text-right bg-green-100/20 border-r border-gray-100">{row.nhtTotal.toFixed(2)}</td>
                                    </tr>
                                ))}

                                {filteredData.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="11" className="p-8 text-center text-xs text-gray-400 font-bold uppercase">No data found for the selected year</td>
                                    </tr>
                                )}
                            </tbody>

                            {/* Grand Totals */}
                            {filteredData.length > 0 && (
                                <tfoot className="bg-gray-100 sticky bottom-0 border-t-2 border-gray-300 print:static">
                                    <tr>
                                        <td colSpan="2" className="p-2 px-4 text-right text-[11px] font-black uppercase text-gray-800 border-r border-gray-300">Grand Total</td>
                                        <td className="p-2 text-right text-[11px] font-black text-gray-900 border-r border-gray-300">${totals.grossPay.toFixed(2)}</td>
                                        <td className="p-2 bg-blue-100/50 border-r border-gray-200"></td>
                                        <td className="p-2 text-right text-[10px] font-bold text-gray-800 bg-blue-100/50 border-r border-gray-200">${totals.nisEmployee.toFixed(2)}</td>
                                        <td className="p-2 text-right text-[10px] font-bold text-gray-800 bg-blue-100/50 border-r border-gray-200">${totals.nisEmployer.toFixed(2)}</td>
                                        <td className="p-2 text-right text-[11px] font-black text-blue-900 bg-blue-200/50 border-r border-gray-300">${totals.nisTotal.toFixed(2)}</td>

                                        <td className="p-2 bg-green-100/50 border-r border-gray-200"></td>
                                        <td className="p-2 text-right text-[10px] font-bold text-gray-800 bg-green-100/50 border-r border-gray-200">${totals.nhtEmployee.toFixed(2)}</td>
                                        <td className="p-2 text-right text-[10px] font-bold text-gray-800 bg-green-100/50 border-r border-gray-200">${totals.nhtEmployer.toFixed(2)}</td>
                                        <td className="p-2 text-right text-[11px] font-black text-green-900 bg-green-200/50 border-r border-gray-300">${totals.nhtTotal.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsolidatedStatutoryReport;
