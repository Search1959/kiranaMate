import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

/**
 * Client-side (browser) Firestore access for the System Admin's own
 * subscription billing ledger — what each real Trading/Service ERP account
 * owes Deinrim for platform use, separate from anything inside a store's own
 * bookkeeping. Same reasoning and same project/database as tradingCloud.ts /
 * serviceCloud.ts: no server runs on the static hosts, so this talks to
 * Firestore directly so the ledger is the same regardless of which device or
 * hosting the admin is looking from.
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

export interface LedgerPayment {
  id: string;
  amount: number;
  date: string; // ISO date
  note?: string;
}

export interface SubscriptionLedgerEntry {
  accountId: string; // matches AdminAccountItem.storeId
  workspaceType: 'trading' | 'service';
  storeName: string;
  monthlyFee: number;
  /** ISO date billing was switched on for this account — NOT the account's
   * original signup date. Backdating to signup would invent debt for months
   * nobody was ever actually being billed for. Defaults to "today" the first
   * time a ledger entry is created for an account. */
  billingStartDate: string;
  payments: LedgerPayment[];
  updatedAt?: string;
}

const COLLECTION = 'subscriptionLedger';

/** Best-effort read — returns null on any failure or if no ledger exists yet for this account. */
export async function cloudGetLedgerEntry(accountId: string): Promise<SubscriptionLedgerEntry | null> {
  const db = getCloudFirestore();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTION, accountId));
    return snap.exists() ? (snap.data() as SubscriptionLedgerEntry) : null;
  } catch (err) {
    console.error(`Failed to fetch subscription ledger [${accountId}]:`, err);
    return null;
  }
}

/** Whole-blob write, matching the same pattern used everywhere else in this app. */
export async function cloudSaveLedgerEntry(entry: SubscriptionLedgerEntry): Promise<void> {
  const db = getCloudFirestore();
  if (!db) return;
  try {
    await setDoc(doc(db, COLLECTION, entry.accountId), { ...entry, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error(`Failed to save subscription ledger [${entry.accountId}]:`, err);
  }
}

/** Loads every ledger entry at once — used to populate the admin's Subscription Ledger tab in one round trip. */
export async function cloudListAllLedgerEntries(): Promise<SubscriptionLedgerEntry[]> {
  const db = getCloudFirestore();
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map(d => d.data() as SubscriptionLedgerEntry);
  } catch (err) {
    console.error('Failed to list subscription ledger entries:', err);
    return [];
  }
}
