import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, Tag, MessageSquare, Utensils, X } from 'lucide-react';
import { CartItem, OrderType } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { sfx } from '../utils/audio';

interface CartSidebarProps {
  cart: CartItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  discountRate: number; // 0 to 1
  fixedDiscount: number;
  discountName: string;
  setDiscount: (rate: number, fixed: number, name: string) => void;
  taxEnabled: boolean;
  setTaxEnabled: (enabled: boolean) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isMobileModal?: boolean;
  onCloseMobile?: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  orderType,
  setOrderType,
  tableNumber,
  setTableNumber,
  customerName,
  setCustomerName,
  discountRate,
  fixedDiscount,
  discountName,
  setDiscount,
  taxEnabled,
  setTaxEnabled,
  onUpdateQuantity,
  onUpdateNotes,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isMobileModal = false,
  onCloseMobile,
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [showDiscountSelector, setShowDiscountSelector] = useState(false);

  // Math calculations
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

  const handleSaveNote = (itemId: string) => {
    onUpdateNotes(itemId, tempNote);
    setEditingNoteId(null);
  };

  const handleApplyPresetDiscount = (rate: number, fixed: number, name: string) => {
    setDiscount(rate, fixed, name);
    setShowDiscountSelector(false);
  };

  return (
    <div className={`flex flex-col h-full bg-neutral-900 border-l border-neutral-800 ${isMobileModal ? 'w-full' : ''}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">Keranjang Pesanan</h2>
            <p className="text-xs text-neutral-400 font-mono tabular-nums">
              {totalItemsCount} item terpilih
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              title="Kosongkan Keranjang"
              className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors text-xs flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Hapus</span>
            </button>
          )}

          {isMobileModal && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Order Info & Type Controls */}
      <div className="p-3.5 bg-neutral-800/40 border-b border-neutral-800 space-y-3">
        {/* Dine In vs Take Away segmented buttons */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-800 rounded-lg">
          <button
            type="button"
            onClick={() => setOrderType('dine-in')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
              orderType === 'dine-in'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Makan di Tempat (Dine In)
          </button>
          <button
            type="button"
            onClick={() => setOrderType('takeaway')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
              orderType === 'takeaway'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Bawa Pulang (Takeaway)
          </button>
        </div>

        {/* Customer & Table details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              {orderType === 'dine-in' ? 'Nomor Meja' : 'Label Pesanan'}
            </label>
            <input
              type="text"
              placeholder={orderType === 'dine-in' ? 'Meja 01' : 'Takeaway #1'}
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-md text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Nama Pelanggan</label>
            <input
              type="text"
              placeholder="Pelanggan (opsional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-md text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 mb-3 border border-neutral-700">
              <Utensils className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-neutral-200">Belum ada pesanan.</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-[220px]">
              Silakan pilih menu makanan dan minuman favorit pelanggan di sebelah kiri.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.menuItem.id}
              className="p-3 bg-neutral-800/80 rounded-xl border border-neutral-700/60 flex flex-col gap-2 transition-colors hover:border-neutral-600"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white leading-tight line-clamp-1">
                    {item.menuItem.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400 font-mono tabular-nums">
                    <span>{formatRupiah(item.menuItem.price)}</span>
                    <span>×</span>
                    <span>{item.quantity}</span>
                    <span className="text-amber-400 font-bold ml-auto">
                      {formatRupiah(item.menuItem.price * item.quantity)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem(item.menuItem.id)}
                  className="text-neutral-400 hover:text-rose-400 p-1"
                  title="Hapus"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Notes display & editing */}
              {editingNoteId === item.menuItem.id ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={tempNote}
                    onChange={(e) => setTempNote(e.target.value)}
                    placeholder="Contoh: pedas level 3, less ice..."
                    className="flex-1 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-[11px] text-white focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveNote(item.menuItem.id)}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded text-[11px]"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNoteId(item.menuItem.id);
                      setTempNote(item.notes || '');
                    }}
                    className="flex items-center gap-1 text-neutral-400 hover:text-amber-300 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3 text-neutral-400" />
                    <span>{item.notes ? `Catatan: ${item.notes}` : '+ Catatan khusus'}</span>
                  </button>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-700/40">
                <span className="text-[11px] text-neutral-400">Jumlah porsi</span>
                <div className="flex items-center gap-1.5 bg-neutral-900 px-2 py-0.5 rounded-lg border border-neutral-700">
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      onUpdateQuantity(item.menuItem.id, -1);
                    }}
                    className="w-5 h-5 flex items-center justify-center text-neutral-300 hover:text-white"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-white font-mono tabular-nums px-1.5">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      onUpdateQuantity(item.menuItem.id, 1);
                    }}
                    className="w-5 h-5 flex items-center justify-center text-amber-400 hover:text-amber-300"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Calculation & Checkout Footer */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/95 space-y-3">
          {/* Discount / Voucher Row */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDiscountSelector(!showDiscountSelector)}
              className="w-full py-1.5 px-2.5 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs flex items-center justify-between text-neutral-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {calculatedDiscount > 0 ? (
                    <span className="text-amber-400 font-semibold">{discountName}</span>
                  ) : (
                    'Gunakan Diskon / Promo'
                  )}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">Ubah</span>
            </button>

            {/* Discount selector dropdown */}
            {showDiscountSelector && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl space-y-1 z-30">
                <div className="text-[11px] font-semibold text-neutral-400 px-2 py-1">Pilih Promo:</div>
                <button
                  onClick={() => handleApplyPresetDiscount(0, 0, '')}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-700 text-neutral-300 flex justify-between"
                >
                  <span>Tanpa Diskon</span>
                  <span>Rp 0</span>
                </button>
                <button
                  onClick={() => handleApplyPresetDiscount(0.1, 0, 'Diskon 10% (Promo Pelanggan)')}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-700 text-amber-400 font-semibold flex justify-between"
                >
                  <span>Diskon 10% (Member)</span>
                  <span>10%</span>
                </button>
                <button
                  onClick={() => handleApplyPresetDiscount(0.15, 0, 'Diskon 15% (Jumat Berkah)')}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-700 text-amber-400 font-semibold flex justify-between"
                >
                  <span>Diskon 15% (Happy Hour)</span>
                  <span>15%</span>
                </button>
                <button
                  onClick={() => handleApplyPresetDiscount(0, 5000, 'Voucher Rp 5.000')}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-700 text-amber-400 font-semibold flex justify-between"
                >
                  <span>Potongan Kopi</span>
                  <span>Rp 5.000</span>
                </button>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-1.5 text-xs text-neutral-300 font-mono tabular-nums">
            <div className="flex justify-between">
              <span className="text-neutral-400">Subtotal Pesanan</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>

            {calculatedDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Diskon Promo</span>
                <span>-{formatRupiah(calculatedDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-neutral-400">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-neutral-800 border-neutral-600 text-amber-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Pajak Restoran (PB1 10%)</span>
              </label>
              <span>{formatRupiah(tax)}</span>
            </div>

            <div className="pt-2 border-t border-neutral-800 flex justify-between items-baseline font-sans">
              <span className="text-sm font-bold text-white">Total Pembayaran</span>
              <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            type="button"
            onClick={onCheckout}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-neutral-950 rounded-xl font-bold text-sm flex items-center justify-between shadow-lg shadow-amber-950/30 transition-all"
          >
            <span>Bayar Pesanan</span>
            <span className="font-mono tabular-nums">{formatRupiah(grandTotal)}</span>
          </button>
        </div>
      )}
    </div>
  );
};
