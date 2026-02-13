# Project Logic Flow and Dashboard Architecture Plan

## 1. Current State Analysis
Currently, the application has a linear, single-role flow:
*   **Authentication**: Simple boolean toggle (`isLoggedIn`).
*   **Routing**: All routes are accessible once logged in.
*   **Dashboard**: Single `Dashboard.jsx` serving all potential users.
*   **Missing**: User role identification, permission gating, and role-specific views.

## 2. Proposed Logical Flow (Role-Based)

To support multiple roles, the application logic must change as follows:

### A. Authentication Flow
1.  **User Enters Credentials** on `Login.jsx`.
2.  **API Validation**: Backend verifies credentials and returns a `User Object`.
    *   *Payload Example*: `{ "token": "...", "user": { "id": 1, "name": "John", "role": "EMPLOYEE" } }`
3.  **State Update**: Store `token` and `user.role` in `App.jsx` state/Context (e.g., `AuthProvider`).
4.  **Redirection Logic**:
    *   IF `role === 'ADMIN'` -> Redirect to `/admin-dashboard`
    *   IF `role === 'HR_MANAGER'` -> Redirect to `/hr-dashboard`
    *   IF `role === 'EMPLOYEE'` -> Redirect to `/employee-dashboard`

### B. Route Protection (Guard)
*   Create a `ProtectedRoute` component that checks `user.role` before rendering.
*   *Unknown Role* -> Redirect to Login.
*   *Unauthorized Role* -> Show "Access Denied".

## 3. Recommended Dashboards (Total: 4)

Based on the functionality present (Payroll, HR, Statutory, Banking), you need **4 distinct dashboard views**:

### 1. Super Admin / System Admin Dashboard
*   **Purpose**: Technical oversight and company configuration.
*   **Key Widgets**:
    *   System Health & Status.
    *   Company Setup & Licensing.
    *   User Management (Create HR/Finance users).
    *   Audit Logs (Who changed what).
    *   Global Settings.

### 2. HR & Payroll Manager Dashboard (Execution Role)
*   **Purpose**: Daily operations (The current `Dashboard.jsx` seems closest to this).
*   **Key Widgets**:
    *   Payroll Process Status (Pending, Calculated, Disbursed).
    *   Upcoming Tax Deadlines (S01, P24).
    *   Employee Quick Actions (New Hire, Termination).
    *   Leave Requests Pending Approval.
    *   Attendance Anomalies.

### 3. Finance & Accounts Dashboard
*   **Purpose**: Banking and Financial reporting.
*   **Key Widgets**:
    *   Bank Balance / Integration Status.
    *   Total Payroll Liability (Net Pay + Taxes).
    *   Cheque Printing Queue.
    *   GL Interface / Trial Balance Summary.

### 4. Employee Self-Service (ESS) Dashboard
*   **Purpose**: Personal data for individual staff.
*   **Key Widgets**:
    *   "My Last Payslip" (Download/View).
    *   Leave Balance & Request Leave.
    *   Attendance History (Clock In/Out).
    *   Tax Documents (P24, P45 for themselves).
    *   Profile Update (Address/Bank update requests).

## 4. Total Dashboards Needed
**Total: 4 Unique Dashboard Interfaces.**
*Currently, you only have one generic dashboard.*

## 5. What is Missing? (Gap Analysis)

### Immediate Critical Needs:
1.  **Auth Context/Provider**: Need a central store (Context API) to hold `userData` and `role`, not just `isLoggedIn`.
2.  **Role Guard Component**: A wrapper component to protect routes (e.g., `<PrivateRoute roles={['ADMIN']}><Settings /></PrivateRoute>`).
3.  **Dashboard Variations**:
    *   You need to fork `Dashboard.jsx` into `AdminDashboard.jsx`, `HrDashboard.jsx`, etc.
4.  **Employee-Specific Views**:
    *   Current routes like `/leave` are for *managing* leave (HR view). You need `/my-leave` for employees to *apply* for leave.
    *   Current `/employees` is the master list. Users shouldn't see this; they should only see `/my-profile`.

### Functional Gaps:
*   **Approval Workflow Logic**: No backend or frontend logic visible for "Request -> Approve" flows (e.g., Leave approval).
*   **Notifications**: System to alert HR of new requests or deadlines.
*   **Data Isolation**: Ensure APIs return only relevant data (e.g., Employee fetch API should return *only* the logged-in user's data for ESS users).

## 6. Development Roadmap Recommendation
1.  **Modify Login**: Update to accept and store User Role.
2.  **Create Wrapper**: Build `ProtectedRoute.jsx`.
3.  **Refactor Routes**: Update `routes.jsx` to use the wrapper.
4.  **Build Dashboards**: Create the 4 separate dashboard files.
5.  **Split Features**: Differentiate between "Management" pages and "Personal" pages (e.g., *Leave Management* vs *My Leave*).
