import React, { useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  UtensilsCrossed,
  DollarSign,
  Receipt,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Plus,
  Package,
  ArrowUpRight,
} from 'lucide-react';
import { Transaction, MenuItem, MenuCategory } from '../types/pos';
import { formatRupiah, formatDateTime } from '../utils/format';

interface DashboardViewProps {
  transactions: Transaction[];
  menuItems: MenuItem[];
  onToggleStock: (itemId: string) => void;
  onAddNewMenuItem: (item: MenuItem) => void;
  onViewReceipt: (trx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  menuItems,
  onToggleStock,
  onAddNewMenuItem,
  onViewReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'transaksi' | 'stok'>('ringkasan');
  const [searchTrx, setSearchTrx] = useState('');
  const [filterMethod, setFilterMethod] = useState<'all' | 'tunai' | 'qris' | 'transfer'>('all');
  
  // Stock filter
  const [stockSearch, setStockSearch] = useState('');
  const [stockCategory, setStockCategory] = useState<MenuCategory>('all');

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<MenuCategory>('makanan');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Calculations
  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalTransactionsCount = transactions.length;
  const totalItemsSold = transactions.reduce(
    (acc, t) => acc + t.items.reduce((s, it) => s + it.quantity, 0),
    0
  );
  const averageOrderValue = totalTransactionsCount > 0 ? totalRevenue / totalTransactionsCount : 0;

  // Payment breakdown
  const paymentBreakdown = {
    tunai: transactions.filter((t) => t.paymentMethod === 'tunai').reduce((s, t) => s + t.total, 0),
    qris: transactions.filter((t) => t.paymentMethod === 'qris').reduce((s, t) => s + t.total, 0),
    transfer: transactions.filter((t) => t.paymentMethod === 'transfer').reduce((s, t) => s + t.total, 0),
  };

  // Best seller menu items
  const itemSalesMap: Record<string, { item: MenuItem; count: number; omset: number }> = {};
  transactions.forEach((trx) => {
    trx.items.forEach((it) => {
      if (!itemSalesMap[it.menuItem.id]) {
        itemSalesMap[it.menuItem.id] = {
          item: it.menuItem,
          count: 0,
          omset: 0,
        };
      }
      itemSalesMap[it.menuItem.id].count += it.quantity;
      itemSalesMap[it.menuItem.id].omset += it.quantity * it.menuItem.price;
    });
  });

  const topSellers = Object.values(itemSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.orderNumber.toLowerCase().includes(searchTrx.toLowerCase()) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchTrx.toLowerCase())) ||
      (t.tableNumber && t.tableNumber.toLowerCase().includes(searchTrx.toLowerCase()));
    const matchesMethod = filterMethod === 'all' || t.paymentMethod === filterMethod;
    return matchesSearch && matchesMethod;
  });

  // Filtered stock
  const filteredStockItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(stockSearch.toLowerCase());
    const matchesCat = stockCategory === 'all' || item.category === stockCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;

    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: newItemName,
      category: newItemCategory,
      price: Number(newItemPrice),
      description: newItemDesc || 'Menu spesial racikan dapur KOPI & RASA',
      image: '',
      fallbackGradient: 'from-amber-700 to-neutral-900',
      isAvailable: true,
      badge: 'Baru',
    };

    onAddNewMenuItem(newItem);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* View Switcher Sub-nav */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Dashboard & Laporan Kasir</h1>
          <p className="text-xs text-neutral-400">
            Ringkasan omset penjualan, riwayat transaksi lunas, dan stok bahan menu
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-neutral-800/80 rounded-xl border border-neutral-700/60">
          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'ringkasan'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Ringkasan & Analitik
          </button>
          <button
            onClick={() => setActiveTab('transaksi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'transaksi'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Riwayat Transaksi ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('stok')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'stok'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Stok & Manajemen Menu
          </button>
        </div>
      </div>

      {/* TAB 1: RINGKASAN & ANALITIK */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          {/* KPI Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* KPI 1 */}
            <div className="p-4 bg-neutral-850/80 rounded-2xl border border-neutral-800 bg-neutral-800/40">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                <span>Total Omset Hari Ini</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {formatRupiah(totalRevenue)}
              </div>
              <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+18.4% vs kemarin</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-4 bg-neutral-850/80 rounded-2xl border border-neutral-800 bg-neutral-800/40">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                <span>Jumlah Transaksi</span>
                <Receipt className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {totalTransactionsCount} order
              </div>
              <div className="mt-2 text-[11px] text-neutral-400">
                Lunas & tercatat di sistem
              </div>
            </div>

            {/* KPI 3 */}
            <div className="p-4 bg-neutral-850/80 rounded-2xl border border-neutral-800 bg-neutral-800/40">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                <span>Menu Terjual</span>
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {totalItemsSold} porsi
              </div>
              <div className="mt-2 text-[11px] text-neutral-400">
                Makanan & minuman segar
              </div>
            </div>

            {/* KPI 4 */}
            <div className="p-4 bg-neutral-850/80 rounded-2xl border border-neutral-800 bg-neutral-800/40">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                <span>Rata-rata Order (AOV)</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {formatRupiah(averageOrderValue)}
              </div>
              <div className="mt-2 text-[11px] text-neutral-400">
                Nilai per struk pelanggan
              </div>
            </div>
          </div>

          {/* Two-column insights: Payment methods & Top Sellers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Method Distribution */}
            <div className="p-5 bg-neutral-800/40 border border-neutral-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Komposisi Metode Pembayaran</span>
                </h3>
                <span className="text-xs text-neutral-400 font-mono tabular-nums">
                  Total: {formatRupiah(totalRevenue)}
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {/* QRIS */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono tabular-nums">
                    <span className="text-white font-medium">QRIS Nasional</span>
                    <span className="text-neutral-300">
                      {formatRupiah(paymentBreakdown.qris)} (
                      {totalRevenue > 0
                        ? Math.round((paymentBreakdown.qris / totalRevenue) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${
                          totalRevenue > 0
                            ? (paymentBreakdown.qris / totalRevenue) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Tunai */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono tabular-nums">
                    <span className="text-white font-medium">Tunai (Cash)</span>
                    <span className="text-neutral-300">
                      {formatRupiah(paymentBreakdown.tunai)} (
                      {totalRevenue > 0
                        ? Math.round((paymentBreakdown.tunai / totalRevenue) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${
                          totalRevenue > 0
                            ? (paymentBreakdown.tunai / totalRevenue) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Transfer */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono tabular-nums">
                    <span className="text-white font-medium">Transfer Bank</span>
                    <span className="text-neutral-300">
                      {formatRupiah(paymentBreakdown.transfer)} (
                      {totalRevenue > 0
                        ? Math.round((paymentBreakdown.transfer / totalRevenue) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          totalRevenue > 0
                            ? (paymentBreakdown.transfer / totalRevenue) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Seller Menu Items */}
            <div className="p-5 bg-neutral-800/40 border border-neutral-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Menu Paling Laris Hari Ini</span>
                </h3>
                <span className="text-xs text-neutral-400">Paling diminati</span>
              </div>

              {topSellers.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-400">
                  Belum ada transaksi item yang tercatat.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {topSellers.map(({ item, count, omset }, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 bg-neutral-800/70 rounded-xl border border-neutral-750"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-bold font-mono text-amber-400">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-neutral-400 uppercase">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono tabular-nums">
                        <span className="text-xs font-bold text-amber-400 block">
                          {formatRupiah(omset)}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {count} porsi terjual
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT TRANSAKSI */}
      {activeTab === 'transaksi' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari order #, nama pelanggan, meja..."
                value={searchTrx}
                onChange={(e) => setSearchTrx(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-neutral-800 rounded-xl border border-neutral-700/60 overflow-x-auto">
              <Filter className="w-3.5 h-3.5 text-neutral-400 ml-2 mr-1 shrink-0" />
              {(['all', 'tunai', 'qris', 'transfer'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMethod(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    filterMethod === m
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {m === 'all' ? 'Semua Metode' : m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-850/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-800/80 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">No. Order</th>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Pelanggan / Meja</th>
                    <th className="py-3 px-4">Rincian Item</th>
                    <th className="py-3 px-4 text-right">Total Bayar</th>
                    <th className="py-3 px-4 text-center">Metode</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-400">
                        Tidak ada transaksi yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((trx) => (
                      <tr key={trx.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          {trx.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-neutral-300 font-mono">
                          {trx.date}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">
                            {trx.customerName || 'Pelanggan Umum'}
                          </div>
                          <span className="text-[11px] text-neutral-400">
                            {trx.orderType === 'dine-in' ? trx.tableNumber : 'Takeaway'}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-neutral-300">
                          {trx.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                          {formatRupiah(trx.total)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              trx.paymentMethod === 'qris'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : trx.paymentMethod === 'tunai'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                            }`}
                          >
                            {trx.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => onViewReceipt(trx)}
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg border border-neutral-700 transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Struk</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STOK & MANAJEMEN MENU */}
      {activeTab === 'stok' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari menu untuk ubah stok..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Menu Baru</span>
            </button>
          </div>

          {/* Stock Table */}
          <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-850/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-800/80 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama Menu</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Harga</th>
                    <th className="py-3 px-4 text-center">Status Stok</th>
                    <th className="py-3 px-4 text-center">Tindakan Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                            <Package className="w-4 h-4 text-amber-400" />
                          </div>
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-300 uppercase text-[11px]">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 tabular-nums">
                        {formatRupiah(item.price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            item.isAvailable
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isAvailable ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          <span>{item.isAvailable ? 'Tersedia' : 'Habis'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onToggleStock(item.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                            item.isAvailable
                              ? 'bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border-rose-800/40'
                              : 'bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300 border-emerald-800/40'
                          }`}
                        >
                          {item.isAvailable ? 'Tandai Habis' : 'Set Tersedia'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add New Menu Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white">Tambah Menu Baru</h3>
            <form onSubmit={handleCreateNewItem} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Nama Makanan / Minuman</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Es Kopi Pandan Aren"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Kategori</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as MenuCategory)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="makanan">Makanan</option>
                    <option value="snack">Snack</option>
                    <option value="coffee">Coffee</option>
                    <option value="non-coffee">Non-Coffee</option>
                    <option value="minuman">Minuman</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="20000"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white font-mono tabular-nums placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Komposisi bahan lezat & ciri khas..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg shadow-sm"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
