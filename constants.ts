
import { Product, Transaction, User, Customer, Promotion, Vendor } from './types';

// Utility for formatting Rupiah
export const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Kopi Senja Utama',
    address: 'Jl. Sudirman No. 10, Jakarta',
    phone: '08123456789',
    ownerName: 'Bapak Budi',
    status: 'active',
    joinedDate: new Date('2023-01-01').toISOString(),
    subscriptionStart: new Date('2023-01-01').toISOString(),
    subscriptionEnd: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(), // 1 Year from now
    commissionRate: 5,
    logo: 'https://cdn-icons-png.flaticon.com/512/2935/2935413.png'
  },
  {
    id: 'v2',
    name: 'Burger Blenger Cabang 2',
    address: 'Jl. Kemang Raya No. 55, Jakarta',
    phone: '08198765432',
    ownerName: 'Ibu Susi',
    status: 'active',
    joinedDate: new Date('2023-06-15').toISOString(),
    subscriptionStart: new Date('2023-06-15').toISOString(),
    subscriptionEnd: new Date(new Date().getTime() + (5 * 24 * 60 * 60 * 1000)).toISOString(), // Expires in 5 days (Warning test)
    commissionRate: 8,
    logo: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png'
  }
];

// Vendor 1 Products (Coffee Shop)
const V1_PRODUCTS: Product[] = [
  {
    id: '1',
    vendorId: 'v1',
    name: 'Kopi Susu Gula Aren',
    category: 'Kopi',
    price: 28000,
    stock: 50,
    image: 'https://picsum.photos/200/200?random=1',
    description: 'Espresso house blend dipadukan dengan susu segar dan gula aren asli yang legit.',
    color: 'bg-amber-100'
  },
  {
    id: '2',
    vendorId: 'v1',
    name: 'Americano Dingin',
    category: 'Kopi',
    price: 22000,
    stock: 80,
    image: 'https://picsum.photos/200/200?random=2',
    description: 'Espresso double shot dengan air mineral dingin dan es batu kristal.',
    color: 'bg-stone-200'
  },
  {
    id: '3',
    vendorId: 'v1',
    name: 'Matcha Latte Premium',
    category: 'Non-Kopi',
    price: 32000,
    stock: 30,
    image: 'https://picsum.photos/200/200?random=3',
    description: 'Bubuk matcha premium Jepang diaduk sempurna dengan susu steam yang creamy.',
    color: 'bg-green-100'
  },
];

// Vendor 2 Products (Burger Shop)
const V2_PRODUCTS: Product[] = [
  {
    id: '101',
    vendorId: 'v2',
    name: 'Cheeseburger Deluxe',
    category: 'Makanan Berat',
    price: 45000,
    stock: 20,
    image: 'https://picsum.photos/200/200?random=4',
    description: 'Daging sapi australia dengan keju cheddar leleh.',
    color: 'bg-yellow-100'
  },
  {
    id: '102',
    vendorId: 'v2',
    name: 'Kentang Goreng BBQ',
    category: 'Cemilan',
    price: 25000,
    stock: 50,
    image: 'https://picsum.photos/200/200?random=5',
    description: 'Kentang goreng renyah dengan bumbu BBQ spesial.',
    color: 'bg-orange-50'
  },
  {
    id: '103',
    vendorId: 'v2',
    name: 'Lemon Tea Jumbo',
    category: 'Minuman',
    price: 15000,
    stock: 100,
    image: 'https://picsum.photos/200/200?random=6',
    description: 'Teh lemon segar ukuran jumbo.',
    color: 'bg-blue-100'
  }
];

export const INITIAL_PRODUCTS: Product[] = [...V1_PRODUCTS, ...V2_PRODUCTS];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    vendorId: 'v1',
    name: 'Budi Santoso',
    phone: '081234567890',
    email: 'budi@example.com',
    notes: 'Suka kopi tidak terlalu manis',
    totalVisits: 12,
    lastVisit: Date.now() - 86400000
  },
  {
    id: 'CUST-002',
    vendorId: 'v2',
    name: 'Siti Aminah',
    phone: '089876543210',
    email: 'siti@example.com',
    notes: 'Member VIP Burger',
    totalVisits: 5,
    lastVisit: Date.now() - 172800000
  }
];

export const INITIAL_PROMOS: Promotion[] = [
  {
    id: 'PROMO-001',
    vendorId: 'v1',
    code: 'HEMAT10',
    name: 'Diskon 10%',
    type: 'PERCENTAGE',
    value: 10,
    minSpend: 50000,
    isActive: true
  },
  {
    id: 'PROMO-002',
    vendorId: 'v2',
    code: 'BURGER5RB',
    name: 'Potongan 5 Ribu',
    type: 'FIXED',
    value: 5000,
    minSpend: 30000,
    isActive: true
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-1001',
    vendorId: 'v1',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    timestamp: Date.now() - 86400000,
    items: [
      { ...V1_PRODUCTS[0], quantity: 2 },
      { ...V1_PRODUCTS[2], quantity: 1 }
    ],
    subtotal: 88000,
    discount: 0,
    serviceCharge: 4400,
    tax: 9240,
    total: 101640,
    paymentMethod: 'card',
    orderType: 'DINE_IN',
    cashReceived: 101640,
    change: 0
  },
  {
    id: 'TXN-1002',
    vendorId: 'v2',
    date: new Date(Date.now() - 172800000).toISOString(), // 2 Days ago
    timestamp: Date.now() - 172800000,
    items: [
      { ...V2_PRODUCTS[0], quantity: 5 }
    ],
    subtotal: 225000,
    discount: 0,
    serviceCharge: 11250,
    tax: 23625,
    total: 259875,
    paymentMethod: 'qr',
    orderType: 'TAKE_AWAY'
  }
];

export const INITIAL_USERS: User[] = [
  { username: 'superadmin', role: 'super_admin', name: 'System Owner', password: 'admin' },
  { username: 'owner1', vendorId: 'v1', role: 'vendor_admin', name: 'Owner Kopi', password: '123' },
  { username: 'kasir1', vendorId: 'v1', role: 'cashier', name: 'Kasir Kopi', password: '123' },
  { username: 'owner2', vendorId: 'v2', role: 'vendor_admin', name: 'Owner Burger', password: '123' },
];

export const INITIAL_CATEGORIES = {
  'v1': ['Kopi', 'Non-Kopi', 'Cemilan'],
  'v2': ['Makanan Berat', 'Cemilan', 'Minuman']
};
