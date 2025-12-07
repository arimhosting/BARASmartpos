
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, Product, Transaction, CartItem, SavedOrder, UserRole, User, OrderType, ToastMessage, ToastType, Customer, Promotion, Vendor } from './types';
import { INITIAL_PRODUCTS, MOCK_TRANSACTIONS, INITIAL_CUSTOMERS, INITIAL_PROMOS, INITIAL_USERS, INITIAL_CATEGORIES, INITIAL_VENDORS } from './constants';
import { POSView } from './components/POSView';
import { InventoryView } from './components/InventoryView';
import { DashboardView } from './components/DashboardView';
import { LoginView } from './components/LoginView';
import { UserManagementView } from './components/UserManagementView';
import { CustomerView } from './components/CustomerView';
import { PromoView } from './components/PromoView';
import { VendorManagementView } from './components/VendorManagementView';
import { LayoutGrid, ShoppingCart, Package, LogOut, Users, Settings, Tag, Moon, Sun, Store, ChevronLeft } from 'lucide-react';
import { ToastContainer } from './components/UIComponents';

const App: React.FC = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // Vendor State (Multi-Tenancy)
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [activeVendor, setActiveVendor] = useState<Vendor | null>(null);

  // App Global Data State
  // Note: All these arrays contain data for ALL vendors. We filter them in render.
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.POS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categoryMap, setCategoryMap] = useState<Record<string, string[]>>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOS);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Lifted Cart State (Persistent per session)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Filtered Data Helpers ---
  // If Super Admin is logged in and managing a specific vendor, use that vendor ID.
  // If Vendor Admin/Cashier is logged in, use their assigned vendor ID.
  const targetVendorId = activeVendor?.id || user?.vendorId;

  const vendorProducts = useMemo(() => products.filter(p => p.vendorId === targetVendorId), [products, targetVendorId]);
  const vendorTransactions = useMemo(() => transactions.filter(t => t.vendorId === targetVendorId), [transactions, targetVendorId]);
  const vendorCustomers = useMemo(() => customers.filter(c => c.vendorId === targetVendorId), [customers, targetVendorId]);
  const vendorPromos = useMemo(() => promotions.filter(p => p.vendorId === targetVendorId), [promotions, targetVendorId]);
  const vendorSavedOrders = useMemo(() => savedOrders.filter(o => o.vendorId === targetVendorId), [savedOrders, targetVendorId]);
  
  // Get Categories for the current vendor, or default list
  const vendorCategories = useMemo(() => {
     if (targetVendorId && categoryMap[targetVendorId]) {
         return categoryMap[targetVendorId];
     }
     return ['Umum'];
  }, [categoryMap, targetVendorId]);
  
  // Filter users based on vendor (Super Admin sees all or vendor specific?)
  // For User Management View: If Super Admin, sees all. If Vendor Admin, sees only their staff.
  const visibleUsers = useMemo(() => {
    if (user?.role === 'super_admin') {
        // Super admin sees everyone, or maybe filter by activeVendor if viewing a specific shop? 
        // Let's say Super Admin manages all users globally for simplicity in this view.
        return users; 
    }
    return users.filter(u => u.vendorId === targetVendorId);
  }, [users, user, targetVendorId]);


  // --- Toast Handlers ---
  const handleShowToast = (message: string, type: ToastType) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const handleRemoveToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Auth Handlers ---
  const handleLogin = (role: UserRole, username: string) => {
    const foundUser = users.find(u => u.username === username);
    if (foundUser) {
      setUser(foundUser);
      
      if (foundUser.role === 'super_admin') {
        setCurrentView(ViewState.VENDORS);
        setActiveVendor(null); // Super admin starts at global view
        handleShowToast(`Welcome Super Admin!`, 'success');
      } else {
        // Identify the vendor this user belongs to
        const userVendor = vendors.find(v => v.id === foundUser.vendorId);
        if (userVendor) {
            setActiveVendor(userVendor);
            setCurrentView(ViewState.POS);
            handleShowToast(`Selamat datang di ${userVendor.name}, ${foundUser.name}!`, 'success');
        } else {
            handleShowToast('Error: User tidak terhubung ke toko aktif.', 'error');
            setUser(null);
        }
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveVendor(null);
    setCart([]);
    setCustomerName('');
    setSelectedCustomer(null);
    handleShowToast('Anda telah keluar.', 'info');
  };

  const handleSuperAdminExitVendor = () => {
    setActiveVendor(null);
    setCurrentView(ViewState.VENDORS);
    setCart([]); // Clear cart when switching context
  }

  // --- Vendor Management ---
  const handleAddVendor = (v: Vendor) => {
    setVendors([...vendors, v]);
    // Initialize default categories for new vendor
    setCategoryMap(prev => ({ ...prev, [v.id]: ['Umum', 'Makanan', 'Minuman'] }));
    handleShowToast('Mitra baru ditambahkan', 'success');
  }
  const handleUpdateVendor = (v: Vendor) => {
    setVendors(vendors.map(x => x.id === v.id ? v : x));
    handleShowToast('Data mitra diperbarui', 'success');
  }
  const handleDeleteVendor = (id: string) => {
    if (window.confirm("Yakin hapus mitra ini? Semua data terkait akan hilang (Simulasi).")) {
        setVendors(vendors.filter(v => v.id !== id));
        handleShowToast('Mitra dihapus', 'success');
    }
  }
  const handleAccessVendor = (v: Vendor) => {
    setActiveVendor(v);
    setCurrentView(ViewState.DASHBOARD);
    handleShowToast(`Mengakses toko: ${v.name}`, 'info');
  }

  // --- User Management ---
  const handleAddUser = (u: User) => {
    // If adding user as super admin, we need to know which vendor? 
    // For simplicity, if we are inside a vendor context (ActiveVendor), create user for that vendor.
    const newUser = { ...u, vendorId: u.vendorId || activeVendor?.id };
    setUsers([...users, newUser]);
    handleShowToast(`User ${u.username} dibuat.`, 'success');
  }
  const handleUpdateUser = (u: User) => {
    setUsers(users.map(existing => existing.username === u.username ? u : existing));
    handleShowToast(`User ${u.username} diupdate.`, 'success');
  }
  const handleDeleteUser = (username: string) => {
    setUsers(users.filter(u => u.username !== username));
    handleShowToast('User dihapus.', 'success');
  }

  // --- Category Management ---
  const handleAddCategory = (cat: string) => {
    if (!activeVendor) return;
    const currentCats = categoryMap[activeVendor.id] || [];
    if (currentCats.includes(cat)) return;
    
    setCategoryMap(prev => ({
        ...prev,
        [activeVendor.id]: [...currentCats, cat]
    }));
    handleShowToast('Kategori berhasil ditambahkan', 'success');
  }

  const handleDeleteCategory = (cat: string) => {
    if (!activeVendor) return;
    const currentCats = categoryMap[activeVendor.id] || [];
    
    // Check usage
    const inUse = vendorProducts.some(p => p.category === cat);
    if (inUse) {
      handleShowToast('Kategori sedang digunakan oleh produk', 'error');
      return;
    }
    
    setCategoryMap(prev => ({
        ...prev,
        [activeVendor.id]: currentCats.filter(c => c !== cat)
    }));
    handleShowToast('Kategori dihapus', 'success');
  }

  // --- Cart Handlers ---
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      handleShowToast(`Stok ${product.name} habis!`, 'error');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
            handleShowToast(`Stok tidak mencukupi`, 'warning');
            return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    handleShowToast('Keranjang dikosongkan', 'info');
  }

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const product = products.find(p => p.id === productId);
        const newQty = item.quantity + delta;
        if (product && newQty > product.stock) {
            handleShowToast(`Maksimal stok tersedia: ${product.stock}`, 'warning');
            return item;
        }
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const handleCheckout = (paymentMethod: 'cash' | 'card' | 'qr', discount: number = 0, paymentDetails?: any) => {
    if (!activeVendor) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const serviceCharge = (subtotal - discount) * 0.05;
    const taxBase = (subtotal - discount) + serviceCharge;
    const tax = taxBase * 0.1;
    const total = taxBase + tax;
    
    const newTransaction: Transaction = {
      id: `TXN-${Date.now()}`,
      vendorId: activeVendor.id, // Assign to current vendor
      date: new Date().toISOString(),
      timestamp: Date.now(),
      items: cart,
      subtotal,
      discount,
      serviceCharge,
      tax,
      total,
      paymentMethod,
      customerName: selectedCustomer ? selectedCustomer.name : (customerName || 'Pelanggan Umum'),
      customerId: selectedCustomer?.id,
      orderType,
      ...paymentDetails
    };

    setTransactions(prev => [newTransaction, ...prev]);

    // Update Stock Global State
    setProducts(prev => prev.map(p => {
      // Only update if product belongs to this vendor and is in cart
      if (p.vendorId === activeVendor.id) {
          const cartItem = cart.find(i => i.id === p.id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
      }
      return p;
    }));

    // Update Customer Stats
    if (selectedCustomer) {
      setCustomers(prev => prev.map(c => 
        c.id === selectedCustomer.id 
          ? { ...c, totalVisits: c.totalVisits + 1, lastVisit: Date.now() } 
          : c
      ));
    }

    setCart([]);
    setCustomerName('');
    setSelectedCustomer(null);
    setOrderType('DINE_IN');
    handleShowToast('Pembayaran berhasil! Transaksi tersimpan.', 'success');
  };

  const handleSaveOrder = () => {
    if (!activeVendor) return;
    const newSavedOrder: SavedOrder = {
      id: `ORD-${Date.now()}`,
      vendorId: activeVendor.id,
      customerName: selectedCustomer ? selectedCustomer.name : (customerName || `Meja ${vendorSavedOrders.length + 1}`),
      items: [...cart],
      timestamp: Date.now(),
      orderType
    };
    setSavedOrders(prev => [...prev, newSavedOrder]);
    
    setCart([]);
    setCustomerName('');
    setSelectedCustomer(null);
    setOrderType('DINE_IN');
    handleShowToast('Pesanan berhasil disimpan.', 'success');
  };

  const handleLoadSavedOrder = (order: SavedOrder) => {
    setCart(order.items);
    setCustomerName(order.customerName);
    const found = customers.find(c => c.name === order.customerName && c.vendorId === activeVendor?.id);
    setSelectedCustomer(found || null);
    setOrderType(order.orderType);
    setSavedOrders(prev => prev.filter(o => o.id !== order.id));
    handleShowToast('Pesanan dimuat kembali.', 'info');
  };

  const handleResetTransactions = () => {
    if (window.confirm("Hapus semua laporan toko ini?")) {
      // Only delete transactions for this vendor
      setTransactions(prev => prev.filter(t => t.vendorId !== activeVendor?.id));
      handleShowToast('Laporan toko ini direset.', 'success');
    }
  };

  // --- CRM & Promo Handlers (Scoped to Vendor) ---
  const handleAddQuickCustomer = (name: string, phone: string) => {
    if (!activeVendor) return;
    const newCust: Customer = {
      id: `CUST-${Date.now()}`,
      vendorId: activeVendor.id,
      name,
      phone,
      totalVisits: 0
    };
    setCustomers(prev => [...prev, newCust]);
    setSelectedCustomer(newCust);
    handleShowToast('Pelanggan berhasil ditambahkan!', 'success');
  };

  const handleAddCustomer = (c: Customer) => {
    if (!activeVendor) return;
    setCustomers([...customers, { ...c, vendorId: activeVendor.id }]);
    handleShowToast('Data pelanggan disimpan', 'success');
  };
  const handleUpdateCustomer = (c: Customer) => {
    setCustomers(customers.map(x => x.id === c.id ? c : x));
    handleShowToast('Data pelanggan diperbarui', 'success');
  };
  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(x => x.id !== id));
    handleShowToast('Pelanggan dihapus', 'success');
  };

  const handleAddPromo = (p: Promotion) => {
    if (!activeVendor) return;
    setPromotions([...promotions, { ...p, vendorId: activeVendor.id }]);
    handleShowToast('Promo dibuat', 'success');
  };
  const handleDeletePromo = (id: string) => {
    setPromotions(promotions.filter(p => p.id !== id));
    handleShowToast('Promo dihapus', 'success');
  };
  const handleTogglePromo = (id: string) => {
    setPromotions(promotions.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  // --- Inventory Handlers (Scoped to Vendor) ---
  const handleAddProduct = (newProduct: Product) => {
    if (!activeVendor) return;
    setProducts(prev => [...prev, { ...newProduct, vendorId: activeVendor.id }]);
    handleShowToast(`Produk "${newProduct.name}" berhasil ditambahkan.`, 'success');
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    handleShowToast(`Produk "${updatedProduct.name}" berhasil diperbarui.`, 'success');
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    handleShowToast('Produk berhasil dihapus.', 'success');
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'dark' : ''}`}>
      <ToastContainer toasts={toasts} removeToast={handleRemoveToast} />
      
      {!user ? (
        <LoginView onLogin={handleLogin} onShowToast={handleShowToast} users={users} />
      ) : (
        <div className="flex h-screen w-full bg-gray-100 dark:bg-slate-900 font-sans transition-colors duration-200">
          
          {/* Sidebar */}
          <div className="w-20 bg-slate-900 dark:bg-slate-950 flex flex-col items-center py-6 gap-6 z-30 shadow-xl overflow-y-auto scrollbar-hide">
            
            {/* Logo Area */}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/50 shrink-0 overflow-hidden bg-blue-600">
               {activeVendor && activeVendor.logo ? (
                 <img src={activeVendor.logo} alt={activeVendor.name} className="w-full h-full object-cover" />
               ) : (
                 "B"
               )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-3 w-full px-2">
              
              {/* Super Admin specific nav */}
              {user.role === 'super_admin' && !activeVendor && (
                 <SidebarItem 
                   active={currentView === ViewState.VENDORS} 
                   onClick={() => setCurrentView(ViewState.VENDORS)} 
                   icon={<Store size={22} />} 
                   label="Mitra"
                 />
              )}

              {/* Vendor Views (Visible if a vendor is active) */}
              {activeVendor && (
                <>
                  <SidebarItem 
                    active={currentView === ViewState.POS} 
                    onClick={() => setCurrentView(ViewState.POS)} 
                    icon={<ShoppingCart size={22} />} 
                    label="Kasir"
                  />
                  <SidebarItem 
                    active={currentView === ViewState.CUSTOMERS} 
                    onClick={() => setCurrentView(ViewState.CUSTOMERS)} 
                    icon={<Users size={22} />} 
                    label="Klien"
                  />
                  
                  {/* Admin Roles within Vendor */}
                  {(user.role === 'vendor_admin' || user.role === 'super_admin') && (
                    <>
                      <div className="w-full h-px bg-slate-700 my-1"></div>
                      <SidebarItem 
                        active={currentView === ViewState.INVENTORY} 
                        onClick={() => setCurrentView(ViewState.INVENTORY)} 
                        icon={<Package size={22} />} 
                        label="Stok"
                      />
                      <SidebarItem 
                        active={currentView === ViewState.PROMOS} 
                        onClick={() => setCurrentView(ViewState.PROMOS)} 
                        icon={<Tag size={22} />} 
                        label="Promo"
                      />
                      <SidebarItem 
                        active={currentView === ViewState.DASHBOARD} 
                        onClick={() => setCurrentView(ViewState.DASHBOARD)} 
                        icon={<LayoutGrid size={22} />} 
                        label="Laporan"
                      />
                      <SidebarItem 
                        active={currentView === ViewState.USERS} 
                        onClick={() => setCurrentView(ViewState.USERS)} 
                        icon={<Settings size={22} />} 
                        label="Staff"
                      />
                    </>
                  )}
                </>
              )}
            </nav>

            <div className="mt-auto flex flex-col items-center gap-4 pb-2">
              {/* Back to Vendor List (Super Admin only) */}
              {user.role === 'super_admin' && activeVendor && (
                <button
                  onClick={handleSuperAdminExitVendor}
                  className="p-2 text-yellow-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  title="Kembali ke Daftar Mitra"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-slate-400 hover:text-yellow-400 transition-colors rounded-full hover:bg-white/10"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold border border-slate-600" title={user.username}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-3 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/10"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 h-full overflow-hidden relative text-gray-900 dark:text-gray-100 flex flex-col">
            
            {/* Header for Active Vendor Context */}
            {activeVendor && (
                <div className="h-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center px-4 justify-between shrink-0">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Store size={14} />
                        <span className="font-bold">{activeVendor.name}</span>
                        {user.role === 'super_admin' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">Super Admin Access</span>}
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-hidden relative">
              {/* VENDOR MANAGEMENT (Super Admin Only) */}
              {currentView === ViewState.VENDORS && user.role === 'super_admin' && (
                <VendorManagementView
                  vendors={vendors}
                  onAddVendor={handleAddVendor}
                  onUpdateVendor={handleUpdateVendor}
                  onDeleteVendor={handleDeleteVendor}
                  onAccessVendor={handleAccessVendor}
                  onShowToast={handleShowToast}
                  categories={[]} // Not used here
                  // @ts-ignore: Passing transactions for stats
                  allTransactions={transactions}
                />
              )}

              {/* VENDOR SPECIFIC VIEWS */}
              {activeVendor && (
                <>
                  {currentView === ViewState.POS && (
                    <POSView 
                      products={vendorProducts} 
                      cart={cart}
                      customers={vendorCustomers}
                      promotions={vendorPromos}
                      customerName={customerName}
                      selectedCustomer={selectedCustomer}
                      orderType={orderType}
                      onAddToCart={handleAddToCart}
                      onRemoveFromCart={handleRemoveFromCart}
                      onUpdateQuantity={handleUpdateQuantity}
                      onSetCustomerName={setCustomerName}
                      onSetSelectedCustomer={setSelectedCustomer}
                      onSetOrderType={setOrderType}
                      onCheckout={handleCheckout} 
                      savedOrders={vendorSavedOrders}
                      onSaveOrder={handleSaveOrder}
                      onLoadSavedOrder={handleLoadSavedOrder}
                      onAddQuickCustomer={handleAddQuickCustomer}
                      onShowToast={handleShowToast}
                      categories={vendorCategories}
                      onClearCart={handleClearCart}
                    />
                  )}
                  {currentView === ViewState.INVENTORY && (
                    <InventoryView 
                      products={vendorProducts} 
                      onAddProduct={handleAddProduct} 
                      onUpdateProduct={handleUpdateProduct} 
                      onDeleteProduct={handleDeleteProduct}
                      onShowToast={handleShowToast}
                      categories={vendorCategories}
                      onAddCategory={handleAddCategory}
                      onDeleteCategory={handleDeleteCategory}
                    />
                  )}
                  {currentView === ViewState.DASHBOARD && (
                    <DashboardView 
                      transactions={vendorTransactions} 
                      onShowToast={handleShowToast}
                      categories={vendorCategories}
                      onResetTransactions={handleResetTransactions}
                    />
                  )}
                  {currentView === ViewState.USERS && (
                    <UserManagementView
                      users={visibleUsers}
                      onAddUser={handleAddUser}
                      onUpdateUser={handleUpdateUser}
                      onDeleteUser={handleDeleteUser}
                      onShowToast={handleShowToast}
                      categories={vendorCategories}
                    />
                  )}
                  {currentView === ViewState.CUSTOMERS && (
                    <CustomerView
                      customers={vendorCustomers}
                      onAddCustomer={handleAddCustomer}
                      onUpdateCustomer={handleUpdateCustomer}
                      onDeleteCustomer={handleDeleteCustomer}
                      onShowToast={handleShowToast}
                      categories={vendorCategories}
                    />
                  )}
                  {currentView === ViewState.PROMOS && (
                    <PromoView
                      products={vendorProducts}
                      promotions={vendorPromos}
                      onAddPromo={handleAddPromo}
                      onDeletePromo={handleDeletePromo}
                      onToggleActive={handleTogglePromo}
                      onShowToast={handleShowToast}
                      categories={vendorCategories}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-center p-2.5 rounded-xl w-full transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
    >
      <div className={`${active ? 'scale-100' : 'group-hover:scale-110'} transition-transform duration-300`}>
        {icon}
      </div>
      <span className="text-[10px] mt-1 font-medium tracking-wide">{label}</span>
    </button>
  );
};

export default App;
