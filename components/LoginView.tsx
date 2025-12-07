
import React, { useState } from 'react';
import { UserRole, ToastType, User as AppUser } from '../types';
import { Lock, User, ChevronRight, Store } from 'lucide-react';

interface LoginViewProps {
  onLogin: (role: UserRole, username: string) => void;
  onShowToast: (message: string, type: ToastType) => void;
  users: AppUser[];
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onShowToast, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!username || !password) {
      onShowToast('Username dan password harus diisi', 'error');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const foundUser = users.find(u => u.username === username && u.password === password);

      if (foundUser) {
        onLogin(foundUser.role, foundUser.username);
      } else {
        onShowToast('Username atau password salah', 'error');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in relative">
        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="p-8 pb-6 text-center border-b border-gray-100">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
            B
          </div>
          <h1 className="text-2xl font-bold text-gray-800">BARAsmartpos</h1>
          <p className="text-gray-500 text-sm mt-1">Multi-Vendor Cloud POS System</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Masukkan username"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Masukkan password"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk Aplikasi</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 mt-4 space-y-1 border border-gray-100">
            <p className="font-semibold text-gray-700 mb-1">Akun Demo:</p>
            <div className="flex justify-between">
                <span>Super Admin:</span>
                <span className="font-mono text-gray-800">superadmin / admin</span>
            </div>
            <div className="flex justify-between">
                <span>Owner Toko (V1):</span>
                <span className="font-mono text-gray-800">owner1 / 123</span>
            </div>
            <div className="flex justify-between">
                <span>Kasir Toko (V1):</span>
                <span className="font-mono text-gray-800">kasir1 / 123</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
