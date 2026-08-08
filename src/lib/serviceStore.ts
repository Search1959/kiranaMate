import {
  ServiceSector,
  ServiceItem,
  Appointment,
  JobCard,
  ServiceStaff,
  ServicePackage,
  ServiceCustomer,
  ServiceInvoice,
  ServiceQuotation,
  ServicePayment,
  ServiceStats,
  AppointmentStatus,
  JobCardStatus,
  PaymentMethod
} from '../types';
import { getServiceSectorConfig, SERVICE_SECTORS } from './serviceSectorConfig';

const SERVICE_STORE_KEY = 'trademate_service_store_v1';
const ACTIVE_SERVICE_SECTOR_KEY = 'trademate_active_service_sector';
const ACTIVE_SERVICE_COMPANY_KEY = 'trademate_active_service_company';
const SERVICE_ACCOUNTS_KEY = 'trademate_service_accounts';

export interface ServiceStoreData {
  activeSector: ServiceSector;
  /** Present only for a real registered company (absent for the shared per-sector demo datasets). */
  companyId?: string;
  businessName?: string;
  ownerName?: string;
  services: ServiceItem[];
  appointments: Appointment[];
  jobCards: JobCard[];
  staff: ServiceStaff[];
  packages: ServicePackage[];
  customers: ServiceCustomer[];
  invoices: ServiceInvoice[];
  quotations: ServiceQuotation[];
  payments: ServicePayment[];
}

/**
 * Directory of real registered Service ERP companies (separate from the
 * shared per-sector demo datasets). Entirely client-side, mirroring how
 * clientStore.ts handles Trading ERP accounts when there's no backend.
 */
export interface ServiceAccountEntry {
  companyId: string;
  username: string;
  password: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  sector: ServiceSector;
  role: 'owner' | 'staff' | 'admin';
}

