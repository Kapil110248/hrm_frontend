import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Monitor, Settings, FileText, Printer, Search,
    CheckSquare, Folder, Layout, LogOut, X,
    ChevronDown, Save, Plus, HelpCircle, ChevronRight, Menu
} from 'lucide-react';

const Topbar = ({ onLogout, onSelectCompany, companyName, isCompanySelected = false, userRole }) => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [activeSubMenu, setActiveSubMenu] = useState(null);
    const [activeSubSubMenu, setActiveSubSubMenu] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const allMenus = [
        {
            name: 'System',
            items: [
                { label: 'Select Company', action: 'select_company' },
                {
                    label: 'General',
                    subItems: [
                        { label: 'General Details', action: 'general_details' },
                        {
                            label: 'Additional',
                            subItems: [
                                { label: 'Bank Details', action: 'bank_details' }
                            ]
                        }
                    ]
                },
                {
                    label: 'Company Setup',
                    subItems: [
                        { label: 'General Setup', action: 'company_general_setup' },
                        {
                            label: 'Additional Setup Options',
                            subItems: [
                                { label: 'Bank Details', action: 'bank_details' }
                            ]
                        }
                    ]
                },
                { label: 'Customized Modules', action: 'customized_modules' },
                { label: 'System Configuration', action: 'system_settings' },
                { label: 'System Logs', action: 'audit_logs' },
                { label: 'Log Out', action: 'logout' },
                { label: 'Quit', action: 'quit' }
            ]
        },
        {
            name: 'Finance',
            items: [
                {
                    label: 'Payslips',
                    subItems: [
                        { label: 'Generate & Manage', action: 'payslip_manage' },
                        { label: 'My Payslips', action: 'payslip_my' },
                        { label: 'Email Payslips', action: 'email_p24' }
                    ]
                },
                { type: 'separator' },
                {
                    label: 'Transaction Entry',
                    subItems: [
                        { label: 'All Entries', action: 'all_entries' },
                        { label: 'User Labels', action: 'user_labels' },
                        { label: 'Mass Entry', action: 'mass_entry' },
                        { label: 'Mass Updating', action: 'mass_updating' },
                        { label: 'Import Saved Entries', action: 'import_saved_entries' },
                        { label: 'Import Time Sheets', action: 'import_time_sheets' },
                        { label: 'Payroll Wizard', action: 'payroll_wizard' },
                        { label: 'Generate Sales Share', action: 'generate_sales_share' },
                        { label: 'Gang Shift Maintenance', action: 'gang_shift_maintenance' },
                        { label: 'Import JMD To FX Transactions', action: 'import_jmd_fx' }
                    ]
                },
                { label: 'Entered Transaction Register', action: 'entered_transaction_register' },
                { type: 'separator' },
                { label: 'Time Keeper', action: 'time_keeper' },
                { label: 'Post Transactions', action: 'post_transactions', shortcut: 'CTRL+F1' },
                { label: 'Posted Transaction Register', action: 'posted_transaction_register', shortcut: 'CTRL+F2' },
                { type: 'separator' },
                { label: 'Payroll Calculation', action: 'payroll_calculation' },
                { label: 'Calculation Register', action: 'calculation_register', shortcut: 'CTRL+F3' },
                { type: 'separator' },
                { label: 'Payroll Update', action: 'payroll_update' },
                { label: 'Payroll Register', action: 'payroll_register' },
                { label: 'Payroll Register Summary', action: 'payroll_register_summary' },
                { type: 'separator' },
                { label: 'Pay Disbursement', action: 'pay_disbursement' },
                { label: 'Payslips (Generate & Email · TRN Protected)', action: 'payslip_manage' },
                {
                    label: 'Cheque Printing',
                    subItems: [
                        { label: 'Batch Printing', action: 'cheque_batch' },
                        { label: 'Single Cheque', action: 'cheque_single' },
                        { label: 'Print History', action: 'cheque_history' }
                    ]
                },
                { type: 'separator' },
                {
                    label: 'Electronic Payments',
                    subItems: [
                        { label: 'BNS Beneficiary Transfer', action: 'bank_bns' },
                        { label: 'NCB Transfer', action: 'bank_ncb' },
                        { label: 'JN Bank Transfer', action: 'bank_jn' },
                        { label: 'JMMB Transfer', action: 'bank_jmmb' },
                        { label: 'Scotiabank Transfer', action: 'bank_scotia' },
                        { label: 'CIBC/First Global Transfer', action: 'bank_cibc' },
                        { label: 'Sagicor Bank Transfer', action: 'bank_sagicor' },
                        { label: 'CitiBank Transfer', action: 'bank_citibank' },
                        { label: 'Electronic Payment Advice', action: 'electronic_payment_advice' }
                    ]
                },
                { type: 'separator' },
                { label: 'Processing Status', action: 'processing_status' },
                { type: 'separator' },
                { label: 'Advance Payment', action: 'advance_payment' },
                { type: 'separator' },
                { label: 'Redundancy', action: 'redundancy' }
            ]
        },
        {
            name: 'HRM',
            items: [
                { label: 'Employee Management', action: 'employee_management' },
                { type: 'separator' },
                { label: 'Attendance Management', action: 'attendance_management' },
                { type: 'separator' },
                { label: 'Leave Management', action: 'leave_management' },
                { type: 'separator' },
                { label: 'Salary Management', action: 'salary_management' },
                { type: 'separator' },
                { label: 'Payroll Management', action: 'payroll_register' }
            ]
        },
        {
            name: 'Reports',
            items: [
                { label: 'Regulatory Reports Hub', action: 'reports_hub' },
                { type: 'separator' },
                {
                    label: 'Statutory Returns',
                    subItems: [
                        { label: 'P24 - Year End Certificate', action: 'stat_p24' },
                        { label: 'P45 - Termination Certificate', action: 'stat_p45' },
                        { label: 'NHT Contribution Report', action: 'stat_nht' },
                        { label: 'NIS / NHT Returns', action: 'stat_nis_nht' },
                        { label: 'S01 Monthly Return', action: 'stat_s01' },
                        { label: 'S02 Annual Return', action: 'stat_s02' },
                        { label: 'Pension Reports', action: 'stat_pension' },
                        { label: 'Tax Website Upload Files', action: 'stat_tax_upload' }
                    ]
                },
                { type: 'separator' },
                { label: 'Employee Report', action: 'employee_report' },
                { type: 'separator' },
                { label: 'Attendance Report', action: 'attendance_report' },
                { type: 'separator' },
                { label: 'Payroll Report', action: 'payroll_register' },
                { type: 'separator' },
                { label: 'Salary Report', action: 'salary_report' },
                { type: 'separator' },
                { label: 'Payroll Summary', action: 'payroll_summary' },
                { type: 'separator' },
                { label: 'Transaction Register', action: 'transaction_register_report' },
                { type: 'separator' },
                { label: 'Turnover Report', action: 'turnover_report' },
                { label: 'Year-to-Date Breakdown', action: 'ytd_breakdown' },
                { label: 'Retention Report', action: 'retention_report' },
                { type: 'separator' },
                { label: 'Crystal Reporting Interface', action: 'crystal_reporting' },
                { type: 'separator' },
                { label: 'Bank Transfer Advice', action: 'bank_transfer_advice' },
                { label: 'Email P24 Advice', action: 'email_p24' }
            ]
        },
        {
            name: 'Files',
            items: [
                { label: 'Export Data', action: 'files_export' },
                { label: 'Import Data', action: 'files_import' },
                { label: 'Backup System', action: 'files_backup' },
                { label: 'Restore System', action: 'files_restore' }
            ]
        }
    ];

    const menus = allMenus.map(menu => {
        // Filter items within the menu based on user role
        const filteredItems = menu.items.filter(item => {
            if (!userRole || userRole === 'ADMIN') return true;
            if (item.type === 'separator') return true;

            const action = item.action;
            const label = item.label;

            if (userRole === 'EMPLOYEE' || userRole === 'STAFF') {
                // Employees only see My Payslips and Reports Hub
                if (menu.name === 'Finance') {
                    return label === 'Payslips'; // Will need to filter subItems too
                }
                if (menu.name === 'Reports') {
                    return action === 'reports_hub';
                }
                if (menu.name === 'HRM') return false;
            }

            if (userRole === 'HR_MANAGER') {
                // HR Manager can access Finance menu for payroll/disbursement
                if (menu.name === 'Finance') return true;
            }

            if (userRole === 'FINANCE') {
                if (menu.name === 'HRM') return false;
            }

            return true;
        }).map(item => {
            // Further filter subItems if they exist (specifically for Payslips)
            if (item.subItems && (userRole === 'EMPLOYEE' || userRole === 'STAFF')) {
                return {
                    ...item,
                    subItems: item.subItems.filter(si => si.action === 'payslip_my')
                };
            }
            return item;
        }).filter(item => {
            // Remove items that ended up with no subItems if they were supposed to have them
            if (item.subItems && item.subItems.length === 0) return false;
            return true;
        });

        // Post-process to remove redundant separators
        const cleanedItems = filteredItems.reduce((acc, item) => {
            if (item.type === 'separator') {
                // Skip if it's the first item
                if (acc.length === 0) return acc;
                // Skip if the last item was also a separator
                if (acc[acc.length - 1].type === 'separator') return acc;
            }
            acc.push(item);
            return acc;
        }, []);

        // Remove trailing separator if present
        if (cleanedItems.length > 0 && cleanedItems[cleanedItems.length - 1].type === 'separator') {
            cleanedItems.pop();
        }

        return { ...menu, items: cleanedItems };
    }).filter(menu => {
        if (menu.items.length === 0) return false;
        if (!userRole || userRole === 'ADMIN') return true;

        switch (userRole) {
            case 'HR_MANAGER':
                return ['System', 'Finance', 'HRM', 'Reports'].includes(menu.name);
            case 'FINANCE':
                return ['System', 'Finance', 'Reports', 'Files'].includes(menu.name);
            case 'EMPLOYEE':
            case 'STAFF':
                return ['System', 'Finance', 'Reports', 'Files'].includes(menu.name);
            default:
                return false;
        }
    });

    const globalFileInputRef = React.useRef(null);
    const currentActionRef = React.useRef(null);

    const handleGlobalFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Map actions to specific wizard routes
            const routes = {
                'import_saved_entries': '/processing/import-saved',
                'import_time_sheets': '/processing/import-timesheets',
                'import_jmd_fx': '/processing/import-jmd-fx',
                'files_import': '/files/import',
                'files_backup': '/files/backup',
                'files_restore': '/files/restore'
            };

            const targetPath = routes[currentActionRef.current] || '/files/import';

            navigate(targetPath, {
                state: {
                    autoStart: true,
                    fileName: file.name,
                    fileSize: file.size
                }
            });
        }
    };

    const handleMenuClick = (item) => {
        if (item.subItems) return;

        // DIRECT USER GESTURE SYNC TRIGGER
        const isImportAction = [
            'files_import',
            'import_saved_entries',
            'import_time_sheets',
            'import_jmd_fx'
        ].includes(item.action);

        if (isImportAction) {
            currentActionRef.current = item.action;
            if (globalFileInputRef.current) {
                globalFileInputRef.current.click();
            }
            setActiveMenu(null);
            setIsMobileMenuOpen(false);
            return;
        }

        if (item.action === 'select_company') onSelectCompany();
        if (item.action === 'logout' || item.action === 'quit') onLogout();

        if (isCompanySelected) {
            // Navigation logic for all actions
            const navigateTo = {
                'company_general_setup': '/company/setup',
                'general_details': '/company/setup',
                'system_settings': '/company/system-settings',
                'customized_modules': '/company/custom-modules',
                'bank_details': '/bank/details',
                'all_entries': '/transaction/entry',
                'user_labels': '/processing/user-labels',
                'mass_entry': '/processing/mass-entry',
                'import_saved_entries': '/processing/import-saved',
                'import_time_sheets': '/processing/import-timesheets',
                'payroll_wizard': '/processing/payroll-wizard',
                'generate_sales_share': '/processing/sales-share',
                'gang_shift_maintenance': '/processing/gang-shift',
                'entered_transaction_register': '/processing/transaction-register',
                'time_keeper': '/processing/time-keeper',
                'post_transactions': '/processing/post-transactions',
                'posted_transaction_register': '/processing/posted-register',
                'payroll_calculation': '/processing/payroll-calculation',
                'calculation_register': '/processing/calculation-register',
                'payroll_update': '/processing/update',
                'payroll_register': '/payroll/register',
                'payroll_register_summary': '/reports/payroll-summary',
                'pay_disbursement': '/processing/disbursement',
                'processing_status': '/processing/status',
                'advance_payment': '/processing/advance',
                'redundancy': '/processing/redundancy',
                'employee_management': '/employees',
                'attendance_management': '/attendance',
                'leave_management': '/leave',
                'salary_management': '/salary',
                'employee_report': '/reports/employee',
                'attendance_report': '/reports/attendance',
                'salary_report': '/reports/salary',
                // New routes
                'stat_p24': '/statutory/p24',
                'stat_p45': '/statutory/p45',
                'stat_nht': '/statutory/nht',
                'stat_nis_nht': '/statutory/nis-nht',
                'stat_s01': '/statutory/s01',
                'stat_s02': '/statutory/s02',
                'stat_pension': '/statutory/pension',
                'stat_tax_upload': '/statutory/tax-upload',
                'payroll_summary_individual': '/reports/payroll-summary-individual',
                'bank_bns': '/banking/bns',
                'bank_ncb': '/banking/ncb',
                'bank_jn': '/banking/jn',
                'bank_jmmb': '/banking/jmmb',
                'bank_scotia': '/banking/bns', // Placeholder or specific route if exists
                'bank_cibc': '/banking/ncb',   // Placeholder
                'bank_sagicor': '/banking/sagicor',
                'bank_citibank': '/banking/citibank',
                'electronic_payment_advice': '/banking/payment-advice',
                'mass_updating': '/processing/mass-updating',
                'payroll_summary': '/reports/payroll-summary',
                'transaction_register_report': '/reports/transaction-register',
                'turnover_report': '/reports/turnover',
                'ytd_breakdown': '/reports/ytd-breakdown',
                'retention_report': '/reports/retention',
                'crystal_reporting': '/reports/crystal',
                'bank_transfer_advice': '/reports/bank-transfer-advice',
                'cheque_batch': '/processing/cheque-printing',
                'cheque_single': '/processing/cheque-single',
                'cheque_history': '/processing/cheque-history',
                'email_p24': '/reports/email-p24',
                'payslip_manage': '/payslips/manage',
                'payslip_my': '/employee/payslips',
                'reports_hub': '/reports/hub',
                'files_export': '/files?action=export',
                'files_import': '/files?action=import',
                'files_backup': '/files?action=backup',
                'files_restore': '/files?action=restore',
                'audit_logs': '/tools/audit',
            };

            const path = navigateTo[item.action];
            if (path) {
                navigate(path);
            } else if (item.action?.startsWith('files_')) {
                const actionSuffix = item.action.replace('files_', '');
                navigate(`/files?action=${actionSuffix}`);
            } else if (item.action) {
                // Default fallback for newly added items not yet in navigateTo
                navigate('/');
            }
        }

        if (!item.subItems) {
            setActiveMenu(null);
            setActiveSubMenu(null);
            setActiveSubSubMenu(null);
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex flex-col w-full font-sans select-none">
            {/* 1. Title Bar */}
            <div className="bg-[#0B4FD7] text-white h-8 flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="truncate max-w-[200px] md:max-w-none drop-shadow-md">HRM Payroll Terminal - {companyName || 'Session Restricted'}</span>
                </div>
                <div className="flex items-center gap-1">
                    {/* Window Controls Mockup */}
                    <div className="flex gap-1">
                        {/* <button
                            onClick={() => navigate('/')}
                            title="Minimize (Go to Dashboard)"
                            className="w-5 h-5 flex items-center justify-center bg-[#D4D0C8] text-black border border-white border-b-gray-600 border-r-gray-600 shadow-sm active:border-gray-600 active:border-b-white active:border-r-white text-[10px] pb-1 leading-none font-sans font-bold hover:bg-white"
                        >
                            _
                        </button> */}
                        <button
                            onClick={() => {
                                if (!document.fullscreenElement) {
                                    document.documentElement.requestFullscreen();
                                } else {
                                    if (document.exitFullscreen) {
                                        document.exitFullscreen();
                                    }
                                }
                            }}
                            title="Maximize (Toggle Fullscreen)"
                            className="w-5 h-5 flex items-center justify-center bg-[#D4D0C8] text-black border border-white border-b-gray-600 border-r-gray-600 shadow-sm active:border-gray-600 active:border-b-white active:border-r-white text-[10px] pb-0.5 leading-none font-sans font-bold hover:bg-white"
                        >
                            □
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to close the session?")) {
                                    onLogout();
                                }
                            }}
                            title="Close (Log Out)"
                            className="w-5 h-5 flex items-center justify-center bg-[#D4D0C8] text-black border border-white border-b-gray-600 border-r-gray-600 shadow-sm active:border-gray-600 active:border-b-white active:border-r-white text-[10px] pb-0.5 leading-none font-sans font-bold hover:bg-red-500 hover:text-white"
                        >
                            X
                        </button>
                    </div>
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden ml-2 w-6 h-6 flex items-center justify-center hover:bg-blue-600"
                    >
                        <Menu size={16} />
                    </button>
                </div>
            </div>

            {/* 2. Menu Bar (Desktop) */}
            <div className="hidden md:flex bg-[#F0F0F0] border-b border-gray-400 items-center px-1 h-6 relative z-50">
                {menus.map((menu) => (
                    <div
                        key={menu.name}
                        className="relative"
                        onMouseEnter={() => setActiveMenu(menu.name)}
                        onMouseLeave={() => setActiveMenu(null)}
                    >
                        <button
                            onClick={() => setActiveMenu(menu.name)}
                            className={`px-3 py-1 text-xs transition-colors ${activeMenu === menu.name ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {menu.name}
                        </button>

                        {activeMenu === menu.name && menu.items && menu.items.length > 0 && (
                            <div className="absolute top-full left-0 bg-[#EBE9D8] border border-gray-500 shadow-[2px_2px_0_rgba(0,0,0,0.2)] py-1 min-w-[220px] z-[100]">
                                <div className="flex flex-col">
                                    {menu.items.map((item, idx) => (
                                        item.type === 'separator' ? (
                                            <div key={idx} className="border-t border-gray-100 my-1"></div>
                                        ) : (
                                            <div
                                                key={idx}
                                                className="relative group"
                                                onMouseEnter={() => {
                                                    if (item.subItems) {
                                                        setActiveSubMenu(item.label);
                                                        setActiveSubSubMenu(null);
                                                    } else {
                                                        setActiveSubMenu(null);
                                                    }
                                                }}
                                            >
                                                <button
                                                    onClick={() => {
                                                        if (item.subItems) {
                                                            // Optional: Click can still toggle or do nothing if hover handles it
                                                            setActiveSubMenu(activeSubMenu === item.label ? null : item.label);
                                                        } else {
                                                            handleMenuClick(item);
                                                        }
                                                    }}
                                                    className="w-full text-left px-4 py-1.5 text-[11px] font-bold text-black hover:bg-[#0B4FD7] hover:text-white flex justify-between items-center group"
                                                >
                                                    <span>{item.label}</span>
                                                    {item.subItems && (
                                                        <ChevronRight
                                                            size={12}
                                                            className={`text-gray-400 group-hover:text-white transition-transform ${activeSubMenu === item.label ? 'rotate-90' : ''}`}
                                                        />
                                                    )}
                                                    {item.shortcut && <span className="text-gray-300 font-normal ml-4 text-[9px] uppercase tracking-tighter">{item.shortcut}</span>}
                                                </button>

                                                {/* Floating Nested Submenu - Level 2 */}
                                                {item.subItems && activeSubMenu === item.label && (
                                                    <div className="absolute left-full top-0 bg-[#EBE9D8] border border-gray-500 shadow-[2px_2px_0_rgba(0,0,0,0.2)] min-w-[220px] ml-[-1px] z-[101]">
                                                        {item.subItems.map((subItem, subIdx) => (
                                                            subItem.type === 'separator' ? (
                                                                <div key={subIdx} className="border-t border-gray-400 my-1 mx-2"></div>
                                                            ) : (
                                                                <div
                                                                    key={subIdx}
                                                                    className="relative group"
                                                                    onMouseEnter={() => {
                                                                        if (subItem.subItems) {
                                                                            setActiveSubSubMenu(subItem.label);
                                                                        } else {
                                                                            setActiveSubSubMenu(null);
                                                                        }
                                                                    }}
                                                                >
                                                                    <button
                                                                        onClick={() => {
                                                                            if (!subItem.subItems) {
                                                                                handleMenuClick(subItem);
                                                                            }
                                                                        }}
                                                                        className="w-full text-left px-4 py-1.5 text-[11px] font-bold text-black hover:bg-[#0B4FD7] hover:text-white flex justify-between items-center group cursor-default"
                                                                    >
                                                                        <span>{subItem.label}</span>
                                                                        {subItem.subItems && (
                                                                            <ChevronRight
                                                                                size={12}
                                                                                className={`text-black group-hover:text-white`}
                                                                            />
                                                                        )}
                                                                    </button>

                                                                    {/* Floating Nested Submenu - Level 3 */}
                                                                    {subItem.subItems && activeSubSubMenu === subItem.label && (
                                                                        <div className="absolute left-full top-0 bg-[#EBE9D8] border border-gray-500 shadow-[2px_2px_0_rgba(0,0,0,0.2)] min-w-[200px] ml-[-1px] z-[102]">
                                                                            {subItem.subItems.map((subSubItem, subSubIdx) => (
                                                                                <button
                                                                                    key={subSubIdx}
                                                                                    onClick={() => handleMenuClick(subSubItem)}
                                                                                    className="w-full text-left px-4 py-1.5 text-[11px] font-bold text-black hover:bg-[#0B4FD7] hover:text-white group cursor-default block"
                                                                                >
                                                                                    {subSubItem.label}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-[28px] bg-white z-[200] overflow-y-auto w-full overscroll-contain pb-12">
                    <div className="p-4 flex flex-col gap-2">
                        {menus.map((menu) => (
                            <div key={menu.name} className="border-b border-gray-100 pb-2">
                                <div className="font-bold text-[10px] text-gray-400 mb-2 px-2 uppercase tracking-widest">{menu.name}</div>
                                <div className="flex flex-col gap-0.5">
                                    {menu.items.map((item, idx) => (
                                        item.type !== 'separator' && (
                                            <div key={idx}>
                                                <button
                                                    onClick={() => {
                                                        if (item.subItems) {
                                                            setActiveSubMenu(activeSubMenu === item.label ? null : item.label);
                                                            setActiveSubSubMenu(null);
                                                        } else {
                                                            handleMenuClick(item);
                                                        }
                                                    }}
                                                    className="w-full text-left px-4 py-3 min-h-[44px] text-sm text-gray-700 hover:bg-gray-50 flex justify-between items-center rounded"
                                                >
                                                    <span className="font-medium uppercase tracking-tight text-xs">{item.label}</span>
                                                    {item.subItems && <ChevronDown size={16} className={`text-gray-400 shrink-0 ml-2 ${activeSubMenu === item.label ? 'rotate-180' : ''}`} />}
                                                </button>
                                                {item.subItems && activeSubMenu === item.label && (
                                                    <div className="pl-4 sm:pl-6 bg-gray-50 rounded mt-1 space-y-0.5">
                                                        {item.subItems.map((subItem, si) => (
                                                            subItem.type !== 'separator' && (
                                                                <div key={si}>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (subItem.subItems) {
                                                                                setActiveSubSubMenu(activeSubSubMenu === subItem.label ? null : subItem.label);
                                                                            } else {
                                                                                handleMenuClick(subItem);
                                                                            }
                                                                        }}
                                                                        className="w-full text-left px-4 py-3 min-h-[44px] text-xs text-gray-600 hover:bg-white border-l border-gray-200 flex justify-between items-center"
                                                                    >
                                                                        <span className="uppercase tracking-tight">{subItem.label}</span>
                                                                        {subItem.subItems && <ChevronDown size={14} className={`text-gray-400 shrink-0 ml-2 ${activeSubSubMenu === subItem.label ? 'rotate-180' : ''}`} />}
                                                                    </button>
                                                                    {subItem.subItems && activeSubSubMenu === subItem.label && (
                                                                        <div className="pl-6 sm:pl-8 bg-white rounded mt-1 space-y-0.5">
                                                                            {subItem.subItems.map((subSubItem, ssi) => (
                                                                                <button
                                                                                    key={ssi}
                                                                                    onClick={() => handleMenuClick(subSubItem)}
                                                                                    className="w-full text-left px-4 py-3 min-h-[44px] text-xs text-gray-500 border-l border-gray-100"
                                                                                >
                                                                                    {subSubItem.label}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={onLogout}
                            className="mt-6 min-h-[44px] border border-gray-300 text-gray-600 px-4 py-2 rounded flex items-center justify-center gap-2 font-bold text-xs uppercase"
                        >
                            <LogOut size={16} /> Close Session
                        </button>
                    </div>
                </div>
            )}

            {/* 3. Toolbar Icons */}
            <div className="bg-[#EBE9D8] border-b border-white flex items-center gap-1 sm:gap-1 px-2 py-1 h-9 overflow-x-auto no-scrollbar shadow-[inset_0_-1px_0_#808080]">
                {[
                    { icon: <Monitor size={16} />, color: 'text-blue-900', action: () => navigate('/'), title: 'Dashboard', access: ['ADMIN', 'HR_MANAGER', 'FINANCE', 'EMPLOYEE', 'STAFF'] },
                    { icon: <Plus size={16} />, color: 'text-blue-900', action: () => navigate('/employees'), title: 'New Employee', access: ['ADMIN', 'HR_MANAGER', 'FINANCE'] },
                    { icon: <FileText size={16} />, color: 'text-blue-900', action: () => navigate('/reports/hub'), title: 'Reports', access: ['ADMIN', 'HR_MANAGER', 'FINANCE', 'EMPLOYEE', 'STAFF'] },
                    { icon: <Printer size={16} />, color: 'text-blue-900', action: () => window.print(), title: 'Print', access: ['ADMIN', 'HR_MANAGER', 'FINANCE', 'EMPLOYEE', 'STAFF'] },
                    { icon: <Settings size={16} />, color: 'text-blue-900', action: () => navigate('/company/settings'), title: 'Settings', access: ['ADMIN'] },
                    { icon: <div className="h-4 w-[1px] bg-gray-400 mx-1"></div>, color: '', action: () => { }, title: '', access: ['ADMIN', 'HR_MANAGER', 'FINANCE', 'EMPLOYEE', 'STAFF'] }, // Separator
                    { icon: <Search size={16} />, color: 'text-blue-900', action: () => navigate('/search'), title: 'Search', access: ['ADMIN', 'HR_MANAGER', 'FINANCE', 'EMPLOYEE', 'STAFF'] },
                    { icon: <CheckSquare size={16} />, color: 'text-blue-900', action: () => navigate('/processing/status'), title: 'Validate', access: ['ADMIN', 'HR_MANAGER', 'FINANCE'] },
                    { icon: <Folder size={16} />, color: 'text-blue-900', action: () => navigate('/files'), title: 'Files', access: ['ADMIN', 'HR_MANAGER', 'FINANCE', 'EMPLOYEE', 'STAFF'] },
                    { icon: <Layout size={16} />, color: 'text-blue-900', action: () => navigate('/window'), title: 'Layout', access: ['ADMIN', 'HR_MANAGER', 'FINANCE', 'EMPLOYEE', 'STAFF'] },
                    { icon: <HelpCircle size={16} />, color: 'text-blue-900', action: () => navigate('/help'), title: 'Help', access: ['ADMIN', 'HR_MANAGER', 'FINANCE', 'EMPLOYEE', 'STAFF'] },
                ].filter(tool => !tool.access || tool.access.includes(userRole)).map((tool, idx) => (
                    tool.title ? (
                        <button
                            key={idx}
                            onClick={tool.action}
                            title={tool.title}
                            className="w-7 h-7 flex items-center justify-center border border-transparent hover:border-white hover:border-r-gray-500 hover:border-b-gray-500 hover:shadow-[1px_1px_0_rgba(0,0,0,0.1)] active:border-gray-500 active:border-r-white active:border-b-white active:shadow-inner bg-transparent transition-none"
                        >
                            <div className={`${tool.color}`}>{tool.icon}</div>
                        </button>
                    ) : (
                        <div key={idx} className="flex items-center">{tool.icon}</div>
                    )
                ))}
                <div className="flex-1 min-w-[10px]"></div>
            </div>

            {/* Dropdown Backdrop to close menus (Desktop) */}
            {activeMenu && (
                <div
                    className="hidden md:block fixed inset-0 z-40 bg-transparent"
                    onClick={() => setActiveMenu(null)}
                ></div>
            )}
            {/* Hidden Input for Global Tool Actions (Direct Sync Trigger) */}
            <input
                type="file"
                ref={globalFileInputRef}
                className="hidden"
                onChange={handleGlobalFileSelect}
                accept=".xlsx,.xls,.csv,.xml,.bak,.sql,.zip"
            />
        </div>
    );
};

export default Topbar;
