// Sample books for the Asaan Hisab demos: one invented small business, a chart of accounts in the app's shape
// (five heads with numbered accounts under them) and a few months of double entries. Every name and figure is
// made up. Shared by the hero journal, the invoice and the reports demos, so they agree with each other.

export type Head = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface Account {
  code: number;
  name: string;
  head: Head;
}

export const HEADS: { id: Head; code: number; name: string }[] = [
  { id: 'asset', code: 1, name: 'Assets' },
  { id: 'liability', code: 2, name: 'Liabilities' },
  { id: 'equity', code: 3, name: 'Equity' },
  { id: 'income', code: 4, name: 'Income' },
  { id: 'expense', code: 5, name: 'Expenses' },
];

export const ACCOUNTS: Account[] = [
  { code: 1001, name: 'Cash in hand', head: 'asset' },
  { code: 1002, name: 'Bank account', head: 'asset' },
  { code: 1101, name: 'Accounts receivable', head: 'asset' },
  { code: 2001, name: 'Accounts payable', head: 'liability' },
  { code: 2101, name: 'Sales tax payable', head: 'liability' },
  { code: 3001, name: 'Owner’s investment', head: 'equity' },
  { code: 3101, name: 'Retained earnings', head: 'equity' },
  { code: 4001, name: 'Sales', head: 'income' },
  { code: 4002, name: 'Service income', head: 'income' },
  { code: 5001, name: 'Rent', head: 'expense' },
  { code: 5002, name: 'Salaries', head: 'expense' },
  { code: 5003, name: 'Utilities', head: 'expense' },
  { code: 5004, name: 'Office supplies', head: 'expense' },
];

export const account = (code: number): Account => ACCOUNTS.find((a) => a.code === code)!;
export const accountsOf = (...heads: Head[]): Account[] => ACCOUNTS.filter((a) => heads.includes(a.head));

/** Debit-normal heads grow with debits; the rest grow with credits. */
export const debitNormal = (h: Head): boolean => h === 'asset' || h === 'expense';

export interface Line {
  code: number;
  dr?: number;
  cr?: number;
}

export interface Entry {
  date: string;
  ref: string;
  text: string;
  lines: Line[];
}

/** A few months of a small design studio's books, from the owner's first deposit to the end of June. */
export const ENTRIES: Entry[] = [
  { date: '02 Mar 2020', ref: 'JV-001', text: 'Owner’s first deposit', lines: [{ code: 1002, dr: 500000 }, { code: 3001, cr: 500000 }] },
  { date: '05 Mar 2020', ref: 'EXP-014', text: 'Office rent, March to May', lines: [{ code: 5001, dr: 90000 }, { code: 1002, cr: 90000 }] },
  {
    date: '18 Apr 2020',
    ref: 'INV-0041',
    text: 'Invoice, brand identity',
    lines: [{ code: 1101, dr: 339000 }, { code: 4001, cr: 300000 }, { code: 2101, cr: 39000 }],
  },
  { date: '24 Apr 2020', ref: 'EXP-019', text: 'Printer paper and toner, on credit', lines: [{ code: 5004, dr: 24000 }, { code: 2001, cr: 24000 }] },
  { date: '09 May 2020', ref: 'RCP-007', text: 'Part payment on INV-0041', lines: [{ code: 1002, dr: 226000 }, { code: 1101, cr: 226000 }] },
  { date: '15 May 2020', ref: 'INC-022', text: 'Workshop fee, paid in cash', lines: [{ code: 1001, dr: 60000 }, { code: 4002, cr: 60000 }] },
  { date: '31 May 2020', ref: 'EXP-027', text: 'Electricity and internet', lines: [{ code: 5003, dr: 18500 }, { code: 1001, cr: 18500 }] },
  { date: '30 Jun 2020', ref: 'EXP-031', text: 'Salaries, April to June', lines: [{ code: 5002, dr: 150000 }, { code: 1002, cr: 150000 }] },
];

/** Balance of an account over the given entries, positive on its normal side. */
export function balance(code: number, entries: Entry[] = ENTRIES): number {
  const a = account(code);
  let dr = 0;
  let cr = 0;
  for (const e of entries) {
    for (const l of e.lines) {
      if (l.code !== code) continue;
      dr += l.dr ?? 0;
      cr += l.cr ?? 0;
    }
  }
  return debitNormal(a.head) ? dr - cr : cr - dr;
}

// ---------------------------------------------------------------------------------------------------------------
// Money. The app grouped thousands with commas as you typed (ngx-mask) and printed totals the same way.
// ---------------------------------------------------------------------------------------------------------------
const NF = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
export const money = (n: number): string => NF.format(Math.round(n));

/** Digits only, capped: what a masked amount field keeps from what was typed. */
export const parseAmount = (v: string): number => Math.min(99_999_999, Number(v.replace(/[^\d]/g, '')) || 0);

// ---------------------------------------------------------------------------------------------------------------
// Amount in words, as printed on the invoices ("... rupees only"). The app used the number-to-words package;
// this is a small equivalent with the same international scale (thousand, million).
// ---------------------------------------------------------------------------------------------------------------
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function under1000(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const rest = r < 20 ? ONES[r] : TENS[Math.floor(r / 10)] + (r % 10 ? '-' + ONES[r % 10] : '');
  return [h ? ONES[h] + ' hundred' : '', rest].filter(Boolean).join(' ');
}

export function toWords(n: number): string {
  n = Math.floor(Math.abs(n));
  if (!n) return 'zero';
  const parts: string[] = [];
  for (const [size, name] of [[1_000_000, 'million'], [1_000, 'thousand'], [1, '']] as const) {
    const chunk = Math.floor(n / size) % 1000;
    if (chunk) parts.push(under1000(chunk) + (name ? ' ' + name : ''));
  }
  return parts.join(', ');
}
