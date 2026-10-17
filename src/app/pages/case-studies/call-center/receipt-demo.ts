import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorDownloadSimple } from '@ng-icons/phosphor-icons/regular';
import { ORDERS, Order, money, restaurantName, totals } from './call-center.data';

/**
 * The order receipt (my own redraw). The layout follows the real one: restaurant at the top, receipt number, date,
 * address, customer and phone, item, size, unit cost, quantity and price, then subtotal, delivery, tax and total,
 * a paid stamp and a thank you. The shipped portal drew that receipt as HTML, photographed it with html2canvas and
 * placed the picture in a jsPDF page. This demo does what I'd do today: it writes the PDF as real text (Courier,
 * one of the 14 fonts every PDF reader has), so the file is a couple of kilobytes, sharp at any zoom and
 * searchable. Sample orders.
 */
@Component({
  selector: 'mh-cc-receipt',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorDownloadSimple })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./mini-btn.scss'],
  template: `
    <div class="wrap-r">
      <div class="side card">
        <h3>Order details</h3>
        <div class="seg" role="group" aria-label="Sample order">
          @for (o of orders; track o.no) {
            <button type="button" [attr.aria-pressed]="sel().no === o.no" (click)="pick(o)">#{{ o.no }}</button>
          }
        </div>
        <dl class="facts">
          <div><dt>Restaurant</dt><dd>{{ name(sel().restaurant) }}</dd></div>
          <div><dt>Status</dt><dd>{{ sel().status }}</dd></div>
          <div><dt>Placed</dt><dd>{{ sel().date }}</dd></div>
          <div><dt>Items</dt><dd>{{ sel().lines.length }}</dd></div>
        </dl>
        <button type="button" class="mini-btn is-primary" (click)="download()">
          <ng-icon name="phosphorDownloadSimple" aria-hidden="true" /> Download PDF
        </button>
        <p class="mono small" aria-live="polite">{{ msg() }}</p>
      </div>

      <figure class="paper" [attr.aria-label]="'Receipt preview for order ' + sel().no">
        <span class="stamp" aria-hidden="true">Paid</span>
        <p class="r-name">{{ name(sel().restaurant) }}</p>
        <p class="r-h">Order receipt <span>#{{ sel().no }}</span></p>
        <p class="r-m">Date: {{ sel().date.split(',')[0] }}<br />Address: {{ sel().address }}</p>
        <p class="r-m">Customer: {{ sel().customer }}<br />Phone: {{ sel().phone }}</p>
        <table>
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Size</th>
              <th scope="col" class="n">Unit</th>
              <th scope="col" class="n">Qty</th>
              <th scope="col" class="n">Price</th>
            </tr>
          </thead>
          <tbody>
            @for (l of sel().lines; track l.product + l.size) {
              <tr>
                <td>{{ l.product }}</td>
                <td>{{ l.size }}</td>
                <td class="n">{{ money(l.price) }}</td>
                <td class="n">{{ l.qty }}</td>
                <td class="n">{{ money(l.price * l.qty) }}</td>
              </tr>
            }
          </tbody>
        </table>
        <dl class="r-sum">
          <div><dt>Sub total</dt><dd>€{{ money(t().sub) }}</dd></div>
          <div><dt>Delivery charges</dt><dd>€{{ money(t().delivery) }}</dd></div>
          <div><dt>Tax</dt><dd>€{{ money(t().tax) }}</dd></div>
          <div class="tot"><dt>Order total</dt><dd>€{{ money(t().total) }}</dd></div>
        </dl>
        <p class="r-thanks">Thank you!</p>
      </figure>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .wrap-r {
      display: grid;
      grid-template-columns: minmax(0, 300px) minmax(0, 420px);
      justify-content: center;
      gap: 20px;
      align-items: start;
    }
    .side {
      display: grid;
      gap: 14px;
      justify-items: start;

      h3 {
        font-size: 15px;
      }
      .seg button {
        height: 30px;
        padding: 0 11px;
        font-size: 12.5px;
        font-family: var(--font-mono);
      }
    }
    .facts {
      display: grid;
      gap: 6px;
      width: 100%;
      margin: 0;

      div {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--line);
        font-size: 13px;
      }
      dt {
        color: var(--muted);
      }
      dd {
        margin: 0;
        text-align: right;
        font-weight: 500;
      }
    }
    .small {
      font-size: 12px;
      color: var(--muted);
      min-height: 15px;
    }
    .paper {
      position: relative;
      margin: 0;
      padding: 26px 24px 22px;
      border-radius: var(--r-inner);
      background: #fff;
      border: 1px solid var(--line);
      box-shadow: var(--shadow-lg);
      color: #131336;
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 1.55;
      overflow: hidden;
    }
    .stamp {
      position: absolute;
      top: 70px;
      right: 18px;
      padding: 2px 12px;
      border: 2px solid var(--c-red-text);
      border-radius: 8px;
      color: var(--c-red-text);
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      transform: rotate(-12deg);
    }
    .r-name {
      text-align: center;
      font-family: var(--font-sans, inherit);
      font-weight: 700;
      font-size: 15px;
      margin-bottom: 12px;
    }
    .r-h {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;

      span {
        display: block;
      }
    }
    .r-m {
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    th,
    td {
      padding: 3px 0;
      text-align: left;
      font-weight: 400;
    }
    thead th {
      padding-bottom: 6px;
      border-bottom: 1.5px dashed #131336;
    }
    tbody tr:first-child td {
      padding-top: 6px;
    }
    tbody tr:last-child td {
      padding-bottom: 8px;
      border-bottom: 1.5px dashed #131336;
    }
    .n {
      text-align: right;
    }
    .r-sum {
      display: grid;
      gap: 2px;
      width: 80%;
      margin: 10px 0 0 auto;

      div {
        display: flex;
        justify-content: space-between;
      }
      dd {
        margin: 0;
      }
      .tot {
        font-weight: 700;
      }
    }
    .r-thanks {
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1.5px dotted #131336;
      text-align: center;
      font-size: 13px;
    }
    @media (max-width: 760px) {
      .wrap-r {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    @media (max-width: 420px) {
      .paper {
        padding: 22px 14px 18px;
        font-size: 12px;
      }
    }
  `,
})
export class CallCenterReceiptDemo {
  protected readonly orders = ORDERS.slice(0, 3);
  protected readonly money = money;
  protected readonly name = restaurantName;
  protected readonly sel = signal<Order>(ORDERS[0]);
  protected readonly t = computed(() => totals(this.sel().lines));
  protected readonly msg = signal('Writes a text PDF in the browser.');

