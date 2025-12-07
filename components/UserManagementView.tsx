
import React, { useState } from 'react';
import { User, ViewProps, UserRole } from '../types';
import { Button, Input, Select } from './UIComponents';
import { Plus, Edit2, Trash2, Search, X, Shield, ShieldAlert, User as UserIcon, Lock } from 'lucide-react';

interface UserManagementViewProps extends ViewProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (username: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser, onShowToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');

  // Form Data
  const [formData, setFormData] = useState<Partial<User>>({
    name: '', username: '', role: 'cashier', password: ''
  });

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', username: '', role: 'cashier', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    // Don't pre-fill password for security/UX simulation
    setFormData({ ...user, password: user.password || '' });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.username) {
      onShowToast('Nama dan Username wajib diisi', 'error');
      return;
    }

    // Check username uniqueness if adding new
    if (!editingUser && users.some(u => u.username === formData.username)) {
      onShowToast('Username sudah digunakan', 'error');
      return;
    }

    if (!editingUser && !formData.password) {
      onShowToast('Password wajib diisi untuk pengguna baru', 'error');
      return;
    }

    const userData: User = {
      name: formData.name,
      username: formData.username,
      role: formData.role as UserRole,
      password: formData.password || (editingUser?.password || '123456'), // Keep old password if not changed
    };

    if (editingUser) {
      onUpdateUser(userData);
    } else {
      onAddUser(userData);
    }
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-slate-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Pengguna</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola akses dan hak pengguna aplikasi</p>
        </div>
        <Button onClick={openAddModal} icon={<Plus size={18} />}>Tambah Pengguna</Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari pengguna..."
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
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredUsers.map(user => (
                <tr key={user.username} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                    {user.username}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {user.role === 'admin' ? <ShieldAlert size={12}/> : <Shield size={12}/>}
                      {user.role === 'admin' ? 'Administrator' : 'Kasir'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEditModal(user)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"><Edit2 size={16} /></button>
                    {user.username !== 'admin' && (
                       <button onClick={() => onDeleteUser(user.username)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"><Trash2 size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Nama Lengkap" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} icon={<UserIcon size={16}/>} />
              
              <Input 
                label="Username" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})} 
                icon={<Shield size={16}/>} 
                disabled={!!editingUser}
              />

              <Input 
                label={editingUser ? "Password Baru (Kosongkan jika tidak ubah)" : "Password"} 
                type="text" // Visible for demo purposes, usually password type
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                icon={<Lock size={16}/>} 
              />
              
              <Select 
                label="Akses Role"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                options={[
                  { value: 'cashier', label: 'Kasir (POS Only)' },
                  { value: 'admin', label: 'Administrator (Full Access)' }
                ]}
              />
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button onClick={handleSave}>Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
