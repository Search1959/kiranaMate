import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Client-side (browser) Firestore access for Trading ERP stores.
 *
 * Same reasoning as src/lib/serviceCloud.ts: neither deinrimshop.netlify.app
 * nor a Hostinger static deploy ever runs server.ts (Express), so the
 * previous purely-localStorage fallback in clientStore.ts meant every
 * hosting — and every browser — had its own disconnected copy of "the same"
 * store. Talking to Firestore directly from the browser fixes that: it's
 * the SAME `stores/{storeId}` collection server.ts already reads/writes
 * when it does run, so this stays consistent with the real backend too.
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

/** Best-effort read — returns null on any failure (offline, not found, etc.) rather than throwing. */
export async function cloudFetchStore(storeId: string): Promise<any | null> {
  const db = getCloudFirestore();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'stores', storeId));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error(`Failed to fetch store [${storeId}] from cloud:`, err);
    return null;
  }
}

/** Best-effort background sync — never throws, safe to fire-and-forget. */
export async function cloudSaveStore(storeId: string, data: any): Promise<void> {
  const db = getCloudFirestore();
  if (!db) return;
  try {
    await setDoc(doc(db, 'stores', storeId), { ...data, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error(`Failed to sync store [${storeId}] to cloud:`, err);
  }
}

/**
 * Username -> storeId directory for self-registered stores (so logging in
 * with the same username from a different browser/hosting finds the same
 * store). Predefined demo accounts and the plain "store-demo*" family don't
 * need this — their storeId is already fixed/known everywhere.
 */
export async function cloudLookupUsername(username: string): Promise<{ storeId: string } | null> {
  const db = getCloudFirestore();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'tradingAccounts', username));
    return snap.exists() ? (snap.data() as { storeId: string }) : null;
  } catch (err) {
    console.error(`Failed to look up trading account [${username}] in cloud:`, err);
    return null;
  }
}

/** Best-effort — never throws, safe to fire-and-forget. */
export async function cloudRegisterUsername(username: string, storeId: string): Promise<void> {
  const db = getCloudFirestore();
  if (!db) return;
  try {
    await setDoc(doc(db, 'tradingAccounts', username), { storeId, createdAt: new Date().toISOString() });
  } catch (err) {
    console.error(`Failed to register trading account [${username}] in cloud:`, err);
  }
}
