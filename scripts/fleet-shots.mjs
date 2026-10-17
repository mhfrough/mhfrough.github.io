// Screenshots of the fleet platform's staff admin (Angular 21) for the anonymized /work/fleet case study.
//   node scripts/fleet-shots.mjs [--dist <path to the admin's built browser folder>]
//
// Safety: the product is live, so nothing here talks to any server. The admin is built locally from the client
// repo (read only) into .devcache/build/fleet-admin and served from a virtual origin by context.route(). Every API
// call is answered with the made-up fixtures below; websockets are accepted and left silent; every other request
// (analytics, maps, fonts, anything) is aborted before it leaves the machine. No env file, key or token is read.
//
// Anonymity: all names, plates, depots and figures are invented here. Plates use the "QZ" prefix, which is never
// issued on UK plates, phone numbers are from Ofcom's drama range, emails end in .test. The client's logo, product
// name and page title are removed or replaced in the page before each shot, and the brand font (loaded from a CDN)
// is swapped for Geist, the site's own font.
// Output: public/images/fleet/*.webp (quality 80, <= 1600px wide).
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import sharp from 'sharp';
import { ROOT, CACHE } from './_env.mjs';

const { chromium } = await import('playwright');
const OUT = resolve(ROOT, 'public/images/fleet');
mkdirSync(OUT, { recursive: true });

const distFlag = process.argv.indexOf('--dist');
const DIST = distFlag > -1 ? resolve(process.argv[distFlag + 1]) : resolve(CACHE, 'build/fleet-admin/browser');
if (!existsSync(join(DIST, 'index.html'))) throw new Error(`No admin build at ${DIST}`);
const ORIGIN = 'https://fleet.shots.test';

