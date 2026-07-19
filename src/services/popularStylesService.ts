import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  setDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { PopularStyle } from "../types";

const COLLECTION_NAME = "popular_styles";

// Custom premium preset SVG paths matching Carvana's beautiful styles silhouette
export const BODY_STYLE_PRESETS: Record<string, { name: string; svgPath: string }> = {
  suv: {
    name: "SUV",
    svgPath: "M5 14h2l1.5-3.5h7L17 14h2a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1h-1a2.5 2.5 0 0 1-5 0h-5a2.5 2.5 0 0 1-5 0H3a1 1 0 0 1-1-1v-3a2 2 0 0 1 2-2M6 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2M16 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
  },
  sedan: {
    name: "Sedan",
    svgPath: "M2 15h3l1.5-4h11L19 15h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a2.5 2.5 0 0 1-5 0h-6a2.5 2.5 0 0 1-5 0H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1M6 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2M16 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
  },
  truck: {
    name: "Truck",
    svgPath: "M2 13h4V9.5h8L16 13h5a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1h-1a2.5 2.5 0 0 1-5 0H9a2.5 2.5 0 0 1-5 0H2a1 1 0 0 1-1-1v-4a2 2 0 0 1 2-2M6 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2M16 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
  },
  ev: {
    name: "EV",
    svgPath: "M2 15h3l1.5-4h11L19 15h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a2.5 2.5 0 0 1-5 0H8a2.5 2.5 0 0 1-5 0H2v-4z M10 13h4v2"
  },
  hybrid: {
    name: "Hybrid",
    svgPath: "M2 15h3l2-4.5h9l2 4.5h4a1 1 0 0 1 1 1v2h-1a2 2 0 0 1-4 0H7a2 2 0 0 1-4 0H2v-2.5"
  },
  coupe: {
    name: "Coupe",
    svgPath: "M2 15.5l5.5-4h8l4.5 4h2a1 1 0 0 1 1 1v2.5a1 1 0 0 1-1 1h-1a2.5 2.5 0 0 1-5 0H7a2.5 2.5 0 0 1-5 0H2a1 1 0 0 1-1-1v-2.5a1 1 0 0 1 2-1M6 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2M16 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
  },
  hatchback: {
    name: "Hatchback",
    svgPath: "M2 15h3l2.5-5.5h8l1 3.5h4.5a2 2 0 0 1 2 2v2.5a1 1 0 0 1-1 1h-1a2.5 2.5 0 0 1-5 0h-5a2.5 2.5 0 0 1-5 0H2a1 1 0 0 1-1-1V17a2 2 0 0 1 2-2M6 19.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2M16 19.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
  }
};

const DEFAULT_STYLES: Omit<PopularStyle, "id" | "createdAt">[] = [
  {
    name: "SUVs",
    iconPreset: "suv",
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600",
    customSvgPath: "",
    filterKey: "bodyType",
    filterValue: "SUV",
    order: 1,
    status: "active"
  },
  {
    name: "Sedans",
    iconPreset: "sedan",
    imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=600",
    customSvgPath: "",
    filterKey: "bodyType",
    filterValue: "Sedan",
    order: 2,
    status: "active"
  },
  {
    name: "Trucks",
    iconPreset: "truck",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600",
    customSvgPath: "",
    filterKey: "bodyType",
    filterValue: "Truck",
    order: 3,
    status: "active"
  },
  {
    name: "EVs",
    iconPreset: "ev",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600",
    customSvgPath: "",
    filterKey: "fuelType",
    filterValue: "Electric",
    order: 4,
    status: "active"
  },
  {
    name: "Hybrids",
    iconPreset: "hybrid",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600",
    customSvgPath: "",
    filterKey: "fuelType",
    filterValue: "Hybrid",
    order: 5,
    status: "active"
  },
  {
    name: "Coupes",
    iconPreset: "coupe",
    imageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600",
    customSvgPath: "",
    filterKey: "bodyType",
    filterValue: "Coupe",
    order: 6,
    status: "active"
  },
  {
    name: "Hatchbacks",
    iconPreset: "hatchback",
    imageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600",
    customSvgPath: "",
    filterKey: "bodyType",
    filterValue: "Hatchback",
    order: 7,
    status: "active"
  }
];

// Memory and LocalStorage Cache variables
const CACHE_KEY = "popular_vehicle_styles_cache_v1";
let memoryCache: PopularStyle[] | null = null;