function loadServiceAccounts(): ServiceAccountEntry[] {
  try {
    const raw = localStorage.getItem(SERVICE_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveServiceAccounts(accounts: ServiceAccountEntry[]) {
  try {
    localStorage.setItem(SERVICE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Error writing service accounts directory', err);
  }
}

export function generateSeedServiceData(sector: ServiceSector): ServiceStoreData {
  const cfg = getServiceSectorConfig(sector);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const services: ServiceItem[] = cfg.defaultServices.map((s, idx) => ({
    ...s,
    id: `srv-${idx + 1}`,
    sector
  }));

  const staff: ServiceStaff[] = cfg.defaultStaff.map((st, idx) => ({
    ...st,
    id: `stf-${idx + 1}`
  }));

  const packages: ServicePackage[] = cfg.defaultPackages.map((pk, idx) => ({
    ...pk,
    id: `pkg-${idx + 1}`,
    sector
  }));

  const customers: ServiceCustomer[] = [
    {
      id: 'scust-1',
      name: 'Anand Sharma',
      mobile: '9820011223',
      email: 'anand.s@gmail.com',
      address: 'Flat 402, Green Heights, Main Road',
      sector,
      totalSpent: 4200,
      activeJobsCount: 1,
      activeAppointmentsCount: 1,
      amcStatus: 'Active',
      amcExpiryDate: '2027-03-31',
      notes: 'VIP Recurring Customer. Prefers morning appointments.',
      createdAt: todayStr
    },
    {
      id: 'scust-2',
      name: 'Priya Verma',
      mobile: '9821122334',
      email: 'priya.v@yahoo.com',
      address: '12-B, Commercial Plaza',
      sector,
      totalSpent: 1800,
      activeJobsCount: 0,
      activeAppointmentsCount: 1,
      amcStatus: 'None',
      notes: 'Regular monthly client.',
      createdAt: todayStr
    },
    {
      id: 'scust-3',
      name: 'Rohan Gupta',
      mobile: '9832233445',
      email: 'rohan.gupta@corp.com',
      address: 'Shop 5, Industrial Estate',
      sector,
      totalSpent: 8500,
      activeJobsCount: 1,
      activeAppointmentsCount: 0,
      amcStatus: 'Expired',
      notes: 'Commercial account.',
      createdAt: todayStr
    }
  ];

  const appointments: Appointment[] = [
    {
      id: 'app-101',
      customerId: 'scust-1',
      customerName: 'Anand Sharma',
      mobile: '9820011223',
      serviceId: services[0]?.id || 'srv-1',
      serviceName: services[0]?.name || 'Standard Service',
      serviceSector: sector,
      staffId: staff[0]?.id,
      staffName: staff[0]?.name || 'Senior Specialist',
      date: todayStr,
      time: '10:30',
      status: 'Scheduled',
      notes: 'First morning slot requested',
      totalAmount: services[0]?.price || 500,
      paidAmount: 0,
      createdAt: todayStr
    },
    {
      id: 'app-102',
      customerId: 'scust-2',
      customerName: 'Priya Verma',
      mobile: '9821122334',
      serviceId: services[1]?.id || services[0]?.id || 'srv-1',
      serviceName: services[1]?.name || 'Special Care Package',
      serviceSector: sector,
      staffId: staff[1]?.id || staff[0]?.id,
      staffName: staff[1]?.name || staff[0]?.name || 'Assigned Specialist',
      date: todayStr,
      time: '14:00',
      status: 'In-Progress',
      notes: 'Requested expert staff review',
      totalAmount: services[1]?.price || 1200,
      paidAmount: 500,
      createdAt: todayStr
    }
  ];

  const jobCards: JobCard[] = [
    {
      id: 'job-101',
      jobNo: 'JOB-2026-001',
      customerId: 'scust-3',
      customerName: 'Rohan Gupta',
      mobile: '9832233445',
      serviceSector: sector,
      assignedStaffId: staff[0]?.id,
      assignedStaffName: staff[0]?.name || 'Lead Technician',
      status: 'In-Progress',
      priority: 'High',
      issueDescription: `Urgent ${cfg.name} work order execution requested with component replacement.`,
      deviceOrVehicleInfo: `${cfg.name} Work Order #001`,
      partsUsed: [
        { id: 'p1', name: 'Original Spare Component', quantity: 1, unitPrice: 1500, totalPrice: 1500 }
      ],
      labourCharges: 800,
      materialCharges: 1500,
      totalAmount: 2300,
      paidAmount: 1000,
      balanceAmount: 1300,
      estimatedCompletionDate: todayStr,
      remarks: 'In progress at workstation #2',
      createdAt: todayStr
    },
    {
      id: 'job-102',
      jobNo: 'JOB-2026-002',
      customerId: 'scust-1',
      customerName: 'Anand Sharma',
      mobile: '9820011223',
      serviceSector: sector,
      assignedStaffId: staff[1]?.id || staff[0]?.id,
      assignedStaffName: staff[1]?.name || staff[0]?.name || 'Technician',
      status: 'Pending',
      priority: 'Medium',
      issueDescription: 'Scheduled maintenance checkup & routine inspection.',
      deviceOrVehicleInfo: `${cfg.name} Work Order #002`,
      partsUsed: [],
      labourCharges: 500,
      materialCharges: 0,
      totalAmount: 500,
      paidAmount: 0,
      balanceAmount: 500,
      estimatedCompletionDate: todayStr,
      remarks: 'Awaiting client confirmation',
      createdAt: todayStr
    }
  ];

  const invoices: ServiceInvoice[] = [
    {
      id: 'sinv-1001',
      invoiceNo: 'SRV-INV-1001',
      customerId: 'scust-2',
      customerName: 'Priya Verma',
      mobile: '9821122334',
      date: todayStr,
      items: [
        { id: 'i1', name: services[0]?.name || 'Service Item', type: 'SERVICE', price: services[0]?.price || 500, quantity: 1, total: services[0]?.price || 500 }
      ],
      labourCharges: 200,
      materialCharges: 0,
      discount: 50,
      gstAmount: 117,
      grandTotal: (services[0]?.price || 500) + 200 - 50 + 117,
      paidAmount: (services[0]?.price || 500) + 200 - 50 + 117,
      balanceAmount: 0,
      paymentMethod: 'UPI',
      status: 'PAID',
      createdAt: todayStr
    }
  ];

  const quotations: ServiceQuotation[] = [
    {
      id: 'squote-1',
      quoteNo: 'EST-2026-01',
      customerId: 'scust-3',
      customerName: 'Rohan Gupta',
      mobile: '9832233445',
      date: todayStr,
      validUntil: '2026-08-30',
      items: [
        { id: 'q1', name: 'Comprehensive Service & Upgrade', type: 'SERVICE', price: 3500, quantity: 1, total: 3500 },
        { id: 'q2', name: 'Heavy Duty Replacement Material', type: 'MATERIAL', price: 1200, quantity: 1, total: 1200 }
      ],
      labourCharges: 800,
      materialCharges: 1200,
      discount: 200,
      gstAmount: 954,
      grandTotal: 6254,
      status: 'Sent',
      notes: 'Estimate generated for complete commercial overhaul',
      createdAt: todayStr
    }
  ];

  const payments: ServicePayment[] = [
    {
      id: 'spay-1',
      receiptNo: 'REC-2026-01',
      customerId: 'scust-2',
      customerName: 'Priya Verma',
      amount: 767,
      date: todayStr,
      method: 'UPI',
      referenceNo: 'UPI9837192837',
      invoiceId: 'sinv-1001',
      notes: 'Full payment received via GPay',
      createdAt: todayStr
    }
  ];

  return {
    activeSector: sector,
    services,
    appointments,
    jobCards,
    staff,
    packages,
    customers,
    invoices,
    quotations,
    payments
  };
}

export class ServiceStoreManager {
  private data: ServiceStoreData;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): ServiceStoreData {
    try {
      // A real registered company takes priority over the shared per-sector demo.
      const companyId = localStorage.getItem(ACTIVE_SERVICE_COMPANY_KEY);
      if (companyId) {
        const raw = localStorage.getItem(`${SERVICE_STORE_KEY}_${companyId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.services) return parsed;
        }
      }
      const activeSector = (localStorage.getItem(ACTIVE_SERVICE_SECTOR_KEY) as ServiceSector) || 'SALON';
      const raw = localStorage.getItem(`${SERVICE_STORE_KEY}_${activeSector}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.services) return parsed;
      }
      return generateSeedServiceData(activeSector);
    } catch {
      return generateSeedServiceData('SALON');
    }
  }

  private saveToStorage() {
    try {
      const key = this.data.companyId || this.data.activeSector;
      if (this.data.companyId) {
        localStorage.setItem(ACTIVE_SERVICE_COMPANY_KEY, this.data.companyId);
      }
      localStorage.setItem(ACTIVE_SERVICE_SECTOR_KEY, this.data.activeSector);
      localStorage.setItem(`${SERVICE_STORE_KEY}_${key}`, JSON.stringify(this.data));
    } catch (err) {
      console.error("Error writing service store to localStorage", err);
    }
  }

  // Active Sector Switching
  getActiveSector(): ServiceSector {
    return this.data.activeSector;
  }

  /** Switches to a shared per-sector demo dataset — leaves any logged-in company. */
  setActiveSector(sector: ServiceSector) {
    if (this.data.activeSector === sector && !this.data.companyId) return;
    try {
      localStorage.removeItem(ACTIVE_SERVICE_COMPANY_KEY);
      localStorage.setItem(ACTIVE_SERVICE_SECTOR_KEY, sector);
      const raw = localStorage.getItem(`${SERVICE_STORE_KEY}_${sector}`);
      if (raw) {
        this.data = JSON.parse(raw);
      } else {
        this.data = generateSeedServiceData(sector);
      }
      this.saveToStorage();
    } catch {
      this.data = generateSeedServiceData(sector);
    }
  }

  getData(): ServiceStoreData {
    return this.data;
  }

  getCompanyMeta(): { companyId?: string; businessName?: string; ownerName?: string } {
    return {
      companyId: this.data.companyId,
      businessName: this.data.businessName,
      ownerName: this.data.ownerName
    };
  }

  /** Updates business profile fields for a real registered company (no-op for shared demo datasets). */
  updateCompanyProfile(updates: { businessName?: string; ownerName?: string }) {
    if (!this.data.companyId) return;
    if (updates.businessName !== undefined) this.data.businessName = updates.businessName;
    if (updates.ownerName !== undefined) this.data.ownerName = updates.ownerName;

    const accounts = loadServiceAccounts();
    const idx = accounts.findIndex(a => a.companyId === this.data.companyId);
    if (idx >= 0) {
      if (updates.businessName !== undefined) accounts[idx].businessName = updates.businessName;
      if (updates.ownerName !== undefined) accounts[idx].ownerName = updates.ownerName;
      saveServiceAccounts(accounts);
    }

    this.saveToStorage();
  }

  // --- Multi-tenant company accounts (Sign Up / Login) ---

  registerCompany(payload: {
    businessName: string;
    ownerName: string;
    mobile: string;
    username: string;
    password: string;
    sector: ServiceSector;
  }): { companyId: string; sector: ServiceSector } {
    const cleanUsername = payload.username.trim().toLowerCase();
    if (!cleanUsername) throw new Error('Please enter a username.');

    const accounts = loadServiceAccounts();
    if (accounts.some(a => a.username === cleanUsername)) {
      throw new Error('This username is already registered. Please login instead, or choose another username.');
    }

    const companyId = `svc-co-${Date.now()}`;
    accounts.push({
      companyId,
      username: cleanUsername,
      password: payload.password.trim() || '123456',
      businessName: payload.businessName || `${payload.sector} Business`,
      ownerName: payload.ownerName || 'Business Owner',
      mobile: payload.mobile || '9876543210',
      sector: payload.sector,
      role: 'owner'
    });
    saveServiceAccounts(accounts);

    const emptyData: ServiceStoreData = {
      activeSector: payload.sector,
      companyId,
      businessName: payload.businessName,
      ownerName: payload.ownerName,
      services: [],
      appointments: [],
      jobCards: [],
      staff: [],
      packages: [],
      customers: [],
      invoices: [],
      quotations: [],
      payments: []
    };

    this.data = emptyData;
    this.saveToStorage();

    return { companyId, sector: payload.sector };
  }

  loginCompany(username: string, password: string): {
    companyId: string;
    sector: ServiceSector;
    businessName: string;
    ownerName: string;
    role: 'owner' | 'staff' | 'admin';
  } {
    const cleanUsername = username.trim().toLowerCase();
    const accounts = loadServiceAccounts();
    const found = accounts.find(a => a.username === cleanUsername);

    if (!found) {
      throw new Error('Account not found. Please check your username, or sign up as a new company.');
    }
    if (found.password && found.password !== password.trim()) {
      throw new Error('Incorrect password. Please try again.');
    }

    const raw = localStorage.getItem(`${SERVICE_STORE_KEY}_${found.companyId}`);
    this.data = raw ? JSON.parse(raw) : generateSeedServiceData(found.sector);
    this.data.companyId = found.companyId;
    this.data.businessName = found.businessName;
    this.data.ownerName = found.ownerName;
    this.saveToStorage();

    return {
      companyId: found.companyId,
      sector: found.sector,
      businessName: found.businessName,
      ownerName: found.ownerName,
      role: found.role
    };
  }

  // Services
  getServices(): ServiceItem[] {
    return this.data.services || [];
  }

  addService(item: Omit<ServiceItem, 'id' | 'sector'>): ServiceItem {
    const newItem: ServiceItem = {
      ...item,
      id: `srv-${Date.now()}`,
      sector: this.data.activeSector
    };
    this.data.services = [newItem, ...this.data.services];
    this.saveToStorage();
    return newItem;
  }

  deleteService(id: string) {
    this.data.services = this.data.services.filter(s => s.id !== id);
    this.saveToStorage();
  }

  // Appointments
  getAppointments(): Appointment[] {
    return this.data.appointments || [];
  }

  addAppointment(app: Omit<Appointment, 'id' | 'createdAt' | 'serviceSector'>): Appointment {
    const newApp: Appointment = {
      ...app,
      id: `app-${Date.now()}`,
      serviceSector: this.data.activeSector,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.data.appointments = [newApp, ...this.data.appointments];
    this.saveToStorage();
    return newApp;
  }

  updateAppointmentStatus(id: string, status: AppointmentStatus) {
    this.data.appointments = this.data.appointments.map(a =>
      a.id === id ? { ...a, status } : a
    );
    this.saveToStorage();
  }

  // Job Cards
  getJobCards(): JobCard[] {
    return this.data.jobCards || [];
  }

  addJobCard(job: Omit<JobCard, 'id' | 'jobNo' | 'createdAt' | 'serviceSector'>): JobCard {
    const randomNo = Math.floor(100 + Math.random() * 900);
    const newJob: JobCard = {
      ...job,
      id: `job-${Date.now()}`,
      jobNo: `JOB-2026-${randomNo}`,
      serviceSector: this.data.activeSector,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.data.jobCards = [newJob, ...this.data.jobCards];
    this.saveToStorage();
    return newJob;
  }

  updateJobCardStatus(id: string, status: JobCardStatus) {
    this.data.jobCards = this.data.jobCards.map(j =>
      j.id === id ? { ...j, status, ...(status === 'Completed' ? { actualCompletionDate: new Date().toISOString().split('T')[0] } : {}) } : j
    );
    this.saveToStorage();
  }

  // Staff
  getStaff(): ServiceStaff[] {
    return this.data.staff || [];
  }

  addStaff(st: Omit<ServiceStaff, 'id'>): ServiceStaff {
    const newStaff: ServiceStaff = {
      ...st,
      id: `stf-${Date.now()}`
    };
    this.data.staff = [...this.data.staff, newStaff];
    this.saveToStorage();
    return newStaff;
  }

  // Packages
  getPackages(): ServicePackage[] {
    return this.data.packages || [];
  }

  addPackage(pkg: Omit<ServicePackage, 'id' | 'sector'>): ServicePackage {
    const newPkg: ServicePackage = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      sector: this.data.activeSector
    };
    this.data.packages = [...this.data.packages, newPkg];
    this.saveToStorage();
    return newPkg;
  }

  // Customers
  getCustomers(): ServiceCustomer[] {
    return this.data.customers || [];
  }

  addCustomer(c: Omit<ServiceCustomer, 'id' | 'createdAt' | 'sector' | 'totalSpent' | 'activeJobsCount' | 'activeAppointmentsCount'>): ServiceCustomer {
    const newCust: ServiceCustomer = {
      ...c,
      id: `scust-${Date.now()}`,
      sector: this.data.activeSector,
      totalSpent: 0,
      activeJobsCount: 0,
      activeAppointmentsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.data.customers = [newCust, ...this.data.customers];
    this.saveToStorage();
    return newCust;
  }

  // Invoices
  getInvoices(): ServiceInvoice[] {
    return this.data.invoices || [];
  }

  createInvoice(inv: Omit<ServiceInvoice, 'id' | 'invoiceNo' | 'createdAt'>): ServiceInvoice {
    const randomNo = Math.floor(1000 + Math.random() * 9000);
    const newInv: ServiceInvoice = {
      ...inv,
      id: `sinv-${Date.now()}`,
      invoiceNo: `SRV-INV-${randomNo}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.data.invoices = [newInv, ...this.data.invoices];

    // If payment made, record payment log
    if (newInv.paidAmount > 0) {
      this.addPayment({
        customerId: newInv.customerId,
        customerName: newInv.customerName,
        amount: newInv.paidAmount,
        date: newInv.date,
        method: newInv.paymentMethod,
        invoiceId: newInv.id,
        notes: `Payment for Invoice ${newInv.invoiceNo}`
      });
    }

    this.saveToStorage();
    return newInv;
  }

  // Quotations
  getQuotations(): ServiceQuotation[] {
    return this.data.quotations || [];
  }

  createQuotation(q: Omit<ServiceQuotation, 'id' | 'quoteNo' | 'createdAt'>): ServiceQuotation {
    const randomNo = Math.floor(100 + Math.random() * 900);
    const newQuote: ServiceQuotation = {
      ...q,
      id: `squote-${Date.now()}`,
      quoteNo: `EST-2026-${randomNo}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.data.quotations = [newQuote, ...this.data.quotations];
    this.saveToStorage();
    return newQuote;
  }

  convertQuotationToJobCard(quoteId: string): JobCard {
    const q = this.data.quotations.find(item => item.id === quoteId);
    if (!q) throw new Error('Quotation not found');

    const job = this.addJobCard({
      customerId: q.customerId,
      customerName: q.customerName,
      mobile: q.mobile,
      status: 'Pending',
      priority: 'Medium',
      issueDescription: `Converted from Quotation ${q.quoteNo}`,
      partsUsed: q.items.filter(i => i.type === 'MATERIAL').map(i => ({ id: i.id, name: i.name, quantity: i.quantity, unitPrice: i.price, totalPrice: i.total })),
      labourCharges: q.labourCharges,
      materialCharges: q.materialCharges,
      totalAmount: q.grandTotal,
      paidAmount: 0,
      balanceAmount: q.grandTotal,
      estimatedCompletionDate: new Date().toISOString().split('T')[0]
    });

    this.data.quotations = this.data.quotations.map(item =>
      item.id === quoteId ? { ...item, status: 'ConvertedToJob' } : item
    );
    this.saveToStorage();
    return job;
  }

  convertQuotationToInvoice(quoteId: string, paymentMethod: PaymentMethod = 'UPI'): ServiceInvoice {
    const q = this.data.quotations.find(item => item.id === quoteId);
    if (!q) throw new Error('Quotation not found');

    const inv = this.createInvoice({
      customerId: q.customerId,
      customerName: q.customerName,
      mobile: q.mobile,
      date: new Date().toISOString().split('T')[0],
      items: q.items,
      labourCharges: q.labourCharges,
      materialCharges: q.materialCharges,
      discount: q.discount,
      gstAmount: q.gstAmount,
      grandTotal: q.grandTotal,
      paidAmount: q.grandTotal,
      balanceAmount: 0,
      paymentMethod,
      status: 'PAID'
    });

    this.data.quotations = this.data.quotations.map(item =>
      item.id === quoteId ? { ...item, status: 'ConvertedToInvoice' } : item
    );
    this.saveToStorage();
    return inv;
  }

  // Payments
  getPayments(): ServicePayment[] {
    return this.data.payments || [];
  }

  addPayment(pay: Omit<ServicePayment, 'id' | 'receiptNo' | 'createdAt'>): ServicePayment {
    const randomNo = Math.floor(100 + Math.random() * 900);
    const newPay: ServicePayment = {
      ...pay,
      id: `spay-${Date.now()}`,
      receiptNo: `REC-2026-${randomNo}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.data.payments = [newPay, ...this.data.payments];
    this.saveToStorage();
    return newPay;
  }

  // Calculated Service Stats
  getStats(): ServiceStats {
    const todayStr = new Date().toISOString().split('T')[0];
    const apps = this.getAppointments();
    const jobs = this.getJobCards();
    const invs = this.getInvoices();
    const staff = this.getStaff();

    const todayApps = apps.filter(a => a.date === todayStr);
    const todayJobs = jobs.filter(j => j.createdAt === todayStr);
    const pendingJobs = jobs.filter(j => j.status === 'Pending' || j.status === 'In-Progress');
    const completedJobs = jobs.filter(j => j.status === 'Completed' || j.status === 'Delivered');

    const todayInvs = invs.filter(i => i.date === todayStr);
    const todayRev = todayInvs.reduce((acc, i) => acc + i.paidAmount, 0);

    const totalOutstanding = jobs.reduce((acc, j) => acc + j.balanceAmount, 0) +
      invs.reduce((acc, i) => acc + i.balanceAmount, 0);

    const activeStaff = staff.filter(s => s.status === 'Active').length;
    const avgRating = staff.length > 0 ? (staff.reduce((acc, s) => acc + s.rating, 0) / staff.length) : 4.8;

    return {
      todayAppointmentsCount: todayApps.length,
      todayJobsCount: todayJobs.length,
      pendingJobsCount: pendingJobs.length,
      completedJobsCount: completedJobs.length,
      todayRevenue: todayRev,
      outstandingPayments: totalOutstanding,
      todayCustomersCount: new Set([...todayApps.map(a => a.customerId), ...todayJobs.map(j => j.customerId)]).size,
      monthlyIncome: invs.reduce((acc, i) => acc + i.paidAmount, 0),
      activeStaffCount: activeStaff,
      averageRating: parseFloat(avgRating.toFixed(1))
    };
  }
}

export const serviceStore = new ServiceStoreManager();
