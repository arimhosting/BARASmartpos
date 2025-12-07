
import React, { useEffect, useState, useMemo } from 'react';
import { Transaction, ViewProps } from '../types';
import { formatRupiah } from '../constants';
import { Card, Button } from './UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles, TrendingUp, DollarSign, ShoppingBag, Calendar, Filter, X, Trash2 } from 'lucide-react';
import { analyzeSalesData } from '../services/geminiService';

interface DashboardViewProps extends ViewProps {
  transactions: Transaction[];
  // Dynamic categories passed from App
}

export const DashboardView: React.FC<DashboardViewProps> = ({ transactions, onShowToast, categories, onResetTransactions }) => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  
  // Date Filter State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter Transactions based on Date Range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Convert transaction date to YYYY-MM-DD for comparison
      const tDate = new Date(t.date).toISOString().split('T')[0];
      
      let isValid = true;
      if (startDate && tDate < startDate) isValid = false;
      if (endDate && tDate > endDate) isValid = false;
      
      return isValid;
    });
  }, [transactions, startDate, endDate]);

  // Calculate Stats based on FILTERED transactions
  const stats = useMemo(() => {
    const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const count = filteredTransactions.length;
    const avgOrder = count > 0 ? totalSales / count : 0;
    
    // Most sold category calculation
    const catCount: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      t.items.forEach(i => {
        catCount[i.category] = (catCount[i.category] || 0) + i.quantity;
      });
    });
    // Sort to find top category
    const topCat = Object.entries(catCount).sort((a,b) => b[1] - a[1])[0]?.[0] || '-';

    return { totalSales, count, avgOrder, topCat };
  }, [filteredTransactions]);

  // Chart Data: Sales by Category based on FILTERED transactions
  const chartData = useMemo(() => {
    // Initialize data with 0 for all categories
    const data = categories.map(cat => ({ name: cat, sales: 0 }));
    
    filteredTransactions.forEach(t => {
      t.items.forEach(i => {
        const catIndex = data.findIndex(d => d.name === i.category);
        if (catIndex > -1) {
          data[catIndex].sales += (i.price * i.quantity);
        }
      });
    });
    return data;
  }, [filteredTransactions, categories]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#14b8a6'];

  const handleGetInsights = async () => {
    if (filteredTransactions.length === 0) {
        onShowToast("Tidak ada data transaksi pada periode ini.", "warning");
        return;
    }
    setIsLoadingAi(true);
    try {
        const insight = await analyzeSalesData(filteredTransactions);
        setAiInsight(insight);
        onShowToast("Analisis AI berhasil dibuat!", "success");
    } catch (e) {
        onShowToast("Gagal membuat analisis AI", "error");
    } finally {
        setIsLoadingAi(false);
    }
  };

  // Quick Filter Handlers
  const setFilterToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const setFilterLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const setFilterThisMonth = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-slate-900">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ringkasan Bisnis</h1>
          <p className="text-gray-500 dark:text-gray-400">Pantau performa penjualan usaha Anda.</p>
        </div>
        
        <div className="flex gap-4">
             {onResetTransactions && (
                <button 
                  onClick={onResetTransactions} 
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <Trash2 size={16} />
                  <span className="font-bold text-sm">Reset Laporan</span>
                </button>
             )}

            {/* Date Filter Controls */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-slate-600 pr-3 mr-1">
                    <Filter size={16} />
                    <span className="font-medium">Filter:</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Dari</span>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Sampai</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="h-6 w-px bg-gray-200 dark:bg-slate-600 hidden sm:block mx-1"></div>

                <div className="flex gap-2">
                    <button onClick={setFilterToday} className="px-3 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50">Hari Ini</button>
                    <button onClick={setFilterLast7Days} className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600">7 Hari</button>
                    <button onClick={setFilterThisMonth} className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600">Bulan Ini</button>
                    {(startDate || endDate) && (
                        <button onClick={clearFilter} className="p-1 text-gray-400 hover:text-red-500" title="Hapus Filter">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="flex flex-col">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Penjualan</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatRupiah(stats.totalSales)}</h3>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Transaksi</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.count}</h3>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Rata-rata Order</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatRupiah(stats.avgOrder)}</h3>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Kategori Terlaris</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{stats.topCat}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Penjualan per Kategori</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: number) => [formatRupiah(value), 'Penjualan']}
                  />
                  <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction History Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
               <h3 className="font-bold text-gray-900 dark:text-white">Riwayat Transaksi Terakhir</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400">
                   <tr>
                     <th className="px-6 py-3 font-medium">ID</th>
                     <th className="px-6 py-3 font-medium">Waktu</th>
                     <th className="px-6 py-3 font-medium">Pelanggan</th>
                     <th className="px-6 py-3 font-medium">Metode</th>
                     <th className="px-6 py-3 font-medium text-right">Total</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                   {filteredTransactions.slice(0, 10).map((t) => (
                     <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                       <td className="px-6 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{t.id}</td>
                       <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                         {new Date(t.date).toLocaleDateString('id-ID')} <span className="text-gray-400 text-xs">{new Date(t.timestamp).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                       </td>
                       <td className="px-6 py-3 text-gray-900 dark:text-white font-medium">{t.customerName}</td>
                       <td className="px-6 py-3">
                         <span className={`px-2 py-1 rounded-full text-xs uppercase font-bold ${
                           t.paymentMethod === 'cash' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                           t.paymentMethod === 'card' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 
                           'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                         }`}>
                           {t.paymentMethod}
                         </span>
                       </td>
                       <td className="px-6 py-3 text-right font-bold text-gray-900 dark:text-white">{formatRupiah(t.total)}</td>
                     </tr>
                   ))}
                   {filteredTransactions.length === 0 && (
                     <tr>
                       <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                         Tidak ada data transaksi yang sesuai filter.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Right: AI Analysis */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-yellow-300 animate-pulse" />
              <h3 className="font-bold text-lg">AI Business Insight</h3>
            </div>
            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
              {aiInsight || "Analisis cerdas menggunakan Google Gemini AI untuk membaca tren penjualan Anda."}
            </p>
            <Button 
              onClick={handleGetInsights} 
              disabled={isLoadingAi}
              className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none shadow-none font-bold"
            >
              {isLoadingAi ? 'Menganalisis...' : (aiInsight ? 'Update Analisis' : 'Analisis Sekarang')}
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
             <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
               <Calendar size={18} className="text-blue-500"/> 
               Periode Laporan
             </h4>
             <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
               <div className="flex justify-between border-b border-gray-100 dark:border-slate-700 pb-2">
                 <span>Mulai Tanggal</span>
                 <span className="font-medium text-gray-900 dark:text-white">{startDate ? new Date(startDate).toLocaleDateString('id-ID', { dateStyle: 'long' }) : 'Awal Waktu'}</span>
               </div>
               <div className="flex justify-between border-b border-gray-100 dark:border-slate-700 pb-2">
                 <span>Sampai Tanggal</span>
                 <span className="font-medium text-gray-900 dark:text-white">{endDate ? new Date(endDate).toLocaleDateString('id-ID', { dateStyle: 'long' }) : 'Hari Ini'}</span>
               </div>
               <div className="flex justify-between pt-1">
                 <span>Hari Aktif</span>
                 <span className="font-medium text-gray-900 dark:text-white">
                    {/* Simple calc for demo */}
                    {startDate && endDate 
                      ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)) + 1
                      : '-'
                    } Hari
                 </span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
