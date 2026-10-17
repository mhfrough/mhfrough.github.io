// Sample data for the call center demos. Everything here is invented: restaurants, menus, prices, callers and
// orders. The shapes follow the real portal (products with a price per size, orders with customer, address, item
// lines, delivery charge, tax and total, five statuses), never its data. Prices in euros, as the portal used.

export interface Restaurant {
  id: number;
  name: string;
  city: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  /** Price per size, in euros. */
  sizes: { size: string; price: number }[];
}

export interface Caller {
  phone: string;
  name: string;
  address: string;
  restaurant: number;
}

export type Status = 'Pending' | 'Processing' | 'Delivered' | 'Completed' | 'Cancelled';

export const STATUSES: readonly Status[] = ['Pending', 'Processing', 'Delivered', 'Completed', 'Cancelled'];

export interface Line {
  product: string;
  size: string;
  qty: number;
  price: number;
}

export interface Order {
  no: number;
  restaurant: number;
  customer: string;
  phone: string;
  address: string;
  date: string;
  status: Status;
  lines: Line[];
}

export const RESTAURANTS: readonly Restaurant[] = [
  { id: 1, name: 'Pizzeria Sole', city: 'Northtown' },
  { id: 2, name: 'Burger Lane', city: 'Northtown' },
  { id: 3, name: 'Pasta Bar 9', city: 'Riverside' },
];

export const MENUS: Record<number, readonly Product[]> = {
  1: [
    { id: 'p1', name: 'Margherita', category: 'Pizza', sizes: [{ size: '26 cm', price: 7.5 }, { size: '32 cm', price: 9.9 }] },
    { id: 'p2', name: 'Salami', category: 'Pizza', sizes: [{ size: '26 cm', price: 8.5 }, { size: '32 cm', price: 10.9 }] },
    { id: 'p3', name: 'Garlic bread', category: 'Sides', sizes: [{ size: 'Regular', price: 3.9 }] },
    { id: 'p4', name: 'Lemonade', category: 'Drinks', sizes: [{ size: '0.33 l', price: 2.5 }, { size: '0.5 l', price: 3.2 }] },
  ],
  2: [
    { id: 'b1', name: 'Classic burger', category: 'Burgers', sizes: [{ size: 'Single', price: 8.9 }, { size: 'Double', price: 11.9 }] },
    { id: 'b2', name: 'Chicken burger', category: 'Burgers', sizes: [{ size: 'Single', price: 8.5 }, { size: 'Double', price: 11.5 }] },
    { id: 'b3', name: 'Fries', category: 'Sides', sizes: [{ size: 'Small', price: 2.9 }, { size: 'Large', price: 3.9 }] },
  ],
  3: [
    { id: 'n1', name: 'Penne arrabbiata', category: 'Pasta', sizes: [{ size: 'Regular', price: 9.5 }, { size: 'Large', price: 11.5 }] },
    { id: 'n2', name: 'Lasagne', category: 'Pasta', sizes: [{ size: 'Regular', price: 10.9 }] },
    { id: 'n3', name: 'Tiramisu', category: 'Desserts', sizes: [{ size: 'Regular', price: 4.5 }] },
  ],
};

/** Returning callers, found by phone number. */
export const CALLERS: readonly Caller[] = [
  { phone: '0700 555 0142', name: 'Sample caller A', address: '12 Mill Road, Northtown', restaurant: 1 },
  { phone: '0700 555 0178', name: 'Sample caller B', address: '4 Station Square, Riverside', restaurant: 3 },
];

export const DELIVERY = 2.5;
/** Sample tax rate, applied to the subtotal. */
export const TAX_RATE = 0.07;

export const ORDERS: readonly Order[] = [
  {
    no: 1046,
    restaurant: 1,
    customer: 'Sample caller A',
    phone: '0700 555 0142',
    address: '12 Mill Road, Northtown',
    date: '14 Mar 2023, 19:12',
    status: 'Processing',
    lines: [
      { product: 'Salami', size: '32 cm', qty: 2, price: 10.9 },
      { product: 'Garlic bread', size: 'Regular', qty: 1, price: 3.9 },
      { product: 'Lemonade', size: '0.5 l', qty: 2, price: 3.2 },
    ],
  },
  {
    no: 1045,
    restaurant: 2,
    customer: 'Sample caller C',
    phone: '0700 555 0110',
    address: '88 Hill Street, Northtown',
    date: '14 Mar 2023, 18:57',
    status: 'Pending',
    lines: [
      { product: 'Classic burger', size: 'Double', qty: 1, price: 11.9 },
      { product: 'Fries', size: 'Large', qty: 1, price: 3.9 },
    ],
  },
  {
    no: 1044,
    restaurant: 3,
    customer: 'Sample caller B',
    phone: '0700 555 0178',
    address: '4 Station Square, Riverside',
    date: '14 Mar 2023, 18:31',
    status: 'Delivered',
    lines: [
      { product: 'Lasagne', size: 'Regular', qty: 2, price: 10.9 },
      { product: 'Tiramisu', size: 'Regular', qty: 2, price: 4.5 },
    ],
  },
  {
    no: 1043,
    restaurant: 1,
    customer: 'Sample caller D',
    phone: '0700 555 0133',
    address: '3 Park Lane, Northtown',
    date: '14 Mar 2023, 18:05',
    status: 'Completed',
    lines: [{ product: 'Margherita', size: '26 cm', qty: 1, price: 7.5 }],
  },
];

export const restaurantName = (id: number): string => RESTAURANTS.find((r) => r.id === id)?.name ?? '';

export interface Totals {
  sub: number;
  delivery: number;
  tax: number;
  total: number;
}

export function totals(lines: readonly Line[]): Totals {
  const sub = round(lines.reduce((s, l) => s + l.price * l.qty, 0));
  const delivery = lines.length ? DELIVERY : 0;
  const tax = round(sub * TAX_RATE);
  return { sub, delivery, tax, total: round(sub + delivery + tax) };
}

const round = (n: number): number => Math.round(n * 100) / 100;

/** 12.5 -> "12.50". The euro sign is added in the templates. */
export const money = (n: number): string => n.toFixed(2);

/** Digits only, for phone lookups: "0170 555 0142" -> "01705550142". */
export const digits = (s: string): string => s.replace(/\D/g, '');
