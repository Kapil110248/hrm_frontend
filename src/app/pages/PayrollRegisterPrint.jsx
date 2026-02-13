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
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    let periodParam = filterOptions.payPeriod;

                    if (!isNaN(periodParam) && parseInt(periodParam) >= 1 && parseInt(periodParam) <= 12) {
                        const monthIdx = parseInt(periodParam) - 1;
                        periodParam = `${months[monthIdx]}-${filterOptions.ofYear}`;
                    } else if (!periodParam.includes('-')) {
                        periodParam = `${periodParam}-${filterOptions.ofYear}`;
                    }

                    console.log('[PRINT_DEBUG] Fetching payload:', { companyId: company.id, period: periodParam });

                    const res = await api.fetchPayrolls({
                        companyId: company.id,
                        period: periodParam
                    });

                    if (res.success) {
                        let processedData = res.data;

                        // Advanced Client-side filtering
                        processedData = processedData.filter(p => {
                            const emp = p.employee || {};

                            // 1. Department Filter
                            if (filterOptions.department && !filterOptions.department.includes('ALL')) {
                                const dMatch = (emp.department?.name === filterOptions.department) ||
                                    (emp.department === filterOptions.department);
                                if (!dMatch) return false;
                            }

                            // 2. Branch/Location Filter (Partial Match)
                            if (filterOptions.branch && !filterOptions.branch.includes('ALL')) {
                                const filterVal = filterOptions.branch.toLowerCase();
                                const city = (emp.city || '').toLowerCase();
                                const parish = (emp.parish || '').toLowerCase();
                                const branch = (emp.branch || '').toLowerCase();

                                const bMatch = city.includes(filterVal) || parish.includes(filterVal) || branch.includes(filterVal) || filterVal.includes(city);
                                if (!bMatch) return false;
                            }

                            // 3. Pay Series (Frequency) Filter (Partial Match)
                            if (filterOptions.paySeries && !filterOptions.paySeries.includes('ALL')) {
                                const filterVal = filterOptions.paySeries.toLowerCase(); // e.g. "monthly (m01)"
                                const empFreq = (emp.payFrequency || '').toLowerCase(); // e.g. "monthly"

                                // Check if either string contains the other
                                const sMatch = empFreq.includes(filterVal) || filterVal.includes(empFreq);
                                if (!sMatch) return false;
                            }

                            // 4. Pay Grade (Hierarchy) Filter (Partial Match)
                            if (filterOptions.payGrade && !filterOptions.payGrade.includes('ALL')) {
                                const filterVal = filterOptions.payGrade.toLowerCase();
                                const empGrade = (emp.designation || '').toLowerCase();

                                const gMatch = empGrade === filterVal || empGrade.includes(filterVal) || filterVal.includes(empGrade);
                                if (!gMatch) return false;
                            }

                            // 5. Personnel Filter
                            if (filterOptions.employee && !filterOptions.employee.includes('ALL')) {
                                const searchName = filterOptions.employee.split('[')[0].trim().toLowerCase();
                                const searchId = filterOptions.employee.match(/\[(.*?)\]/)?.[1]?.toLowerCase();

                                const fName = emp.firstName?.toLowerCase() || '';
                                const lName = emp.lastName?.toLowerCase() || '';
                                const empId = emp.employeeId?.toLowerCase() || '';
                                const fullName = `${fName} ${lName}`;

                                if (searchId) {
                                    if (empId !== searchId) return false;
                                } else {
                                    if (!fullName.includes(searchName)) return false;
                                }
                            }

                            return true;
                        });

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
    }, [filterOptions.payPeriod, filterOptions.ofYear, filterOptions.department, filterOptions.branch, filterOptions.employee, filterOptions.paySeries, filterOptions.payGrade]);

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
                        <>
                            {/* Main Data Table */}
                            <div className="mb-6 overflow-x-auto">
                                <table className="w-full text-[9px] border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="border-b-2 border-black">
                                            <th className="text-left font-black uppercase py-2 w-[8%]">Emp ID</th>
                                            <th className="text-left font-black uppercase py-2 w-[22%]">Employee Name</th>
                                            <th className="text-left font-black uppercase py-2 w-[18%]">Department</th>
                                            <th className="text-left font-black uppercase py-2 w-[12%]">Job Title</th>
                                            <th className="text-left font-black uppercase py-2 w-[10%]">Location</th>
                                            <th className="text-right font-black uppercase py-2 w-[10%]">Gross Salary</th>
                                            <th className="text-right font-black uppercase py-2 w-[8%] text-red-600">Deductions</th>
                                            <th className="text-right font-black uppercase py-2 w-[8%] text-red-600">Tax</th>
                                            <th className="text-right font-black uppercase py-2 w-[10%] bg-gray-50">Net Pay</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payrollData.map((p, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-yellow-50">
                                                <td className="py-1.5 text-gray-700 font-bold align-top">{p.employee?.employeeId}</td>
                                                <td className="py-1.5 text-blue-900 font-bold uppercase align-top">{p.employee?.firstName} {p.employee?.lastName}</td>
                                                <td className="py-1.5 text-gray-600 uppercase align-top">{p.employee?.department?.name || p.employee?.department || '-'}</td>
                                                <td className="py-1.5 text-gray-500 uppercase italic text-[8px] align-top">{p.employee?.designation || '-'}</td>
                                                <td className="py-1.5 text-gray-500 uppercase italic text-[8px] align-top">{p.employee?.city || p.employee?.branch || '-'}</td>
                                                <td className="py-1.5 text-right text-gray-800 font-mono align-top">{formatCurrency(p.grossSalary)}</td>
                                                <td className="py-1.5 text-right text-red-500 font-mono align-top">{formatCurrency(p.deductions)}</td>
                                                <td className="py-1.5 text-right text-red-500 font-mono align-top">{formatCurrency(p.tax)}</td>
                                                <td className="py-1.5 text-right text-green-700 font-black font-mono bg-gray-50 align-top">{formatCurrency(p.netSalary)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Report Summary Section */}
                            <div className="mt-8 border-t-2 border-gray-800 pt-4">
                                <div className="mb-3 text-[10px] font-black uppercase text-gray-700 tracking-wider">Report Grand Totals</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[9px]">

                                    {/* Earnings Summary */}
                                    <div className="border border-gray-400 p-2 shadow-sm">
                                        <div className="font-bold mb-2 border-b border-gray-200 pb-1 text-gray-600">TOTAL EARNINGS</div>
                                        <div className="grid grid-cols-[1fr_auto] gap-y-1">
                                            <span>Total Gross:</span>
                                            <span className="font-bold font-mono">{formatCurrency(totals.gross)}</span>
                                            <span className="text-gray-500">Non-Taxable:</span>
                                            <span className="text-gray-500 font-mono">0.00</span>
                                        </div>
                                    </div>

                                    {/* Deductions Summary */}
                                    <div className="border border-gray-400 p-2 shadow-sm">
                                        <div className="font-bold mb-2 border-b border-gray-200 pb-1 text-gray-600">TOTAL DEDUCTIONS</div>
                                        <div className="grid grid-cols-[1fr_auto] gap-y-1">
                                            <span>Total Ded:</span>
                                            <span className="font-bold text-red-600 font-mono">{formatCurrency(totals.deductions)}</span>
                                            <span>Total Tax:</span>
                                            <span className="font-bold text-red-600 font-mono">{formatCurrency(totals.tax)}</span>
                                        </div>
                                    </div>

                                    {/* Statutory Breakdown */}
                                    <div className="border border-gray-400 p-2 shadow-sm bg-gray-50">
                                        <div className="font-bold mb-2 border-b border-gray-200 pb-1 text-blue-600">STATUTORY BREAKDOWN (EST)</div>
                                        <div className="grid grid-cols-[1fr_auto] gap-y-1 text-gray-500">
                                            <span>NHT:</span>
                                            <span className="font-mono">{formatCurrency(totals.nht)}</span>
                                            <span>NIS:</span>
                                            <span className="font-mono">{formatCurrency(totals.nis)}</span>
                                            <span>EdTax:</span>
                                            <span className="font-mono">{formatCurrency(totals.edTax)}</span>
                                        </div>
                                    </div>

                                    {/* Net Disbursement */}
                                    <div className="border-2 border-green-600 p-2 shadow-md bg-green-50 flex flex-col justify-center">
                                        <div className="font-black text-[10px] uppercase text-green-800 mb-1">NET DISBURSEMENT</div>
                                        <div className="text-left text-xs text-gray-600">TOTAL NET:</div>
                                        <div className="text-right text-xl font-black text-green-700 mt-auto font-mono">{formatCurrency(totals.net)}</div>
                                    </div>

                                </div>
                            </div>
                        </>
                    )}
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
                    onClick={() => navigate('/payroll/register')}
                    className="px-3 py-1 border border-gray-400 bg-white hover:bg-gray-100"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

// Helper for currency formatting
const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default PayrollRegisterPrint;
