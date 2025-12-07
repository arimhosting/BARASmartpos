
import React, { useState } from 'react';
import { Vendor, ViewProps, Transaction } from '../types';
import { Button, Input, Select } from './UIComponents';
import { Plus, Edit2, Trash2, Search, X, Store, LogIn, Calendar, MapPin, Phone, Upload, Image as ImageIcon, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { formatRupiah } from '../constants';

interface VendorManagementViewProps extends ViewProps {
  vendors: Vendor[];
  allTransactions?: Transaction[]; // Optional prop for stats
  onAddVendor: (vendor: Vendor) => void;
  onUpdateVendor: (vendor: Vendor) => void;
  onDeleteVendor: (id: string) => void;
  onAccessVendor: (vendor: Vendor) => void;
}

export const VendorManagementView: React.FC<VendorManagementViewProps> = ({ 
  vendors, 
  allTransactions = [],
  onAddVendor, 
  onUpdateVendor, 
  onDeleteVendor,
  onAccessVendor, 
  onShowToast 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState<Partial<Vendor>>({
    name: '', address: '', phone: '', ownerName: '', status: 'active', logo: '', 
    subscriptionStart: new Date().toISOString().split('T')[0], 
    subscriptionEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    commissionRate: 5
  });

  const openAddModal = () => {
    setEditingVendor(null);
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
    setFormData({ 
      name: '', address: '', phone: '', ownerName: '', status: 'active', logo: '', 
      subscriptionStart: today, 
      subscriptionEnd: nextYear,
      commissionRate: 5
    });
    setIsModalOpen(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    // Ensure dates are formatted for input date type (YYYY-MM-DD)
    const startDate = vendor.subscriptionStart ? new Date(vendor.subscriptionStart).toISOString().split('T')[0] : '';
    const endDate = vendor.subscriptionEnd ? new Date(vendor.subscriptionEnd).toISOString().split('T')[0] : '';
    
    setFormData({ 
      ...vendor, 
      subscriptionStart: startDate,
      subscriptionEnd: endDate
    });
    setIsModalOpen(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.ownerName) {
      onShowToast('Nama Toko dan Nama Pemilik wajib diisi', 'error');
      return;
    }

    const vendorData: Vendor = {
      id: editingVendor ? editingVendor.id : `v-${Date.now()}`,
      name: formData.name!,
      address: formData.address || '',
      phone: formData.phone || '',
      ownerName: formData.ownerName!,
      status: (formData.status as 'active' | 'inactive') || 'active',
      joinedDate: editingVendor ? editingVendor.joinedDate : new Date().toISOString(),
      logo: formData.logo,
      subscriptionStart: formData.subscriptionStart ? new Date(formData.subscriptionStart).toISOString() : undefined,
      subscriptionEnd: formData.subscriptionEnd ? new Date(formData.subscriptionEnd).toISOString() : undefined,
      commissionRate: Number(formData.commissionRate) || 0
    };

    if (editingVendor) {
      onUpdateVendor(vendorData);
    } else {
      onAddVendor(vendorData);
    }
    setIsModalOpen(false);
  };

  // Helper to calculate vendor stats
  const getVendorStats = (vendorId: string) => {
    const vTxns = allTransactions.filter(t => t.vendorId === vendorId);
    const totalRevenue = vTxns.reduce((sum, t) => sum + t.total, 0);
    
    // Top Product
    const prodCounts: Record<string, number> = {};
    vTxns.forEach(t => t.items.forEach(i => {
        prodCounts[i.name] = (prodCounts[i.name] || 0) + i.quantity;
    }));
    const topProduct = Object.entries(prodCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || '-';

    return { totalRevenue, topProduct };
  };

  // Helper for Subscription status
  const getSubscriptionStatus = (endDateString?: string) => {
    if (!endDateString) return { label: 'Unknown', color: 'bg-gray-100 text-gray-500' };
    
    const end = new Date(endDateString);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' };
    if (diffDays < 7) return { label: `${diffDays} Hari Lagi`, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' };
    return { label: 'Aktif', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' };
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-slate-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sistem Multi-Vendor</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola performa, langganan, dan branding mitra</p>
        </div>
        <Button onClick={openAddModal} icon={<Plus size={18} />}>Tambah Mitra Baru</Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari toko atau pemilik..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Nama Toko</th>
                <th className="px-6 py-4">Status & Sewa</th>
                <th className="px-6 py-4 text-center">Omset & Top Produk</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredVendors.map(vendor => {
                const stats = getVendorStats(vendor.id);
                const subStatus = getSubscriptionStatus(vendor.subscriptionEnd);

                return (
                  <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-slate-600">
                          {vendor.logo ? (
                            <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Store size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{vendor.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <MapPin size={10} /> {vendor.address || 'Alamat tidak ada'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${subStatus.color}`}>
                          <Clock size={10} className="mr-1" /> {subStatus.label}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Exp: {vendor.subscriptionEnd ? new Date(vendor.subscriptionEnd).toLocaleDateString('id-ID') : '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><DollarSign size={12}/> Omset:</span>
                                <span className="font-bold text-green-600 dark:text-green-400">{formatRupiah(stats.totalRevenue)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><TrendingUp size={12}/> Top:</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[100px]" title={stats.topProduct}>{stats.topProduct}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="font-medium text-gray-900 dark:text-white">{vendor.ownerName}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Phone size={10} /> {vendor.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button size="sm" onClick={() => onAccessVendor(vendor)} className="bg-indigo-600 hover:bg-indigo-700 border-none text-white">
                        <LogIn size={14} className="mr-1" /> Akses
                      </Button>
                      <button onClick={() => openEditModal(vendor)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => onDeleteVendor(vendor.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingVendor ? 'Edit Mitra' : 'Tambah Mitra Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Logo Upload */}
              <div className="flex items-center justify-center">
                 <div className="relative group w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-700 border-2 border-dashed border-gray-300 dark:border-slate-600 overflow-hidden flex items-center justify-center cursor-pointer">
                    {formData.logo ? (
                        <img src={formData.logo} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                        <ImageIcon className="text-gray-400" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="text-white" size={20} />
                    </div>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <Input label="Nama Toko" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Kopi Kenangan" />
                 <Input label="Nama Pemilik" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} placeholder="Nama lengkap" />
              </div>
              
              <Input label="Alamat Lengkap" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Alamat toko" />
              <Input label="Nomor Telepon" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="08..." />

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-slate-700 pt-4 mt-2">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mulai Sewa</label>
                    <input type="date" value={formData.subscriptionStart} onChange={e => setFormData({...formData, subscriptionStart: e.target.value})} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:text-white" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Berakhir</label>
                    <input type="date" value={formData.subscriptionEnd} onChange={e => setFormData({...formData, subscriptionEnd: e.target.value})} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:text-white" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <Input label="Komisi Bagi Hasil (%)" type="number" value={formData.commissionRate} onChange={e => setFormData({...formData, commissionRate: Number(e.target.value)})} />
                  <Select 
                    label="Status Mitra"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    options={[
                      { value: 'active', label: 'Aktif' },
                      { value: 'inactive', label: 'Non-Aktif (Suspended)' }
                    ]}
                  />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button onClick={handleSave}>Simpan Data</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