// The API base comes from the local development build (it points at localhost); it is never printed or contacted.
function detectApi(dist) {
  for (const f of readdirSync(dist).filter((n) => n.endsWith('.js'))) {
    const m = readFileSync(join(dist, f), 'utf8').match(/apiUrl\s*:\s*["'`]([^"'`]+)["'`]/);
    if (m) return m[1].replace(/\/$/, '');
  }
  throw new Error('No apiUrl found in the build');
}
const API = detectApi(DIST);

// The admin's storage keys carry a short product prefix; read it from the build so it is not repeated here.
function detectPrefix(dist) {
  for (const f of readdirSync(dist).filter((n) => n.endsWith('.js'))) {
    const m = readFileSync(join(dist, f), 'utf8').match(/["'`]([a-z]+)_access_token["'`]/);
    if (m) return m[1];
  }
  throw new Error('No storage key prefix found in the build');
}
const KEY = detectPrefix(DIST);
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(API + '/')) {
  throw new Error('The admin build does not point at localhost. Build it with --configuration development.');
}

// ---------------------------------------------------------------------------------------------------------------
// Made-up fleet. "Today" is fixed so the shots are stable: Monday 12 October 2026, 09:30 in London.
// ---------------------------------------------------------------------------------------------------------------
const NOW = new Date('2026-10-12T09:30:00+01:00');
const DAY = 86_400_000;
const d = (n) => new Date(NOW.getTime() + n * DAY).toISOString().slice(0, 10);
const iso = (n, h = 9) => new Date(NOW.getTime() + n * DAY + (h - 9) * 3_600_000).toISOString();

const COMPANY = { id: 'c1', name: 'Demo Fleet', code: 'DEMO' };
const USER = {
  id: 'u1', name: 'Alex Morgan', username: 'amorgan', email: 'alex@demo-fleet.test', phone: null, jobTitle: 'Fleet manager',
  department: null, bio: null, avatarUrl: null, role: 'account-administrator', companyId: 'c1', siteIds: ['s1', 's2', 's3'],
  themePreference: 'light', passkeysEnabled: true,
};
const SITES = [
  { id: 's1', code: 'NTH', name: 'North depot', city: null },
  { id: 's2', code: 'CTY', name: 'City depot', city: null },
  { id: 's3', code: 'EST', name: 'East depot', city: null },
];
const siteOf = (i) => SITES[i % 3];

const NAMES = [
  'Sam Carter', 'Priya Shah', 'Daniel Hughes', 'Aisha Khan', 'Tom Bennett', 'Leah Collins', 'Omar Farouk', 'Grace Walsh',
  'Ryan Doyle', 'Hannah Reid', 'Imran Qureshi', 'Chloe Turner', 'Jack Murray', 'Zara Ahmed', 'Lewis Grant', 'Mia Holt',
  'Nathan Price', 'Sophie Lane', 'Adam Webb', 'Ella Ward', 'Bilal Hussain', 'Ruby Fox', 'Kieran Shaw', 'Nadia Bell',
  'Owen Pike', 'Isla Hart', 'Faisal Raza', 'Megan Cole', 'Ben Archer', 'Yasmin Noor',
];

const MODELS = [
  ['Toyota', 'Corolla Hybrid', 'Saloon', 'Hybrid'], ['Toyota', 'Prius', 'Saloon', 'Hybrid'], ['Kia', 'Niro', 'SUV', 'Hybrid'],
  ['Skoda', 'Octavia', 'Estate', 'Diesel'], ['Ford', 'Galaxy', 'MPV', 'Hybrid'], ['Hyundai', 'Ioniq', 'Saloon', 'Hybrid'],
  ['Toyota', 'RAV4', 'SUV', 'Hybrid'], ['Volkswagen', 'Sharan', 'MPV', 'Diesel'],
];
const TAILS = ['FLT', 'DPT', 'HRE', 'RNT', 'CAB', 'MTR', 'VAN', 'KEY', 'GRG', 'TST', 'NEW', 'BLU', 'GRN', 'SIL', 'BLK', 'WHT', 'RED', 'GRY', 'NAV', 'TAX', 'PHV', 'ECO', 'EVS', 'HYB'];
const COLOURS = ['White', 'Silver', 'Black', 'Grey', 'Blue'];

const VEHICLES = TAILS.map((tail, i) => {
  const [make, model, category, fuelType] = MODELS[i % MODELS.length];
  const site = siteOf(i);
  const out = i < 17;
  const vor = i === 17 || i === 21;
  const reg = `QZ${22 + (i % 5)} ${tail}`;
  return {
    id: `v${i + 1}`, companyId: 'c1', siteId: site.id, registration: reg, make, model, category, vin: `DEMOVIN${String(i + 1).padStart(10, '0')}`,
    trackerNumber: null, trackerReference: null, trackerStatus: i % 4 === 3 ? 'ordered' : 'installed', mileage: 31_000 + i * 2_870,
    status: vor ? 'VOR / Maintenance' : 'Available', year: 2022 + (i % 5), colour: COLOURS[i % COLOURS.length], fuelType, groupId: null, notes: null,
    lastServiceDate: d(-40 - i), nextServiceDue: d(60 - i), motExpiry: d([9, 44, 120, 210, 3, 300, 75, 18][i % 8]), motExempt: false, motBookedInDate: null,
    cocExpiry: null, cocExempt: true, roadTaxExpiry: d(90 + i * 7), roadTaxApplicationDate: null, insuranceExpiry: d(150 + i * 3),
    insurancePolicyNumber: null, v5ReferenceNumber: null, section50Inspection: null, section50NextInspection: null, section50Exempt: true,
    retired: false, currentlyOut: out, currentDriverId: out ? `d${i + 1}` : null, currentDriverName: out ? NAMES[i] : null,
    createdAt: iso(-300 + i), updatedAt: iso(-2), isArchived: false, archivedAt: null, duplicatedFromId: null,
    registrationDate: `${2022 + (i % 5)}-03-01`, transmission: 'Automatic', bodyStyle: category, seats: category === 'MPV' ? 7 : 5, engineSize: 1800,
    co2Emissions: 98, euroStatus: 'Euro 6', doors: 5, dvlaLastSynced: iso(-1), site, group: null, bodyWorkRequired: false,
    interimTestDateTime: i % 3 === 0 ? iso(12 + i, 10) : null, interimTestExempt: false, interimTestPassedDate: null,
    renewalTestDateTime: i % 5 === 0 ? iso(26 + i, 11) : null, renewalReferenceNumber: null, renewalTestStatus: null, preTestDateTime: null,
  };
});

const DRIVERS = NAMES.map((name, i) => {
  const site = siteOf(i);
  const active = i < 17;
  const [first, last] = name.split(' ');
  const licence = [5, 22, 140, 380, 640, -3, 260, 810, 47, 520][i % 10];
  return {
    id: `d${i + 1}`, companyId: 'c1', siteId: site.id, name, company: null, email: `${first.toLowerCase()}.${last.toLowerCase()}@example.test`,
    phone: `07700 900${String(100 + i * 7).slice(-3)}`, address: null, city: null, postcode: null, cabNumber: String(200 + i),
    licenseNumber: `DEMO${String(i + 1).padStart(6, '0')}XX`, licenseExpiry: d(licence), dvlaCheckDate: d(-20 - i * 3), dvlaCheckBy: 'Alex Morgan',
    badgeNumber: `B-${String(4000 + i)}`, badgeExpiry: d(30 + i * 19), effectiveBadgeExpiry: d(30 + i * 19), hasBadgeRenewalReceipt: false,
    nationalInsuranceNumber: null, active: true, createdAt: iso(-400 + i * 5), updatedAt: iso(-3), totalHires: 1 + (i % 6), activeHires: active ? 1 : 0,
    hasActiveHire: active, isArchived: false, archivedAt: null, duplicatedFromId: null,
  };
});

// One live hire per vehicle that is out, plus two pending starts and one ending today.
const BOOKINGS = VEHICLES.slice(0, 17).map((v, i) => ({
  id: `b${i + 1}`, companyId: 'c1', siteId: v.siteId, siteName: v.site.name, vehicleId: v.id, driverId: `d${i + 1}`,
  startDate: d(-30 + i * 2), endDate: d([20, 6, 33, 11, 48, 0, 27, 9, 61, 15, 40, 4, 23, 70, 13, 35, 8][i]), actualEndDate: null,
  status: 'active', workflowStatus: 'active', contractSigned: true, driverName: NAMES[i], vehicleRegistration: v.registration,
  driver: { name: NAMES[i] }, vehicle: { registration: v.registration }, additionalDriversCount: i % 7 === 2 ? 1 : 0,
}));
BOOKINGS.push(
  { ...BOOKINGS[0], id: 'b18', vehicleId: 'v19', siteId: 's3', siteName: 'East depot', vehicleRegistration: VEHICLES[18].registration, vehicle: { registration: VEHICLES[18].registration }, driverId: 'd19', driverName: NAMES[18], driver: { name: NAMES[18] }, startDate: d(2), endDate: d(30), status: 'pending', workflowStatus: 'checkout', contractSigned: false, additionalDriversCount: 0 },
  { ...BOOKINGS[0], id: 'b19', vehicleId: 'v20', siteId: 's2', siteName: 'City depot', vehicleRegistration: VEHICLES[19].registration, vehicle: { registration: VEHICLES[19].registration }, driverId: 'd20', driverName: NAMES[19], driver: { name: NAMES[19] }, startDate: d(5), endDate: d(40), status: 'pending', workflowStatus: 'checkout', contractSigned: true, additionalDriversCount: 0 },
);
const PENDING = BOOKINGS.filter((b) => b.status === 'pending');

const HOLIDAYS = [
  { id: 'h1', vehicleId: 'v4', vehicleReg: VEHICLES[3].registration, driverId: 'd4', driverName: NAMES[3], startDate: d(3), endDate: d(9), notes: 'Family visit', companyId: 'c1', status: 'acknowledged', createdAt: iso(-6), updatedAt: iso(-6) },
  { id: 'h2', vehicleId: 'v11', vehicleReg: VEHICLES[10].registration, driverId: 'd11', driverName: NAMES[10], startDate: d(7), endDate: d(12), notes: null, companyId: 'c1', status: 'acknowledged', createdAt: iso(-3), updatedAt: iso(-3) },
];

const summary = (b, gross = 210) => ({
  id: b.id, bookingNo: `H-${2026}${String(300 + Number(b.id.slice(1))).padStart(4, '0')}`, clientName: b.driverName, regNo: b.vehicleRegistration,
  makeModel: (() => { const v = VEHICLES.find((x) => x.id === b.vehicleId); return v ? `${v.make} ${v.model}` : null; })(),
  status: b.status === 'pending' ? 'Pending' : 'Active', grossTotal: gross, pickUpDate: b.startDate, chargeFromDate: b.startDate, endDate: b.endDate,
});
const status = (days) => (days < 0 ? 'Expired' : days <= 30 ? 'Expiring Soon' : 'Upcoming');
const vRow = (v, key) => { const days = Math.round((new Date(v[key]) - NOW) / DAY); return { id: v.id, registration: v.registration, expiry: v[key], days, status: status(days), site: v.site.name, createdAt: iso(-90), updatedAt: iso(-4) }; };
const dRow = (dr, key) => { const days = Math.round((new Date(dr[key]) - NOW) / DAY); return { id: dr.id, name: dr.name, expiry: dr[key], days, status: status(days), site: SITES.find((s) => s.id === dr.siteId).name, createdAt: iso(-90), updatedAt: iso(-4) }; };
const within = (rows, max) => rows.filter((r) => r.days <= max).sort((a, b) => a.days - b.days);

const motRows = within(VEHICLES.map((v) => vRow(v, 'motExpiry')), 60);
const licenceRows = within(DRIVERS.slice(0, 17).map((x) => dRow(x, 'licenseExpiry')), 90);
const badgeRows = within(DRIVERS.slice(0, 17).map((x) => dRow(x, 'badgeExpiry')), 90);

const TASKS = [
  ['Call about MOT booking', 'Conversation', 'Vehicle', VEHICLES[4].registration, 'New', 0],
  ['Chase signed hire agreement', 'Email', 'Booking', 'H-20260319', 'In Progress', 1],
  ['Licence renewal photo received, check it', 'Web Booking', 'Client', NAMES[5], 'New', 0],
  ['Send permission letter', 'Letter', 'Client', NAMES[2], 'New', 2],
  ['Arrange tyre replacement', 'Conversation', 'Vehicle', VEHICLES[17].registration, 'In Progress', 1],
  ['Confirm holiday dates', 'Email', 'Client', NAMES[3], 'Complete', -1],
  ['Book interim test', 'Conversation', 'Vehicle', VEHICLES[9].registration, 'New', 4],
  ['Return inspection follow-up', 'Email', 'Booking', 'H-20260312', 'New', 3],
].map(([description, taskType, entityType, relatedTo, st, due], i) => ({
  id: `t${i + 1}`, taskNumber: `T-${1040 + i}`, status: st, taskType, entityType, entityId: `e${i}`, relatedTo, description,
  assignedToId: 'u1', assignedTo: { id: 'u1', name: 'Alex Morgan' }, createdById: 'u1', createdBy: { id: 'u1', name: 'Alex Morgan' },
  dueDate: d(due), attachments: [], createdAt: iso(-5 + i),
}));

const DASHBOARD = {
  fleet: {
    total: VEHICLES.length, available: 5, onHire: 17, maintenance: 2, returned: 1, other: 0, motExpired: 0,
    motExpiringSoon: motRows.filter((r) => r.days <= 30).map((r) => ({ registration: r.registration, motExpiry: r.expiry })),
    taxExpiringSoon: [],
  },
  bookings: {
    total: 212, activeHires: 17, pending: 2, overdue: 1, totalRevenue: 48_260, outstandingBalance: 1_470,
    todayCheckouts: [summary(BOOKINGS[17])], todayReturns: [summary(BOOKINGS[5])], upcoming: PENDING.map((b) => summary(b)),
    recent: BOOKINGS.slice(0, 6).map((b) => summary(b)), bookingDatesThisMonth: [1, 3, 6, 8, 12, 14, 17, 19, 22],
  },
  clients: {
    total: 30, active: 17,
    licenceExpiringSoon: licenceRows.filter((r) => r.days <= 30).map((r) => ({ forename: r.name.split(' ')[0], surname: r.name.split(' ')[1], licenseExpiry: r.expiry })),
    recentActive: [],
  },
  tasks: { open: 7, new: 5, dueSoon: TASKS.slice(0, 4), recent: TASKS.slice(0, 5), taskDatesThisMonth: [12, 13, 14, 16] },
  jobs: { active: 2, pending: 3, completedToday: 4, activeList: [] },
  compliance: {
    bookings: {
      endingSoon: 4, expired: 0, overdueReturns: 1,
      endingSoonRows: BOOKINGS.filter((b) => b.status === 'active' && (new Date(b.endDate) - NOW) / DAY <= 14).map((b) => summary(b)),
      expiredRows: [], overdueReturnRows: [summary(BOOKINGS[5])],
    },
    drivers: {
      total: 17, dvlaChecksNeeded: 2, dvlaRows: [],
      licenceExpired: licenceRows.filter((r) => r.days < 0).length, licenceExpiringSoon: licenceRows.filter((r) => r.days >= 0 && r.days <= 30).length,
      licenceUpcoming: licenceRows.filter((r) => r.days > 30).length, licenceRows,
      badgeExpired: 0, badgeExpiringSoon: badgeRows.filter((r) => r.days <= 30).length, badgeUpcoming: badgeRows.filter((r) => r.days > 30).length, badgeRows,
    },
    vehicles: {
      motExpiringSoon: motRows.filter((r) => r.days <= 30).length, motUpcoming: motRows.filter((r) => r.days > 30).length, motRows,
      insuranceExpired: 0, insuranceExpiringSoon: 0, insuranceUpcoming: 2,
      vehLicenceExpired: 0, vehLicenceExpiringSoon: 2, vehLicenceUpcoming: 3,
      serviceOverdue: 1, serviceDueSoon: 3, serviceUpcoming: 6, serviceNeedsSetup: 2, serviceTotal: 24,
      roadTaxExpired: 0, roadTaxExpiringSoon: 1, roadTaxUpcoming: 2,
      interimTestExpired: 0, interimTestExpiringSoon: 3, interimTestUpcoming: 4, interimTestNotSet: 1,
      renewalTestExpired: 0, renewalTestExpiringSoon: 1, renewalTestUpcoming: 3, renewalTestNotSet: 0,
      section50Expired: 0, section50ExpiringSoon: 0, section50Upcoming: 0, section50Rows: [], section50NotSet: 0, section50NotSetRows: [],
    },
  },
  documentCompliance: { vehicles: { missingCount: 2 }, drivers: { missingCount: 3 } },
};

const rStatus = (days) => (days < 0 ? 'Expired' : days <= 7 ? 'Urgent' : days <= 14 ? 'Warning' : 'Due Soon');
const repV = (v, key) => { const days = Math.round((new Date(v[key]) - NOW) / DAY); return { vehicleId: v.id, registration: v.registration, makeModel: `${v.make} ${v.model}`, siteName: v.site.name, expiry: v[key], days, status: rStatus(days) }; };
const repD = (dr, key) => { const days = Math.round((new Date(dr[key]) - NOW) / DAY); return { clientId: dr.id, name: dr.name, siteName: SITES.find((s) => s.id === dr.siteId).name, expiry: dr[key], days, status: rStatus(days) }; };
const soon = (rows, max = 30) => rows.filter((r) => r.days <= max).sort((a, b) => a.days - b.days);
const REPORTS = {
  filters: { period: 'last-month', siteId: null, startDate: '2026-09-01', endDate: '2026-09-30' },
  overview: {
    totalVehicles: 24, availableVehicles: 5, onHireVehicles: 17, maintenanceVehicles: 2, fleetUtilizationPct: 71, totalRevenue: 48_260, totalVat: 9_652,
    totalHires: 212, activeBookings: 17, averageWeeklyRate: 212,
    categoryBreakdown: [
      { category: 'Saloon', total: 9, onHire: 7, available: 2, utilizationPct: 78 },
      { category: 'SUV', total: 6, onHire: 4, available: 2, utilizationPct: 67 },
      { category: 'MPV', total: 6, onHire: 4, available: 1, utilizationPct: 67 },
      { category: 'Estate', total: 3, onHire: 2, available: 0, utilizationPct: 67 },
    ],
  },
  revenueBySite: SITES.map((s, i) => ({ siteId: s.id, siteName: s.name, hires: [88, 71, 53][i], revenue: [19_400, 16_120, 12_740][i], vat: [3_880, 3_224, 2_548][i], total: [23_280, 19_344, 15_288][i] })),
  revenueByVehicle: VEHICLES.slice(0, 10).map((v, i) => ({ vehicleId: v.id, registration: v.registration, makeModel: `${v.make} ${v.model}`, category: v.category, siteName: v.site.name, hires: 3 + (i % 4), days: 120 - i * 6, revenue: 3_600 - i * 140 })),
  weeklyRates: {
    byCategory: [{ category: 'Saloon', hires: 96, avgRate: 205 }, { category: 'SUV', hires: 52, avgRate: 225 }, { category: 'MPV', hires: 44, avgRate: 240 }, { category: 'Estate', hires: 20, avgRate: 195 }],
    bySite: SITES.map((s, i) => ({ siteId: s.id, siteName: s.name, hires: [88, 71, 53][i], avgRate: [214, 209, 211][i] })),
  },
  compliance: {
    totalAlerts: 17,
    items: [
      { key: 'mot', label: 'MOT', icon: 'bi-clipboard-check', expired: 0, dueSoon: 3, upcoming: 2, missingDate: 0 },
      { key: 'insurance', label: 'Insurance', icon: 'bi-shield-check', expired: 0, dueSoon: 0, upcoming: 2, missingDate: 0 },
      { key: 'licence', label: 'Driving licence', icon: 'bi-person-vcard', expired: 1, dueSoon: 2, upcoming: 3, missingDate: 0 },
      { key: 'badge', label: 'Taxi badge', icon: 'bi-person-badge', expired: 0, dueSoon: 2, upcoming: 4, missingDate: 0 },
      { key: 'interimTest', label: 'Interim test', icon: 'bi-wrench', expired: 0, dueSoon: 3, upcoming: 4, missingDate: 1 },
      { key: 'dvla', label: 'DVLA checks', icon: 'bi-search', expired: 0, dueSoon: 2, upcoming: 0, missingDate: 0 },
    ],
    detail: {
      mot: soon(VEHICLES.map((v) => repV(v, 'motExpiry')), 60), coc: [], insurance: [], service: [],
      licence: soon(DRIVERS.slice(0, 17).map((x) => repD(x, 'licenseExpiry')), 60),
      badge: soon(DRIVERS.slice(0, 17).map((x) => repD(x, 'badgeExpiry')), 60),
      dvla: [
        { clientId: 'd7', name: NAMES[6], siteName: 'North depot', lastCheck: d(-190), daysSince: 190, status: 'Overdue' },
        { clientId: 'd13', name: NAMES[12], siteName: 'North depot', lastCheck: null, daysSince: null, status: 'Never Checked' },
      ],
      phv: [],
      interimTest: VEHICLES.filter((v) => v.interimTestDateTime).map((v) => ({ ...repV({ ...v, t: v.interimTestDateTime.slice(0, 10) }, 't'), advisories: [] })).slice(0, 6),
      renewalTest: VEHICLES.filter((v) => v.renewalTestDateTime).map((v) => ({ ...repV({ ...v, t: v.renewalTestDateTime.slice(0, 10) }, 't'), advisories: [] })),
      section50: [], roadTax: [], advisories: [], permissionLetters: [],
    },
  },
  vehicleSpecs: {
    totalVehicles: 24,
    vehicles: VEHICLES.map((v) => ({ id: v.id, registration: v.registration, makeModel: `${v.make} ${v.model}`, category: v.category, fuelType: v.fuelType, transmission: v.transmission, colour: v.colour, seats: v.seats, doors: v.doors, year: v.year, vin: null, siteName: v.site.name, status: v.status, retired: false })),
  },
};

// Support chat: one inbox, one open thread.
const thread = (i, st, preview, mins, unread, cat) => ({
  id: `ch${i}`, status: st, initiatedBy: 'client', category: cat,
  client: { id: `d${i}`, name: NAMES[i - 1], email: null, phone: null, clientNumber: `C-${3100 + i}`, company: null },
  assignedAdminUser: st === 'open' ? null : { id: 'u1', name: 'Alex Morgan' }, lastMessageAt: new Date(NOW.getTime() - mins * 60_000).toISOString(),
  lastMessagePreview: preview, lastMessageSenderType: 'client', unread, createdAt: iso(-1),
});
const THREADS = [
  thread(2, 'in_progress', 'Thanks, I will drop it at the depot after 4.', 3, true, 'Booking Query'),
  thread(9, 'open', 'Can I pay this week’s rent by bank transfer?', 12, true, 'Invoice Query'),
  thread(5, 'in_progress', 'Photo of the new licence attached.', 38, false, 'Account Query'),
  thread(14, 'open', 'Warning light came on this morning.', 64, true, 'Technical Query'),
  thread(11, 'resolved', 'All sorted, thank you.', 180, false, 'General Query'),
];
const msg = (id, who, text, mins) => ({
  id, threadId: 'ch2', senderType: who === 'me' ? 'admin_user' : 'client', senderAdminUser: who === 'me' ? { id: 'u1', name: 'Alex Morgan' } : null,
  senderAdminUserId: who === 'me' ? 'u1' : null, type: 'text', text, attachmentUrl: null, attachmentName: null, durationSec: null,
  createdAt: new Date(NOW.getTime() - mins * 60_000).toISOString(),
});
const THREAD_DETAIL = {
  thread: { id: 'ch2', status: 'in_progress', initiatedBy: 'client', category: 'Booking Query', initiatedByAdminUser: null, assignedAdminUser: { id: 'u1', name: 'Alex Morgan' }, resolvedAt: null, createdAt: iso(-1), clientLastReadAt: new Date(NOW.getTime() - 2 * 60_000).toISOString() },
  client: THREADS[0].client,
  driverContext: {
    activeBooking: { id: 'b2', status: 'Active', startDate: BOOKINGS[1].startDate, endDate: BOOKINGS[1].endDate },
    vehicle: { id: 'v2', registration: VEHICLES[1].registration, make: VEHICLES[1].make, model: VEHICLES[1].model, status: 'Available' },
    lastCompletedJob: null, lastPayment: { amount: 210, date: d(-4) },
  },
  messages: [
    msg('m1', 'them', 'Hi, my contract ends next week. Can I extend it by a month?', 26),
    msg('m2', 'me', 'Morning Priya, yes. I have sent a 4 week extension to the app for you to accept.', 21),
    msg('m3', 'them', 'Got it, accepted. Do I need to bring the car in?', 14),
    msg('m4', 'me', 'Only for the interim test on the 24th. The depot is open from 8.', 9),
    msg('m5', 'them', 'Thanks, I will drop it at the depot after 4.', 3),
  ],
  participants: [{ adminUserId: 'u1', name: 'Alex Morgan', role: 'assigned', joinedAt: iso(-1), lastReadAt: new Date(NOW.getTime() - 60_000).toISOString() }],
  feedback: null,
};

const ALERTS = {
  total: 6, bySeverity: { critical: 1, warning: 3, info: 2 },
  byCategory: { compliance: 4, booking: 1, task: 1, job: 0, driver: 0, vehicle: 0, admin: 0 },
  alerts: [
    { id: 'n1', category: 'compliance', type: 'licence_expired', severity: 'critical', title: 'Driving licence expired', detail: `${NAMES[5]}: expired 3 days ago`, entityType: 'Client', entityId: 'd6', route: '/drivers', isRead: false, createdAt: iso(0, 8) },
    { id: 'n2', category: 'compliance', type: 'mot_expiring', severity: 'warning', title: 'MOT due in 3 days', detail: VEHICLES[4].registration, entityType: 'Vehicle', entityId: 'v5', route: '/vehicles', isRead: false, createdAt: iso(0, 7) },
  ],
};

const env = (data) => ({ data, statusCode: 200, timestamp: NOW.toISOString() });
const page = (rows, q) => {
  const limit = Number(q.get('limit') ?? rows.length) || rows.length;
  const offset = Number(q.get('offset') ?? 0);
  return { data: rows.slice(offset, offset + limit), total: rows.length };
};

/** path (after the API base, no query) + query -> payload (wrapped in {data}) */
function api(path, q, method) {
  const p = path.replace(/^\/+/, '');
  if (method !== 'GET') return env({});
  switch (p) {
    case 'sites': return env(SITES);
    case 'app-version': return env({ version: '0.0.0' });
    case 'dashboard/full': return env(DASHBOARD);
    case 'vehicles/trackers': return env({ rows: VEHICLES.map((v) => ({ vehicleId: v.id, registration: v.registration, make: v.make, model: v.model, siteName: v.site.name, trackerStatus: v.trackerStatus, trackerReference: null, trackerNumber: null })) });
    case 'vehicles': return env(page(VEHICLES, q));
    case 'clients': {
      let rows = DRIVERS;
      if (q.get('hasActiveHire') === 'true') rows = rows.filter((x) => x.hasActiveHire);
      if (q.get('hasActiveHire') === 'false') rows = rows.filter((x) => !x.hasActiveHire);
      return env(page(rows, q));
    }
    case 'bookings': return env(q.get('status') === 'pending' ? PENDING : BOOKINGS);
    case 'vehicle-holidays': return env({ data: HOLIDAYS, total: HOLIDAYS.length, page: 1, limit: 500 });
    case 'vehicle-holidays/requests': return env([]);
    case 'tasks': return env(page(TASKS, q));
    case 'reports': return env(REPORTS);
    case 'document-requests':
    case 'agreement-requests': return env({ items: [], take: 100, skip: 0, hasMore: false });
    case 'fines/open-count': return env(2);
    case 'chat/threads/unread-count': return env({ count: 3 });
    case 'chat/threads': {
      const tab = q.get('tab');
      if (tab === 'closed') return env(THREADS.filter((t) => t.status === 'resolved'));
      if (tab === 'needs_attention') return env(THREADS.filter((t) => t.unread));
      return env(THREADS.filter((t) => t.status !== 'resolved'));
    }
    case 'incidents/queues': return env({ NEEDS_ATTENTION: 1, WAITING_CUSTOMER: 0, WAITING_INSURANCE: 1, READY_TO_CLOSE: 0 });
    case 'onboarding/pending-review-count': return env({ count: 2 });
    case 'driver-inquiries': return env([]);
    case 'maintenance/work-orders': return env({ items: [], total: 0, page: 1, pageSize: Number(q.get('pageSize') ?? 25) });
    case 'notifications/alerts': return env(ALERTS);
    case 'auth/webauthn/credentials': return env([{ id: 'pk1', browser: 'Chrome', os: 'Windows', deviceType: 'desktop', deviceName: 'Office PC', backedUp: true, isActive: true, createdAt: iso(-30), lastUsedAt: iso(-1) }]);
    case 'admin-users': return env([{ id: 'u1', name: 'Alex Morgan', role: 'account-administrator' }]);
    default:
      if (/^chat\/threads\/[^/]+$/.test(p)) return env(THREAD_DETAIL);
      if (/^chat\/threads\/[^/]+\/notes$/.test(p)) return env([]);
      return env([]);
  }
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.map': 'application/json',
};

// Brand assets are never served: the logo and the partner logos and signature images in public/.
const NEVER = /(logo|signature|favicon|zona)/i;
function staticFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^[\\/]+/, '');
  const file = join(DIST, clean);
  if (NEVER.test(clean)) return { status: 404, contentType: 'text/plain', body: 'not served' };
  if (clean && file.startsWith(DIST) && existsSync(file) && statSync(file).isFile()) {
    return { status: 200, contentType: TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream', body: readFileSync(file) };
  }
  if (extname(clean)) return { status: 404, contentType: 'text/plain', body: 'not found' };
  return { status: 200, contentType: TYPES['.html'], body: readFileSync(join(DIST, 'index.html')) };
}

