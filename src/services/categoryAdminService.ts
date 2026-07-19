import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  writeBatch,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Category, CategoryField, CategoryVersion } from '../types';

const CATEGORIES_COLLECTION = 'categories';
const FIELDS_COLLECTION = 'category_fields';
const VERSIONS_COLLECTION = 'category_versions';
const AUDIT_LOGS_COLLECTION = 'audit_logs';

export const categoryAdminService = {
  // --- Category Management ---

  async getAllCategories(): Promise<Category[]> {
    const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  },

  async createCategory(data: Partial<Category>): Promise<string> {
    const newDocRef = doc(collection(db, CATEGORIES_COLLECTION));
    const now = new Date().toISOString();
    
    const category: Category = {
      id: newDocRef.id,
      name: data.name || '',
      nameAr: data.nameAr,
      nameUr: data.nameUr,
      slug: data.slug || '',
      parentId: data.parentId || null,
      level: data.level || 1,
      icon: data.icon,
      status: 'active',
      showOnHomepage: data.showOnHomepage || false,
      isFeatured: data.isFeatured || false,
      order: data.order || 0,
      itemCount: 0,
      version: 1,
      isDraft: true,
      createdAt: now,
      updatedAt: now,
      ...data
    };

    await setDoc(newDocRef, category);
    return newDocRef.id;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<void> {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  },

  async deleteCategory(id: string): Promise<void> {
    const docsToDelete: { ref: any, type: string, id: string }[] = [];
    
    try {
      // 1. Recursive helper to accumulate all documents
      const collect = async (parentId: string) => {
        const q = query(collection(db, CATEGORIES_COLLECTION), where('parentId', '==', parentId));
        const snapshot = await getDocs(q);
        
        for (const d of snapshot.docs) {
          const childId = d.id;
          // Gather descendants first
          await collect(childId);
          
          docsToDelete.push({ ref: d.ref, type: 'category', id: childId });
          
          // Add associated fields
          const fieldsQ = query(collection(db, FIELDS_COLLECTION), where('categoryId', '==', childId));
          const fieldsSnap = await getDocs(fieldsQ);
          fieldsSnap.forEach(fd => docsToDelete.push({ ref: fd.ref, type: 'field', id: fd.id }));
          
          // Add associated versions
          const versionsQ = query(collection(db, VERSIONS_COLLECTION), where('categoryId', '==', childId));
          const versionsSnap = await getDocs(versionsQ);
          versionsSnap.forEach(vd => docsToDelete.push({ ref: vd.ref, type: 'version', id: vd.id }));
        }
      };

      // 2. Start collection from the target node's children
      await collect(id);

      // 3. Add parent-level associations
      const fieldsQ = query(collection(db, FIELDS_COLLECTION), where('categoryId', '==', id));
      const fieldsSnapshot = await getDocs(fieldsQ);
      fieldsSnapshot.forEach(f => docsToDelete.push({ ref: f.ref, type: 'field', id: f.id }));

      const versionsQ = query(collection(db, VERSIONS_COLLECTION), where('categoryId', '==', id));
      const versionsSnapshot = await getDocs(versionsQ);
      versionsSnapshot.forEach(v => docsToDelete.push({ ref: v.ref, type: 'version', id: v.id }));

      // 4. Finally add the target category itself
      docsToDelete.push({ ref: doc(db, CATEGORIES_COLLECTION, id), type: 'category', id });

      // 5. Commit in chunks of 450 (Firestore limit is 500)
      const batches = [];
      for (let i = 0; i < docsToDelete.length; i += 450) {
        const batch = writeBatch(db);
        const chunk = docsToDelete.slice(i, i + 450);
        chunk.forEach(item => batch.delete(item.ref));
        batches.push(batch.commit());
      }

      await Promise.all(batches);

      await this.logAction(
        'ARCH_DELETE_CASCADE', 
        'Category', 
        id, 
        `Node and ${docsToDelete.length - 1} nested structures purged recursively.`
      );
    } catch (error: any) {
      console.error('Cascading Delete Failure:', error);
      throw new Error(`Deletion failed: ${error.message || 'Permission or structural error'}`);
    }
  },

  // --- Field Management ---

  async getCategoryFields(categoryId: string): Promise<CategoryField[]> {
    const q = query(
      collection(db, FIELDS_COLLECTION), 
      where('categoryIds', 'array-contains', categoryId),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryField));
  },

  async getAllFields(): Promise<CategoryField[]> {
    const q = query(
      collection(db, FIELDS_COLLECTION),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryField));
  },

  async saveFields(categoryId: string, fields: Partial<CategoryField>[]): Promise<void> {
    const batch = writeBatch(db);
    
    // 1. Get existing fields for this category
    const existingFields = await this.getCategoryFields(categoryId);
    const incomingIds = new Set(fields.map(f => f.id).filter(id => id && !id.startsWith('new_')));

    // 2. Queue deletions for fields that were removed ONLY IF they were only in this category
    // (Actually, if it's many-to-many, removing from one category shouldn't delete the field)
    // For now, to keep existing behavior for single-category fields, we'll keep it simple
    // but the new form handles it better.
    
    // 3. Queue upserts for incoming fields
    for (const fieldData of fields) {
      const categoryIds = fieldData.categoryIds || [categoryId];
      if (!categoryIds.includes(categoryId)) categoryIds.push(categoryId);

      if (fieldData.id && !fieldData.id.startsWith('new_')) {
        const fieldRef = doc(db, FIELDS_COLLECTION, fieldData.id);
        batch.set(fieldRef, { ...fieldData, categoryIds, updatedAt: serverTimestamp() }, { merge: true });
      } else {
        const newFieldRef = doc(collection(db, FIELDS_COLLECTION));
        const cleanData = { ...fieldData };
        delete cleanData.id; 
        batch.set(newFieldRef, { ...cleanData, id: newFieldRef.id, categoryIds, createdAt: serverTimestamp() });
      }
    }
    
    await batch.commit();
    await this.logAction('ARCH_FIELD_SAVE', 'Category', categoryId, `Synchronized ${fields.length} attribute definitions.`);
  },

  async saveField(field: Partial<CategoryField>): Promise<string> {
    const now = new Date().toISOString();
    if (field.id && !field.id.startsWith('new_')) {
      const fieldRef = doc(db, FIELDS_COLLECTION, field.id);
      await updateDoc(fieldRef, {
        ...field,
        updatedAt: serverTimestamp()
      });
      return field.id;
    } else {
      const newFieldRef = doc(collection(db, FIELDS_COLLECTION));
      const cleanData = { ...field };
      delete cleanData.id;
      await setDoc(newFieldRef, {
        ...cleanData,
        id: newFieldRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return newFieldRef.id;
    }
  },

  async deleteField(fieldId: string): Promise<void> {
    const fieldRef = doc(db, FIELDS_COLLECTION, fieldId);
    await deleteDoc(fieldRef);
    await this.logAction('ARCH_FIELD_DELETE', 'Field', fieldId, `Attribute ${fieldId} purged.`);
  },

  // --- Versioning & Publishing ---

  async publishCategory(categoryId: string): Promise<void> {
    const categoryDoc = await getDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
    if (!categoryDoc.exists()) throw new Error('Category not found');
    
    const category = categoryDoc.data() as Category;
    const fields = await this.getCategoryFields(categoryId);
    
    const newVersionNumber = (category.version || 0) + 1;
    const versionId = `${categoryId}_v${newVersionNumber}`;
    
    const version: CategoryVersion = {
      id: versionId,
      categoryId,
      version: newVersionNumber,
      data: category,
      fields: fields,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const batch = writeBatch(db);
    
    // Save version snapshot
    batch.set(doc(db, VERSIONS_COLLECTION, versionId), version);
    
    // Update category to move out of draft
    batch.update(doc(db, CATEGORIES_COLLECTION, categoryId), {
      isDraft: false,
      version: newVersionNumber,
      updatedAt: new Date().toISOString()
    });

    await batch.commit();
  },

  async publishAllChanges(): Promise<{ count: number }> {
    const qDrafts = query(collection(db, CATEGORIES_COLLECTION), where('isDraft', '==', true));
    const snapshot = await getDocs(qDrafts);
    
    if (snapshot.empty) return { count: 0 };
    
    let count = 0;
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    for (const d of snapshot.docs) {
      const category = d.data() as Category;
      const categoryId = d.id;
      
      // For each category, we also need its fields
      const fieldsSnapshot = await getDocs(query(collection(db, FIELDS_COLLECTION), where('categoryIds', 'array-contains', categoryId)));
      const fields = fieldsSnapshot.docs.map(fd => fd.data() as CategoryField);
      
      const newVersionNumber = (category.version || 0) + 1;
      const versionId = `global_${categoryId}_v${newVersionNumber}_${Date.now()}`;
      
      const version: CategoryVersion = {
        id: versionId,
        categoryId,
        version: newVersionNumber,
        data: category,
        fields: fields,
        publishedAt: now,
        createdAt: now
      };

      batch.set(doc(db, VERSIONS_COLLECTION, versionId), version);
      batch.update(doc(db, CATEGORIES_COLLECTION, categoryId), {
        isDraft: false,
        version: newVersionNumber,
        updatedAt: now,
        status: 'active' // Ensure it's active when globally published
      });
      count++;
    }

    await batch.commit();
    await this.logAction('GLOBAL_PUBLISH', 'ALL', 'system', `Published ${count} category changes`);
    return { count };
  },

  // --- Utilities ---

  async duplicateCategory(id: string): Promise<string> {
    const original = await getDoc(doc(db, CATEGORIES_COLLECTION, id));
    if (!original.exists()) throw new Error('Original category not found');
    
    const data = original.data();
    const newId = await this.createCategory({
      ...data,
      name: `${data.name} (Copy)`,
      slug: `${data.slug}-copy`,
      itemCount: 0,
      createdAt: undefined,
      updatedAt: undefined
    });

    // Clone fields
    const fields = await this.getCategoryFields(id);
    const batch = writeBatch(db);
    for (const field of fields) {
      const newFieldRef = doc(collection(db, FIELDS_COLLECTION));
      batch.set(newFieldRef, { ...field, id: newFieldRef.id, categoryId: newId });
    }
    await batch.commit();

    return newId;
  },

  async logAction(action: string, targetType: string, targetId: string, details: string) {
    const logRef = doc(collection(db, AUDIT_LOGS_COLLECTION));
    await setDoc(logRef, {
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString()
    });
  }
};
