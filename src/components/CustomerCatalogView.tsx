import React from 'react';
import { ShoppingBag, Sparkles, Clock, Utensils, Check } from 'lucide-react';
import { MenuItem, MenuCategory, CartItem } from '../types/pos';
import { MenuCard } from './MenuCard';
import { formatRupiah } from '../utils/format';

interface CustomerCatalogViewProps {
  menuItems: MenuItem[];
  selectedCategory: MenuCategory;
  setSelectedCategory: (cat: MenuCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onDecrement: (itemId: string) => void;
  onOpenCart: () => void;
}

export const CustomerCatalogView: React.FC<CustomerCatalogViewProps> = ({
  menuItems,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  cart,
  onAddToCart,
  onDecrement,
  onOpenCart,
}) => {
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  const categories: { key: MenuCategory; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'makanan', label: 'Makanan' },
    { key: 'snack', label: 'Snack' },
    { key: 'coffee', label: 'Coffee' },
    { key: 'non-coffee', label: 'Non-Coffee' },
    { key: 'minuman', label: 'Minuman' },
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-amber-950/30 to-neutral-900 border border-neutral-800 p-6 sm:p-8 lg:p-10 shadow-2xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                ONLINE
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-neutral-400 font-medium">KOPI & RASA WARUNG • FOOD • COFFEE</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Selamat datang! ☕
            </h1>
            <p className="text-sm sm:text-base text-neutral-300">
              Nikmati makanan lezat dan minuman favoritmu hari ini.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-neutral-400">
              <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-amber-400 border border-neutral-700">
                FRESH • DELICIOUS • AFFORDABLE
              </span>
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>OPEN 08.00–22.00</span>
              </span>
            </div>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="grid grid-cols-3 gap-3 bg-neutral-900/90 p-4 rounded-2xl border border-neutral-800 shrink-0">
            <div className="text-center px-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-white block">
                {menuItems.length}+
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">Menu tersedia</span>
            </div>
            <div className="text-center px-2 border-x border-neutral-800">
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 block">
                {totalItemsCount}
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">Item pesanan</span>
            </div>
            <div className="text-center px-2">
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-400 block tabular-nums">
                {formatRupiah(totalCartAmount)}
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">Total belanja</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs & Section Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <h2 className="text-xl font-bold text-white tracking-tight">Menu Favorit Pelanggan</h2>
          </div>

          {/* Floating Cart checkout trigger button */}
          {totalItemsCount > 0 && (
            <button
              onClick={onOpenCart}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-950/30 transition-all sm:ml-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Lihat Pesanan ({totalItemsCount} item)</span>
              <span className="font-mono tabular-nums">{formatRupiah(totalCartAmount)}</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat.key
                  ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md font-bold'
                  : 'bg-neutral-850 bg-neutral-800/80 text-neutral-300 border-neutral-750 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredItems.map((item) => {
          const cartItem = cart.find((c) => c.menuItem.id === item.id);
          return (
            <MenuCard
              key={item.id}
              item={item}
              quantityInCart={cartItem ? cartItem.quantity : 0}
              onAddToCart={onAddToCart}
              onDecrement={onDecrement}
            />
          );
        })}
      </div>
    </div>
  );
};
