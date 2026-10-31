import React from 'react';
import { ShoppingBag, LayoutDashboard, UtensilsCrossed, Store } from 'lucide-react';
import { formatRupiah } from '../utils/format';

interface HeaderProps {
  currentView: 'pos' | 'customer' | 'dashboard';
  setCurrentView: (view: 'pos' | 'customer' | 'dashboard') => void;
  cartCount: number;
  cartTotal: number;
  openMobileCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  cartCount,
  cartTotal,
  openMobileCart,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentView('pos')}
            className="text-left group flex items-center gap-2.5 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition-colors">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap block leading-tight">
                KOPI & RASA
              </span>
              <span className="text-[10px] tracking-widest text-neutral-400 uppercase block font-medium">
                WARUNG • FOOD • COFFEE
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentView('pos')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'pos'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>POS Kasir</span>
          </button>

          <button
            onClick={() => setCurrentView('customer')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'customer'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <span>Katalog Menu</span>
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'dashboard'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Laporan & Stok</span>
            <span className="sm:hidden">Laporan</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action (Mobile Cart Trigger or Cashier Indicator) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Cart button for mobile / small screen */}
          <button
            onClick={openMobileCart}
            className="lg:hidden relative p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg transition-colors border border-neutral-700 flex items-center gap-2"
            aria-label="Keranjang Pesanan"
          >
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold bg-amber-500 text-neutral-950 rounded-full">
                {cartCount}
              </span>
            )}
            <span className="text-xs font-mono tabular-nums text-neutral-300 hidden xs:inline">
              {formatRupiah(cartTotal)}
            </span>
          </button>

          {/* Desktop active cashier badge */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-neutral-800/80 rounded-lg border border-neutral-800 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-neutral-300 font-medium">Kasir: Rian</span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400">Shift Pagi</span>
          </div>
        </div>

      </div>
    </header>
  );
};
