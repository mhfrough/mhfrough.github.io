// Sample data shared by the DMAX mockups. Every table name, row count, rate and account here is invented: DMAX is an
// internal banking tool and nothing from a real bank, store or run appears on this page.

export type StoreId = 'db2' | 'file' | 'mongo';

export interface Store {
  id: StoreId;
  label: string;
  /** Sample throughput in records per second, used for time estimates and the live counters. */
  rate: number;
}

export const STORES: readonly Store[] = [
  { id: 'db2', label: 'DB2', rate: 8400 },
  { id: 'file', label: 'Flat file', rate: 12600 },
  { id: 'mongo', label: 'MongoDB', rate: 6900 },
];

export interface SampleTable {
  id: string;
  name: string;
  rows: number;
  /** Average bytes per exported row, for size estimates. */
  bytes: number;
}

export const TABLES: readonly SampleTable[] = [
  { id: 'accounts', name: 'ACCOUNTS', rows: 1_284_500, bytes: 620 },
  { id: 'customers', name: 'CUSTOMERS', rows: 1_092_310, bytes: 940 },
  { id: 'transfers', name: 'FUNDS_TRANSFER', rows: 3_418_900, bytes: 1180 },
  { id: 'entries', name: 'STATEMENT_ENTRIES', rows: 18_640_200, bytes: 410 },
  { id: 'categories', name: 'CATEGORY_ENTRIES', rows: 2_207_450, bytes: 380 },
];

export const storeById = (id: StoreId): Store => STORES.find((s) => s.id === id) ?? STORES[0];
export const tableById = (id: string): SampleTable => TABLES.find((t) => t.id === id) ?? TABLES[0];

/** 1284500 -> "1,284,500". Fixed locale so the server and the browser print the same string. */
export const int = (n: number): string => Math.round(n).toLocaleString('en-US');

/** Bytes -> "512 KB", "86.4 MB", "7.1 GB". */
export function size(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

/** Seconds -> "42 s", "4 min 12 s", "1 h 08 min". */
export function duration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s} s`;
  if (s < 3600) return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
  return `${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')} min`;
}

/** Saves a small text file the visitor asked for. Browser only: call from click handlers. */
export function saveText(name: string, text: string, type = 'text/csv'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type ColumnKind = 'id' | 'ref' | 'code' | 'text' | 'date' | 'amount' | 'ccy';

/** A source column: its system name, the readable name staff gave it, and whether exports include it. */
export interface SampleColumn {
  sys: string;
  name: string;
  kind: ColumnKind;
  on: boolean;
}

/** Columns per sample table, in the order exports use. System names are invented in the core-banking style. */
export const COLUMNS: Readonly<Record<string, readonly SampleColumn[]>> = {
  customers: [
    { sys: 'RECID', name: 'CUSTOMER_ID', kind: 'id', on: true },
    { sys: 'SHORT.NAME', name: 'SHORT_NAME', kind: 'text', on: true },
    { sys: 'SECTOR', name: 'SECTOR', kind: 'code', on: true },
    { sys: 'RESIDENCE', name: 'RESIDENCE', kind: 'code', on: true },
    { sys: 'OPENING.DATE', name: 'OPENED_ON', kind: 'date', on: true },
    { sys: 'LOCAL.REF.4', name: 'RISK_CLASS', kind: 'code', on: false },
  ],
  accounts: [
    { sys: 'RECID', name: 'ACCOUNT_NO', kind: 'id', on: true },
    { sys: 'CUSTOMER', name: 'CUSTOMER_ID', kind: 'ref', on: true },
    { sys: 'CATEGORY', name: 'CATEGORY', kind: 'code', on: true },
    { sys: 'CURRENCY', name: 'CURRENCY', kind: 'ccy', on: true },
    { sys: 'WORKING.BALANCE', name: 'BALANCE', kind: 'amount', on: true },
    { sys: 'OPENING.DATE', name: 'OPENED_ON', kind: 'date', on: false },
  ],
  transfers: [
    { sys: 'RECID', name: 'TRANSFER_REF', kind: 'id', on: true },
    { sys: 'DEBIT.ACCT.NO', name: 'FROM_ACCOUNT', kind: 'ref', on: true },
    { sys: 'CREDIT.ACCT.NO', name: 'TO_ACCOUNT', kind: 'ref', on: true },
    { sys: 'DEBIT.AMOUNT', name: 'AMOUNT', kind: 'amount', on: true },
    { sys: 'DEBIT.CURRENCY', name: 'CURRENCY', kind: 'ccy', on: true },
    { sys: 'PROCESSING.DATE', name: 'VALUE_DATE', kind: 'date', on: true },
  ],
  entries: [
    { sys: 'RECID', name: 'ENTRY_ID', kind: 'id', on: true },
    { sys: 'ACCOUNT.NUMBER', name: 'ACCOUNT_NO', kind: 'ref', on: true },
    { sys: 'AMOUNT.LCY', name: 'AMOUNT', kind: 'amount', on: true },
    { sys: 'BOOKING.DATE', name: 'BOOKED_ON', kind: 'date', on: true },
    { sys: 'NARRATIVE', name: 'NARRATIVE', kind: 'text', on: true },
  ],
  categories: [
    { sys: 'RECID', name: 'ENTRY_ID', kind: 'id', on: true },
    { sys: 'PL.CATEGORY', name: 'CATEGORY', kind: 'code', on: true },
    { sys: 'AMOUNT.LCY', name: 'AMOUNT', kind: 'amount', on: true },
    { sys: 'BOOKING.DATE', name: 'BOOKED_ON', kind: 'date', on: true },
  ],
};

const CODES = ['1001', '2040', '3105', '4200', '6001'];
const TEXTS = ['Sample Trading Co', 'Demo Textiles Ltd', 'Example Foods', 'Test Logistics', 'Placeholder Mills'];
const NARRATIVES = ['Salary credit', 'Utility bill', 'Card purchase', 'Branch cash', 'Online transfer'];

/** A deterministic invented value for row `i` of a column, so downloads and previews never change between visits. */
export function sampleValue(c: SampleColumn, i: number): string {
  switch (c.kind) {
    case 'id':
      return `${c.name.slice(0, 2)}${String(100231 + i * 17).padStart(8, '0')}`;
    case 'ref':
      return String(1029384700 + ((i * 7919) % 9000));
    case 'code':
      return CODES[i % CODES.length];
    case 'text':
      return c.sys === 'NARRATIVE' ? NARRATIVES[i % NARRATIVES.length] : TEXTS[i % TEXTS.length];
    case 'date':
      return `2026-0${(i % 9) + 1}-${String((i * 3) % 27 + 1).padStart(2, '0')}`;
    case 'amount':
      return (((i * 48271) % 900000) / 100 + 25).toFixed(2);
    case 'ccy':
      return i % 4 === 3 ? 'USD' : 'PKR';
  }
}

/** CSV of `rows` invented rows for the given columns (enabled ones only), using the staff names as the header. */
export function sampleCsv(cols: readonly SampleColumn[], rows: number): string {
  const on = cols.filter((c) => c.on);
  const lines = [on.map((c) => c.name).join(',')];
  for (let i = 0; i < rows; i++) lines.push(on.map((c) => sampleValue(c, i)).join(','));
  return lines.join('\n') + '\n';
}
