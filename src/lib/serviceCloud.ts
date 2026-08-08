import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { ServiceSector } from '../types';
import { ServiceStoreData } from './serviceStore';

/**
 * Client-side (browser) Firestore access for Service ERP company accounts.
 *
 * This is deliberately independent of server.ts / src/server/firestore.ts —
 * those only run under `npm run dev` (the Express server), which is NOT what
 * serves the real deployed site (Netlify only ships the static frontend).
 * Talking to Firestore directly from the browser means Service ERP accounts
 * work the same way whether running locally or on the live deployed site,
 * since Firestore is reachable straight from any browser with this public
 * web config (the same one server.ts already uses — Firebase web API keys
 * identify a project, they aren't a secret by themselves; access control is
 * whatever the project's Firestore rules say).
 */

const FIREBASE_CONFIG = {
  projectId: 'hardy-diorama-njlsj',
  appId: '1:445494552671:web:577c81c63b3575f41153ea',
  apiKey: 'AIzaSyAvjyq5UfqqQ2bf6S3MMcGQzN7YeAnjIq0',
  authDomain: 'hardy-diorama-njlsj.firebaseapp.com',
  storageBucket: 'hardy-diorama-njlsj.firebasestorage.app',
  messagingSenderId: '445494552671'
};
const FIRESTORE_DATABASE_ID = 'ai-studio-kiranamatekirana-b469a4d4-4021-4b52-8ca6-84ca871ae68e';

let firestoreInstance: ReturnType<typeof getFirestore> | null = null;

function getCloudFirestore() {
  if (firestoreInstance) return firestoreInstance;
  try {
    const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
    firestoreInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
    return firestoreInstance;
  } catch (err) {
    console.error('Failed to initialize client-side Cloud Firestore:', err);
    return null;
  }
}

/** Thrown when Firestore itself can't be reached (offline, blocked, etc.) — callers should fall back to local-only mode. */
export class CloudUnavailableError extends Error {
  constructor() {
    super('CLOUD_UNAVAILABLE');
    this.name = 'CloudUnavailableError';
  }
}

export interface CloudServiceAccount {
  companyId: string;
  username: string;
  password: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  sector: ServiceSector;
  role: 'owner' | 'staff' | 'admin';
  createdAt: string;
}

export async function cloudRegisterCompany(payload: {
  businessName: string;
  ownerName: string;
  mobile: string;
  username: string;
  password: string;
  sector: ServiceSector;
}): Promise<{ companyId: string; sector: ServiceSector }> {
  const db = getCloudFirestore();
  if (!db) throw new CloudUnavailableError();

  const cleanUsername = payload.username.trim().toLowerCase();

  let existing;
  try {
    existing = await getDoc(doc(db, 'serviceAccounts', cleanUsername));
  } catch {
    throw new CloudUnavailableError();
  }
  if (existing.exists()) {
    throw new Error('This username is already registered. Please login instead, or choose another username.');
  }

  const companyId = `svc-co-${Date.now()}`;
  const account: CloudServiceAccount = {
    companyId,
    username: cleanUsername,
    password: payload.password.trim() || '123456',
    businessName: payload.businessName,
    ownerName: payload.ownerName,
    mobile: payload.mobile || '9876543210',
    sector: payload.sector,
    role: 'owner',
    createdAt: new Date().toISOString()
  };

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

  await setDoc(doc(db, 'serviceAccounts', cleanUsername), account);
  await setDoc(doc(db, 'serviceCompanies', companyId), emptyData as any);

  return { companyId, sector: payload.sector };
}

