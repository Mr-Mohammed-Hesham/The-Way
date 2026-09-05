import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs
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
    error: null
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

  /**
   * Initializes Firestore real-time synchronization.
   */
  public async initSync(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    this.updateStatus({
      isSyncing: true,
      error: null
    });

    const storage =
      StorageService.getInstance();

    try {
      /*
       * Check whether Firestore already contains
       * training-center data.
       *
       * We keep the existing bootstrap behavior:
       * if students is completely empty, the current
       * local data is seeded to Firestore.
       */
      const studentsPath = 'students';

      let existingStudentsSnap;

      try {
        existingStudentsSnap =
          await getDocs(
            collection(db, studentsPath)
          );
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.LIST,
          studentsPath
        );

        throw err;
      }

      if (
        existingStudentsSnap &&
        existingStudentsSnap.empty
      ) {
        console.info(
          'Seeding initial training center data to Firebase Firestore...'
        );

        await this.seedAllToFirestore(storage);
      }

      /*
       * Start real-time listeners.
       */
      this.attachCollectionListeners(storage);

      this.updateStatus({
        isConnected: true,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null
      });
    } catch (err) {
      console.error(
        'Failed to initialize Firebase sync:',
        err
      );

      this.updateStatus({
        isConnected: false,
        isSyncing: false,
        error:
          err instanceof Error
            ? err.message
            : 'Unknown sync error'
      });
    }
  }

  /**
   * Attach real-time Firestore listeners
   * for all application collections.
   */
  private attachCollectionListeners(
    storage: StorageService
  ) {
    /*
     * STUDENTS
     */
    const studentsPath = 'students';

    onSnapshot(
      collection(db, studentsPath),
      snapshot => {
        const remoteStudents =
          snapshot.docs.map(
            document =>
              document.data() as Student
          );

        if (remoteStudents.length > 0) {
          storage.mergeRemoteStudents(
            remoteStudents
          );
        }

        this.updateStatus({
          isConnected: true,
          lastSyncedAt: new Date(),
          error: null
        });
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          studentsPath
        );

        this.updateStatus({
          isConnected: false,
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
    );

    /*
     * TEACHERS
     */
    const teachersPath = 'teachers';

    onSnapshot(
      collection(db, teachersPath),
      snapshot => {
        const remoteTeachers =
          snapshot.docs.map(
            document =>
              document.data() as Teacher
          );

        if (remoteTeachers.length > 0) {
          storage.mergeRemoteTeachers(
            remoteTeachers
          );
        }

        this.updateStatus({
          isConnected: true,
          lastSyncedAt: new Date(),
          error: null
        });
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          teachersPath
        );

        this.updateStatus({
          isConnected: false,
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
    );

    /*
     * SUBJECTS
     */
    const subjectsPath = 'subjects';

    onSnapshot(
      collection(db, subjectsPath),
      snapshot => {
        const remoteSubjects =
          snapshot.docs.map(
            document =>
              document.data() as Subject
          );

        if (remoteSubjects.length > 0) {
          storage.mergeRemoteSubjects(
            remoteSubjects
          );
        }

        this.updateStatus({
          isConnected: true,
          lastSyncedAt: new Date(),
          error: null
        });
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          subjectsPath
        );

        this.updateStatus({
          isConnected: false,
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
    );

    /*
     * ROOMS
     */
    const roomsPath = 'rooms';

    onSnapshot(
      collection(db, roomsPath),
      snapshot => {
        const remoteRooms =
          snapshot.docs.map(
            document =>
              document.data() as Room
          );

        if (remoteRooms.length > 0) {
          storage.mergeRemoteRooms(
            remoteRooms
          );
        }

        this.updateStatus({
          isConnected: true,
          lastSyncedAt: new Date(),
          error: null
        });
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          roomsPath
        );

        this.updateStatus({
          isConnected: false,
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
    );

    /*
     * ASSIGNMENTS
     */
    const assignmentsPath = 'assignments';

    onSnapshot(
      collection(db, assignmentsPath),
      snapshot => {
        const remoteAssignments =
          snapshot.docs.map(
            document =>
              document.data() as TeacherAssignment
          );

        if (remoteAssignments.length > 0) {
          storage.mergeRemoteAssignments(
            remoteAssignments
          );
        }

        this.updateStatus({
          isConnected: true,
          lastSyncedAt: new Date(),
          error: null
        });
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          assignmentsPath
        );

        this.updateStatus({
          isConnected: false,
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
    );

    /*
     * CONTRACTS
     */
    const contractsPath = 'contracts';

    onSnapshot(
      collection(db, contractsPath),
      snapshot => {
        const remoteContracts =
          snapshot.docs.map(
            document =>
              document.data() as Contract
          );

        if (remoteContracts.length > 0) {
          storage.mergeRemoteContracts(
            remoteContracts
          );
        }

        this.updateStatus({
          isConnected: true,
          lastSyncedAt: new Date(),
          error: null
        });
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          contractsPath
        );

        this.updateStatus({
          isConnected: false,
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
    );

    /*
     * SESSIONS
     */
    const sessionsPath = 'sessions';

    onSnapshot(
      collection(db, sessionsPath),
      snapshot => {
        const remoteSessions =
          snapshot.docs.map(
            document =>
              document.data() as Session
          );

        if (remoteSessions.length > 0) {
          storage.mergeRemoteSessions(
            remoteSessions
          );
        }

        this.updateStatus({
          isConnected: true,
          lastSyncedAt: new Date(),
          error: null
        });
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          sessionsPath
        );

        this.updateStatus({
          isConnected: false,
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
    );

    /*
     * ATTENDANCE
     */
    const attendancePath = 'attendance';

    onSnapshot(
      collection(db, attendancePath),
      snapshot => {
        const remoteAttendance =
          snapshot.docs.map(
            document =>
              document.data() as AttendanceRecord
          );

        if (remoteAttendance.length > 0) {
          storage.mergeRemoteAttendance(
            remoteAttendance
          );
        }

        this.updateStatus({
          isConnected: true,
          lastSyncedAt: new Date(),
          error: null
        });
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          attendancePath
        );

        this.updateStatus({
          isConnected: false,
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
    );

    /*
     * PAYMENTS
     */
    const paymentsPath = 'payments';

    onSnapshot(
      collection(db, paymentsPath),
      snapshot => {
        const remotePayments =
          snapshot.docs.map(
            document =>
              document.data() as Payment
          );

        if (remotePayments.length > 0) {
          storage.mergeRemotePayments(
            remotePayments
          );
        }

        this.updateStatus({
          isConnected: true,
          lastSyncedAt: new Date(),
          error: null
        });
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          paymentsPath
        );

        this.updateStatus({
          isConnected: false,
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
    );

    /*
     * TEACHER PAYMENTS
     */
    const teacherPaymentsPath =
      'teacherPayments';

    onSnapshot(
      collection(
        db,
        teacherPaymentsPath
      ),
      snapshot => {
        const remoteTeacherPayments =
          snapshot.docs.map(
            document =>
              document.data() as TeacherPayment
          );

        if (
          remoteTeacherPayments.length > 0
        ) {
          storage.mergeRemoteTeacherPayments(
            remoteTeacherPayments
          );
        }

        this.updateStatus({
          isConnected: true,
          lastSyncedAt: new Date(),
          error: null
        });
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          teacherPaymentsPath
        );

        this.updateStatus({
          isConnected: false,
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
    );

    /*
     * NOTIFICATIONS
     */
    const notificationsPath =
      'notifications';

    onSnapshot(
      collection(
        db,
        notificationsPath
      ),
      snapshot => {
        const remoteNotifications =
          snapshot.docs.map(
            document =>
              document.data() as NotificationItem
          );

        if (
          remoteNotifications.length > 0
        ) {
          storage.mergeRemoteNotifications(
            remoteNotifications
          );
        }

        this.updateStatus({
          isConnected: true,
          lastSyncedAt: new Date(),
          error: null
        });
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          notificationsPath
        );

        this.updateStatus({
          isConnected: false,
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
    );

    /*
     * AUDIT LOGS
     */
    const auditLogsPath = 'auditLogs';

    onSnapshot(
      collection(db, auditLogsPath),
      snapshot => {
        const remoteAuditLogs =
          snapshot.docs.map(
            document =>
              document.data() as AuditLogItem
          );

        if (remoteAuditLogs.length > 0) {
          storage.mergeRemoteAuditLogs(
            remoteAuditLogs
          );
        }

        this.updateStatus({
          isConnected: true,
          lastSyncedAt: new Date(),
          error: null
        });
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          auditLogsPath
        );

        this.updateStatus({
          isConnected: false,
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
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

      await setDoc(
        doc(
          db,
          collectionName,
          item.id
        ),
        item,
        {
          merge: true
        }
      );

      this.updateStatus({
        isConnected: true,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null
      });
    } catch (err) {
      this.updateStatus({
        isSyncing: false,
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
        error: null
      });
    } catch (err) {
      this.updateStatus({
        isSyncing: false,
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
      /*
       * SETTINGS
       */
      const settings =
        storage.getSettings();

      await setDoc(
        doc(
          db,
          'settings',
          'center_config'
        ),
        {
          ...settings,
          id: 'center_config'
        }
      );

      /*
       * STUDENTS
       */
      for (
        const student
        of storage.getStudents()
      ) {
        await setDoc(
          doc(
            db,
            'students',
            student.id
          ),
          student
        );
      }

      /*
       * TEACHERS
       */
      for (
        const teacher
        of storage.getTeachers()
      ) {
        await setDoc(
          doc(
            db,
            'teachers',
            teacher.id
          ),
          teacher
        );
      }

      /*
       * SUBJECTS
       */
      for (
        const subject
        of storage.getSubjects()
      ) {
        await setDoc(
          doc(
            db,
            'subjects',
            subject.id
          ),
          subject
        );
      }

      /*
       * ROOMS
       */
      for (
        const room
        of storage.getRooms()
      ) {
        await setDoc(
          doc(
            db,
            'rooms',
            room.id
          ),
          room
        );
      }

      /*
       * ASSIGNMENTS
       */
      for (
        const assignment
        of storage.getAssignments()
      ) {
        await setDoc(
          doc(
            db,
            'assignments',
            assignment.id
          ),
          assignment
        );
      }

      /*
       * CONTRACTS
       */
      for (
        const contract
        of storage.getContracts()
      ) {
        await setDoc(
          doc(
            db,
            'contracts',
            contract.id
          ),
          contract
        );
      }

      /*
       * SESSIONS
       */
      for (
        const session
        of storage.getSessions()
      ) {
        await setDoc(
          doc(
            db,
            'sessions',
            session.id
          ),
          session
        );
      }

      /*
       * ATTENDANCE
       */
      for (
        const attendance
        of storage.getAttendance()
      ) {
        await setDoc(
          doc(
            db,
            'attendance',
            attendance.id
          ),
          attendance
        );
      }

      /*
       * PAYMENTS
       */
      for (
        const payment
        of storage.getPayments()
      ) {
        await setDoc(
          doc(
            db,
            'payments',
            payment.id
          ),
          payment
        );
      }

      /*
       * TEACHER PAYMENTS
       */
      for (
        const teacherPayment
        of storage.getTeacherPayments()
      ) {
        await setDoc(
          doc(
            db,
            'teacherPayments',
            teacherPayment.id
          ),
          teacherPayment
        );
      }

      /*
       * NOTIFICATIONS
       */
      for (
        const notification
        of storage.getNotifications()
      ) {
        await setDoc(
          doc(
            db,
            'notifications',
            notification.id
          ),
          notification
        );
      }

      /*
       * AUDIT LOGS
       */
      for (
        const auditLog
        of storage.getAuditLogs()
      ) {
        await setDoc(
          doc(
            db,
            'auditLogs',
            auditLog.id
          ),
          auditLog
        );
      }

      this.updateStatus({
        isConnected: true,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null
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