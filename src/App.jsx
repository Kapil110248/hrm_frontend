import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/routes';
import Login from './app/Login';
import CompanySelection from './app/CompanySelection';
import Topbar from './app/layout/Topbar';

function App() {
  // Load state from localStorage on mount
  // Load state from localStorage on mount
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedCompany, setSelectedCompany] = useState(() => {
    const saved = localStorage.getItem('selectedCompany');
    return saved ? JSON.parse(saved) : null;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
    } else {
      localStorage.removeItem('selectedCompany');
    }
  }, [selectedCompany]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setSelectedCompany(null); // Reset company selection on new login to force selection screen
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedCompany(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedCompany');
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-[#EBE9D8]">
        {/* 1. Global Navbar/Toolbar - Only show after Login & Company Selection */}
        {currentUser && selectedCompany && (
          <div className="no-print">
            <Topbar
              onLogout={handleLogout}
              onSelectCompany={() => setSelectedCompany(null)}
              companyName={selectedCompany?.name}
              isCompanySelected={!!selectedCompany}
              userRole={currentUser?.role}
            />
          </div>
        )}

        {/* 2. Main Content Area */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          {/* Actual Components/Routes */}
          <div className="relative z-10 w-full h-full overflow-auto bg-[#EBE9D8] card-classic-container">
            {!currentUser ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <Login onLogin={handleLogin} />
              </div>
            ) : !selectedCompany ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <CompanySelection onSelect={handleCompanySelect} onExit={handleLogout} />
              </div>
            ) : (
              <AppRoutes onLogout={handleLogout} selectedCompany={selectedCompany} currentUser={currentUser} />
            )}
          </div>
        </div>

        {/* 3. Global Status Bar - Only show during active session */}
        {currentUser && selectedCompany && (
          <div className="bg-[#D4D0C8] border-t border-white min-h-6 px-4 py-0.5 flex items-center justify-between text-[11px] text-black font-sans shadow-[inset_0_1px_0_#808080] z-50 no-print select-none">
            <div className="flex items-center gap-4">
              <span className="inset-shadow px-2 border-r border-gray-400">{currentUser ? `Ready — ${currentUser.role}` : 'RESTRICTED'}</span>
              <span className="pl-4">JA REGION</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="border-l border-white border-r border-gray-400 px-2">EXCLUSIVE</span>
              <span className="border-l border-white pl-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full border border-gray-500 ${currentUser ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{currentUser ? 'SECURE' : 'UNAUTH'}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;