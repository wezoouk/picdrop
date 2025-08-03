
import { Photo } from '../types';
import { idbGet, idbSet } from './idbService';

export interface WeddingDetails {
  coupleNames: string;
  date: string;
  message: string;
  ownerEmail?: string;
  profileImageUrl?: string;
  backgroundImageUrl?: string;
  backgroundPosition?: string;
  contentBackgroundColor?: string;
}

export interface WeddingData {
  id: string;
  details: WeddingDetails;
  photos: Photo[];
}

interface Database {
  [weddingId: string]: WeddingData;
}

const DB_KEY = 'picDropDB';

const getDatabase = async (): Promise<Database> => {
  try {
    const db = await idbGet<Database>(DB_KEY);
    return db || {};
  } catch (e) {
    console.error("Failed to get database from IndexedDB", e);
    return {};
  }
};

const saveDatabase = async (db: Database) => {
  try {
    await idbSet(DB_KEY, db);
  } catch (e) {
    console.error("Failed to save database to IndexedDB", e);
    throw e;
  }
};

// --- Public API ---

export const findUserByEmail = async (email: string): Promise<WeddingData | null> => {
    if (!email) return null;
    const db = await getDatabase();
    const allWeddings = Object.values(db);
    return allWeddings.find(wedding => wedding.details.ownerEmail === email) || null;
}

export const createWedding = async (
    id: string, 
    details: Omit<WeddingDetails, 'ownerEmail' | 'profileImageUrl' | 'backgroundImageUrl' | 'backgroundPosition' | 'contentBackgroundColor'>,
    ownerEmail: string
): Promise<WeddingData> => {
    const db = await getDatabase();
    if (db[id]) {
        throw new Error('A wedding page with this name already exists. Please choose another.');
    }
    const existingUser = await findUserByEmail(ownerEmail);
    if(existingUser) {
        throw new Error('An account with this email already exists.');
    }

    const newWedding: WeddingData = {
        id,
        details: {
            ...details,
            ownerEmail,
            profileImageUrl: '',
            backgroundImageUrl: '',
            backgroundPosition: 'center',
            contentBackgroundColor: 'rgba(253, 248, 245, 0.9)',
        },
        photos: [],
    };
    db[id] = newWedding;
    await saveDatabase(db);
    return newWedding;
};

export const getAllWeddings = async (): Promise<WeddingData[]> => {
    const db = await getDatabase();
    // Exclude the example wedding from the list of manageable weddings
    const { example, ...weddings } = db;
    return Object.values(weddings);
};

export const deleteWedding = async (weddingId: string): Promise<void> => {
    const db = await getDatabase();
    const weddingToDelete = db[weddingId];
    if (!weddingToDelete) {
        throw new Error('Wedding not found.');
    }
    
    // Also delete user from localStorage to prevent orphaned login data
    if (weddingToDelete.details.ownerEmail) {
        localStorage.removeItem(`user_${weddingToDelete.details.ownerEmail}`);
    }

    delete db[weddingId];
    await saveDatabase(db);
};


export const getWedding = async (id: string): Promise<WeddingData | null> => {
    const db = await getDatabase();

    // Just-in-time creation of example data if it doesn't exist
    if (id === 'example' && !db['example']) {
        db['example'] = {
            id: 'example',
            details: {
                coupleNames: 'Jessica & Michael',
                date: 'October 26, 2024',
                message: 'Welcome to our wedding celebration! We would be honored if you\'d share the moments you capture today.',
                profileImageUrl: `https://picsum.photos/seed/couple/400/400`,
                backgroundImageUrl: `https://picsum.photos/seed/weddingbg/1920/1080`,
                backgroundPosition: 'center',
                contentBackgroundColor: 'rgba(253, 248, 245, 0.9)',
            },
            photos: Array.from({ length: 15 }, (_, i) => ({
                id: `mock${i + 1}`,
                url: `https://picsum.photos/seed/${i + 1}/800/1200`,
                caption: i % 3 === 0 ? `A beautiful moment captured. ❤️` : '',
                uploaderName: ['Alice', 'Bob', 'Charlie', 'Diana'][i % 4],
                timestamp: Date.now() - (i * 1000 * 60 * 5),
                isPublic: true,
                isSensitive: i === 2 || i === 9,
            })),
        };
        await saveDatabase(db);
    }
    
    return db[id] || null;
};

export const updateWeddingDetails = async (id: string, newDetails: WeddingDetails): Promise<WeddingData> => {
    const db = await getDatabase();
    if (!db[id]) {
        throw new Error('Wedding not found.');
    }
    db[id].details = newDetails;
    await saveDatabase(db);
    return db[id];
};

export interface UploadData {
    file: File;
    caption: string;
    uploaderName: string;
    isSensitive: boolean;
    isPrivate: boolean;
}

// Helper to convert file to Base64
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });


export const uploadPhotos = async (weddingId: string, uploads: UploadData[]): Promise<Photo[]> => {
    const db = await getDatabase();
    if (!db[weddingId]) {
        throw new Error('Wedding not found.');
    }
    
    const newPhotos: Photo[] = [];
    for (let i = 0; i < uploads.length; i++) {
        const upload = uploads[i];
        const base64Url = await toBase64(upload.file);
        newPhotos.push({
            id: `new${Date.now()}${i}`,
            url: base64Url,
            caption: upload.caption,
            uploaderName: upload.uploaderName,
            timestamp: Date.now(),
            isPublic: !upload.isPrivate,
            isSensitive: upload.isPrivate ? false : upload.isSensitive,
            isPrivate: upload.isPrivate,
        });
    }
    
    db[weddingId].photos = [...newPhotos, ...db[weddingId].photos];
    await saveDatabase(db);
    
    return newPhotos;
};

export const deletePhotos = async (weddingId: string, photoIds: Set<string>): Promise<void> => {
    const db = await getDatabase();
    if (!db[weddingId]) {
        throw new Error('Wedding not found.');
    }
    db[weddingId].photos = db[weddingId].photos.filter(p => !photoIds.has(p.id));
    await saveDatabase(db);
}

export const togglePhotoVisibility = async (weddingId: string, photoId: string): Promise<boolean> => {
    const db = await getDatabase();
    if (!db[weddingId]) {
        throw new Error('Wedding not found.');
    }
    const photo = db[weddingId].photos.find(p => p.id === photoId);
    if (!photo) {
        throw new Error('Photo not found.');
    }
    photo.isPublic = !photo.isPublic;
    // a private photo cannot be made public manually
    if (photo.isPrivate) {
        photo.isPublic = false;
    }
    await saveDatabase(db);
    return photo.isPublic;
};