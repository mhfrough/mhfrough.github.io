// Shared sample data for the Malik Transport demos. Vehicle classes and tariffs follow the transporter info page
// as drafted in the source repo (a time charge per started half hour with a ceiling, a price per load kilometre
// and a waiting charge per started half hour); in production every figure came from each vehicle's plan in the
// company API, and the API worked out the fare. Routes are sample trips from Rüdesheim am Rhein with rounded
// distances and times. No customers, drivers or addresses of real people.

export type VehicleId = 'wagon' | 'transporter' | 'truck75' | 'truck12';

export interface Vehicle {
  id: VehicleId;
  name: string;
  /** Euro per started half hour of driving time. */
  halfHour: number;
  /** Ceiling on the time charge. */
  cap: number;
  /** Euro per load kilometre. */
  perKm: number;
  /** Euro per started half hour of waiting. */
  wait: number;
  toll?: boolean;
}

export const VEHICLES: readonly Vehicle[] = [
  { id: 'wagon', name: 'Station wagon', halfHour: 14, cap: 89, perKm: 0.89, wait: 9 },
  { id: 'transporter', name: 'Transporter', halfHour: 16, cap: 99, perKm: 0.99, wait: 10 },
  { id: 'truck75', name: 'Truck 7.5 t', halfHour: 19, cap: 169, perKm: 1.69, wait: 12 },
  { id: 'truck12', name: 'Truck 12 t', halfHour: 22, cap: 189, perKm: 1.89, wait: 14, toll: true },
];

export interface Route {
  id: string;
  from: string;
  to: string;
  km: number;
  min: number;
}

export const ROUTES: readonly Route[] = [
  { id: 'wi', from: 'Rüdesheim am Rhein', to: 'Wiesbaden', km: 33, min: 41 },
  { id: 'mz', from: 'Rüdesheim am Rhein', to: 'Mainz', km: 36, min: 44 },
  { id: 'ko', from: 'Rüdesheim am Rhein', to: 'Koblenz', km: 65, min: 64 },
  { id: 'ffm', from: 'Rüdesheim am Rhein', to: 'Frankfurt am Main', km: 72, min: 58 },
  { id: 'ham', from: 'Rüdesheim am Rhein', to: 'Hamburg', km: 515, min: 325 },
];

export interface Fare {
  halves: number;
  time: number;
  capped: boolean;
  distance: number;
  waitHalves: number;
  waiting: number;
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function fare(v: Vehicle, r: Route, waitMin = 0): Fare {
  const halves = Math.ceil(r.min / 30);
  const rawTime = halves * v.halfHour;
  const time = Math.min(rawTime, v.cap);
  const distance = round2(r.km * v.perKm);
  const waitHalves = Math.ceil(waitMin / 30);
  const waiting = waitHalves * v.wait;
  return { halves, time, capped: rawTime > v.cap, distance, waitHalves, waiting, total: round2(time + distance + waiting) };
}

export const eur = (n: number) => '€ ' + n.toFixed(2);

export const hm = (min: number) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`);

export const vehicle = (id: VehicleId) => VEHICLES.find((v) => v.id === id)!;
export const route = (id: string) => ROUTES.find((r) => r.id === id)!;
