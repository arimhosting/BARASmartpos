
import React from 'react';
import { Vendor, Product } from '../types';
import { formatRupiah } from '../constants';
import { Store, ShoppingBag, ArrowRight, Star, TrendingUp, ShieldCheck, Smartphone } from 'lucide-react';

interface LandingViewProps {
  vendors: Vendor[];
  products: Product[];
  onLoginClick: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ vendors, products, onLoginClick }) => {
  // Get a subset of products for showcase (e.g., first 8)
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 font-sans overflow-y-auto">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                B
              </div>
              <span className="font-bold text-xl tracking-tight">BARAsmartpos</span>
            </div>
            <button 
              onClick={onLoginClick}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span className="hidden sm:inline">Mitra / Staff</span> Masuk
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl mb-6">
              <span className="block">Platform Kasir Digital</span>
              <span className="block text-blue-600">Untuk UMKM Modern</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Kelola stok, pantau penjualan real-time, dan hubungkan bisnis Anda dengan ribuan pelanggan dalam satu aplikasi pintar berbasis Cloud AI.
            </p>
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center gap-4">
              <button onClick={onLoginClick} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-xl shadow-blue-900/20 transition-all">
                Mulai Sekarang
              </button>
              <button className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-slate-700 text-base font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 md:py-4 md:text-lg md:px-10 transition-all">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                   <TrendingUp />
                </div>
                <h3 className="font-bold text-lg mb-2">Laporan Real-Time</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Analisis penjualan harian dan stok barang kapan saja dari mana saja.</p>
             </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                   <ShieldCheck />
                </div>
                <h3 className="font-bold text-lg mb-2">Multi-Vendor & Aman</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Sistem terpusat yang aman untuk mengelola banyak cabang atau mitra sekaligus.</p>
             </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                   <Smartphone />
                </div>
                <h3 className="font-bold text-lg mb-2">Dukungan QRIS</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Terima pembayaran digital dengan mudah, cepat, dan otomatis tercatat.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Vendors Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Mitra Kami</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Toko Pilihan Terpercaya
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
              Temukan berbagai merchant berkualitas yang telah bergabung dengan ekosistem BARAsmartpos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendors.map(vendor => (
              <div key={vendor.id} className="group relative bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 transition-all hover:shadow-xl hover:-translate-y-1 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-700 p-1 shadow-sm overflow-hidden flex-shrink-0">
                     {vendor.logo ? (
                        <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover rounded-lg" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Store size={24} />
                        </div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {vendor.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {vendor.address}
                    </p>
                    <div className="mt-2 flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                      Buka Sekarang
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
             <div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Produk Unggulan</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Menu favorit dari berbagai mitra kami.</p>
             </div>
             <button className="hidden sm:flex items-center gap-1 text-blue-600 font-medium hover:underline">
                Lihat Semua <ArrowRight size={16} />
             </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => {
                const vendor = vendors.find(v => v.id === product.vendorId);
                return (
                    <div key={product.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all border border-gray-100 dark:border-slate-800 group">
                        <div className={`h-48 w-full overflow-hidden relative ${product.color || 'bg-gray-200'}`}>
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                            />
                            {vendor && (
                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                                    <Store size={10} />
                                    <span className="truncate max-w-[100px]">{vendor.name}</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.category}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded text-yellow-700 dark:text-yellow-400 text-xs font-bold">
                                    <Star size={10} className="fill-current" /> 4.8
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatRupiah(product.price)}</span>
                                <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                                    <ShoppingBag size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
             <button className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline">
                Lihat Semua Produk <ArrowRight size={16} />
             </button>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                  <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">BARAsmartpos</span>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">© 2024 PT Bara Teknologi Digital. All rights reserved.</p>
              </div>
              <div className="flex gap-6">
                 <a href="#" className="text-gray-400 hover:text-gray-500">Instagram</a>
                 <a href="#" className="text-gray-400 hover:text-gray-500">Twitter</a>
                 <a href="#" className="text-gray-400 hover:text-gray-500">LinkedIn</a>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};
