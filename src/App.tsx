/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, UtensilsCrossed, X, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { MenuItem, MenuCategory, CartItem, Transaction, OrderType } from './types/pos';
import { INITIAL_MENU_ITEMS, INITIAL_TRANSACTIONS } from './data/menuData';
import { Header } from './components/Header';
import { MenuCard } from './components/MenuCard';
import { CartSidebar } from './components/CartSidebar';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { DashboardView } from './components/DashboardView';
import { CustomerCatalogView } from './components/CustomerCatalogView';
import { formatRupiah } from './utils/format';
import { sfx } from './utils/audio';

export default function App() {
  // Navigation & View Mode
  const [currentView, setCurrentView] = useState<'pos' | 'customer' | 'dashboard'>('pos');

  // Menu items & Transactions state
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Cart & Order state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNumber, setTableNumber] = useState<string>('Meja 01');
  const [customerName, setCustomerName] = useState<string>('');

  // Discount & Tax
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [fixedDiscount, setFixedDiscount] = useState<number>(0);
  const [discountName, setDiscountName] = useState<string>('');
  const [taxEnabled, setTaxEnabled] = useState<boolean>(true);

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [currentReceiptTrx, setCurrentReceiptTrx] = useState<Transaction | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  // Category filter list
  const categories: { key: MenuCategory; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'makanan', label: 'Makanan' },
    { key: 'snack', label: 'Snack' },
    { key: 'coffee', label: 'Coffee' },
    { key: 'non-coffee', label: 'Non-Coffee' },
    { key: 'minuman', label: 'Minuman' },
  ];

  // Mathematical totals
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  let calculatedDiscount = 0;
  if (discountRate > 0) {
    calculatedDiscount = Math.round(subtotal * discountRate);
  } else if (fixedDiscount > 0) {
    calculatedDiscount = Math.min(fixedDiscount, subtotal);
  }

  const taxableAmount = Math.max(0, subtotal - calculatedDiscount);
  const tax = taxEnabled ? Math.round(taxableAmount * 0.1) : 0;
  const grandTotal = Math.max(0, taxableAmount + tax);

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const handleDecrement = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter((ci) => ci.menuItem.id !== itemId);
      }
      return prev.map((ci) =>
        ci.menuItem.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci
      );
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    if (delta > 0) {
      const item = menuItems.find((m) => m.id === itemId);
      if (item) handleAddToCart(item);
    } else {
      handleDecrement(itemId);
    }
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((ci) => (ci.menuItem.id === itemId ? { ...ci, notes } : ci))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    sfx.playClick();
    setCart((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
  };

  const handleClearCart = () => {
    sfx.playClick();
    setCart([]);
  };

  const handleSetDiscount = (rate: number, fixed: number, name: string) => {
    setDiscountRate(rate);
    setFixedDiscount(fixed);
    setDiscountName(name);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsMobileCartOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
    setIsPaymentModalOpen(false);
    setCurrentReceiptTrx(transaction);
    setIsReceiptModalOpen(true);
  };

  const handleNewTransaction = () => {
    setCart([]);
    setDiscountRate(0);
    setFixedDiscount(0);
    setDiscountName('');
    setCustomerName('');
    setTableNumber('Meja 01');
    setIsReceiptModalOpen(false);
    setCurrentReceiptTrx(null);
  };

  const handleToggleStock = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === itemId ? { ...m, isAvailable: !m.isAvailable } : m))
    );
  };

  const handleAddNewMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => [item, ...prev]);
  };

  const handleViewReceipt = (trx: Transaction) => {
    setCurrentReceiptTrx(trx);
    setIsReceiptModalOpen(true);
  };

  // Filtered menu items for POS
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        cartCount={totalItemsCount}
        cartTotal={grandTotal}
        openMobileCart={() => setIsMobileCartOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* VIEW 1: POS KASIR */}
        {currentView === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (Menu catalog & filters): 8 of 12 columns */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {/* Category tabs & Search toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari makanan, kopi, snack..."
                    className="w-full pl-9 pr-8 py-2 bg-neutral-800 border border-neutral-700/80 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Info text */}
                <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-mono tabular-nums">
                  <span>{filteredMenuItems.length} menu</span>
                  <span>·</span>
                  <span className="text-amber-400 font-semibold">Siap Saji</span>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setSelectedCategory(cat.key);
                      sfx.playClick();
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                      selectedCategory === cat.key
                        ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm font-bold'
                        : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border-neutral-700/60 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Menu Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredMenuItems.map((item) => {
                  const cartItem = cart.find((ci) => ci.menuItem.id === item.id);
                  return (
                    <MenuCard
                      key={item.id}
                      item={item}
                      quantityInCart={cartItem ? cartItem.quantity : 0}
                      onAddToCart={handleAddToCart}
                      onDecrement={handleDecrement}
                    />
                  );
                })}
              </div>

              {filteredMenuItems.length === 0 && (
                <div className="p-12 text-center bg-neutral-800/30 rounded-2xl border border-neutral-800 space-y-2">
                  <UtensilsCrossed className="w-8 h-8 text-neutral-500 mx-auto" />
                  <p className="text-sm font-semibold text-neutral-300">
                    Menu tidak ditemukan
                  </p>
                  <p className="text-xs text-neutral-500">
                    Coba kata kunci lain atau pilih kategori Semua.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column (Cart & Checkout): 4 of 12 columns (Desktop sticky) */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-20">
              <div className="rounded-2xl overflow-hidden border border-neutral-800 shadow-xl max-h-[calc(100vh-6rem)] flex flex-col">
                <CartSidebar
                  cart={cart}
                  orderType={orderType}
                  setOrderType={setOrderType}
                  tableNumber={tableNumber}
                  setTableNumber={setTableNumber}
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  discountRate={discountRate}
                  fixedDiscount={fixedDiscount}
                  discountName={discountName}
                  setDiscount={handleSetDiscount}
                  taxEnabled={taxEnabled}
                  setTaxEnabled={setTaxEnabled}
                  onUpdateQuantity={handleUpdateQuantity}
                  onUpdateNotes={handleUpdateNotes}
                  onRemoveItem={handleRemoveItem}
                  onClearCart={handleClearCart}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: KATALOG MENU PELANGGAN */}
        {currentView === 'customer' && (
          <CustomerCatalogView
            menuItems={menuItems}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            cart={cart}
            onAddToCart={handleAddToCart}
            onDecrement={handleDecrement}
            onOpenCart={() => setIsMobileCartOpen(true)}
          />
        )}

        {/* VIEW 3: DASHBOARD LAPORAN & STOK */}
        {currentView === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            menuItems={menuItems}
            onToggleStock={handleToggleStock}
            onAddNewMenuItem={handleAddNewMenuItem}
            onViewReceipt={handleViewReceipt}
          />
        )}
      </main>

      {/* Floating Bottom Bar on Mobile/Tablet when items are in cart (POS mode) */}
      {cart.length > 0 && currentView === 'pos' && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full p-3.5 bg-amber-500 text-neutral-950 font-bold rounded-2xl shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-neutral-950 text-amber-400 flex items-center justify-center text-xs font-mono">
                {totalItemsCount}
              </div>
              <span className="text-xs font-semibold">Buka Keranjang Pesanan</span>
            </div>
            <span className="text-sm font-mono tabular-nums font-extrabold">
              {formatRupiah(grandTotal)}
            </span>
          </button>
        </div>
      )}

      {/* Mobile Cart Drawer / Modal */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full sm:max-w-md h-[90vh] sm:h-[85vh] bg-neutral-900 rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col border border-neutral-800">
            <CartSidebar
              cart={cart}
              orderType={orderType}
              setOrderType={setOrderType}
              tableNumber={tableNumber}
              setTableNumber={setTableNumber}
              customerName={customerName}
              setCustomerName={setCustomerName}
              discountRate={discountRate}
              fixedDiscount={fixedDiscount}
              discountName={discountName}
              setDiscount={handleSetDiscount}
              taxEnabled={taxEnabled}
              setTaxEnabled={setTaxEnabled}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateNotes={handleUpdateNotes}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onCheckout={handleCheckout}
              isMobileModal={true}
              onCloseMobile={() => setIsMobileCartOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cart={cart}
        subtotal={subtotal}
        discount={calculatedDiscount}
        discountName={discountName}
        tax={tax}
        grandTotal={grandTotal}
        orderType={orderType}
        tableNumber={tableNumber}
        customerName={customerName}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Thermal Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={currentReceiptTrx}
        onNewTransaction={handleNewTransaction}
      />
    </div>
  );
}
