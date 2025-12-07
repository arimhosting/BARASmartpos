
import React, { useState } from 'react';
import { Customer, ViewProps } from '../types';
import { Button, Input } from './UIComponents';
import { Plus, Edit2, Trash2, Search, X, User, Phone, Mail } from 'lucide-react';

interface CustomerViewProps extends ViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ customers, onAddCustomer, onUpdateCustomer, onDeleteCustomer, onShowToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '', phone: '', email: '', notes: ''
  });

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', email: '', notes: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ ...customer });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      onShowToast('Nama dan Nomor Telepon wajib diisi', 'error');
      return;
    }

    const customerData = {
      id: editingCustomer ? editingCustomer.id : `CUST-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      notes: formData.notes,
      totalVisits: editingCustomer ? editingCustomer.totalVisits : 0,
      lastVisit: editingCustomer ? editingCustomer.lastVisit : undefined
    } as Customer;

    if (editingCustomer) {
      onUpdateCustomer(customerData);
    } else {
      onAddCustomer(customerData);
    }
    setIsModalOpen(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-slate-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Pelanggan (CRM)</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola database pelanggan dan riwayat kunjungan</p>
        </div>
        <Button onClick={openAddModal} icon={<Plus size={18} />}>Tambah Pelanggan</Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari nama atau no hp..."
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
                <th className="px-6 py-4">Nama Pelanggan</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Catatan</th>
                <th className="px-6 py-4">Total Kunjungan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {customer.phone}</div>
                    {customer.email && <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400"/> {customer.email}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 italic">
                    {customer.notes || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-center">
                    <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-md">{customer.totalVisits}x</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEditModal(customer)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteCustomer(customer.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && <div className="p-8 text-center text-gray-500 dark:text-gray-400">Data tidak ditemukan.</div>}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingCustomer ? 'Edit Pelanggan' : 'Pelanggan Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Nama Lengkap" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} icon={<User size={16}/>} />
              <Input label="Nomor Telepon / WhatsApp" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} icon={<Phone size={16}/>} />
              <Input label="Email (Opsional)" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} icon={<Mail size={16}/>} />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Tambahan</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm h-20 resize-none bg-white dark:bg-slate-700 dark:text-white"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Misal: Alergi kacang, Suka pedas..."
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
