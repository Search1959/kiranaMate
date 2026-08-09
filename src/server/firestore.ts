import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let firestoreInstance: ReturnType<typeof getFirestore> | null = null;

export function getCloudFirestore() {
  if (firestoreInstance) return firestoreInstance;

  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
      const databaseId = config.firestoreDatabaseId || undefined;
      firestoreInstance = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
      console.log('🔥 Cloud Firestore Database Connected Successfully! Project ID:', config.projectId);
      return firestoreInstance;
    }
  } catch (err) {
    console.error('Error initializing Cloud Firestore:', err);
  }
  return null;
}

// Cloud sync functions for store data
export async function saveStoreToCloud(storeId: string, storeData: any) {
  const db = getCloudFirestore();
  if (!db) return;
  try {
    const ref = doc(db, 'stores', storeId);
    await setDoc(ref, {
      ...storeData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`☁️ Cloud Firestore: Store [${storeId}] synced successfully.`);
  } catch (err) {
    console.error(`Failed to sync store [${storeId}] to Cloud Firestore:`, err);
  }
}

export async function fetchStoreFromCloud(storeId: string) {
  const db = getCloudFirestore();
  if (!db) return null;
  try {
    const ref = doc(db, 'stores', storeId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.error(`Failed to fetch store [${storeId}] from Cloud Firestore:`, err);
  }
  return null;
}

/**
 * Durable username -> storeId directory, shared with the client-side fallback
 * (src/lib/tradingCloud.ts writes the exact same `tradingAccounts` collection).
 * This is what lets a login find an EXISTING store after the server process
 * restarts (a redeploy, a crash, a host recycling the dyno) instead of the
 * in-memory-only getUserByUsername() coming up empty and silently creating a
 * brand-new store with a fresh random ID, orphaning all the real data that
 * was in the original one. This was a real, serious bug — see the session
 * this fix was written in.
 */
export async function saveUsernameDirectory(username: string, storeId: string): Promise<void> {
  const db = getCloudFirestore();
  if (!db) return;
  try {
    await setDoc(doc(db, 'tradingAccounts', username.trim().toLowerCase()), {
      storeId,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error(`Failed to register username [${username}] in cloud directory:`, err);
  }
}

export async function lookupUsernameDirectory(username: string): Promise<{ storeId: string } | null> {
  const db = getCloudFirestore();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'tradingAccounts', username.trim().toLowerCase()));
    return snap.exists() ? (snap.data() as { storeId: string }) : null;
  } catch (err) {
    console.error(`Failed to look up username [${username}] in cloud directory:`, err);
    return null;
  }
}

/** Every known username -> storeId pair, used to proactively re-hydrate all
 * real accounts on server startup, not just the ones a stale local snapshot
 * already happens to know about. */
export async function listAllUsernameDirectoryEntries(): Promise<{ username: string; storeId: string }[]> {
  const db = getCloudFirestore();
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'tradingAccounts'));
    return snap.docs.map(d => ({ username: d.id, storeId: (d.data() as any).storeId }));
  } catch (err) {
    console.error('Failed to list username directory from cloud:', err);
    return [];
  }
}
