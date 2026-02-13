import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Printer, LogOut, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';

const PayrollRegisterPrint = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [zoom, setZoom] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 1;

    const [payrollData, setPayrollData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totals, setTotals] = useState({
        gross: 0,
        deductions: 0,
        tax: 0,
        net: 0,
        nis: 0,
        nht: 0,
        edTax: 0
    });

    // Get filter options from navigation state
    const filterOptions = location.state?.filterOptions || {
        payPeriod: '3',
        ofYear: '2026',
        paySeries: '',
        payGrade: '',
        employee: '',
        department: '',
        branch: '',
        location: ''
    };

    const reportOptions = location.state?.reportOptions || {};
    const orderOptions = location.state?.orderOptions || {};

    useEffect(() => {
        const fetchPayrollData = async () => {
            setIsLoading(true);
            try {
                const companyStr = localStorage.getItem('selectedCompany');
                const company = companyStr ? JSON.parse(companyStr) : null;

                if (company) {

                    let periodParam = filterOptions.payPeriod;
                    if ((periodParam.length <= 2) && !isNaN(periodParam)) {
                        const date = new Date();
                        date.setMonth(parseInt(periodParam) - 1);
                        periodParam = `${date.toLocaleString('default', { month: 'short' })}-${filterOptions.ofYear}`;
                    } else if (!periodParam.includes('-')) {
                        // Fallback if just a string like 'Feb', assume current year or default
                        // This is less likely if coming from PayrollRegister, but safe to handle
                        periodParam = `${periodParam}-${filterOptions.ofYear}`;
                    }

                    const res = await api.fetchPayrolls({
                        companyId: company.id,
                        period: periodParam
                    });

                    if (res.success) {
                        let processedData = res.data;

                        // Client-side filtering to match Register selection
                        if (filterOptions.department && !filterOptions.department.includes('ALL')) {
                            processedData = processedData.filter(p =>
                                (p.employee?.department?.name === filterOptions.department) ||
                                (p.employee?.department === filterOptions.department)
                            );
                        }

                        if (filterOptions.branch && !filterOptions.branch.includes('ALL')) {
                            processedData = processedData.filter(p => p.employee?.branch === filterOptions.branch);
                        }

                        if (filterOptions.employee && !filterOptions.employee.includes('ALL')) {
                            const searchName = filterOptions.employee.split('[')[0].trim().toLowerCase();
                            const searchId = filterOptions.employee.match(/\[(.*?)\]/)?.[1]?.toLowerCase();

                            processedData = processedData.filter(p => {
                                const fName = p.employee?.firstName?.toLowerCase() || '';
                                const lName = p.employee?.lastName?.toLowerCase() || '';
                                const empId = p.employee?.employeeId?.toLowerCase() || '';
                                const fullName = `${fName} ${lName}`;

                                if (searchId) return empId.includes(searchId);
                                return fullName.includes(searchName);
                            });
                        }

                        setPayrollData(processedData);

                        // Calculate totals
                        const newTotals = processedData.reduce((acc, curr) => ({
                            gross: acc.gross + parseFloat(curr.grossSalary || 0),
                            deductions: acc.deductions + parseFloat(curr.deductions || 0),
                            tax: acc.tax + parseFloat(curr.tax || 0),
                            net: acc.net + parseFloat(curr.netSalary || 0),
                            nis: acc.nis + (parseFloat(curr.nis || 0)),
                            nht: acc.nht + (parseFloat(curr.nht || 0)),
                            edTax: acc.edTax + (parseFloat(curr.edTax || 0))
                        }), { gross: 0, deductions: 0, tax: 0, net: 0, nis: 0, nht: 0, edTax: 0 });

                        setTotals(newTotals);
                    }
                }
            } catch (err) {
                console.error('Error fetching payroll data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayrollData();
    }, [filterOptions.payPeriod, filterOptions.ofYear, filterOptions.department, filterOptions.branch, filterOptions.employee]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

    const reportData = {
        companyName: JSON.parse(localStorage.getItem('selectedCompany') || '{}').name || 'COMPANY NAME',
        reportTitle: 'PAYROLL REGISTER',
        systemAuditInfo: {
            payrollPeriod: `${filterOptions.payPeriod} / ${filterOptions.ofYear}`,
            periodEnding: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            payrollCycle: `Monthly`,
            printDateTime: new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            printedBy: JSON.parse(localStorage.getItem('currentUser') || '{}').name || 'ADMIN'
        },
        reportOptions: {
            employees: filterOptions.employee || 'ALL',
            departments: filterOptions.department || 'ALL',
            branches: filterOptions.branch || 'ALL',
            locations: filterOptions.location || 'ALL',
            paySeries: filterOptions.paySeries || 'ALL',
            payGrade: filterOptions.payGrade || 'ALL',
            orderedBy: `${orderOptions.primaryOrder || 'Name'} (${orderOptions.primarySort || 'Asc'})`
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#808080] font-sans text-xs">
            {/* Toolbar */}
            <div className="bg-[#EBE9D8] border-b border-gray-400 px-2 py-1 flex items-center gap-2 no-print">
                <span className="font-bold text-gray-700">PayrollRegister.frx - Page 1</span>
                <div className="flex-1"></div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleZoomOut}
                        className="p-1 border border-gray-400 bg-white hover:bg-gray-100 active:bg-gray-200"
                        title="Zoom Out"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <span className="px-2 min-w-[50px] text-center font-bold">{zoom}%</span>
                    <button
                        onClick={handleZoomIn}
                        className="p-1 border border-gray-400 bg-white hover:bg-gray-100 active:bg-gray-200"
                        title="Zoom In"
                    >
                        <ZoomIn size={16} />
                    </button>
                    <div className="w-4"></div>
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="p-1 border border-gray-400 bg-white hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50"
                        title="Previous Page"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="px-2 font-bold">{currentPage} / {totalPages}</span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="p-1 border border-gray-400 bg-white hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50"
                        title="Next Page"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Content Area - Print Preview */}
            <div className="flex-1 p-2 sm:p-4 overflow-auto flex justify-center items-start">
                <div
                    className="bg-white shadow-lg border border-gray-300 w-full max-w-[900px] min-h-[1100px] p-4 sm:p-8 origin-top transition-transform duration-200"
                    style={{ transform: `scale(${zoom / 100})` }}
                >
                    {/* Report Header */}
                    <div className="text-center mb-4">
                        <h1 className="text-sm font-bold">{reportData.companyName}</h1>
                        <h2 className="text-lg font-bold mt-1">{reportData.reportTitle}</h2>
                    </div>

                    {/* Two Column Layout for System Audit Info and Report Options */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6 text-[10px]">
                        {/* System Audit Info */}
                        <div className="flex-1">
                            <div className="font-bold mb-1 border-b border-gray-400">SYSTEM AUDIT INFO</div>
                            <div className="grid grid-cols-[120px_1fr] gap-y-0.5">
                                <span className="font-bold">Payroll Period(s)</span>
                                <span>: {reportData.systemAuditInfo.payrollPeriod}</span>
                                <span className="font-bold">Period Ending</span>
                                <span>: {reportData.systemAuditInfo.periodEnding}</span>
                                <span className="font-bold">Payroll Cycle</span>
                                <span>: {reportData.systemAuditInfo.payrollCycle}</span>
                                <span className="font-bold">Print Date/Time</span>
                                <span>: {reportData.systemAuditInfo.printDateTime}</span>
                                <span className="font-bold">Printed By</span>
                                <span>: {reportData.systemAuditInfo.printedBy}</span>
                            </div>
                        </div>

                        {/* Report Options */}
                        <div className="flex-1">
                            <div className="font-bold mb-1 border-b border-gray-400">REPORT OPTION(S)</div>
                            <div className="grid grid-cols-[100px_1fr] gap-y-0.5">
                                <span className="font-bold">Employee(s)</span>
                                <span>: {reportData.reportOptions.employees}</span>
                                <span className="font-bold">Department(s)</span>
                                <span>: {reportData.reportOptions.departments}</span>
                                <span className="font-bold">Branch(es)</span>
                                <span>: {reportData.reportOptions.branches}</span>
                                <span className="font-bold">Location(s)</span>
                                <span>: {reportData.reportOptions.locations}</span>
                                <span className="font-bold">Pay Series</span>
                                <span>: {reportData.reportOptions.paySeries}</span>
                                <span className="font-bold">Pay Grade</span>
                                <span>: {reportData.reportOptions.payGrade}</span>
                                <span className="font-bold">Ordered By</span>
                                <span>: {reportData.reportOptions.orderedBy}</span>
                            </div>
                        </div>
                    </div>

                    {/* Employee Section */}
                    {isLoading ? (
                        <div className="mb-4 p-8 text-center">
                            <div className="text-blue-600 font-bold uppercase tracking-widest animate-pulse">Loading Payroll Data...</div>
                        </div>
                    ) : payrollData.length === 0 ? (
                        <div className="mb-4 p-8 text-center border-2 border-dashed border-gray-300">
                            <div className="text-gray-400 font-bold uppercase tracking-widest">No Payroll Records Found</div>
                            <div className="text-[10px] text-gray-400 mt-2">Try adjusting your filter criteria</div>
                        </div>
                    ) : (
                        payrollData.map((record, idx) => (
                            <div key={record.id || idx} className="mb-6 border-b border-gray-200 pb-4">
                                <div className="flex gap-4 text-[10px] border-b border-gray-600 pb-1 mb-2">
                                    <div>
                                        <span className="font-bold">Employee ID:</span> <span>{record.employee?.employeeId || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold">Name:</span> <span>{record.employee?.firstName} {record.employee?.lastName}</span>
                                    </div>
                                </div>

                                {/* Main Data Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[9px] border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="border-b border-gray-400">
                                                <th className="text-left p-1 font-bold">PERIOD</th>
                                                <th className="text-left p-1 font-bold">EMPLOYEE</th>
                                                <th className="text-right p-1 font-bold">GROSS SALARY</th>
                                                <th className="text-right p-1 font-bold">DEDUCTIONS</th>
                                                <th className="text-right p-1 font-bold">TAX</th>
                                                <th className="text-right p-1 font-bold">NET PAY</th>
                                                <th className="text-left p-1 font-bold">STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="p-1">{record.period}</td>
                                                <td className="p-1">{record.employee?.firstName} {record.employee?.lastName}</td>
                                                <td className="p-1 text-right">${parseFloat(record.grossSalary || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="p-1 text-right">${parseFloat(record.deductions || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="p-1 text-right">${parseFloat(record.tax || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="p-1 text-right font-bold">${parseFloat(record.netSalary || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="p-1">
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${record.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                        record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary for this employee */}
                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px]">
                                    <div className="border border-gray-300 p-2">
                                        <div className="font-bold text-gray-500">Gross Salary</div>
                                        <div className="text-right font-bold">${parseFloat(record.grossSalary || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="border border-gray-300 p-2">
                                        <div className="font-bold text-gray-500">Deductions</div>
                                        <div className="text-right font-bold text-red-600">${parseFloat(record.deductions || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="border border-gray-300 p-2">
                                        <div className="font-bold text-gray-500">Tax</div>
                                        <div className="text-right font-bold text-red-600">${parseFloat(record.tax || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="border border-gray-300 p-2 bg-green-50">
                                        <div className="font-bold text-gray-500">Net Pay</div>
                                        <div className="text-right font-bold text-green-700">${parseFloat(record.netSalary || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Report Summary Section */}
                    <div className="mt-6 border-t-2 border-gray-400 pt-4">
                        <div className="mb-2 text-xs font-black uppercase text-gray-600">Report Grand Totals</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 text-[9px]">
                            <div className="border border-gray-400 p-2 shadow-sm">
                                <div className="font-bold mb-1 border-b border-gray-200">TOTAL EARNINGS</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <span>Gross:</span>
                                    <span className="text-right font-bold">${totals.gross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    <span>Non-Taxable:</span>
                                    <span className="text-right">0.00</span>
                                </div>
                            </div>

                            <div className="border border-gray-400 p-2 shadow-sm">
                                <div className="font-bold mb-1 border-b border-gray-200">TOTAL DEDUCTIONS</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <span>Total Ded:</span>
                                    <span className="text-right font-bold text-red-600">${totals.deductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    <span>Total Tax:</span>
                                    <span className="text-right font-bold text-red-600">${totals.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="border border-gray-400 p-2 shadow-sm bg-gray-50">
                                <div className="font-bold mb-1 border-b border-gray-200 text-blue-900">STATUTORY BREAKDOWN (EST)</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <span>NHT:</span>
                                    <span className="text-right">{totals.nht > 0 ? totals.nht.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}</span>
                                    <span>NIS:</span>
                                    <span className="text-right">{totals.nis > 0 ? totals.nis.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}</span>
                                    <span>EdTax:</span>
                                    <span className="text-right">{totals.edTax > 0 ? totals.edTax.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}</span>
                                </div>
                            </div>

                            <div className="border border-gray-400 p-2 shadow-sm bg-yellow-50">
                                <div className="font-bold mb-1 border-b border-gray-200">NET DISBURSEMENT</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <span className="font-black text-gray-700">TOTAL NET:</span>
                                    <span className="text-right font-black text-green-700 text-lg">${totals.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="bg-[#EBE9D8] border-t border-gray-400 px-2 py-1 flex items-center gap-2 no-print mt-auto">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-3 py-1 border border-gray-400 bg-white hover:bg-gray-100"
                >
                    <Printer size={16} />
                    <span className="font-bold">Print</span>
                </button>
                <div className="flex-1"></div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 px-3 py-1 border border-gray-400 bg-white hover:bg-gray-100"
                >
                    <LogOut size={16} />
                    <span className="font-bold">Close</span>
                </button>
            </div>
        </div>
    );
};

export default PayrollRegisterPrint;
