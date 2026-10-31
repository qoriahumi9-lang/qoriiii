import React, { useState, useEffect } from 'react';
import { X, Banknote, QrCode, Building2, CheckCircle2, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentMethod, Transaction, CartItem, OrderType } from '../types/pos';
import { formatRupiah, formatReceiptDate } from '../utils/format';
import { sfx } from '../utils/audio';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  discount: number;
  discountName?: string;
  tax: number;
  grandTotal: number;
  orderType: OrderType;
  tableNumber: string;
  customerName: string;
  onPaymentSuccess: (transaction: Transaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  cart,
  subtotal,
  discount,
  discountName,
  tax,
  grandTotal,
  orderType,
  tableNumber,
  customerName,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('tunai');

  // Cash state
  const [cashAmount, setCashAmount] = useState<number>(grandTotal);
  const [cashInputString, setCashInputString] = useState<string>(grandTotal.toString());

  // QRIS state
  const [qrisStatus, setQrisStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState(899); // 15 mins

  // Transfer state
  const [selectedBank, setSelectedBank] = useState<'BCA' | 'Mandiri' | 'BRI' | 'BNI'>('BCA');
  const [copiedVA, setCopiedVA] = useState(false);

  // Initialize cash when grandTotal changes
  useEffect(() => {
    if (isOpen) {
      setCashAmount(grandTotal);
      setCashInputString(grandTotal.toString());
      setQrisStatus('idle');
      setSecondsRemaining(899);
    }
  }, [isOpen, grandTotal]);

  // QRIS timer countdown
  useEffect(() => {
    if (!isOpen || method !== 'qris' || qrisStatus !== 'idle') return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, method, qrisStatus]);

  if (!isOpen) return null;

  // Change math
  const cashChange = Math.max(0, cashAmount - grandTotal);
  const isCashInsufficient = cashAmount < grandTotal;

  // Cash shortcuts: rounded amounts based on grandTotal
  const getCashShortcuts = () => {
    const list = [grandTotal];
    const roundTo10k = Math.ceil(grandTotal / 10000) * 10000;
    if (roundTo10k > grandTotal && !list.includes(roundTo10k)) list.push(roundTo10k);
    const roundTo50k = Math.ceil(grandTotal / 50000) * 50000;
    if (roundTo50k > grandTotal && !list.includes(roundTo50k)) list.push(roundTo50k);
    const roundTo100k = Math.ceil(grandTotal / 100000) * 100000;
    if (roundTo100k > grandTotal && !list.includes(roundTo100k)) list.push(roundTo100k);
    if (!list.includes(100000) && grandTotal < 100000) list.push(100000);
    if (!list.includes(200000) && grandTotal < 200000) list.push(200000);
    return Array.from(new Set(list)).slice(0, 5);
  };

  const handleCashShortcut = (amount: number) => {
    setCashAmount(amount);
    setCashInputString(amount.toString());
    sfx.playClick();
  };

  const handleManualCashChange = (val: string) => {
    const cleanNum = val.replace(/\D/g, '');
    setCashInputString(cleanNum);
    setCashAmount(Number(cleanNum) || 0);
  };

  const bankVAMap: Record<string, string> = {
    BCA: '8277 0812 3456 7890',
    Mandiri: '8890 8123 4567 8901',
    BRI: '1280 8123 4567 8902',
    BNI: '9880 8123 4567 8903',
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText(bankVAMap[selectedBank].replace(/\s/g, ''));
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  // Complete Payment Action
  const handleFinalizeTransaction = () => {
    sfx.playCashRegister();
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    const orderNum = `KPR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      orderNumber: orderNum,
      date: formatReceiptDate(new Date()),
      timestamp: Date.now(),
      items: [...cart],
      subtotal,
      discount,
      discountName,
      tax,
      total: grandTotal,
      paymentMethod: method,
      cashReceived: method === 'tunai' ? cashAmount : grandTotal,
      cashChange: method === 'tunai' ? cashChange : 0,
      bankName: method === 'transfer' ? `${selectedBank} Virtual Account` : undefined,
      orderType,
      tableNumber: tableNumber || (orderType === 'dine-in' ? 'Meja 01' : 'Takeaway'),
      customerName: customerName || 'Pelanggan Umum',
      cashierName: 'Rian (Kasir 1)',
      status: 'lunas',
    };

    onPaymentSuccess(newTrx);
  };

  const simulateQrisSuccess = () => {
    setQrisStatus('processing');
    setTimeout(() => {
      setQrisStatus('success');
      setTimeout(() => {
        handleFinalizeTransaction();
      }, 700);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Metode Pembayaran</h3>
            <p className="text-xs text-neutral-400">Pilih salah satu metode pembayaran di bawah</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Banner */}
        <div className="p-4 bg-neutral-800/40 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Total Tagihan:</span>
          <span className="text-xl font-bold font-mono tabular-nums text-amber-400">
            {formatRupiah(grandTotal)}
          </span>
        </div>

        {/* Method Tabs */}
        <div className="p-3 border-b border-neutral-800 bg-neutral-950/60">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
            <button
              onClick={() => {
                setMethod('tunai');
                sfx.playClick();
              }}
              className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                method === 'tunai'
                  ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Tunai</span>
            </button>

            <button
              onClick={() => {
                setMethod('qris');
                sfx.playClick();
              }}
              className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                method === 'qris'
                  ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>QRIS</span>
            </button>

            <button
              onClick={() => {
                setMethod('transfer');
                sfx.playClick();
              }}
              className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                method === 'transfer'
                  ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Transfer</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: TUNAI (CASH) */}
          {method === 'tunai' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-1 font-medium">
                  Uang Diterima dari Pelanggan:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-semibold">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={cashInputString}
                    onChange={(e) => handleManualCashChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-lg font-bold font-mono tabular-nums text-white focus:outline-none focus:border-amber-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Fast Shortcut Buttons */}
              <div>
                <span className="text-[11px] text-neutral-400 block mb-2 font-medium">Pilihan Nominal Cepat:</span>
                <div className="flex flex-wrap gap-2">
                  {getCashShortcuts().map((amount, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleCashShortcut(amount)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums font-semibold transition-colors border ${
                        cashAmount === amount
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {amount === grandTotal ? 'Uang Pas' : formatRupiah(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kembalian / Status Display */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isCashInsufficient
                    ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                    : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                }`}
              >
                <div>
                  <span className="text-xs block font-medium">
                    {isCashInsufficient ? 'Uang Belum Cukup:' : 'Uang Kembalian:'}
                  </span>
                  {isCashInsufficient && (
                    <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Kurang {formatRupiah(grandTotal - cashAmount)}
                    </span>
                  )}
                </div>
                <span className="text-xl font-bold font-mono tabular-nums">
                  {formatRupiah(cashChange)}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: QRIS */}
          {method === 'qris' && (
            <div className="flex flex-col items-center text-center space-y-4">
              {/* QRIS Header */}
              <div className="w-full bg-white text-neutral-900 rounded-xl p-4 shadow-md flex flex-col items-center border border-neutral-300">
                <div className="flex items-center justify-between w-full border-b border-neutral-200 pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-red-600 text-sm tracking-wider">QRIS</span>
                    <span className="text-[10px] text-neutral-600 font-medium">Standar Pembayaran Nasional</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-neutral-500">NMID: ID102026884192</span>
                </div>

                <div className="text-xs font-bold text-neutral-900 mb-2">
                  KOPI & RASA WARUNG & CAFE
                </div>

                {/* Simulated QR Code Graphic */}
                <div className="relative p-3 bg-white border-2 border-neutral-900 rounded-lg">
                  <svg
                    className="w-48 h-48"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                  >
                    {/* Corners */}
                    <rect x="0" y="0" width="28" height="28" fill="black" />
                    <rect x="4" y="4" width="20" height="20" fill="white" />
                    <rect x="8" y="8" width="12" height="12" fill="black" />

                    <rect x="72" y="0" width="28" height="28" fill="black" />
                    <rect x="76" y="4" width="20" height="20" fill="white" />
                    <rect x="80" y="8" width="12" height="12" fill="black" />

                    <rect x="0" y="72" width="28" height="28" fill="black" />
                    <rect x="4" y="76" width="20" height="20" fill="white" />
                    <rect x="8" y="80" width="12" height="12" fill="black" />

                    {/* QR Matrix Pattern Simulation */}
                    <rect x="36" y="8" width="6" height="6" fill="black" />
                    <rect x="48" y="14" width="6" height="6" fill="black" />
                    <rect x="58" y="6" width="6" height="6" fill="black" />
                    <rect x="34" y="24" width="6" height="6" fill="black" />
                    <rect x="46" y="30" width="6" height="6" fill="black" />
                    <rect x="10" y="40" width="6" height="6" fill="black" />
                    <rect x="24" y="46" width="6" height="6" fill="black" />
                    <rect x="38" y="42" width="8" height="8" fill="black" />
                    <rect x="52" y="48" width="6" height="6" fill="black" />
                    <rect x="66" y="38" width="6" height="6" fill="black" />
                    <rect x="80" y="44" width="6" height="6" fill="black" />
                    <rect x="40" y="60" width="6" height="6" fill="black" />
                    <rect x="54" y="64" width="6" height="6" fill="black" />
                    <rect x="68" y="58" width="6" height="6" fill="black" />
                    <rect x="82" y="70" width="6" height="6" fill="black" />
                    <rect x="36" y="78" width="6" height="6" fill="black" />
                    <rect x="50" y="82" width="6" height="6" fill="black" />
                    <rect x="64" y="76" width="6" height="6" fill="black" />
                    <rect x="76" y="84" width="8" height="8" fill="black" />
                  </svg>

                  {/* QRIS Center badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-neutral-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                      QRIS
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <div className="text-sm font-bold text-neutral-900 font-mono tabular-nums">
                    {formatRupiah(grandTotal)}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Scan via GoPay, OVO, Dana, ShopeePay, BCA, dll.
                  </div>
                </div>
              </div>

              {/* Timer & Sim button */}
              <div className="text-xs text-neutral-400 flex items-center gap-2">
                <span>Berlaku hingga:</span>
                <span className="font-mono tabular-nums font-bold text-amber-400">
                  {Math.floor(secondsRemaining / 60)}:
                  {(secondsRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <button
                type="button"
                onClick={simulateQrisSuccess}
                disabled={qrisStatus !== 'idle'}
                className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-neutral-700 transition-colors"
              >
                {qrisStatus === 'processing' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Menunggu konfirmasi scan pelanggan...</span>
                  </>
                ) : qrisStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Pembayaran Berhasil Terverifikasi!</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Simulasikan Pembayaran Berhasil (Scan Pelanggan)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: TRANSFER BANK */}
          {method === 'transfer' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-2 font-medium">Pilih Rekening Tujuan:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['BCA', 'Mandiri', 'BRI', 'BNI'] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBank(b)}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-colors ${
                        selectedBank === b
                          ? 'bg-amber-500 text-neutral-950 border-amber-500'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* VA Card */}
              <div className="p-4 bg-neutral-800/80 rounded-xl border border-neutral-700 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Nomor Virtual Account ({selectedBank}):</span>
                  <span className="text-emerald-400 font-medium">Otomatis Terverifikasi</span>
                </div>

                <div className="flex items-center justify-between bg-neutral-900 p-2.5 rounded-lg border border-neutral-700">
                  <span className="font-mono text-base font-bold text-white tracking-wider">
                    {bankVAMap[selectedBank]}
                  </span>
                  <button
                    onClick={handleCopyVA}
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md transition-colors flex items-center gap-1 text-xs"
                    title="Salin Nomor VA"
                  >
                    {copiedVA ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Disalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Salin</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-neutral-400 space-y-1">
                  <p>• Atas Nama: <strong>KOPI & RASA KASIR</strong></p>
                  <p>• Masukkan nominal tepat <strong>{formatRupiah(grandTotal)}</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          >
            Batal
          </button>

          <button
            onClick={handleFinalizeTransaction}
            disabled={method === 'tunai' && isCashInsufficient}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              method === 'tunai' && isCashInsufficient
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-950/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Selesaikan & Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
