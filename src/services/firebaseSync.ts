import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, firebaseConfig } from './firebase';
import { StorageService } from './storageService';
import {
  Student,
  Teacher,
  Subject,
  Room,
  TeacherAssignment,
  Contract,
  Session,
  AttendanceRecord,
  Payment,
  TeacherPayment,
  NotificationItem,
  AuditLogItem,
  CenterSettings
} from '../types';

export interface CloudSyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  projectId: string;
  databaseId: string;
  error: string | null;
}

class FirebaseSyncService {
  private static instance: FirebaseSyncService;
  private isInitialized = false;
  private statusListeners: Set<(status: CloudSyncStatus) => void> = new Set();

  private status: CloudSyncStatus = {
    isConnected: true,
    isSyncing: false,
    lastSyncedAt: null,
    projectId: firebaseConfig.projectId,
    databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
    error: null
  };

  public static getInstance(): FirebaseSyncService {
    if (!FirebaseSyncService.instance) {
      FirebaseSyncService.instance = new FirebaseSyncService();
    }
    return FirebaseSyncService.instance;
  }

  public getStatus(): CloudSyncStatus {
    return { ...this.status };
  }

  public onStatusChange(listener: (status: CloudSyncStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => this.statusListeners.delete(listener);
  }

  private updateStatus(patch: Partial<CloudSyncStatus>) {
    this.status = { ...this.status, ...patch };
    this.statusListeners.forEach(fn => fn(this.getStatus()));
  }

  /**
   * Initializes real-time Firestore listeners and auto-seeds initial data to cloud if empty.
   */
  public async initSync(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.updateStatus({ isSyncing: true });

    const storage = StorageService.getInstance();

    try {
      // 1. Check if students collection in Firestore already has data
      const studentsPath = 'students';
      let existingStudentsSnap;
      try {
        existingStudentsSnap = await getDocs(collection(db, studentsPath));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, studentsPath);
      }

      // If cloud has zero students, seed from local storage to Firestore
      if (existingStudentsSnap && existingStudentsSnap.empty) {
        console.info('Seeding initial training center data to Firebase Firestore...');
        await this.seedAllToFirestore(storage);
      }

      // 2. Setup real-time listeners for all core collections
      this.attachCollectionListeners(storage);

      this.updateStatus({
        isConnected: true,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null
      });
    } catch (err) {
      console.error('Failed to initialize Firebase sync:', err);
      this.updateStatus({
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Unknown sync error'
      });
    }
  }

  /**
   * Listen to remote updates from Firestore
   */
  private attachCollectionListeners(storage: StorageService) {
    // Listen to Students
    const studentsPath = 'students';
    onSnapshot(
      collection(db, studentsPath),
      snapshot => {
        if (!snapshot.empty) {
          const remoteStudents = snapshot.docs.map(d => d.data() as Student);
          storage.mergeRemoteStudents(remoteStudents);
          this.updateStatus({ lastSyncedAt: new Date() });
        }
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, studentsPath);
      }
    );