  protected pick(o: Order): void {
    this.sel.set(o);
    this.msg.set('Writes a text PDF in the browser.');
  }

  protected download(): void {
    const o = this.sel();
    const bytes = receiptPdf(o);
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Order ${o.no} receipt (sample).pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.msg.set(`Saved, ${(bytes.length / 1024).toFixed(1)} KB of real text.`);
  }
}

// ---------- A minimal PDF writer: one page, Courier, ASCII only ----------

const W = 34; // characters per receipt line

function receiptPdf(o: Order): string {
  const t = totals(o.lines);
  const pad = (l: string, r: string) => l + ' '.repeat(Math.max(1, W - l.length - r.length)) + r;
  const rule = '-'.repeat(W);
  const rows: [string, boolean][] = [
    [restaurantName(o.restaurant), true],
    ['', false],
    [`Order receipt #${o.no}`, true],
    [`Date: ${o.date.split(',')[0]}`, false],
    [`Address: ${o.address}`.slice(0, W), false],
    [`Customer: ${o.customer}`, false],
    [`Phone: ${o.phone}`, false],
    ['', false],
    [pad('Item, size', 'Qty   Price'), true],
    [rule, false],
    ...o.lines.flatMap((l): [string, boolean][] => [
      [`${l.product}, ${l.size}`.slice(0, W), false],
      [pad(`  @ ${money(l.price)}`, `${l.qty}  ${money(l.price * l.qty).padStart(6)}`), false],
    ]),
    [rule, false],
    [pad('Sub total', `EUR ${money(t.sub)}`), false],
    [pad('Delivery charges', `EUR ${money(t.delivery)}`), false],
    [pad('Tax (sample 7%)', `EUR ${money(t.tax)}`), false],
    [pad('Order total', `EUR ${money(t.total)}`), true],
    ['', false],
    [pad('', 'PAID'), true],
    ['Thank you!', false],
    ['', false],
    ['Sample data, mhfrough.dev', false],
  ];

  const lead = 14;
  const width = 300;
  const height = 60 + rows.length * lead;
  const esc = (s: string) => s.replace(/[\\()]/g, (c) => '\\' + c);
  const text = rows
    .map(([s, bold], i) => `BT /${bold ? 'F2' : 'F1'} 10 Tf 24 ${height - 36 - i * lead} Td (${esc(s)}) Tj ET`)
    .join('\n');

  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
  ];

  // ASCII only, so string length equals byte length and the cross-reference offsets are exact.
  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((n) => `${String(n).padStart(10, '0')} 00000 n \n`).join('');
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return out;
}
