import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc
} from 'firebase/firestore';

import {
  db,
  handleFirestoreError,
  OperationType,
  firebaseConfig
} from './firebase';

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
  CenterSettings,
  User
} from '../types';

export interface CloudSyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  projectId: string;
  databaseId: string;
  error: string | null;
  isPermissionDenied?: boolean;
}

/**
 * Recursively strips all `undefined` values from an object or array.
 * Firestore strictly rejects documents with any property set to `undefined`.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as T;
  }
  return data;
}

function isPermissionDeniedError(err: unknown): boolean {
  const code = (err as any)?.code;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    code === 'permission-denied' ||
    msg.includes('Missing or insufficient permissions') ||
    msg.includes('permission-denied')
  );
}

class FirebaseSyncService {
  private static instance: FirebaseSyncService;

  private isInitialized = false;
  private unsubscribers: (() => void)[] = [];

  private statusListeners: Set<
    (status: CloudSyncStatus) => void
  > = new Set();

  private status: CloudSyncStatus = {
    isConnected: true,
    isSyncing: false,
    lastSyncedAt: null,
    projectId: firebaseConfig.projectId,
    databaseId:
      firebaseConfig.firestoreDatabaseId ||
      '(default)',
    error: null,
    isPermissionDenied: false
  };

  public static getInstance(): FirebaseSyncService {
    if (!FirebaseSyncService.instance) {
      FirebaseSyncService.instance =
        new FirebaseSyncService();
    }

    return FirebaseSyncService.instance;
  }

  public getStatus(): CloudSyncStatus {
    return {
      ...this.status
    };
  }

  public onStatusChange(
    listener: (status: CloudSyncStatus) => void
  ): () => void {
    this.statusListeners.add(listener);

    listener(this.getStatus());

    return () =>
      this.statusListeners.delete(listener);
  }

  private updateStatus(
    patch: Partial<CloudSyncStatus>
  ) {
    this.status = {
      ...this.status,
      ...patch
    };

    this.statusListeners.forEach(listener =>
      listener(this.getStatus())
    );
  }

  private reportListenerError(
    error: unknown,
    operationType: OperationType,
    path: string
  ) {
    const permDenied = isPermissionDeniedError(error);
    this.updateStatus({
      isConnected: false,
      isSyncing: false,
      isPermissionDenied: permDenied,
      error:
        error instanceof Error
          ? error.message
          : String(error)
    });

    try {
      handleFirestoreError(error, operationType, path);
    } catch {
      // Structured FirestoreErrorInfo is already logged to console.error by handleFirestoreError
    }
  }

  /**
   * Stops active real-time listeners cleanly (e.g. on sign-out).
   */
  public stopSync(): void {
    this.unsubscribers.forEach(unsub => {
      try {
        unsub();
      } catch {
        // ignore unsubscribe errors
      }
    });
    this.unsubscribers = [];
    this.isInitialized = false;
    this.updateStatus({
      isSyncing: false,
      error: null,
      isPermissionDenied: false
    });
  }

  /**
   * Initializes Firestore real-time synchronization.
   */
  public async initSync(forceRestart = false): Promise<void> {
    if (forceRestart) {
      this.stopSync();
    }

    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    this.updateStatus({
      isSyncing: true,
      error: null,
      isPermissionDenied: false
    });

    const storage =
      StorageService.getInstance();

    try {
      const [existingStudentsSnap, existingUsersSnap] = await Promise.all([
        getDocs(collection(db, 'students')).catch(err => {
          this.reportListenerError(err, OperationType.LIST, 'students');
          throw err;
        }),
        getDocs(collection(db, 'users')).catch(err => {
          this.reportListenerError(err, OperationType.LIST, 'users');
          throw err;
        })
      ]);

      if (
        existingStudentsSnap.empty &&
        existingUsersSnap.empty
      ) {
        console.info(
          'Seeding initial training center data to Firebase Firestore...'
        );
        await this.seedAllToFirestore(storage);
      }

      this.attachCollectionListeners(storage);

      this.updateStatus({
        isConnected: true,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
        isPermissionDenied: false
      });
    } catch (err) {
      this.isInitialized = false;
      console.error(
        'Failed to initialize Firebase sync:',
        err
      );

      this.updateStatus({
        isConnected: false,
        isSyncing: false,
        isPermissionDenied: isPermissionDeniedError(err),
        error:
          err instanceof Error
            ? err.message
            : 'Unknown sync error'
      });
    }
  }

  /**
   * Pulls latest cloud documents across all collections without overwriting remote data.
   */
  public async pullAllFromFirestore(
    storage: StorageService
  ): Promise<void> {
    this.updateStatus({
      isSyncing: true,
      error: null,
      isPermissionDenied: false
    });

    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'center_config'));
      if (settingsSnap.exists()) {
        storage.mergeRemoteSettings(settingsSnap.data() as Partial<CenterSettings>);
      }

      const [
        usersSnap,
        studentsSnap,
        teachersSnap,
        subjectsSnap,
        roomsSnap,
        assignmentsSnap,
        contractsSnap,
        sessionsSnap,
        attendanceSnap,
        paymentsSnap,
        teacherPaymentsSnap,
        notificationsSnap,
        auditLogsSnap
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'teachers')),
        getDocs(collection(db, 'subjects')),
        getDocs(collection(db, 'rooms')),
        getDocs(collection(db, 'assignments')),
        getDocs(collection(db, 'contracts')),
        getDocs(collection(db, 'sessions')),
        getDocs(collection(db, 'attendance')),
        getDocs(collection(db, 'payments')),
        getDocs(collection(db, 'teacherPayments')),
        getDocs(collection(db, 'notifications')),
        getDocs(collection(db, 'auditLogs'))
      ]);

      const mapWithId = <T extends { id: string }>(snap: typeof studentsSnap): T[] =>
        snap.docs.map(d => ({ ...(d.data() as T), id: d.data().id || d.id }));

      storage.mergeRemoteUsers(mapWithId<User>(usersSnap as any));
      storage.mergeRemoteStudents(mapWithId<Student>(studentsSnap));
      storage.mergeRemoteTeachers(mapWithId<Teacher>(teachersSnap as any));
      storage.mergeRemoteSubjects(mapWithId<Subject>(subjectsSnap as any));
      storage.mergeRemoteRooms(mapWithId<Room>(roomsSnap as any));
      storage.mergeRemoteAssignments(mapWithId<TeacherAssignment>(assignmentsSnap as any));
      storage.mergeRemoteContracts(mapWithId<Contract>(contractsSnap as any));
      storage.mergeRemoteSessions(mapWithId<Session>(sessionsSnap as any));
      storage.mergeRemoteAttendance(mapWithId<AttendanceRecord>(attendanceSnap as any));
      storage.mergeRemotePayments(mapWithId<Payment>(paymentsSnap as any));
      storage.mergeRemoteTeacherPayments(mapWithId<TeacherPayment>(teacherPaymentsSnap as any));
      storage.mergeRemoteNotifications(mapWithId<NotificationItem>(notificationsSnap as any));
      storage.mergeRemoteAuditLogs(mapWithId<AuditLogItem>(auditLogsSnap as any));

      if (!this.isInitialized) {
        this.isInitialized = true;
        this.attachCollectionListeners(storage);
      }

      this.updateStatus({
        isConnected: true,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
        isPermissionDenied: false
      });
    } catch (err) {
      this.reportListenerError(err, OperationType.LIST, 'all_collections');
      throw err;
    }
  }

  /**
   * Attach real-time Firestore listeners
   * for all application collections.
   */
  private attachCollectionListeners(
    storage: StorageService
  ) {
    const markHealthy = () => {
      this.updateStatus({
        isConnected: true,
        lastSyncedAt: new Date(),
        error: null,
        isPermissionDenied: false
      });
    };

    /*
     * SETTINGS
     */
    const settingsDocPath = 'settings/center_config';
    this.unsubscribers.push(
      onSnapshot(
        doc(db, 'settings', 'center_config'),
        docSnap => {
          if (docSnap.exists()) {
            storage.mergeRemoteSettings(
              docSnap.data() as Partial<CenterSettings>
            );
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.GET,
            settingsDocPath
          );
        }
      )
    );

    /*
     * USERS (Staff & System Accounts)
     */
    const usersPath = 'users';
    this.unsubscribers.push(
      onSnapshot(
        collection(db, usersPath),
        snapshot => {
          const remoteUsers = snapshot.docs.map(document => ({
            ...(document.data() as User),
            id: document.data().id || document.id
          }));

          if (remoteUsers.length > 0) {
            storage.mergeRemoteUsers(remoteUsers);
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.LIST,
            usersPath
          );
        }
      )
    );

    /*
     * STUDENTS
     */
    const studentsPath = 'students';
    this.unsubscribers.push(
      onSnapshot(
        collection(db, studentsPath),
        snapshot => {
          const remoteStudents = snapshot.docs.map(document => ({
            ...(document.data() as Student),
            id: document.data().id || document.id
          }));

          if (remoteStudents.length > 0) {
            storage.mergeRemoteStudents(remoteStudents);
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.LIST,
            studentsPath
          );
        }
      )
    );

    /*
     * TEACHERS
     */
    const teachersPath = 'teachers';
    this.unsubscribers.push(
      onSnapshot(
        collection(db, teachersPath),
        snapshot => {
          const remoteTeachers = snapshot.docs.map(document => ({
            ...(document.data() as Teacher),
            id: document.data().id || document.id
          }));

          if (remoteTeachers.length > 0) {
            storage.mergeRemoteTeachers(remoteTeachers);
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.LIST,
            teachersPath
          );
        }
      )
    );

    /*
     * SUBJECTS
     */
    const subjectsPath = 'subjects';
    this.unsubscribers.push(
      onSnapshot(
        collection(db, subjectsPath),
        snapshot => {
          const remoteSubjects = snapshot.docs.map(document => ({
            ...(document.data() as Subject),
            id: document.data().id || document.id
          }));

          if (remoteSubjects.length > 0) {
            storage.mergeRemoteSubjects(remoteSubjects);
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.LIST,
            subjectsPath
          );
        }
      )
    );

    /*
     * ROOMS
     */
    const roomsPath = 'rooms';
    this.unsubscribers.push(
      onSnapshot(
        collection(db, roomsPath),
        snapshot => {
          const remoteRooms = snapshot.docs.map(document => ({
            ...(document.data() as Room),
            id: document.data().id || document.id
          }));

          if (remoteRooms.length > 0) {
            storage.mergeRemoteRooms(remoteRooms);
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.LIST,
            roomsPath
          );
        }
      )
    );

    /*
     * ASSIGNMENTS
     */
    const assignmentsPath = 'assignments';
    this.unsubscribers.push(
      onSnapshot(
        collection(db, assignmentsPath),
        snapshot => {
          const remoteAssignments = snapshot.docs.map(document => ({
            ...(document.data() as TeacherAssignment),
            id: document.data().id || document.id
          }));

          if (remoteAssignments.length > 0) {
            storage.mergeRemoteAssignments(remoteAssignments);
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.LIST,
            assignmentsPath
          );
        }
      )
    );

    /*
     * CONTRACTS
     */
    const contractsPath = 'contracts';
    this.unsubscribers.push(
      onSnapshot(
        collection(db, contractsPath),
        snapshot => {
          const remoteContracts = snapshot.docs.map(document => ({
            ...(document.data() as Contract),
            id: document.data().id || document.id
          }));

          if (remoteContracts.length > 0) {
            storage.mergeRemoteContracts(remoteContracts);
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.LIST,
            contractsPath
          );
        }
      )
    );

    /*
     * SESSIONS
     */
    const sessionsPath = 'sessions';
    this.unsubscribers.push(
      onSnapshot(
        collection(db, sessionsPath),
        snapshot => {
          const remoteSessions = snapshot.docs.map(document => ({
            ...(document.data() as Session),
            id: document.data().id || document.id
          }));

          if (remoteSessions.length > 0) {
            storage.mergeRemoteSessions(remoteSessions);
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.LIST,
            sessionsPath
          );
        }
      )
    );

    /*
     * ATTENDANCE
     */
    const attendancePath = 'attendance';
    this.unsubscribers.push(
      onSnapshot(
        collection(db, attendancePath),
        snapshot => {
          const remoteAttendance = snapshot.docs.map(document => ({
            ...(document.data() as AttendanceRecord),
            id: document.data().id || document.id
          }));

          if (remoteAttendance.length > 0) {
            storage.mergeRemoteAttendance(remoteAttendance);
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.LIST,
            attendancePath
          );
        }
      )
    );

    /*
     * PAYMENTS
     */
    const paymentsPath = 'payments';
    this.unsubscribers.push(
      onSnapshot(
        collection(db, paymentsPath),
        snapshot => {
          const remotePayments = snapshot.docs.map(document => ({
            ...(document.data() as Payment),
            id: document.data().id || document.id
          }));

          if (remotePayments.length > 0) {
            storage.mergeRemotePayments(remotePayments);
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.LIST,
            paymentsPath
          );
        }
      )
    );

    /*
     * TEACHER PAYMENTS
     */
    const teacherPaymentsPath = 'teacherPayments';
    this.unsubscribers.push(
      onSnapshot(
        collection(db, teacherPaymentsPath),
        snapshot => {
          const remoteTeacherPayments = snapshot.docs.map(document => ({
            ...(document.data() as TeacherPayment),
            id: document.data().id || document.id
          }));

          if (remoteTeacherPayments.length > 0) {
            storage.mergeRemoteTeacherPayments(remoteTeacherPayments);
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.LIST,
            teacherPaymentsPath
          );
        }
      )
    );

    /*
     * NOTIFICATIONS
     */
    const notificationsPath = 'notifications';
    this.unsubscribers.push(
      onSnapshot(
        collection(db, notificationsPath),
        snapshot => {
          const remoteNotifications = snapshot.docs.map(document => ({
            ...(document.data() as NotificationItem),
            id: document.data().id || document.id
          }));

          if (remoteNotifications.length > 0) {
            storage.mergeRemoteNotifications(remoteNotifications);
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.LIST,
            notificationsPath
          );
        }
      )
    );

    /*
     * AUDIT LOGS
     */
    const auditLogsPath = 'auditLogs';
    this.unsubscribers.push(
      onSnapshot(
        collection(db, auditLogsPath),
        snapshot => {
          const remoteAuditLogs = snapshot.docs.map(document => ({
            ...(document.data() as AuditLogItem),
            id: document.data().id || document.id
          }));

          if (remoteAuditLogs.length > 0) {
            storage.mergeRemoteAuditLogs(remoteAuditLogs);
          }
          markHealthy();
        },
        error => {
          this.reportListenerError(
            error,
            OperationType.LIST,
            auditLogsPath
          );
        }
      )
    );
  }

  /**
   * Save one document to Firestore.
   */
  public async saveDocument<
    T extends { id: string }
  >(
    collectionName: string,
    item: T
  ): Promise<void> {
    const docPath =
      `${collectionName}/${item.id}`;

    try {
      this.updateStatus({
        isSyncing: true
      });

      const sanitizedItem = sanitizeForFirestore(item);

      await setDoc(
        doc(
          db,
          collectionName,
          item.id
        ),
        sanitizedItem,
        {
          merge: true
        }
      );

      this.updateStatus({
        isConnected: true,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
        isPermissionDenied: false
      });
    } catch (err) {
      this.updateStatus({
        isSyncing: false,
        isPermissionDenied: isPermissionDeniedError(err),
        error:
          err instanceof Error
            ? err.message
            : String(err)
      });

      handleFirestoreError(
        err,
        OperationType.WRITE,
        docPath
      );
    }
  }

  /**
   * Delete one document from Firestore.
   */
  public async deleteDocument(
    collectionName: string,
    id: string
  ): Promise<void> {
    const docPath =
      `${collectionName}/${id}`;

    try {
      this.updateStatus({
        isSyncing: true
      });

      await deleteDoc(
        doc(
          db,
          collectionName,
          id
        )
      );

      this.updateStatus({
        isConnected: true,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
        isPermissionDenied: false
      });
    } catch (err) {
      this.updateStatus({
        isSyncing: false,
        isPermissionDenied: isPermissionDeniedError(err),
        error:
          err instanceof Error
            ? err.message
            : String(err)
      });

      handleFirestoreError(
        err,
        OperationType.DELETE,
        docPath
      );
    }
  }

  /**
   * Seed all local application data
   * into Firestore.
   */
  public async seedAllToFirestore(
    storage: StorageService
  ): Promise<void> {
    this.updateStatus({
      isSyncing: true
    });

    try {
      const settings =
        storage.getSettings();

      await setDoc(
        doc(
          db,
          'settings',
          'center_config'
        ),
        sanitizeForFirestore({
          ...settings,
          id: 'center_config'
        }),
        { merge: true }
      );

      for (const student of storage.getStudents()) {
        await setDoc(
          doc(db, 'students', student.id),
          sanitizeForFirestore(student),
          { merge: true }
        );
      }

      for (const teacher of storage.getTeachers()) {
        await setDoc(
          doc(db, 'teachers', teacher.id),
          sanitizeForFirestore(teacher),
          { merge: true }
        );
      }

      for (const subject of storage.getSubjects()) {
        await setDoc(
          doc(db, 'subjects', subject.id),
          sanitizeForFirestore(subject),
          { merge: true }
        );
      }

      for (const room of storage.getRooms()) {
        await setDoc(
          doc(db, 'rooms', room.id),
          sanitizeForFirestore(room),
          { merge: true }
        );
      }

      for (const assignment of storage.getAssignments()) {
        await setDoc(
          doc(db, 'assignments', assignment.id),
          sanitizeForFirestore(assignment),
          { merge: true }
        );
      }

      for (const contract of storage.getContracts()) {
        await setDoc(
          doc(db, 'contracts', contract.id),
          sanitizeForFirestore(contract),
          { merge: true }
        );
      }

      for (const session of storage.getSessions()) {
        await setDoc(
          doc(db, 'sessions', session.id),
          sanitizeForFirestore(session),
          { merge: true }
        );
      }

      for (const attendance of storage.getAttendance()) {
        await setDoc(
          doc(db, 'attendance', attendance.id),
          sanitizeForFirestore(attendance),
          { merge: true }
        );
      }

      for (const payment of storage.getPayments()) {
        await setDoc(
          doc(db, 'payments', payment.id),
          sanitizeForFirestore(payment),
          { merge: true }
        );
      }

      for (const teacherPayment of storage.getTeacherPayments()) {
        await setDoc(
          doc(db, 'teacherPayments', teacherPayment.id),
          sanitizeForFirestore(teacherPayment),
          { merge: true }
        );
      }

      for (const notification of storage.getNotifications()) {
        await setDoc(
          doc(db, 'notifications', notification.id),
          sanitizeForFirestore(notification),
          { merge: true }
        );
      }

      for (const auditLog of storage.getAuditLogs()) {
        await setDoc(
          doc(db, 'auditLogs', auditLog.id),
          sanitizeForFirestore(auditLog),
          { merge: true }
        );
      }

      this.updateStatus({
        isConnected: true,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
        isPermissionDenied: false
      });

      console.info(
        'Successfully synced all datasets to Firestore cloud!'
      );
    } catch (err) {
      console.warn(
        'Initial seeding encountered an error:',
        err
      );

      this.updateStatus({
        isSyncing: false,
        isPermissionDenied: isPermissionDeniedError(err),
        error:
          err instanceof Error
            ? err.message
            : String(err)
      });
    }
  }
}

export const firebaseSync =
  FirebaseSyncService.getInstance();