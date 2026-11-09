import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenAddTransaction: () => void;
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenAddTransaction, title }) => {
  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">{title}</h2>
          <p className="text-xs text-slate-400 hidden sm:block">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onOpenAddTransaction} size="sm" className="shadow-sm">
          <Plus className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </header>
  );
};