function loadFromLocalStorage(): PopularStyle[] | null {
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      return JSON.parse(saved) as PopularStyle[];
    }
  } catch (e) {
    console.warn("[PopularStyles] LocalStorage cache load error:", e);
  }
  return null;
}

function saveToLocalStorage(data: PopularStyle[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("[PopularStyles] LocalStorage cache save error:", e);
  }
}

function getStaticDefaults(): PopularStyle[] {
  return DEFAULT_STYLES.map((style, i) => ({
    id: `static_${style.iconPreset || i}`,
    ...style,
    createdAt: new Date().toISOString()
  })) as PopularStyle[];
}

export const popularStylesService = {
  /**
   * Synchronously and instantly gets popular styles from cache.
   * Leverages memory, LocalStorage, or hardcoded templates. Guaranteed < 1ms load.
   */
  getCached(): PopularStyle[] {
    if (memoryCache && memoryCache.length > 0) {
      return memoryCache;
    }
    const local = loadFromLocalStorage();
    if (local && local.length > 0) {
      memoryCache = local;
      return local;
    }
    const defaults = getStaticDefaults();
    memoryCache = defaults;
    return defaults;
  },

  /**
   * Returns styles with caching. Initiates standard background fetch to align storage with database changes.
   */
  async getAll(forceRefresh = false): Promise<PopularStyle[]> {
    if (memoryCache && memoryCache.length > 0 && !forceRefresh) {
      // Spark background update to ensure consistency without latency and return immediate cache
      this.revalidateInBackground();
      return memoryCache;
    }
    return this.fetchFreshAndSave();
  },

  /**
   * Background service validation of popular styles database.
   */
  async revalidateInBackground(): Promise<void> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PopularStyle[];
        
        // Only update if something actually changed to avoid layout flashes
        const simplifiedCurrent = JSON.stringify(memoryCache || []);
        const simplifiedFetched = JSON.stringify(fetched);
        
        if (simplifiedCurrent !== simplifiedFetched) {
          memoryCache = fetched;
          saveToLocalStorage(fetched);
          // Broadcast custom refresh event to auto update subscribers in real-time
          window.dispatchEvent(new CustomEvent("popular-styles-refreshed", { detail: fetched }));
        }
      }
    } catch (err) {
      // Silent fallback in background
    }
  },

  /**
   * Forces direct fresh fetch from Cloud Storage / Firestore.
   */
  async fetchFreshAndSave(): Promise<PopularStyle[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      
      let fetched: PopularStyle[] = [];
      if (snapshot.empty) {
        console.log("[PopularStyles] Seeding Firestore on first fetch...");
        await this.seedDefaultStyles();
        const freshSnapshot = await getDocs(q);
        fetched = freshSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PopularStyle[];
      } else {
        fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PopularStyle[];
      }
      
      memoryCache = fetched;
      saveToLocalStorage(fetched);
      return fetched;
    } catch (error) {
      console.warn("[PopularStyles] Live read failed. Returning cache fallback:", error);
      return this.getCached();
    }
  },

  /**
   * Seeds default styles to Firestore.
   */
  async seedDefaultStyles(): Promise<void> {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      for (const style of DEFAULT_STYLES) {
        const docId = style.iconPreset;
        const docRef = doc(colRef, docId);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          await setDoc(docRef, {
            ...style,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.error("[PopularStyles] Seeding failed:", e);
    }
  },

  /**
   * Adds a new popular style.
   */
  async create(data: Omit<PopularStyle, "id" | "createdAt">): Promise<PopularStyle> {
    const colRef = collection(db, COLLECTION_NAME);
    const payload = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(colRef, payload);
    const newStyle = {
      id: docRef.id,
      ...payload
    };
    
    await this.fetchFreshAndSave();
    return newStyle;
  },

  /**
   * Updates an existing popular style.
   */
  async update(id: string, data: Partial<Omit<PopularStyle, "id" | "createdAt">>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    await this.fetchFreshAndSave();
  },

  /**
   * Deletes a popular style.
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    await this.fetchFreshAndSave();
  },

  /**
   * Resets collection back to default preset styles.
   */
  async resetToDefaults(): Promise<PopularStyle[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const snap = await getDocs(snapCollectionQuery(q));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, COLLECTION_NAME, d.id));
      }
      
      await this.seedDefaultStyles();
      return await this.fetchFreshAndSave();
    } catch (e) {
      console.error("[PopularStyles] Reset failed:", e);
      throw e;
    }
  }
};

// Helper inside file for safe query snapping
function snapCollectionQuery(q: any) {
  return q;
}
