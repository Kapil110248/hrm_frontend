import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Parties from './masters/Parties';
import Items from './masters/Items';
import Ledgers from './masters/Ledgers';
import Sales from './entries/Sales';
import Purchase from './entries/Purchase';
import Payment from './entries/Payment';
import LedgerReport from './reports/LedgerReport';
import TrialBalance from './reports/TrialBalance';
import ProfitLoss from './reports/ProfitLoss';
import CompanySettings from './pages/CompanySettings';
import CompanySettingsPage from './pages/CompanySettingsPage';
import BankDetails from './pages/BankDetails';
import Dashboard from './pages/Dashboard'; // Keep for fallback
import TransactionEntry from './pages/TransactionEntry';
import PayrollRegister from './pages/PayrollRegister';
import PayrollRegisterPrint from './pages/PayrollRegisterPrint';
import EmployeeManagement from './pages/EmployeeManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import LeaveManagement from './pages/LeaveManagement';
import SalaryManagement from './pages/SalaryManagement';
import EmployeeReport from './pages/EmployeeReport';
import AttendanceReport from './pages/AttendanceReport';
import SalaryReport from './pages/SalaryReport';
import Settings from './pages/Settings';
import TimeKeeper from './pages/TimeKeeper';
import PayrollCalculation from './pages/PayrollCalculation';
import AdvancePayment from './pages/AdvancePayment';
import ProcessingStatus from './pages/ProcessingStatus';
import PayDisbursement from './pages/PayDisbursement';
import TransactionRegister from './pages/TransactionRegister';
import PayrollUpdate from './pages/PayrollUpdate';
import FileManager from './pages/FileManager';
import SystemTools from './pages/SystemTools';
import TransactionRecords from './pages/TransactionRecords';
import PayrollWizard from './pages/PayrollWizard';
import Redundancy from './pages/Redundancy';
import CalculationRegister from './pages/CalculationRegister';
import ModulePlaceholder from './pages/ModulePlaceholder';
import JamaicaStatutory from './pages/JamaicaStatutory';
import BankIntegrations from './pages/BankIntegrations';
import ChequePrinting from './pages/ChequePrinting';
import EmailPayslips from './pages/EmailPayslips';
import PayslipManagement from './pages/PayslipManagement';
import MyPayslips from './pages/MyPayslips';
import EmployeeDocuments from './pages/EmployeeDocuments';
import ImportWizard from './pages/ImportWizard';
import ReportsHub from './pages/ReportsHub';
import PayrollSummaryReport from './pages/PayrollSummaryReport';
import TurnoverReport from './pages/TurnoverReport';
import YTDBreakdownReport from './pages/YTDBreakdownReport';
import RetentionReport from './pages/RetentionReport';
import CrystalReporting from './pages/CrystalReporting';
import BankTransferAdvice from './pages/BankTransferAdvice';
import P24Report from './pages/P24Report';
import NHTReport from './pages/NHTReport';
import NISReport from './pages/NISReport';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import HrDashboard from './pages/dashboards/HrDashboard';
import FinanceDashboard from './pages/dashboards/FinanceDashboard';
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard';
import UserLabels from './pages/UserLabels';
import MassEntry from './pages/MassEntry';
import MassUpdating from './pages/MassUpdating';
import GenerateSalesShare from './pages/GenerateSalesShare';
import GangShiftMaintenance from './pages/GangShiftMaintenance';
import PostedTransactionRegister from './pages/PostedTransactionRegister';
import PostTransactions from './pages/PostTransactions';
import CustomizedModules from './pages/CustomizedModules';
import GlobalSearch from './pages/GlobalSearch';
import HelpSupport from './pages/HelpSupport';
import WindowManagement from './pages/WindowManagement';
import SingleChequePrinting from './pages/SingleChequePrinting';
import ChequePrintHistory from './pages/ChequePrintHistory';
import SystemDiagnostics from './pages/SystemDiagnostics';
import DatabaseCleanup from './pages/DatabaseCleanup';
import SecurityAudit from './pages/SecurityAudit';
import AuditLogs from './pages/AuditLogs';

import ProtectedRoute from './ProtectedRoute';

const RoleBasedDashboard = ({ user }) => {
    if (!user) return <Dashboard />;
    switch (user.role) {
        case 'ADMIN': return <AdminDashboard />;
        case 'HR_MANAGER': return <HrDashboard />;
        case 'FINANCE': return <FinanceDashboard />;
        case 'EMPLOYEE':
        case 'STAFF': return <EmployeeDashboard />;
        default: return <HrDashboard />;
    }
};

