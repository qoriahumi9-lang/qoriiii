import React, { useState } from 'react';
import { Printer, Copy, Check, X, Share2, PlusCircle } from 'lucide-react';
import { Transaction } from '../types/pos';
import { formatRupiah } from '../utils/format';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onNewTransaction: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onNewTransaction,
}) => {
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReceiptText = () => {
    const lines = [
      '================================',
      '         KOPI & RASA            ',
      '    WARUNG • FOOD • COFFEE      ',
      'Jl. Senopati No. 88, Jak-Sel    ',
      'Telp: 0812-3456-7890            ',
      '================================',
      `No. Struk : ${transaction.orderNumber}`,
      `Waktu     : ${transaction.date}`,
      `Kasir     : ${transaction.cashierName}`,
      `Pelanggan : ${transaction.customerName || 'Umum'}`,
      `Pesanan   : ${transaction.orderType === 'dine-in' ? `Dine-In (${transaction.tableNumber})` : 'Takeaway'}`,
      '--------------------------------',
      ...transaction.items.map(
        (it) =>
          `${it.menuItem.name}\n  ${it.quantity}x @${formatRupiah(it.menuItem.price)} = ${formatRupiah(
            it.menuItem.price * it.quantity
          )}${it.notes ? `\n  (${it.notes})` : ''}`
      ),
      '--------------------------------',
      `Subtotal  : ${formatRupiah(transaction.subtotal)}`,
      transaction.discount > 0 ? `Diskon    : -${formatRupiah(transaction.discount)}` : '',
      `Pajak PB1 : ${formatRupiah(transaction.tax)}`,
      `TOTAL     : ${formatRupiah(transaction.total)}`,
      '--------------------------------',
      `Metode    : ${transaction.paymentMethod.toUpperCase()}`,
      transaction.paymentMethod === 'tunai'
        ? `Tunai     : ${formatRupiah(transaction.cashReceived || transaction.total)}\nKembalian : ${formatRupiah(
            transaction.cashChange || 0
          )}`
        : `Status    : LUNAS`,
      '================================',
      '    Terima kasih atas order Anda!  ',
      '    WiFi: KopiRasa_Free / 2026  ',
      '================================',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(lines);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-white">Transaksi Berhasil Disimpan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Thermal Receipt Slip Container */}
        <div className="p-5 bg-neutral-950/60 overflow-y-auto max-h-[65vh] flex justify-center">
          <div
            id="printable-receipt"
            className="w-full max-w-[340px] bg-amber-50 text-neutral-900 p-5 rounded-lg shadow-xl font-receipt text-xs leading-relaxed border border-amber-200 relative select-text"
          >
            {/* Top jagged perforation visual */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle,transparent_4px,#fef3c7_4px)] bg-[length:10px_10px] -mt-1 opacity-80" />

            {/* Receipt Header */}
            <div className="text-center pb-3 border-b border-dashed border-neutral-400 space-y-0.5">
              <h2 className="text-base font-black tracking-wider uppercase text-neutral-950">
                KOPI & RASA
              </h2>
              <p className="text-[10px] tracking-widest text-neutral-600 font-semibold uppercase">
                WARUNG • FOOD • COFFEE
              </p>
              <p className="text-[10px] text-neutral-500">Jl. Senopati No. 88, Jakarta Selatan</p>
              <p className="text-[10px] text-neutral-500">Telp: 0812-3456-7890</p>
            </div>

            {/* Meta Info */}
            <div className="py-2.5 border-b border-dashed border-neutral-400 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-600">No. Order</span>
                <span className="font-bold text-neutral-900">{transaction.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Waktu</span>
                <span>{transaction.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Kasir</span>
                <span>{transaction.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Tipe Pesanan</span>
                <span className="font-semibold text-neutral-900">
                  {transaction.orderType === 'dine-in'
                    ? `Dine In (${transaction.tableNumber})`
                    : 'Takeaway'}
                </span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Pelanggan</span>
                  <span>{transaction.customerName}</span>
                </div>
              )}
            </div>

            {/* Itemized Table */}
            <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-2">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-neutral-900">
                    <span className="line-clamp-1">{item.menuItem.name}</span>
                    <span className="tabular-nums">
                      {formatRupiah(item.menuItem.price * item.quantity)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-600 tabular-nums">
                    <span>
                      {item.quantity} × {formatRupiah(item.menuItem.price)}
                    </span>
                  </div>
                  {item.notes && (
                    <div className="text-[10px] text-neutral-500 italic">
                      Catatan: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary Calculation */}
            <div className="py-2.5 border-b border-dashed border-neutral-400 text-[11px] space-y-1 tabular-nums">
              <div className="flex justify-between text-neutral-700">
                <span>Subtotal</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>

              {transaction.discount > 0 && (
                <div className="flex justify-between text-neutral-900 font-semibold">
                  <span>{transaction.discountName || 'Diskon'}</span>
                  <span>-{formatRupiah(transaction.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-700">
                <span>PB1 Restoran (10%)</span>
                <span>{formatRupiah(transaction.tax)}</span>
              </div>

              <div className="flex justify-between text-sm font-black pt-1 border-t border-neutral-400 text-neutral-950">
                <span>TOTAL AKHIR</span>
                <span>{formatRupiah(transaction.total)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2.5 border-b border-dashed border-neutral-400 text-[11px] space-y-1 tabular-nums">
              <div className="flex justify-between font-semibold">
                <span>Metode Pembayaran</span>
                <span className="uppercase">{transaction.paymentMethod}</span>
              </div>

              {transaction.paymentMethod === 'tunai' && (
                <>
                  <div className="flex justify-between text-neutral-700">
                    <span>Tunai Diterima</span>
                    <span>{formatRupiah(transaction.cashReceived || transaction.total)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-900 font-bold">
                    <span>Kembalian</span>
                    <span>{formatRupiah(transaction.cashChange || 0)}</span>
                  </div>
                </>
              )}

              {transaction.paymentMethod === 'qris' && (
                <div className="text-[10px] text-neutral-600 text-center py-0.5">
                  Lunas via QRIS Settlement ID#{transaction.orderNumber.replace('KPR-', '')}
                </div>
              )}

              {transaction.paymentMethod === 'transfer' && (
                <div className="text-[10px] text-neutral-600 text-center py-0.5">
                  Lunas via {transaction.bankName || 'Transfer Bank'}
                </div>
              )}
            </div>

            {/* Barcode / QR Simulation & Footer */}
            <div className="pt-3 text-center space-y-2">
              {/* Barcode Graphic */}
              <div className="flex justify-center items-center gap-[2px] h-9 px-4">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 2, 3, 2, 1, 4, 2, 1, 3, 1, 2].map(
                  (width, i) => (
                    <div
                      key={i}
                      className="bg-neutral-950 h-full"
                      style={{ width: `${width}px` }}
                    />
                  )
                )}
              </div>
              <p className="text-[9px] tracking-widest text-neutral-500 font-mono">
                *{transaction.orderNumber}*
              </p>

              <div className="pt-1 text-[10px] text-neutral-600 leading-tight">
                <p className="font-semibold text-neutral-800">
                  Terima kasih atas kunjungan Anda! ☕
                </p>
                <p className="mt-0.5 text-neutral-500">
                  Wi-Fi: <span className="font-bold">KopiRasa_Free</span> | Pass:{' '}
                  <span className="font-bold">kopienak2026</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak Struk</span>
            </button>

            <button
              onClick={handleCopyReceiptText}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-neutral-400" />
                  <span>Salin WA</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={onNewTransaction}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all ml-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
