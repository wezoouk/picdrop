
const DB_NAME = 'PicDropDB';
const STORE_NAME = 'KeyValueStore';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
    if (dbPromise) {
        return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
    return dbPromise;
};

export const idbSet = async (key: string, value: any): Promise<void> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
            console.error('IDB Transaction error:', transaction.error);
            reject(transaction.error);
        }
    });
};

export const idbGet = async <T>(key: string): Promise<T | undefined> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        
        request.onsuccess = () => {
            resolve(request.result as T);
        };
        request.onerror = () => {
            console.error('IDB Request error:', request.error);
            reject(request.error);
        };
    });
};