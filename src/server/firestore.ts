import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
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