import PayPeriodManagement from './pages/PayPeriodManagement';
import RunPayroll from './pages/RunPayroll';
import PayrollReview from './pages/PayrollReview';
import PayrollHistory from './pages/PayrollHistory';
import PayslipPreview from './pages/PayslipPreview';
import EmployeePayrollSettings from './pages/EmployeePayrollSettings';
import P45Report from './pages/P45Report';


const AppRoutes = ({ onLogout, currentUser }) => {
    return (
        <Routes>
            <Route element={<MainLayout onLogout={onLogout} />}>
                {/* 1. Dashboard (Open to all logged in users) */}
                <Route path="/" element={<RoleBasedDashboard user={currentUser} />} />

                {/* Global Tools & Pages */}
                <Route path="/search" element={<GlobalSearch />} />
                <Route path="/help" element={<HelpSupport />} />
                <Route path="/window" element={<WindowManagement />} />
                <Route path="/format" element={<ModulePlaceholder title="Report Formatting" />} />
                <Route path="/files" element={<FileManager />} />
                <Route path="/files/import" element={<ImportWizard />} />
                <Route path="/files/backup" element={<ImportWizard />} />
                <Route path="/files/restore" element={<ImportWizard />} />
                <Route path="/reports/hub" element={<ReportsHub />} />

                {/* 2. HR & Admin Modules */}
                <Route element={<ProtectedRoute user={currentUser} allowedRoles={['ADMIN', 'HR_MANAGER', 'FINANCE']} />}>
                    <Route path="/employees" element={<EmployeeManagement />} />
                    <Route path="/attendance" element={<AttendanceManagement />} />
                    <Route path="/leave" element={<LeaveManagement />} />
                    <Route path="/salary" element={<SalaryManagement />} />
                    <Route path="/employees/payroll-settings" element={<EmployeePayrollSettings />} />
                    <Route path="/payroll/periods" element={<PayPeriodManagement />} />
                    <Route path="/payroll/history" element={<PayrollHistory />} />
                    <Route path="/payroll/payslip-preview" element={<PayslipPreview />} />
                    <Route path="/payroll/register" element={<PayrollRegister />} />
                    <Route path="/payroll/register/print" element={<PayrollRegisterPrint />} />

                    {/* Processing */}
                    <Route path="/processing/transaction-register" element={<TransactionRegister />} />
                    <Route path="/processing/time-keeper" element={<TimeKeeper />} />
                    <Route path="/processing/run-payroll" element={<RunPayroll />} />
                    <Route path="/processing/payroll-review" element={<PayrollReview />} />
                    <Route path="/processing/payroll-calculation" element={<PayrollCalculation />} />
                    <Route path="/processing/advance" element={<AdvancePayment />} />
                    <Route path="/processing/status" element={<ProcessingStatus />} />
                    <Route path="/processing/payroll-wizard" element={<PayrollWizard />} />
                    <Route path="/processing/calculation-register" element={<CalculationRegister />} />
                    <Route path="/processing/update" element={<PayrollUpdate />} />
                    <Route path="/processing/redundancy" element={<Redundancy />} />
                    <Route path="/processing/user-labels" element={<UserLabels />} />
                    <Route path="/processing/mass-entry" element={<MassEntry />} />
                    <Route path="/processing/import-saved" element={<ImportWizard />} />
                    <Route path="/processing/import-timesheets" element={<ImportWizard />} />
                    <Route path="/processing/import-jmd-fx" element={<ImportWizard />} />
                    <Route path="/processing/sales-share" element={<GenerateSalesShare />} />
                    <Route path="/processing/gang-shift" element={<GangShiftMaintenance />} />
                    <Route path="/processing/post-transactions" element={<PostTransactions />} />
                    <Route path="/processing/posted-register" element={<PostedTransactionRegister />} />
                    <Route path="/processing/mass-updating" element={<MassUpdating />} />
                    <Route path="/email-payslips" element={<EmailPayslips />} />

                    {/* HR Reports */}
                    <Route path="/reports/employee" element={<EmployeeReport />} />
                    <Route path="/reports/attendance" element={<AttendanceReport />} />
                    <Route path="/reports/salary" element={<SalaryReport />} />
                    <Route path="/reports/nis" element={<NISReport />} />
                    <Route path="/reports/p24" element={<P24Report />} />
                    <Route path="/reports/p45" element={<P45Report />} />
                    <Route path="/reports/nht" element={<NHTReport />} />
                    <Route path="/payslips/manage" element={<PayslipManagement />} />
                    <Route path="/reports/payroll-summary" element={<PayrollSummaryReport />} />
                    <Route path="/reports/payroll-summary-individual" element={<PayrollSummaryReport individual={true} />} />
                    <Route path="/reports/transaction-register" element={<TransactionRegister />} />
                    <Route path="/reports/turnover" element={<TurnoverReport />} />
                    <Route path="/reports/ytd-breakdown" element={<YTDBreakdownReport />} />
                    <Route path="/reports/retention" element={<RetentionReport />} />
                    <Route path="/reports/email-p24" element={<EmailPayslips />} />
                </Route>

                {/* 3. Finance & Admin Modules */}
                <Route element={<ProtectedRoute user={currentUser} allowedRoles={['ADMIN', 'FINANCE']} />}>
                    <Route path="/entries/*" element={<Sales />} /> {/* Fallback or specific */}
                    <Route path="/entries/sales" element={<Sales />} />
                    <Route path="/entries/purchase" element={<Purchase />} />
                    <Route path="/entries/payment" element={<Payment />} />

                    <Route path="/masters/parties" element={<Parties />} />
                    <Route path="/masters/items" element={<Items />} />
                    <Route path="/masters/ledgers" element={<Ledgers />} />

                    <Route path="/reports/ledger" element={<LedgerReport />} />
                    <Route path="/reports/trial-balance" element={<TrialBalance />} />
                    <Route path="/reports/profit-loss" element={<ProfitLoss />} />

                    <Route path="/bank/details" element={<BankDetails />} />
                    <Route path="/transaction/entry" element={<TransactionEntry />} />

                    <Route path="/processing/disbursement" element={<PayDisbursement />} />
                    <Route path="/processing/cheque-printing" element={<ChequePrinting />} />
                    <Route path="/processing/cheque-single" element={<SingleChequePrinting />} />
                    <Route path="/processing/cheque-history" element={<ChequePrintHistory />} />

                    {/* Finance Reports */}
                    <Route path="/reports/bank-transfer-advice" element={<BankTransferAdvice />} />
                    <Route path="/reports/crystal" element={<CrystalReporting />} />

                    {/* Banking Integrations */}
                    <Route path="/banking/bns" element={<BankIntegrations bank="BNS" />} />
                    <Route path="/banking/ncb" element={<BankIntegrations bank="NCB" />} />
                    <Route path="/banking/jn" element={<BankIntegrations bank="JN" />} />
                    <Route path="/banking/jmmb" element={<BankIntegrations bank="JMMB" />} />
                    <Route path="/banking/sagicor" element={<BankIntegrations bank="SAGICOR" />} />
                    <Route path="/banking/citibank" element={<BankIntegrations bank="CITIBANK" />} />
                    <Route path="/banking/payment-advice" element={<ModulePlaceholder title="Electronic Payment Advice Module" />} />

                    {/* Statutory (Finance usually handles payments/filing) */}
                    <Route path="/statutory/p24" element={<P24Report />} />
                    <Route path="/statutory/p45" element={<JamaicaStatutory type="P45" />} />
                    <Route path="/statutory/nht" element={<NHTReport />} />
                    <Route path="/statutory/nis-nht" element={<JamaicaStatutory type="NIS-NHT" />} />
                    <Route path="/statutory/s01" element={<JamaicaStatutory type="S01" />} />
                    <Route path="/statutory/s02" element={<JamaicaStatutory type="S02" />} />
                    <Route path="/statutory/pension" element={<JamaicaStatutory type="Pension" />} />
                    <Route path="/statutory/tax-upload" element={<JamaicaStatutory type="TaxUpload" />} />
                </Route>

                {/* 4. Admin Only Modules */}
                <Route element={<ProtectedRoute user={currentUser} allowedRoles={['ADMIN']} />}>
                    <Route path="/company/setup" element={<CompanySettings />} />
                    <Route path="/company/settings" element={<CompanySettingsPage />} />
                    <Route path="/company/system-settings" element={<Settings />} />
                    <Route path="/company/custom-modules" element={<CustomizedModules />} />
                    <Route path="/tools" element={<SystemTools />} />
                    <Route path="/tools/diagnostics" element={<SystemDiagnostics />} />
                    <Route path="/tools/cleanup" element={<DatabaseCleanup />} />
                    <Route path="/tools/security" element={<SecurityAudit />} />
                    <Route path="/tools/audit" element={<AuditLogs />} />
                </Route>

                {/* 5. Employee Access (Self Service) */}
                <Route element={<ProtectedRoute user={currentUser} allowedRoles={['ADMIN', 'HR_MANAGER', 'FINANCE', 'EMPLOYEE']} />}>
                    <Route path="/employee/payslips" element={<MyPayslips />} />
                    <Route path="/employee/documents" element={<EmployeeDocuments />} />
                    {/* Shared Routes or Common Pages */}
                    <Route path="/transactions" element={<TransactionRecords />} />
                </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
