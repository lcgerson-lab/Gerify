import { useState, useEffect } from 'react';

const DB_NAME = 'gerify_db';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function useIndexedDB(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const existing = await idbGet(key);
        if (existing !== undefined) {
          if (!cancelled) setStoredValue(existing);
          return;
        }
        const legacy = window.localStorage.getItem(key);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          await idbSet(key, parsed);
          window.localStorage.removeItem(key);
          if (!cancelled) setStoredValue(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const setValue = (value) => {
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      idbSet(key, valueToStore).catch((e) => console.error(e));
      return valueToStore;
    });
  };

  return [storedValue, setValue];
}