    // Listen to Teachers
    const teachersPath = 'teachers';
    onSnapshot(
      collection(db, teachersPath),
      snapshot => {
        if (!snapshot.empty) {
          const remoteTeachers = snapshot.docs.map(d => d.data() as Teacher);
          storage.mergeRemoteTeachers(remoteTeachers);
          this.updateStatus({ lastSyncedAt: new Date() });
        }
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, teachersPath);
      }
    );

    // Listen to Subjects
    const subjectsPath = 'subjects';
    onSnapshot(
      collection(db, subjectsPath),
      snapshot => {
        if (!snapshot.empty) {
          const remoteSubjects = snapshot.docs.map(d => d.data() as Subject);
          storage.mergeRemoteSubjects(remoteSubjects);
          this.updateStatus({ lastSyncedAt: new Date() });
        }
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, subjectsPath);
      }
    );

    // Listen to Rooms
    const roomsPath = 'rooms';
    onSnapshot(
      collection(db, roomsPath),
      snapshot => {
        if (!snapshot.empty) {
          const remoteRooms = snapshot.docs.map(d => d.data() as Room);
          storage.mergeRemoteRooms(remoteRooms);
          this.updateStatus({ lastSyncedAt: new Date() });
        }
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, roomsPath);
      }
    );

    // Listen to Sessions
    const sessionsPath = 'sessions';
    onSnapshot(
      collection(db, sessionsPath),
      snapshot => {
        if (!snapshot.empty) {
          const remoteSessions = snapshot.docs.map(d => d.data() as Session);
          storage.mergeRemoteSessions(remoteSessions);
          this.updateStatus({ lastSyncedAt: new Date() });
        }
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, sessionsPath);
      }
    );

    // Listen to Contracts
    const contractsPath = 'contracts';
    onSnapshot(
      collection(db, contractsPath),
      snapshot => {
        if (!snapshot.empty) {
          const remoteContracts = snapshot.docs.map(d => d.data() as Contract);
          storage.mergeRemoteContracts(remoteContracts);
          this.updateStatus({ lastSyncedAt: new Date() });
        }
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, contractsPath);
      }
    );

    // Listen to Attendance
    const attendancePath = 'attendance';
    onSnapshot(
      collection(db, attendancePath),
      snapshot => {
        if (!snapshot.empty) {
          const remoteAttendance = snapshot.docs.map(d => d.data() as AttendanceRecord);
          storage.mergeRemoteAttendance(remoteAttendance);
          this.updateStatus({ lastSyncedAt: new Date() });
        }
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, attendancePath);
      }
    );

    // Listen to Payments
    const paymentsPath = 'payments';
    onSnapshot(
      collection(db, paymentsPath),
      snapshot => {
        if (!snapshot.empty) {
          const remotePayments = snapshot.docs.map(d => d.data() as Payment);
          storage.mergeRemotePayments(remotePayments);
          this.updateStatus({ lastSyncedAt: new Date() });
        }
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, paymentsPath);
      }
    );
  }

  /**
   * Save or update an item to Firestore
   */
  public async saveDocument<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
    const docPath = `${collectionName}/${item.id}`;
    try {
      this.updateStatus({ isSyncing: true });
      await setDoc(doc(db, collectionName, item.id), item, { merge: true });
      this.updateStatus({ isSyncing: false, lastSyncedAt: new Date(), error: null });
    } catch (err) {
      this.updateStatus({ isSyncing: false, error: err instanceof Error ? err.message : String(err) });
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  }

  /**
   * Delete an item from Firestore
   */
  public async deleteDocument(collectionName: string, id: string): Promise<void> {
    const docPath = `${collectionName}/${id}`;
    try {
      this.updateStatus({ isSyncing: true });
      await deleteDoc(doc(db, collectionName, id));
      this.updateStatus({ isSyncing: false, lastSyncedAt: new Date(), error: null });
    } catch (err) {
      this.updateStatus({ isSyncing: false, error: err instanceof Error ? err.message : String(err) });
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  }

  /**
   * Seed local data to Firestore
   */
  public async seedAllToFirestore(storage: StorageService): Promise<void> {
    this.updateStatus({ isSyncing: true });
    try {
      // 1. Settings
      const settings = storage.getSettings();
      await setDoc(doc(db, 'settings', 'center_config'), settings);

      // 2. Students
      for (const s of storage.getStudents()) {
        await setDoc(doc(db, 'students', s.id), s);
      }

      // 3. Teachers
      for (const t of storage.getTeachers()) {
        await setDoc(doc(db, 'teachers', t.id), t);
      }

      // 4. Subjects
      for (const sub of storage.getSubjects()) {
        await setDoc(doc(db, 'subjects', sub.id), sub);
      }

      // 5. Rooms
      for (const r of storage.getRooms()) {
        await setDoc(doc(db, 'rooms', r.id), r);
      }

      // 6. Contracts
      for (const c of storage.getContracts()) {
        await setDoc(doc(db, 'contracts', c.id), c);
      }

      // 7. Sessions
      for (const sess of storage.getSessions()) {
        await setDoc(doc(db, 'sessions', sess.id), sess);
      }

      // 8. Attendance
      for (const a of storage.getAttendance()) {
        await setDoc(doc(db, 'attendance', a.id), a);
      }

      // 9. Payments
      for (const p of storage.getPayments()) {
        await setDoc(doc(db, 'payments', p.id), p);
      }

      this.updateStatus({ isSyncing: false, lastSyncedAt: new Date() });
      console.info('Successfully synced all datasets to Firestore cloud!');
    } catch (err) {
      console.warn('Initial seeding encountered an error:', err);
      this.updateStatus({ isSyncing: false });
    }
  }
}

export const firebaseSync = FirebaseSyncService.getInstance();
