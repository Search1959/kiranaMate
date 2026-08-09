/**
 * Firestore's setDoc() throws "invalid-argument" if ANY field, anywhere in
 * the object tree, is explicitly `undefined` (as opposed to simply omitted).
 * That's an easy trap: a form that does `foo: bar || undefined` for an
 * optional field left blank looks completely fine in the UI — the local
 * save succeeds, no error is shown — but the background cloud sync silently
 * throws and the write never lands. The data only looks safe until the
 * local copy is gone (a redeploy, a cleared browser, a different device).
 *
 * Call this on any object right before setDoc() so a blank optional field
 * anywhere in the app can never silently break a cloud sync again.
 */
export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(v => stripUndefinedDeep(v)) as unknown as T;
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[key] = stripUndefinedDeep(v);
    }
    return out as T;
  }
  return value;
}