const GEIST = readFileSync(resolve(ROOT, 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'));

// Branding out, noise out: the sidebar logo and product name, the build tag, toasts from endpoints with no fixture.
const CSS = [
  "@font-face { font-family: 'Plus Jakarta Sans'; font-weight: 100 900; src: url('/__geist.woff2') format('woff2'); }",
  '.sidebar-logo, .auth-logo, .brand-logo, img[src*="logo"] { visibility: hidden !important; }',
  '.app-version, .ant-notification, .ant-message, .cdk-overlay-container .update-banner { display: none !important; }',
  'html { scrollbar-width: none; } ::-webkit-scrollbar { display: none; }',
  '*, *::before, *::after { caret-color: transparent !important; animation-duration: 0s !important; transition-duration: 0s !important; }',
].join('\n');

const browser = await chromium.launch();

async function open(path, { dark = false, width = 1440, height = 900 } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height }, deviceScaleFactor: 1.5, serviceWorkers: 'block', reducedMotion: 'reduce',
    locale: 'en-GB', timezoneId: 'Europe/London', colorScheme: dark ? 'dark' : 'light',
  });
  const misses = new Set();
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    if (url.startsWith(API)) {
      const u = new URL(url);
      const body = api(u.pathname.slice(new URL(API).pathname.length), u.searchParams, req.method());
      return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': ORIGIN, 'access-control-allow-headers': '*', 'access-control-allow-credentials': 'true' }, body: JSON.stringify(body) });
    }
    if (url.startsWith(ORIGIN)) {
      const pathname = new URL(url).pathname;
      if (pathname === '/__geist.woff2') return route.fulfill({ status: 200, contentType: 'font/woff2', body: GEIST });
      const r = staticFile(pathname);
      if (r.status === 404) misses.add(pathname);
      return route.fulfill(r);
    }
    if (url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
    return route.abort(); // analytics, maps, fonts CDN, anything else
  });
  // Realtime sockets: accepted, never forwarded, never answered.
  await ctx.routeWebSocket(/.*/, () => {});
  await ctx.addInitScript(({ user, company, dark: isDark, key }) => {
    const u = { ...user, themePreference: isDark ? 'dark' : 'light' };
    localStorage.setItem(`${key}_access_token`, 'demo');
    localStorage.setItem(`${key}_refresh_token`, 'demo');
    localStorage.setItem(`${key}_admin_session`, JSON.stringify({ user: u, company }));
    localStorage.setItem(`${key}_passkey_prompt_dismissed_${u.id}`, '1');
    localStorage.setItem(`${key}-last-user-id`, u.id);
    localStorage.setItem(`${key}-dark-mode`, String(isDark));
    localStorage.setItem(`${key}_latest_known_version`, '0.0.0');
    try { Notification.requestPermission = () => Promise.resolve('denied'); } catch {}
  }, { user: USER, company: COMPANY, dark, key: KEY });
  const p = await ctx.newPage();
  await p.clock.setFixedTime(NOW);
  p.on('pageerror', (e) => console.log(`  pageerror: ${e.message.split('\n')[0]}`));
  await p.goto(ORIGIN + path, { waitUntil: 'load', timeout: 60_000 });
  await settle(p);
  if (misses.size) console.log(`  not served: ${[...misses].join(', ')}`);
  return { ctx, page: p };
}

