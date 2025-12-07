
import React, { useState } from 'react';
import { Promotion, ViewProps, Product } from '../types';
import { Button, Input, Select } from './UIComponents';
import { Plus, Trash2, Search, X, Tag, Percent, DollarSign, CheckSquare, Square } from 'lucide-react';
import { formatRupiah } from '../constants';

interface PromoViewProps extends ViewProps {
  promotions: Promotion[];
  products: Product[]; // Need access to products
  onAddPromo: (promo: Promotion) => void;
  onDeletePromo: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export const PromoView: React.FC<PromoViewProps> = ({ promotions, products, onAddPromo, onDeletePromo, onToggleActive, onShowToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Promotion>>({
    code: '', name: '', type: 'PERCENTAGE', value: 0, minSpend: 0, isActive: true, eligibleProductIds: []
  });
  
  const [applyToAll, setApplyToAll] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  const handleOpenModal = () => {
    setFormData({
      code: '', name: '', type: 'PERCENTAGE', value: 0, minSpend: 0, isActive: true, eligibleProductIds: []
    });
    setApplyToAll(true);
    setSelectedProductIds(new Set());
    setIsModalOpen(true);
  }

  const toggleProductSelection = (productId: string) => {
    const newSet = new Set(selectedProductIds);
    if (newSet.has(productId)) {
        newSet.delete(productId);
    } else {
        newSet.add(productId);
    }
    setSelectedProductIds(newSet);
  }

  const handleSave = () => {
    if (!formData.code || !formData.name || !formData.value) {
      onShowToast('Kode, Nama, dan Nilai Promo wajib diisi', 'error');
      return;
    }

    if (!applyToAll && selectedProductIds.size === 0) {
        onShowToast('Pilih minimal satu produk untuk promo spesifik', 'warning');
        return;
    }

    const newPromo: Promotion = {
      id: `PROMO-${Date.now()}`,
      vendorId: '', // Placeholder, will be overwritten by parent component
      code: formData.code.toUpperCase(),
      name: formData.name,
      type: formData.type as 'PERCENTAGE' | 'FIXED',
      value: Number(formData.value),
      minSpend: Number(formData.minSpend) || 0,
      isActive: true,
      eligibleProductIds: applyToAll ? undefined : Array.from(selectedProductIds)
    };

    onAddPromo(newPromo);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-slate-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Promosi</h1>
          <p className="text-gray-500 dark:text-gray-400">Buat kode promo dan diskon spesial</p>
        </div>
        <Button onClick={handleOpenModal} icon={<Plus size={18} />}>Buat Promo Baru</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map(promo => (
          <div key={promo.id} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${promo.isActive ? 'border-blue-200 dark:border-blue-900' : 'border-gray-200 dark:border-slate-700 opacity-70'} overflow-hidden transition-all hover:shadow-md`}>
            <div className={`h-2 ${promo.isActive ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Tag size={20} />
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{promo.code}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{promo.name}</p>
                  </div>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id={`toggle-${promo.id}`} checked={promo.isActive} onChange={() => onToggleActive(promo.id)} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                    <label htmlFor={`toggle-${promo.id}`} className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${promo.isActive ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'}`}></label>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Tipe Potongan</span>
                  <span className="font-medium flex items-center gap-1 dark:text-gray-200">
                    {promo.type === 'PERCENTAGE' ? <Percent size={14}/> : <DollarSign size={14}/>}
                    {promo.type === 'PERCENTAGE' ? 'Persentase (%)' : 'Nominal Tetap (Rp)'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Nilai</span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {promo.type === 'PERCENTAGE' ? `${promo.value}%` : formatRupiah(promo.value)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Min. Belanja</span>
                  <span className="font-medium dark:text-gray-200">{formatRupiah(promo.minSpend || 0)}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                     <span className={`text-xs font-semibold px-2 py-1 rounded-full ${!promo.eligibleProductIds ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                         {!promo.eligibleProductIds ? 'Berlaku Semua Menu' : `Hanya ${promo.eligibleProductIds.length} Menu Tertentu`}
                     </span>
                </div>
              </div>

              <button 
                onClick={() => onDeletePromo(promo.id)}
                className="w-full py-2 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 size={16} /> Hapus Promo
              </button>
            </div>
          </div>
        ))}
        {promotions.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
            Belum ada promosi aktif.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Buat Promo Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <Input label="Kode Promo (Unik)" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="CONTOH: HEMAT10" />
              <Input label="Nama Promo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Diskon Akhir Tahun" />
              
              <div className="grid grid-cols-2 gap-4">
                <Select 
                  label="Tipe Potongan"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                  options={[
                    { value: 'PERCENTAGE', label: 'Persentase (%)' },
                    { value: 'FIXED', label: 'Nominal (Rp)' }
                  ]}
                />
                <Input 
                  label="Nilai Potongan" 
                  type="number" 
                  value={formData.value} 
                  onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} 
                />
              </div>
              <Input 
                  label="Minimal Belanja (Rp)" 
                  type="number" 
                  value={formData.minSpend} 
                  onChange={e => setFormData({...formData, minSpend: parseFloat(e.target.value)})} 
                  placeholder="0 jika tidak ada"
              />

              {/* Product Selection Logic */}
              <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Produk</label>
                  <div className="flex gap-4 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="target" checked={applyToAll} onChange={() => setApplyToAll(true)} className="accent-blue-600"/>
                          <span className="text-sm dark:text-gray-200">Semua Produk</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="target" checked={!applyToAll} onChange={() => setApplyToAll(false)} className="accent-blue-600"/>
                          <span className="text-sm dark:text-gray-200">Produk Tertentu</span>
                      </label>
                  </div>

                  {!applyToAll && (
                      <div className="border border-gray-200 dark:border-slate-600 rounded-lg max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-slate-700">
                          {products.map(p => (
                              <div key={p.id} onClick={() => toggleProductSelection(p.id)} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded cursor-pointer">
                                  {selectedProductIds.has(p.id) ? (
                                      <CheckSquare size={18} className="text-blue-600 dark:text-blue-400" />
                                  ) : (
                                      <Square size={18} className="text-gray-400" />
                                  )}
                                  <span className="text-sm dark:text-gray-200 truncate">{p.name}</span>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button onClick={handleSave}>Simpan Promo</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
