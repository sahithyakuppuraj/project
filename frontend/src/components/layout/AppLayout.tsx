import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { TransactionModal } from '../transactions/TransactionModal';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/transactions':
        return 'Transaction Management';
      case '/budgets':
        return 'Budget Management';
      case '/goals':
        return 'Financial Goals';
      case '/analytics':
        return 'Spending Analytics';
      case '/settings':
        return 'Settings & Profile';
      default:
        return 'FinanceFlow';
    }
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          title={title}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenAddTransaction={() => setIsAddModalOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet context={{ openAddTransaction: () => setIsAddModalOpen(true) }} />
          </div>
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          // Dispatch a custom event so any active page can refresh its data cleanly!
          window.dispatchEvent(new Event('finance_data_updated'));
        }}
      />
    </div>
  );
};

