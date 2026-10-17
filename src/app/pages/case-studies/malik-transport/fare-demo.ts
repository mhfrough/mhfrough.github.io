import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowRight, phosphorMapPin } from '@ng-icons/phosphor-icons/regular';
import { ROUTES, VEHICLES, VehicleId, eur, fare, hm, route, vehicle } from './malik-transport.data';

/**
 * Hero mockup of the public price calculator (my own redraw, not a screenshot). Pick a vehicle class and a route
 * and the fare is broken down the way the tariff reads: a charge per started half hour of driving with a ceiling,
 * a price per load kilometre, and a waiting charge per started half hour. In the product the visitor searched any
 * address (through the company API, which asked Google) and the API returned the same breakdown from the vehicle's
 * plan; here the routes are samples and the sum is done in the page. "Book this job" mirrors the customer portal,
 * where the same calculation fixes the fare on a new order.
 */
@Component({
  selector: 'mh-mt-fare',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorArrowRight, phosphorMapPin })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./mini-btn.scss'],
  template: `
    <div class="fare card card--lift">
      <header class="f-head">
        <span class="mark"><img src="/images/malik-transport/malik-transport-mark.webp" width="41" height="32" alt="" /></span>
        <div>
          <h2>Price a job</h2>
          <p>The tariff, worked out before anyone calls</p>
        </div>
      </header>

      <div class="grp" role="group" aria-labelledby="mt-veh-l">
        <span class="lbl" id="mt-veh-l">Vehicle</span>
        <div class="vehicles">
          @for (v of vehicles; track v.id) {
            <button type="button" class="veh" [attr.aria-pressed]="vid() === v.id" (click)="pick(v.id)">
              <b>{{ v.name }}</b>
              <span class="mono">{{ eur(v.perKm) }}/km</span>
            </button>
          }
        </div>
      </div>

      <div class="row2">
        <div class="field">
          <label for="mt-route">Route</label>
          <select id="mt-route" class="select" (change)="setRoute($any($event.target).value)">
            @for (r of routes; track r.id) {
              <option [value]="r.id" [selected]="r.id === rid()">{{ r.from }} to {{ r.to }}</option>
            }
          </select>
        </div>
        <div class="grp" role="group" aria-labelledby="mt-wait-l">
          <span class="lbl" id="mt-wait-l">Waiting at pickup</span>
          <div class="seg">
            @for (w of waits; track w) {
              <button type="button" [attr.aria-pressed]="waitMin() === w" (click)="setWait(w)">{{ w ? w + ' min' : 'None' }}</button>
            }
          </div>
        </div>
      </div>

      <p class="trip">
        <ng-icon name="phosphorMapPin" aria-hidden="true" />
        <span class="mono">{{ r().km }} km</span>
        <span aria-hidden="true">·</span>
        <span class="mono">{{ hm(r().min) }}</span>
        <span class="muted">driving, rounded sample</span>
      </p>

      <dl class="bd">
        <div>
          <dt>Driving time <small>{{ f().halves }} half {{ f().halves === 1 ? 'hour' : 'hours' }} × {{ eur(v().halfHour) }}{{ f().capped ? ', capped at ' + eur(v().cap) : '' }}</small></dt>
          <dd class="mono" [class.capped]="f().capped">{{ eur(f().time) }}</dd>
        </div>
        <div>
          <dt>Load kilometres <small>{{ r().km }} × {{ eur(v().perKm) }}</small></dt>
          <dd class="mono">{{ eur(f().distance) }}</dd>
        </div>
        <div>
          <dt>Waiting <small>{{ f().waitHalves }} × {{ eur(v().wait) }}</small></dt>
          <dd class="mono">{{ eur(f().waiting) }}</dd>
        </div>
        <div class="total">
          <dt>Total fare{{ v().toll ? ', plus truck toll if any' : '' }}</dt>
          <dd class="mono" aria-live="polite">{{ eur(f().total) }}</dd>
        </div>
      </dl>

      <div class="f-foot">
        <p class="mono note" aria-live="polite">{{ note() }}</p>
        <button type="button" class="mini-btn is-primary" (click)="book()">
          Book this job <ng-icon name="phosphorArrowRight" aria-hidden="true" />
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .fare {
      display: grid;
      gap: 14px;
      padding: 18px;
    }
    .f-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);

      h2 {
        font-size: 16px;
      }
      p {
        font-size: 12.5px;
        color: var(--muted);
      }
    }
    .mark {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: var(--r-inner);
      background: var(--mt-blue-soft);

      img {
        width: 30px;
        height: auto;
      }
    }
    .grp {
      display: grid;
      gap: 6px;
      min-width: 0;
    }
    .lbl,
    .field label {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--ink-2);
    }
    .vehicles {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 6px;
    }
    .veh {
      display: grid;
      gap: 2px;
      min-height: 52px;
      padding: 8px 10px;
      border-radius: var(--r-inner);
      border: 1px solid var(--line);
      background: var(--surface);
      text-align: left;
      transition:
        border-color var(--t-base) var(--ease),
        background var(--t-base) var(--ease);

      b {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--ink);
        line-height: 1.25;
      }
      .mono {
        font-size: 12px;
        color: var(--muted);
      }
      &:hover {
        border-color: var(--line-strong);
      }
      &[aria-pressed='true'] {
        border-color: var(--mt-blue);
        background: var(--mt-blue-soft);

        .mono {
          color: var(--mt-blue-text);
        }
      }
      &:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
    }
    .row2 {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: end;

      .select {
        height: 44px;
        font-size: 14px;
      }
      .seg button {
        height: 34px;
        padding: 0 11px;
        font-size: 12.5px;
      }
    }
    .trip {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      font-size: 13px;
      color: var(--ink-2);

      ng-icon {
        color: var(--mt-blue-text);
      }
      .muted {
        color: var(--muted);
        font-size: 12px;
      }
    }
    .bd {
      display: grid;
      margin: 0;
      padding: 6px 14px;
      border-radius: var(--r-inner);
      background: var(--bg);
      border: 1px solid var(--line);

      > div {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        padding: 7px 0;
      }
      dt {
        font-size: 13px;
        font-weight: 500;
        color: var(--ink);

        small {
          display: block;
          font-size: 12px;
          font-weight: 400;
          color: var(--muted);
        }
      }
      dd {
        margin: 0;
        font-size: 13.5px;
        color: var(--ink);
        white-space: nowrap;
      }
      dd.capped {
        color: var(--mt-blue-text);
      }
      .total {
        margin: 6px -8px 4px;
        padding: 10px 8px;
        border-radius: 10px;
        background: var(--mt-blue-soft);

        dt {
          font-weight: 600;
        }
        dd {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--mt-blue-text);
        }
      }
    }
    .f-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .note {
      font-size: 12px;
      color: var(--muted);
      min-height: 14px;
    }
    @media (max-width: 520px) {
      .fare {
        padding: 14px;
      }
      .vehicles {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .row2 {
        grid-template-columns: 1fr;
      }
      .f-foot {
        flex-direction: column-reverse;
        align-items: stretch;
      }
    }
  `,
})
export class MalikTransportFareDemo {
  protected readonly vehicles = VEHICLES;
  protected readonly routes = ROUTES;
  protected readonly waits = [0, 30, 60];
  protected readonly eur = eur;
  protected readonly hm = hm;

  protected readonly vid = signal<VehicleId>('transporter');
  protected readonly rid = signal('wi');
  protected readonly waitMin = signal(0);
  protected readonly note = signal('Sample tariffs and routes.');
  private orderNo = 1044;

  protected readonly v = computed(() => vehicle(this.vid()));
  protected readonly r = computed(() => route(this.rid()));
  protected readonly f = computed(() => fare(this.v(), this.r(), this.waitMin()));

  protected pick(id: VehicleId): void {
    this.vid.set(id);
    this.note.set('Sample tariffs and routes.');
  }

  protected setRoute(id: string): void {
    this.rid.set(id);
    this.note.set(this.f().capped ? 'Long trip: the time charge hits its ceiling.' : 'Sample tariffs and routes.');
  }

  protected setWait(m: number): void {
    this.waitMin.set(m);
    this.note.set('Sample tariffs and routes.');
  }

  protected book(): void {
    this.note.set(`Order MTS-${this.orderNo++} sent to the office as New, fare fixed at ${eur(this.f().total)}.`);
  }
}
