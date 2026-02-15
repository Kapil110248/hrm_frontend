import React, { useState, useEffect } from 'react';
import {
    FileText, Download, Calendar, Lock, Loader2
} from 'lucide-react';
import { api } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MyPayslips = () => {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [employee, setEmployee] = useState(null);
    const [activeUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [selectedCompany] = useState(JSON.parse(localStorage.getItem('selectedCompany') || '{}'));

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Employee Profile/Stats to get name and ID
            const statsRes = await api.fetchEmployeeDashboardStats();
            if (statsRes.success && statsRes.data.employee) {
                setEmployee(statsRes.data.employee);
            }

            // 2. Fetch Payroll History
            const response = await api.fetchPayrolls({
                email: activeUser.email
            });
            if (response.success) {
                setHistory(response.data.map(p => ({
                    id: p.id,
                    period: p.period,
                    date: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString(),
                    net: new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(parseFloat(p.netSalary)),
                    status: p.status,
                    raw: p // Keep raw data for PDF calcs
                })));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeUser.id]);

    const handleDownload = (slip) => {
        try {
            const doc = new jsPDF();
            const primaryColor = [0, 85, 229]; // #0055E5
            const secondaryColor = [100, 100, 100];

            // --- PAGE BORDER ---
            doc.setDrawColor(200, 200, 200);
            doc.rect(5, 5, 200, 287);

            // --- HEADER ---
            doc.setFillColor(...primaryColor);
            doc.rect(10, 10, 190, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text(selectedCompany?.name || 'ISLAND HR SOLUTIONS', 20, 25);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('OFFICIAL ELECTRONIC PAYSLIP :: CONFIDENTIAL', 20, 32);
            doc.text(`PAY PERIOD: ${slip.period.toUpperCase()}`, 20, 38);

            doc.setFontSize(14);
            doc.text('CONFIRMED', 160, 25);
            doc.setFontSize(8);
            doc.text('CRYPTO-SIGNED', 160, 30);

            // --- EMPLOYEE INFORMATION SECTION ---
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('PERSONNEL INFORMATION', 15, 65);
            doc.line(15, 67, 195, 67);

            const firstName = employee?.firstName || activeUser.firstName || 'Staff';
            const lastName = employee?.lastName || activeUser.lastName || 'Member';
            const empId = employee?.employeeId || activeUser.employeeId || 'USR-404';

            const empDetails = [
                ['Employee Name:', `${firstName} ${lastName}`.toUpperCase()],
                ['Employee ID:', empId],
                ['Designation:', (employee?.designation || 'Staff').toUpperCase()],
                ['TRN Number:', employee?.trn || '---'],
                ['Date of Issue:', slip.date]
            ];

            autoTable(doc, {
                startY: 70,
                body: empDetails,
                theme: 'plain',
                styles: { fontSize: 9, cellPadding: 1 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } }
            });

            // --- EARNINGS & DEDUCTIONS ---
            // Use lastAutoTable.finalY from the doc object which jspdf-autotable populates
            const finalY = (doc.lastAutoTable?.finalY || 100) + 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('FINANCIAL BREAKDOWN', 15, finalY);
            doc.line(15, finalY + 2, 195, finalY + 2);

            const p = slip.raw || {};
            const financialData = [
                ['Basic Salary / Earnings', new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(parseFloat(p.grossSalary || 0)), ''],
                ['Total Tax & Statutory Deductions', '', new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(parseFloat(p.tax || 0))],
                ['Other Deductions', '', new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD' }).format(parseFloat(p.deductions || 0))],
            ];

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Description', 'Earnings', 'Deductions']],
                body: financialData,
                theme: 'striped',
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
                styles: { fontSize: 9 }
            });

            // --- SUMMARY BOX ---
            const lastY = (doc.lastAutoTable?.finalY || 150) + 15;
            doc.setFillColor(245, 247, 250);
            doc.rect(120, lastY, 75, 25, 'F');
            doc.setDrawColor(...primaryColor);
            doc.rect(120, lastY, 75, 25);

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('NET PAYABLE', 125, lastY + 10);
            doc.setFontSize(16);
            doc.setTextColor(...primaryColor);
            doc.text(slip.net, 125, lastY + 20);

            // --- FOOTER ---
            doc.setFontSize(8);
            doc.setTextColor(...secondaryColor);
            doc.setFont('helvetica', 'italic');
            doc.text('Note: This is a computer-generated payslip and does not require a physical signature.', 15, 275);
            doc.text(`Generated on ${new Date().toLocaleString()} | Island HRM Core v4.2`, 15, 280);

            // Signature Line
            doc.line(130, 270, 190, 270);
            doc.text('Authorized Finance Officer', 145, 275);

            doc.save(`PAYSLIP_${slip.period.replace(/[\s-]/g, '_')}_${empId}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("Failed to generate PDF. Please try again. Error: " + error.message);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-50 font-sans p-4 sm:p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-8">
                <div className="flex items-center gap-3">
                    <FileText className="text-blue-600 size-6 sm:size-8" />
                    <h1 className="text-xl sm:text-3xl font-black text-gray-800 italic uppercase tracking-tighter">My Payslip History</h1>
                </div>
                <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Confidential Financial Records :: Station {employee?.employeeId || 'USR'}</p>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-900 text-white p-4 sm:p-6 rounded-xl shadow-2xl mb-8 flex items-center gap-6 border-l-8 border-blue-400 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <Lock size={80} />
                </div>
                <div className="bg-blue-800 p-3 rounded-lg shadow-inner">
                    <Lock size={28} className="text-blue-200" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-sm sm:text-base font-black uppercase italic tracking-widest">Secure Document Access Protocol</h3>
                    <p className="text-[10px] sm:text-xs text-blue-200 mt-1 font-bold">
                        Your electronic payslips are AES-256 encrypted. Use your TRN Number to decrypt downloaded files.
                    </p>
                </div>
            </div>

            {/* Payslip List */}
            <div className="grid gap-4 sm:gap-6">
                {loading ? (
                    <div className="p-20 text-center italic font-black text-gray-300 uppercase tracking-[0.5em] animate-pulse">Requesting Secure Feed...</div>
                ) : history.length === 0 ? (
                    <div className="p-20 text-center italic font-black text-gray-300 uppercase tracking-[0.5em]">Inventory cache is currently empty.</div>
                ) : history.map((slip) => (
                    <div key={slip.id} className="bg-white p-4 sm:p-8 rounded-xl border-2 border-white border-r-gray-200 border-b-gray-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col sm:flex-row items-center justify-between group">
                        <div className="flex items-center gap-6 w-full sm:w-auto mb-4 sm:mb-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 border-2 border-white rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Calendar size={28} className="sm:size-32" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl sm:text-2xl font-black text-gray-800 italic uppercase tracking-tighter group-hover:text-blue-900">{slip.period}</span>
                                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Disbursement: {slip.date}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Net Remittance</span>
                                <span className="text-xl sm:text-2xl font-black text-blue-800 italic tabular-nums tracking-tighter">{slip.net}</span>
                            </div>
                            <button
                                onClick={() => handleDownload(slip)}
                                className="flex items-center gap-2 px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-black uppercase italic tracking-widest shadow-lg active:translate-y-1 active:shadow-none transition-all border-b-4 border-blue-900"
                            >
                                <Download size={16} /> Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-10 flex justify-center border-t border-gray-100 mt-12 pb-6">
                <p className="text-[10px] sm:text-xs text-gray-400 font-black uppercase italic tracking-widest">
                    Manual Verification Terminal :: <span className="text-blue-600 cursor-help underline decoration-dotted">DOCKET_ID_404</span>
                </p>
            </div>
        </div>
    );
};

export default MyPayslips;
