import apiClient from '../api/apiClient';

export const api = {
    login: async (email, password) => {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            if (response.success) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            }
            return response;
        } catch (error) {
            return { success: false, message: error.message || 'Login failed' };
        }
    },

    logout: async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await apiClient.post('/auth/logout', { refreshToken });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.clear();
        }
    },

    fetchSessions: async () => {
        return apiClient.get('/auth/sessions');
    },

    terminateSessions: async (currentRefreshToken) => {
        return apiClient.post('/auth/terminate-sessions', { currentRefreshToken });
    },

    fetchCompanies: async () => {
        return apiClient.get('/companies');
    },

    createCompany: async (data) => {
        return apiClient.post('/companies', data);
    },

    updateCompany: async (id, data) => {
        return apiClient.put(`/companies/${id}`, data);
    },

    fetchEmployees: async (companyId) => {
        return apiClient.get(`/employees?companyId=${companyId}`);
    },

    createEmployee: async (data) => {
        return apiClient.post('/employees', data);
    },

    updateEmployee: async (id, data) => {
        return apiClient.put(`/employees/${id}`, data);
    },

    bulkUpdateEmployees: async (data) => {
        return apiClient.put('/employees/bulk-update', data);
    },

    deleteEmployee: async (id) => {
        return apiClient.delete(`/employees/${id}`);
    },

    fetchAdminStats: async (companyId) => {
        const query = companyId ? `?companyId=${companyId}` : '';
        return apiClient.get(`/dashboard/admin-stats${query}`);
    },

    fetchAuditLogs: async (limit = 10) => {
        return apiClient.get(`/audit?limit=${limit}`);
    },

    fetchLiveAttendance: async (companyId) => {
        const query = companyId ? `?companyId=${companyId}` : '';
        return apiClient.get(`/attendance/live${query}`);
    },
    // Attendance
    fetchAttendance: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/attendance?${query}`);
    },
    createAttendance: async (data) => {
        return apiClient.post('/attendance', data);
    },
    updateAttendance: async (id, data) => {
        return apiClient.put(`/attendance/${id}`, data);
    },
    deleteAttendance: async (id) => {
        return apiClient.delete(`/attendance/${id}`);
    },

    // Leaves
    fetchLeaves: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/leaves?${query}`);
    },
    createLeave: async (data) => {
        return apiClient.post('/leaves', data);
    },
    updateLeave: async (id, data) => {
        return apiClient.put(`/leaves/${id}`, data);
    },
    deleteLeave: async (id) => {
        return apiClient.delete(`/leaves/${id}`);
    },

    // Payrolls
    fetchPayrolls: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/payrolls?${query}`);
    },
    createPayroll: async (data) => {
        return apiClient.post('/payrolls', data);
    },
    updatePayroll: async (id, data) => {
        return apiClient.put(`/payrolls/${id}`, data);
    },
    deletePayroll: async (id) => {
        return apiClient.delete(`/payrolls/${id}`);
    },
    fetchPayrollBatches: async (companyId) => {
        return apiClient.get(`/payrolls/batches?companyId=${companyId}`);
    },
    generatePayrolls: async (data) => {
        return apiClient.post('/payrolls/generate', data);
    },
    finalizeBatch: async (data) => {
        return apiClient.post('/payrolls/finalize', data);
    },
    syncPayrolls: async (data) => {
        return apiClient.post('/payrolls/sync', data);
    },
    sendPayslipEmail: async (payrollId) => {
        return apiClient.post(`/payrolls/${payrollId}/email`);
    },
    bulkSendEmails: async (data) => {
        return apiClient.post('/payrolls/bulk-email', data);
    },

    fetchDepartments: async (companyId) => {
        return apiClient.get(`/departments?companyId=${companyId}`);
    },

    fetchUserProfile: async () => {
        return apiClient.get('/users/me');
    },

    updateWindowPreferences: async (windowPreferences) => {
        return apiClient.put('/users/preferences', { windowPreferences });
    },

    // ========== FINANCE MODULE ==========

    // Transactions
    fetchTransactions: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/transactions?${query}`);
    },
    fetchTransaction: async (id) => {
        return apiClient.get(`/transactions/${id}`);
    },
    createTransaction: async (data) => {
        return apiClient.post('/transactions', data);
    },
    updateTransaction: async (id, data) => {
        return apiClient.put(`/transactions/${id}`, data);
    },
    deleteTransaction: async (id) => {
        return apiClient.delete(`/transactions/${id}`);
    },
    bulkCreateTransactions: async (data) => {
        return apiClient.post('/transactions/bulk', data);
    },
    postTransactions: async (data) => {
        return apiClient.post('/transactions/post', data);
    },
    voidTransaction: async (id, data) => {
        return apiClient.post(`/transactions/${id}/void`, data);
    },
    fetchTransactionRegister: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/transactions/register?${query}`);
    },

    // Cheques
    fetchCheques: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/cheques?${query}`);
    },
    fetchCheque: async (id) => {
        return apiClient.get(`/cheques/${id}`);
    },
    createCheque: async (data) => {
        return apiClient.post('/cheques', data);
    },
    updateCheque: async (id, data) => {
        return apiClient.put(`/cheques/${id}`, data);
    },
    deleteCheque: async (id) => {
        return apiClient.delete(`/cheques/${id}`);
    },
    printCheques: async (data) => {
        return apiClient.post('/cheques/print', data);
    },
    voidCheque: async (id, data) => {
        return apiClient.post(`/cheques/${id}/void`, data);
    },
    fetchChequeHistory: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/cheques/history?${query}`);
    },

    // Bank Transfers
    fetchBankTransfers: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/bank-transfers?${query}`);
    },
    fetchBankTransfer: async (id) => {
        return apiClient.get(`/bank-transfers/${id}`);
    },
    createBankTransfer: async (data) => {
        return apiClient.post('/bank-transfers', data);
    },
    updateBankTransfer: async (id, data) => {
        return apiClient.put(`/bank-transfers/${id}`, data);
    },
    deleteBankTransfer: async (id) => {
        return apiClient.delete(`/bank-transfers/${id}`);
    },
    createBatchTransfer: async (data) => {
        return apiClient.post('/bank-transfers/batch', data);
    },
    processBankTransfers: async (data) => {
        return apiClient.post('/bank-transfers/process', data);
    },
    exportBankFile: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/bank-transfers/export?${query}`);
    },

    // Advance Payments
    fetchAdvancePayments: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/advance-payments?${query}`);
    },
    fetchAdvancePayment: async (id) => {
        return apiClient.get(`/advance-payments/${id}`);
    },
    createAdvancePayment: async (data) => {
        return apiClient.post('/advance-payments', data);
    },
    updateAdvancePayment: async (id, data) => {
        return apiClient.put(`/advance-payments/${id}`, data);
    },
    deleteAdvancePayment: async (id) => {
        return apiClient.delete(`/advance-payments/${id}`);
    },
    approveAdvancePayment: async (id, data) => {
        return apiClient.post(`/advance-payments/${id}/approve`, data);
    },
    rejectAdvancePayment: async (id, data) => {
        return apiClient.post(`/advance-payments/${id}/reject`, data);
    },
    markAdvancePaymentAsPaid: async (id, data) => {
        return apiClient.post(`/advance-payments/${id}/paid`, data);
    },
    fetchAdvancePaymentSummary: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/advance-payments/summary?${query}`);
    },

    // Processing & Monitoring
    fetchProcessingStatus: async (params) => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return apiClient.get(`/processing/status${query}`);
    },
    startProcess: async (data) => {
        return apiClient.post('/processing/start', data);
    },
    updateProcessProgress: async (id, data) => {
        return apiClient.put(`/processing/${id}`, data);
    },
    fetchProcessingLogs: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/processing/logs?${query}`);
    },
    fetchProcessingLog: async (id) => {
        return apiClient.get(`/processing/${id}`);
    },
    cleanupOldLogs: async (data) => {
        return apiClient.delete('/processing/cleanup', data);
    },
    fetchProcessingStatistics: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/processing/statistics?${query}`);
    },

    // Redundancy
    calculateRedundancy: async (data) => {
        return apiClient.post('/redundancies/calculate', data);
    },
    fetchRedundancies: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/redundancies?${query}`);
    },
    fetchRedundancy: async (id) => {
        return apiClient.get(`/redundancies/${id}`);
    },
    createRedundancy: async (data) => {
        return apiClient.post('/redundancies', data);
    },
    updateRedundancyStatus: async (id, data) => {
        return apiClient.put(`/redundancies/${id}/status`, data);
    },
    deleteRedundancy: async (id) => {
        return apiClient.delete(`/redundancies/${id}`);
    },

    // Bank Accounts
    fetchBankAccounts: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/bank-accounts?${query}`);
    },
    createBankAccount: async (data) => {
        return apiClient.post('/bank-accounts', data);
    },
    updateBankAccount: async (id, data) => {
        return apiClient.put(`/bank-accounts/${id}`, data);
    },
    deleteBankAccount: async (id) => {
        return apiClient.delete(`/bank-accounts/${id}`);
    },

    // File Maintenance & Backups
    exportMasterData: async (companyId) => {
        const query = companyId ? `?companyId=${companyId}` : '';
        return apiClient.get(`/files/export${query}`);
    },
    importMasterData: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/files/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    createSystemBackup: async () => {
        return apiClient.post('/files/backup');
    },
    restoreSystemBackup: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/files/restore', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    fetchBackupLogs: async () => {
        return apiClient.get('/files/logs');
    },
    downloadBackupFile: (filename) => {
        // Returns the URL for downloading
        return `${apiClient.defaults.baseURL}/files/download/${filename}`;
    },

    // Gang Shift
    fetchGangs: async (companyId) => {
        return apiClient.get(`/gang-shift/gangs?companyId=${companyId}`);
    },
    fetchGangShiftAssignments: async (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/gang-shift/assignments?${query}`);
    },
    saveGangShiftAssignments: async (data) => {
        return apiClient.post('/gang-shift/assignments', data);
    },

    // Employee Bulk Update
    bulkUpdateEmployees: (data) => apiClient.put('/employees/bulk-update', data),

    // Sales Share
    fetchSalesShares: (companyId, period) => apiClient.get(`/sales-share?companyId=${companyId}&period=${period}`),
    saveSalesShares: (data) => apiClient.post('/sales-share', data),

    // System Settings
    fetchSystemSettings: async () => {
        return apiClient.get('/system-settings');
    },
    updateSystemSettings: async (settings) => {
        return apiClient.put('/system-settings', { settings });
    },

    // Transaction Codes
    getTransactionCodes: (isActive) => apiClient.get(`/transaction-codes${isActive !== undefined ? `?isActive=${isActive}` : ''}`),
    createTransactionCode: (data) => apiClient.post('/transaction-codes', data),
    updateTransactionCode: (id, data) => apiClient.put(`/transaction-codes/${id}`, data),
    deleteTransactionCode: (id) => apiClient.delete(`/transaction-codes/${id}`)
};
