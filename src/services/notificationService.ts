import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  getDocs,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, isFirestoreQuotaExceeded } from '../firebase';
import { Notification } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationService = {
  // Get all notifications for a user (real-time)
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
        } as Notification;
      });
      
      // Sort in memory to avoid index issues for now
      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      callback(notifications);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, NOTIFICATIONS_COLLECTION);
    });
  },

  // Mark a notification as read
  async markAsRead(notificationId: string) {
    if (isFirestoreQuotaExceeded()) return;
    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(docRef, { status: 'read' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${NOTIFICATIONS_COLLECTION}/${notificationId}`);
    }
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string) {
    if (isFirestoreQuotaExceeded()) return;
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('status', '==', 'unread')
      );
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      snapshot.docs.forEach((d) => {
        batch.update(d.ref, { status: 'read' });
      });
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, NOTIFICATIONS_COLLECTION);
    }
  },

  // Create a notification
  async sendNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'status'>) {
    if (isFirestoreQuotaExceeded()) return;
    try {
      await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        ...notification,
        status: 'unread',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, NOTIFICATIONS_COLLECTION);
    }
  }
};
