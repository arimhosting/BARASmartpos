
import React, { useState, useEffect } from 'react';
import { Product, ViewProps } from '../types';
import { formatRupiah } from '../constants';
import { Plus, Edit2, Trash2, Wand2, Search, X, Image as ImageIcon, Settings, Upload } from 'lucide-react';
import { Button, Input, Select } from './UIComponents';
import { generateProductDescription } from '../services/geminiService';

interface InventoryViewProps extends ViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  // Dynamic Categories from ViewProps will be used
}

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  onShowToast, 
  categories, 
  onAddCategory, 
  onDeleteCategory 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', category: '', price: 0, stock: 0, description: '', image: ''
  });
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Ensure form data category is valid when categories prop changes (e.g. switching vendors)
  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
        setFormData(prev => ({...prev, category: categories[0]}));
    }
  }, [categories]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: categories[0] || '', price: 0, stock: 0, description: '', image: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) {
        onShowToast('Nama dan harga produk wajib diisi', 'error');
        return;
    }

    const productData = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      // Vendor ID is handled in App.tsx wrapper, we just pass the object
      vendorId: editingProduct ? editingProduct.vendorId : '', // Placeholder, handled in parent
      name: formData.name,
      category: formData.category || categories[0],
      price: Number(formData.price),
      stock: Number(formData.stock),
      description: formData.description || '',
      image: formData.image || `https://picsum.photos/200/200?random=${Date.now()}`,
      color: editingProduct?.color || 'bg-gray-100'
    } as Product;

    if (editingProduct) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    setIsModalOpen(false);
  };

  const handleAiGenerate = async () => {
    if (!formData.name || !formData.category) {
        onShowToast("Mohon isi nama dan kategori produk terlebih dahulu.", "warning");
        return;
    }
    setIsGeneratingAi(true);
    const desc = await generateProductDescription(formData.name, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGeneratingAi(false);
    onShowToast("Deskripsi berhasil dibuat dengan AI!", "success");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategorySubmit = () => {
    if (!newCategoryName) return;
    if (onAddCategory) {
      onAddCategory(newCategoryName);
      setNewCategoryName('');
    }
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-slate-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Inventaris</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola produk, stok, dan konsistensi foto barang</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)} icon={<Settings size={18} />}>Kelola Kategori</Button>
          <Button onClick={openAddModal} icon={<Plus size={18} />}>Tambah Produk</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex gap-4">
          <div className="relative max-w-md w-full">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Cari stok barang..."
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="pl-9 pr-4 py-2 w-full border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
             />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Harga</th>
                <th className="px-6 py-4">Stok</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-600 border border-gray-100 dark:border-slate-600">
                         <img 
                           src={product.image} 
                           alt="" 
                           className="w-full h-full object-cover" 
                           onError={(e) => { (e.target as HTMLImageElement).src = '' }} 
                         />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-slate-600 rounded text-xs font-medium">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{formatRupiah(product.price)}</td>
                  <td className="px-6 py-4">
                     <span className={`text-sm ${product.stock < 10 ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                       {product.stock} unit
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEditModal(product)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteProduct(product.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
             <div className="p-8 text-center text-gray-500 dark:text-gray-400">Produk tidak ditemukan.</div>
          )}
        </div>
      </div>

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
             <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
               <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kelola Kategori</h2>
               <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={20} /></button>
             </div>
             <div className="p-6 space-y-4">
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={newCategoryName} 
                   onChange={e => setNewCategoryName(e.target.value)}
                   className="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:text-white"
                   placeholder="Nama kategori baru..."
                 />
                 <Button onClick={handleAddCategorySubmit} disabled={!newCategoryName} size="sm">Tambah</Button>
               </div>
               <div className="max-h-60 overflow-y-auto space-y-2">
                 {categories.map(cat => (
                   <div key={cat} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                     <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{cat}</span>
                     <button 
                        onClick={() => onDeleteCategory && onDeleteCategory(cat)} 
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                     >
                       <Trash2 size={14} />
                     </button>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input 
                    label="Nama Produk" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="cth. Kopi Susu Gula Aren"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Select 
                      label="Kategori"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      options={categories.map(c => ({ value: c, label: c }))}
                    />
                    <Input 
                      label="Harga (Rp)" 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                    />
                  </div>

                  <Input 
                    label="Jumlah Stok" 
                    type="number" 
                    value={formData.stock} 
                    onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} 
                  />
                </div>

                {/* Right Side: Image Preview & URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto Produk</label>
                  
                  {/* Aspect Square + Object Cover for Consistency */}
                  <div className="w-full aspect-square bg-gray-100 dark:bg-slate-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 overflow-hidden flex flex-col items-center justify-center relative group">
                    {formData.image ? (
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        onError={(e) => { (e.target as HTMLImageElement).src = '' }} 
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <span className="text-xs">Preview Gambar (1:1)</span>
                      </div>
                    )}
                    
                    {/* Overlay Upload Button */}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                       <span className="text-white bg-black/50 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 backdrop-blur-sm">
                         <Upload size={14} /> Upload Foto
                       </span>
                       <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                  
                  <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Disarankan rasio 1:1 (Persegi)
                  </div>
                  <Input 
                    placeholder="Atau tempel URL gambar..."
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-end">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
                  <button 
                    onClick={handleAiGenerate}
                    disabled={isGeneratingAi}
                    className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                  >
                    <Wand2 size={12} />
                    {isGeneratingAi ? 'Sedang membuat...' : 'Buat Otomatis (AI)'}
                  </button>
                </div>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none bg-white dark:bg-slate-700 dark:text-white"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Masukkan deskripsi produk..."
                ></textarea>
                <p className="text-xs text-gray-400">Didukung oleh Google Gemini</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800 mt-auto">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button onClick={handleSave}>Simpan Produk</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