async function settle(p, extra = 1200) {
  await p.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  await p.addStyleTag({ content: CSS });
  await p.evaluate(() => {
    document.title = 'Fleet admin';
    for (const el of document.querySelectorAll('.sidebar-brand-text')) el.textContent = 'Fleet admin';
    // The sidebar scrolls its active link into view; keep it at the top so every shot shows the same menu.
    for (const el of document.querySelectorAll('aside, aside *, nav, nav *')) if (el.scrollTop > 0) el.scrollTop = 0;
  });
  await p.waitForTimeout(extra);
}

async function save(buf, name, width = 1600) {
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(OUT, `${name}.webp`));
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;
const want = (n) => !only || only.includes(n);

if (want('dashboard')) {
  const { ctx, page: p } = await open('/dashboard', { height: 1000 });
  await save(await p.screenshot(), 'admin-dashboard');
  await ctx.close();
}
if (want('vehicles')) {
  const { ctx, page: p } = await open('/vehicles');
  await save(await p.screenshot(), 'admin-vehicles');
  await ctx.close();
}
if (want('drivers')) {
  const { ctx, page: p } = await open('/drivers');
  await save(await p.screenshot(), 'admin-drivers');
  await ctx.close();
}
if (want('tests')) {
  const { ctx, page: p } = await open('/upcoming-tests');
  await save(await p.screenshot(), 'admin-tests');
  await ctx.close();
}
if (want('chat')) {
  const { ctx, page: p } = await open('/chat');
  const first = p.locator('text=Thanks, I will drop it at the depot').first();
  if (await first.count()) {
    await first.click();
    await settle(p, 1000);
  }
  await save(await p.screenshot(), 'admin-chat');
  await ctx.close();
}
if (want('reports')) {
  const { ctx, page: p } = await open('/reports');
  await save(await p.screenshot(), 'admin-reports');
  await ctx.close();
}
if (want('dark')) {
  const { ctx, page: p } = await open('/bookings', { dark: true });
  await save(await p.screenshot(), 'admin-bookings-dark');
  await ctx.close();
}

await browser.close();