export async function cloudLoginCompany(username: string, password: string): Promise<{
  companyId: string;
  sector: ServiceSector;
  businessName: string;
  ownerName: string;
  role: 'owner' | 'staff' | 'admin';
  data: ServiceStoreData | null;
}> {
  const db = getCloudFirestore();
  if (!db) throw new CloudUnavailableError();

  const cleanUsername = username.trim().toLowerCase();

  let accountSnap;
  try {
    accountSnap = await getDoc(doc(db, 'serviceAccounts', cleanUsername));
  } catch {
    throw new CloudUnavailableError();
  }
  if (!accountSnap.exists()) {
    throw new Error('Account not found. Please check your username, or sign up as a new company.');
  }
  const account = accountSnap.data() as CloudServiceAccount;
  if (account.password && account.password !== password.trim()) {
    throw new Error('Incorrect password. Please try again.');
  }

  const companySnap = await getDoc(doc(db, 'serviceCompanies', account.companyId));
  const data = companySnap.exists() ? (companySnap.data() as ServiceStoreData) : null;

  return {
    companyId: account.companyId,
    sector: account.sector,
    businessName: account.businessName,
    ownerName: account.ownerName,
    role: account.role,
    data
  };
}

/** Best-effort background sync — never throws, safe to fire-and-forget. */
export async function cloudSaveCompanyData(companyId: string, data: ServiceStoreData): Promise<void> {
  const db = getCloudFirestore();
  if (!db) return;
  try {
    await setDoc(doc(db, 'serviceCompanies', companyId), { ...data, updatedAt: new Date().toISOString() } as any);
  } catch (err) {
    console.error(`Failed to sync service company [${companyId}] to cloud:`, err);
  }
}

/** Best-effort background sync — never throws, safe to fire-and-forget. */
export async function cloudUpdateAccountProfile(username: string, updates: { businessName?: string; ownerName?: string }): Promise<void> {
  const db = getCloudFirestore();
  if (!db) return;
  try {
    await setDoc(doc(db, 'serviceAccounts', username.trim().toLowerCase()), updates, { merge: true });
  } catch (err) {
    console.error('Failed to update service account profile in cloud:', err);
  }
}

/** Full admin-panel update of a company's account record (credentials + profile). Best-effort. */
export async function cloudAdminUpdateAccount(username: string, updates: Partial<CloudServiceAccount>): Promise<void> {
  const db = getCloudFirestore();
  if (!db) return;
  try {
    const cleanUsername = username.trim().toLowerCase();
    await setDoc(doc(db, 'serviceAccounts', cleanUsername), updates, { merge: true });
    if (updates.businessName !== undefined || updates.ownerName !== undefined) {
      const accountSnap = await getDoc(doc(db, 'serviceAccounts', cleanUsername));
      const companyId = accountSnap.exists() ? (accountSnap.data() as CloudServiceAccount).companyId : undefined;
      if (companyId) {
        const patch: any = {};
        if (updates.businessName !== undefined) patch.businessName = updates.businessName;
        if (updates.ownerName !== undefined) patch.ownerName = updates.ownerName;
        await setDoc(doc(db, 'serviceCompanies', companyId), patch, { merge: true });
      }
    }
  } catch (err) {
    console.error(`Failed to admin-update service account [${username}] in cloud:`, err);
  }
}

/**
 * Lists every registered Service ERP company across every hosting/browser —
 * this is what makes the System Admin registry "auto sync" a new Service
 * signup regardless of where it happened. Best-effort: returns [] if the
 * cloud is unreachable.
 */
export async function cloudListAllServiceAccounts(): Promise<CloudServiceAccount[]> {
  const db = getCloudFirestore();
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'serviceAccounts'));
    return snap.docs.map(d => d.data() as CloudServiceAccount);
  } catch (err) {
    console.error('Failed to list service accounts from cloud:', err);
    return [];
  }
}

/** Best-effort read of a company's live data (for admin "data volume" counts). */
export async function cloudFetchCompanyData(companyId: string): Promise<ServiceStoreData | null> {
  const db = getCloudFirestore();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'serviceCompanies', companyId));
    return snap.exists() ? (snap.data() as ServiceStoreData) : null;
  } catch (err) {
    console.error(`Failed to fetch service company [${companyId}] from cloud:`, err);
    return null;
  }
}

/** Best-effort — never throws, safe to fire-and-forget. */
export async function cloudDeleteAccount(username: string, companyId?: string): Promise<void> {
  const db = getCloudFirestore();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'serviceAccounts', username.trim().toLowerCase()));
    if (companyId) {
      await deleteDoc(doc(db, 'serviceCompanies', companyId));
    }
  } catch (err) {
    console.error(`Failed to delete service account [${username}] from cloud:`, err);
  }
}
