
import React, { useState, useMemo } from 'react';
import { Product, CartItem, SavedOrder, OrderType, ViewProps, Customer, Promotion } from '../types';
import { formatRupiah } from '../constants';
import { Search, Plus, Minus, CreditCard, Banknote, QrCode, Save, Clock, Trash2, User, ChevronRight, X, ShoppingCart, LayoutGrid, List, Utensils, ShoppingBag, Globe, Tag, Check, UserPlus, ArrowRight, Wallet, Info } from 'lucide-react';

interface POSViewProps extends ViewProps {
  products: Product[];
  cart: CartItem[];
  customers: Customer[];
  promotions: Promotion[];
  customerName: string;
  orderType: OrderType;
  selectedCustomer: Customer | null;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetCustomerName: (name: string) => void;
  onSetSelectedCustomer: (customer: Customer | null) => void;
  onSetOrderType: (type: OrderType) => void;
  onCheckout: (paymentMethod: 'cash' | 'card' | 'qr', discount: number, paymentDetails?: any) => void;
  savedOrders: SavedOrder[];
  onSaveOrder: () => void;
  onLoadSavedOrder: (order: SavedOrder) => void;
  onAddQuickCustomer: (name: string, phone: string) => void;
}

export const POSView: React.FC<POSViewProps> = ({ 
  products, 
  cart,
  customers,
  promotions,
  customerName,
  orderType,
  selectedCustomer,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity,
  onSetCustomerName,
  onSetSelectedCustomer,
  onSetOrderType,
  onCheckout,
  savedOrders, 
  onSaveOrder, 
  onLoadSavedOrder,
  onAddQuickCustomer,
  onShowToast,
  categories,
  onClearCart
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr'>('cash');
  
  // Cash Payment State
  const [cashReceived, setCashReceived] = useState<number>(0);
  
  // Card Payment State
  const [cardType, setCardType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [selectedBank, setSelectedBank] = useState<string>('BCA');

  // Customer Search Logic
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);
  const [quickCustName, setQuickCustName] = useState('');
  const [quickCustPhone, setQuickCustPhone] = useState('');

  // Promo Logic
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Filter Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || c.phone.includes(customerSearchQuery));
  }, [customers, customerSearchQuery]);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // DISCOUNT CALCULATION LOGIC
  const discountAmount = useMemo(() => {
    if (!selectedPromo) return 0;
    
    // Check global min spend first (usually based on total cart value)
    if (subtotal < (selectedPromo.minSpend || 0)) return 0;

    let eligibleSubtotal = 0;
    const hasSpecificProducts = selectedPromo.eligibleProductIds && selectedPromo.eligibleProductIds.length > 0;

    if (hasSpecificProducts) {
        // Calculate total only for eligible items
        cart.forEach(item => {
            if (selectedPromo.eligibleProductIds!.includes(item.id)) {
                eligibleSubtotal += item.price * item.quantity;
            }
        });
    } else {
        // Global promo
        eligibleSubtotal = subtotal;
    }

    if (eligibleSubtotal === 0) return 0;

    if (selectedPromo.type === 'PERCENTAGE') {
      return eligibleSubtotal * (selectedPromo.value / 100);
    } else {
      // For fixed value, we cap the discount at the eligible subtotal
      return Math.min(selectedPromo.value, eligibleSubtotal);
    }
  }, [subtotal, selectedPromo, cart]);

  const serviceCharge = (subtotal - discountAmount) * 0.05; // 5% Service Charge after discount
  const taxBase = (subtotal - discountAmount) + serviceCharge;
  const tax = taxBase * 0.1; // 10% PB1
  const finalTotal = taxBase + tax;

  // Change Calculation
  const change = Math.max(0, cashReceived - finalTotal);

  const handleOpenPayment = (method: 'cash' | 'card' | 'qr') => {
    if (cart.length === 0) {
      onShowToast("Keranjang belanja masih kosong", "error");
      return;
    }
    setPaymentMethod(method);
    setCashReceived(0);
    setShowPaymentModal(true);
  };

  const handleFinalCheckout = () => {
    if (paymentMethod === 'cash' && cashReceived < finalTotal) {
      onShowToast("Uang yang diterima kurang!", "error");
      return;
    }

    setIsProcessing(true);
    // Simulate processing delay
    setTimeout(() => {
      const paymentDetails: any = {};
      if (paymentMethod === 'cash') {
        paymentDetails.cashReceived = cashReceived;
        paymentDetails.change = change;
      } else if (paymentMethod === 'card') {
        paymentDetails.cardType = cardType;
        paymentDetails.bankName = selectedBank;
      }

      onCheckout(paymentMethod, discountAmount, paymentDetails);
      setSelectedPromo(null);
      setIsProcessing(false);
      setShowPaymentModal(false);
    }, 1500);
  };

  const handleSave = () => {
    if (cart.length === 0) {
       onShowToast("Keranjang belanja masih kosong", "error");
       return;
    }
    if (!customerName && !selectedCustomer) {
      onShowToast("Mohon pilih Pelanggan atau Nomor Meja", "error");
      return;
    }
    onSaveOrder();
    setSelectedPromo(null);
  };

  const handleLoadSavedOrder = (order: SavedOrder) => {
    onLoadSavedOrder(order);
    setShowSavedModal(false);
  };

  const applyPromoCode = () => {
    const promo = promotions.find(p => p.code === promoCodeInput.toUpperCase() && p.isActive);
    if (promo) {
      if (subtotal < (promo.minSpend || 0)) {
        onShowToast(`Minimal belanja ${formatRupiah(promo.minSpend || 0)} untuk promo ini`, 'warning');
      } else {
        // Validate if specific product promo is applicable
        if (promo.eligibleProductIds && promo.eligibleProductIds.length > 0) {
             const hasEligibleItem = cart.some(item => promo.eligibleProductIds!.includes(item.id));
             if (!hasEligibleItem) {
                 onShowToast('Promo ini tidak berlaku untuk item di keranjang', 'warning');
                 return;
             }
        }
        setSelectedPromo(promo);
        onShowToast('Promo berhasil dipasang!', 'success');
        setPromoCodeInput('');
      }
    } else {
      onShowToast('Kode promo tidak valid atau kadaluarsa', 'error');
    }
  };

  const handleQuickAddCustomer = () => {
    if (!quickCustName || !quickCustPhone) {
      onShowToast('Nama dan No HP wajib diisi', 'error');
      return;
    }
    onAddQuickCustomer(quickCustName, quickCustPhone);
    setShowQuickAddCustomer(false);
    setQuickCustName('');
    setQuickCustPhone('');
  };

  const getOrderTypeLabel = (type: OrderType) => {
    switch(type) {
      case 'DINE_IN': return 'Makan di Tempat';
      case 'TAKE_AWAY': return 'Bungkus / Take Away';
      case 'ONLINE': return 'Order Online';
    }
  };

  const moneyButtons = [
    { label: 'Uang Pas', value: finalTotal },
    { label: '20.000', value: 20000 },
    { label: '50.000', value: 50000 },
    { label: '100.000', value: 100000 },
  ];

  return (
    <div className="flex h-full bg-gray-50 dark:bg-slate-900 overflow-hidden relative">
      {/* LEFT: Product List */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header / Filter */}
        <div className="bg-white dark:bg-slate-800 px-6 py-4 border-b border-gray-200 dark:border-slate-700 shadow-sm z-10 flex justify-between items-center gap-4">
          <div className="flex-1 flex gap-3 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Cari menu..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white dark:placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="bg-gray-100 dark:bg-slate-700 p-1 rounded-lg flex items-center hidden sm:flex">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                title="Tampilan Grid"
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                title="Tampilan List"
              >
                <List size={18} />
              </button>
            </div>
            
            {/* Separate Save Button in Header */}
            <button 
              onClick={handleSave}
              className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors shadow-sm"
            >
              <Save className="w-5 h-5" />
              <span className="font-bold text-sm hidden lg:inline">Simpan Pending</span>
            </button>

            <button 
              onClick={() => setShowSavedModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors relative whitespace-nowrap"
            >
              <Clock className="w-5 h-5" />
              {savedOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">
                  {savedOrders.length}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Categories */}
        <div className="bg-white dark:bg-slate-800 px-6 pb-4 border-b border-gray-100 dark:border-slate-700 flex gap-2 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory('Semua')}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === 'Semua' ? 'bg-slate-800 text-white shadow-md shadow-slate-200 dark:bg-blue-600 dark:shadow-none' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
          >
            Semua Menu
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-slate-800 text-white shadow-md shadow-slate-200 dark:bg-blue-600 dark:shadow-none' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-slate-900">
          
          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => onAddToCart(product)}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`h-40 w-full overflow-hidden relative ${product.color || 'bg-gray-200 dark:bg-slate-700'}`}>
                    <img 
                        src={product.image} 
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {product.stock <= 5 && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded font-bold uppercase tracking-wider">
                          Sisa {product.stock}
                        </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm line-clamp-2 leading-tight">{product.name}</h3>
                    </div>
                    <p className="font-bold text-blue-600 dark:text-blue-400">{formatRupiah(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="flex flex-col gap-3">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => onAddToCart(product)}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-3 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  {/* Image */}
                  <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${product.color || 'bg-gray-200 dark:bg-slate-700'}`}>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">{product.name}</h3>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 text-[10px] rounded-full uppercase tracking-wide">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs truncate pr-4">{product.description || 'Tidak ada deskripsi'}</p>
                  </div>

                  {/* Stock */}
                  <div className="w-24 text-right hidden sm:block">
                     <div className={`text-xs font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-green-600 dark:text-green-400'}`}>
                       Stok: {product.stock}
                     </div>
                  </div>

                  {/* Price & Action */}
                  <div className="text-right pl-4 border-l border-gray-100 dark:border-slate-700 flex items-center gap-4">
                    <span className="font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{formatRupiah(product.price)}</span>
                    <button className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 opacity-40" />
              </div>
              <p>Menu tidak ditemukan.</p>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT: Cart Sidebar */}
      <div className="w-[420px] bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col h-full shadow-2xl z-20">
        <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex flex-col gap-3 mb-4">
             <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Detail Pesanan</h2>
                {cart.length > 0 && onClearCart && (
                   <button 
                     onClick={onClearCart} 
                     className="text-xs flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded transition-colors"
                     title="Hapus semua pesanan"
                   >
                     <Trash2 size={12} /> Hapus
                   </button>
                )}
                <div className="text-xs font-medium bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded ml-auto">
                   {getOrderTypeLabel(orderType)}
                </div>
             </div>
             
             {/* Order Type Selector */}
             <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                <button 
                  onClick={() => onSetOrderType('DINE_IN')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${orderType === 'DINE_IN' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  <Utensils size={14} /> Dine In
                </button>
                <button 
                  onClick={() => onSetOrderType('TAKE_AWAY')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${orderType === 'TAKE_AWAY' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  <ShoppingBag size={14} /> Take Away
                </button>
                <button 
                  onClick={() => onSetOrderType('ONLINE')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${orderType === 'ONLINE' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  <Globe size={14} /> Online
                </button>
             </div>
          </div>
          
          {/* Customer Selection */}
          <div className="relative">
             <div 
               className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
               onClick={() => setIsCustomerSearchOpen(!isCustomerSearchOpen)}
             >
               <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                 <User className="w-4 h-4 text-gray-400" />
                 <span className={!selectedCustomer && !customerName ? "text-gray-400" : "font-medium"}>
                   {selectedCustomer ? selectedCustomer.name : (customerName || (orderType === 'DINE_IN' ? "Pilih Meja / Pelanggan" : "Pilih Pelanggan"))}
                 </span>
               </div>
               <ChevronRight size={16} className="text-gray-400" />
             </div>

             {/* Customer Dropdown */}
             {isCustomerSearchOpen && (
               <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 shadow-xl rounded-lg z-50 p-2 animate-fade-in">
                 <input 
                   autoFocus
                   type="text" 
                   placeholder="Cari pelanggan..." 
                   className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md text-sm mb-2 focus:ring-1 focus:ring-blue-500 outline-none dark:text-white"
                   value={customerSearchQuery}
                   onChange={e => setCustomerSearchQuery(e.target.value)}
                 />
                 <div className="max-h-40 overflow-y-auto space-y-1">
                   {/* Option to create new or type manual */}
                   <div 
                     className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-600 text-blue-600 dark:text-blue-400 text-sm rounded cursor-pointer flex items-center gap-2 font-medium"
                     onClick={() => setShowQuickAddCustomer(true)}
                   >
                     <UserPlus size={14} /> Tambah Pelanggan Baru
                   </div>
                   <div 
                     className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 text-sm rounded cursor-pointer border-b border-gray-100 dark:border-slate-600"
                     onClick={() => {
                       onSetSelectedCustomer(null);
                       onSetCustomerName(customerSearchQuery); // Allow manual typing
                       setIsCustomerSearchOpen(false);
                     }}
                   >
                     Gunakan nama "{customerSearchQuery || 'Tanpa Nama'}"
                   </div>
                   
                   {/* List Customers */}
                   {filteredCustomers.map(c => (
                     <div 
                       key={c.id}
                       className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-600 rounded cursor-pointer flex justify-between items-center"
                       onClick={() => {
                         onSetSelectedCustomer(c);
                         setIsCustomerSearchOpen(false);
                       }}
                     >
                       <div className="text-sm">
                         <div className="font-medium text-gray-800 dark:text-gray-200">{c.name}</div>
                         <div className="text-xs text-gray-500 dark:text-gray-400">{c.phone}</div>
                       </div>
                       {selectedCustomer?.id === c.id && <Check size={14} className="text-green-500" />}
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 opacity-30" />
              </div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Keranjang Kosong</p>
              <p className="text-sm">Silakan pilih menu di sebelah kiri</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors group">
                <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-200 dark:bg-slate-600" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{item.name}</h4>
                    <span className="font-semibold text-sm dark:text-gray-200">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">@{formatRupiah(item.price)}</div>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-md shadow-sm h-7">
                      <button 
                        onClick={() => item.quantity > 1 ? onUpdateQuantity(item.id, -1) : onRemoveFromCart(item.id)}
                        className="w-7 h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-l-md transition-colors"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <span className="text-xs font-semibold w-4 text-center dark:text-white">{item.quantity}</span>
                      <button 
                         onClick={() => onUpdateQuantity(item.id, 1)}
                         className="w-7 h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-r-md transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo Section */}
        {cart.length > 0 && (
          <div className="px-5 py-2 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
            {selectedPromo ? (
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                   <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
                   <div>
                     <div className="text-xs font-bold text-green-700 dark:text-green-400">{selectedPromo.code} Applied</div>
                     <div className="text-[10px] text-green-600 dark:text-green-500">{selectedPromo.name}</div>
                   </div>
                </div>
                <button onClick={() => setSelectedPromo(null)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input 
                    type="text" 
                    placeholder="Kode Promo" 
                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded-md outline-none focus:border-blue-500 uppercase"
                    value={promoCodeInput}
                    onChange={e => setPromoCodeInput(e.target.value)}
                  />
                </div>
                <button 
                  onClick={applyPromoCode}
                  className="px-3 py-1 bg-gray-800 dark:bg-slate-700 text-white text-xs font-medium rounded-md hover:bg-gray-700"
                >
                  Pakai
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer / Total */}
        <div className="p-6 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-medium">{formatRupiah(subtotal)}</span>
            </div>
            {selectedPromo && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Diskon ({selectedPromo.code})</span>
                <span className="font-medium">-{formatRupiah(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500 dark:text-gray-500 text-xs">
              <span>Service Charge (5%)</span>
              <span>{formatRupiah(serviceCharge)}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-500 text-xs">
              <span>PB1 / Pajak Resto (10%)</span>
              <span>{formatRupiah(tax)}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-white pt-3 border-t border-dashed border-gray-200 dark:border-slate-700 mt-2">
              <span>Total Tagihan</span>
              <span>{formatRupiah(finalTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
             <button 
               disabled={cart.length === 0 || isProcessing}
               onClick={() => handleOpenPayment('cash')}
               className="col-span-1 flex flex-col items-center justify-center py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 transition-all disabled:opacity-50"
             >
               <Banknote className="w-6 h-6 mb-1" />
               <span className="text-[10px] font-bold uppercase">Tunai</span>
             </button>
             <button 
               disabled={cart.length === 0 || isProcessing}
               onClick={() => handleOpenPayment('card')}
               className="col-span-1 flex flex-col items-center justify-center py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 transition-all disabled:opacity-50"
             >
               <CreditCard className="w-6 h-6 mb-1" />
               <span className="text-[10px] font-bold uppercase">Kartu</span>
             </button>
             <button 
               disabled={cart.length === 0 || isProcessing}
               onClick={() => handleOpenPayment('qr')}
               className="col-span-1 flex flex-col items-center justify-center py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 transition-all disabled:opacity-50"
             >
               <QrCode className="w-6 h-6 mb-1" />
               <span className="text-[10px] font-bold uppercase">QRIS</span>
             </button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Quick Add Customer Modal */}
      {showQuickAddCustomer && (
        <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6 animate-fade-in border dark:border-slate-700">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Pelanggan Baru</h3>
              <div className="space-y-3">
                <div>
                   <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Nama Lengkap</label>
                   <input type="text" className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={quickCustName} onChange={e => setQuickCustName(e.target.value)} />
                </div>
                <div>
                   <label className="text-xs font-medium text-gray-500 dark:text-gray-400">No Handphone</label>
                   <input type="text" className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={quickCustPhone} onChange={e => setQuickCustPhone(e.target.value)} />
                </div>
                <div className="flex gap-2 pt-2">
                   <button onClick={() => setShowQuickAddCustomer(false)} className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600">Batal</button>
                   <button onClick={handleQuickAddCustomer} className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Simpan</button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Saved Orders Modal */}
      {showSavedModal && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-[450px] h-full bg-white dark:bg-slate-800 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
               <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pesanan Disimpan</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Daftar meja yang belum bayar</p>
               </div>
               <button onClick={() => setShowSavedModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                 <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-800">
               {savedOrders.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Clock className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">Tidak ada pesanan yang disimpan</p>
                 </div>
               ) : (
                 savedOrders.map(order => {
                    const orderTotal = order.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
                    return (
                      <div key={order.id} className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-3 pb-2 border-b border-gray-100 dark:border-slate-600">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                                {order.customerName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">{order.customerName}</h3>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                  <span className="flex items-center gap-1 bg-gray-100 dark:bg-slate-600 px-1.5 py-0.5 rounded">
                                    <Clock className="w-3 h-3" />
                                    {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                  <span className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
                                    {getOrderTypeLabel(order.orderType)}
                                  </span>
                                </div>
                              </div>
                           </div>
                           <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatRupiah(orderTotal)}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                           {order.items.map(item => (
                             <div key={item.id} className="flex justify-between items-center text-xs">
                               <span className="truncate max-w-[200px]">{item.quantity}x {item.name}</span>
                               <span className="text-gray-500 dark:text-gray-400">{formatRupiah(item.price * item.quantity)}</span>
                             </div>
                           ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                // Simple remove logic for saved order if needed, but primarily used for load
                                // Here we just load
                                handleLoadSavedOrder(order);
                              }}
                              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                            >
                              <span>Lanjutkan / Bayar</span>
                              <ChevronRight size={16} />
                            </button>
                        </div>
                      </div>
                    );
                 })
               )}
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in border dark:border-slate-700 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pembayaran</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Tagihan: <span className="text-blue-600 dark:text-blue-400 font-bold">{formatRupiah(finalTotal)}</span></p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
              
              {/* Method Tabs */}
              <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl mb-6">
                <button 
                  onClick={() => setPaymentMethod('cash')} 
                  className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${paymentMethod === 'cash' ? 'bg-white dark:bg-slate-600 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  <Banknote size={16} /> Tunai
                </button>
                <button 
                  onClick={() => setPaymentMethod('card')} 
                  className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  <CreditCard size={16} /> Kartu
                </button>
                <button 
                  onClick={() => setPaymentMethod('qr')} 
                  className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${paymentMethod === 'qr' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  <QrCode size={16} /> QRIS
                </button>
              </div>

              {/* CASH View */}
              {paymentMethod === 'cash' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Uang Diterima</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                      <input 
                        type="number" 
                        autoFocus
                        className="w-full pl-12 pr-4 py-4 text-2xl font-bold border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        value={cashReceived || ''}
                        onChange={e => setCashReceived(Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Quick Money Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {moneyButtons.map((btn, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCashReceived(btn.value)}
                        className="py-2 px-1 border border-gray-200 dark:border-slate-600 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 transition-colors"
                      >
                        {btn.label === 'Uang Pas' ? 'Uang Pas' : formatRupiah(btn.value)}
                      </button>
                    ))}
                  </div>

                  {/* Change Display */}
                  <div className={`p-4 rounded-xl border ${change >= 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Kembalian</span>
                      <span className={`text-xl font-bold ${change >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatRupiah(change)}
                      </span>
                    </div>
                    {change < 0 && (
                      <p className="text-xs text-red-500 mt-1 text-right">Kurang {formatRupiah(Math.abs(change))}</p>
                    )}
                  </div>
                </div>
              )}

              {/* CARD View */}
              {paymentMethod === 'card' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Jenis Kartu</label>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setCardType('DEBIT')}
                        className={`flex-1 py-3 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${cardType === 'DEBIT' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400'}`}
                      >
                        <Wallet size={20} />
                        <span className="font-bold text-sm">Debit</span>
                      </button>
                      <button 
                        onClick={() => setCardType('CREDIT')}
                        className={`flex-1 py-3 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${cardType === 'CREDIT' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400'}`}
                      >
                        <CreditCard size={20} />
                        <span className="font-bold text-sm">Kredit</span>
                      </button>
                    </div>
                  </div>

                  {cardType === 'DEBIT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pilih Bank</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['BCA', 'BNI', 'MANDIRI', 'BRI', 'LAINNYA'].map(bank => (
                          <button 
                            key={bank}
                            onClick={() => setSelectedBank(bank)}
                            className={`py-2 px-3 border rounded-lg text-sm font-semibold transition-all ${selectedBank === bank ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-blue-400'}`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg flex items-start gap-3">
                    <Info size={20} className="text-blue-500 mt-0.5" />
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Silakan gesek kartu pada mesin EDC dan pastikan transaksi berhasil sebelum menekan tombol Selesai.
                    </p>
                  </div>
                </div>
              )}

              {/* QR View */}
              {paymentMethod === 'qr' && (
                <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in py-4">
                  <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                    {/* Dummy QR Code */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MokaLitePayment-${finalTotal}`} 
                      alt="QRIS Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Scan QRIS</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Pembayaran: {formatRupiah(finalTotal)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Menunggu pembayaran...
                  </div>
                </div>
              )}

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex gap-3">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleFinalCheckout}
                disabled={isProcessing || (paymentMethod === 'cash' && change < 0)}
                className={`flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all ${isProcessing ? 'opacity-70 cursor-wait' : ''} ${(paymentMethod === 'cash' && change < 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? 'Memproses...' : (
                  <>
                    <span>Bayar Sekarang</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
