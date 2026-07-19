import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Category, CategoryField } from '../types';
import { INITIAL_CATEGORIES } from '../constants/initialCategories';

const CATEGORIES_COLLECTION = 'categories';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      const q = query(collection(db, CATEGORIES_COLLECTION));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      return items.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, CATEGORIES_COLLECTION);
    }
  },

  async seed(): Promise<Category[]> {
    const batch = INITIAL_CATEGORIES;
    for (const cat of batch) {
      // Remove local timestamps to let save() use serverTimestamp()
      const { createdAt, updatedAt, ...cleanCat } = cat as any;
      await this.save(cleanCat);
    }
    return batch;
  },

  async getByLevel(level: number): Promise<Category[]> {
    try {
      const q = query(
        collection(db, CATEGORIES_COLLECTION), 
        where('level', '==', level)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      return items.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, `${CATEGORIES_COLLECTION}?level=${level}`);
    }
  },

  async getChildren(parentId: string | null): Promise<Category[]> {
    try {
      const q = query(
        collection(db, CATEGORIES_COLLECTION), 
        where('parentId', '==', parentId)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      return items.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, `${CATEGORIES_COLLECTION}?parentId=${parentId}`);
    }
  },

  async save(category: Partial<Category>): Promise<string> {
    const id = category.id || doc(collection(db, CATEGORIES_COLLECTION)).id;
    const path = `${CATEGORIES_COLLECTION}/${id}`;
    try {
      const categoryRef = doc(db, CATEGORIES_COLLECTION, id);
      
      const data: any = { ...category };
      
      data.updatedAt = serverTimestamp();
      if (!category.createdAt) {
        data.createdAt = serverTimestamp();
      }

      await setDoc(categoryRef, data, { merge: true });
      return id;
    } catch (error) {
      return handleFirestoreError(error, category.id ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  },

  async delete(id: string): Promise<void> {
    // Note: In production, we should handle recursive deletion of children
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
  },

  async updateOrder(id: string, newOrder: number): Promise<void> {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, id);
    await updateDoc(categoryRef, { order: newOrder, updatedAt: serverTimestamp() });
  },

  async getCategoryFields(categoryId: string): Promise<CategoryField[]> {
    try {
      const q = query(
        collection(db, 'category_fields'), 
        where('categoryIds', 'array-contains', categoryId),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryField));
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, `category_fields?categoryId=${categoryId}`);
    }
  },

  async getAllFields(): Promise<CategoryField[]> {
    try {
      const q = query(collection(db, 'category_fields'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryField));
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, 'category_fields');
    }
  }
};
