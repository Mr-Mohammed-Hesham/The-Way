import { initializeApp, getApps } from 'firebase/app';

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  setPersistence,
  inMemoryPersistence,
  User as FirebaseUser,
} from 'firebase/auth';

import firebaseConfig from '../../firebase-applet-config.json';
import { app } from './firebase';

export const auth = getAuth(app);

/*
 * ============================================================
 * USERNAME / EMAIL → FIREBASE AUTH EMAIL RESOLUTION
 * ============================================================
 *
 * يدعم تسجيل الدخول سواء كتب المستخدم:
 * 1) اسم المستخدم فقط مثل: admin أو hesham -> يتحول إلى username@theway.local
 * 2) البريد الكامل مثل: admin@theway.local أو بريد حقيقي مسجل في Firebase Auth
 */

export const normalizeUsername = (
  username: string
): string => {
  return username
    .trim()
    .toLowerCase();
};

export const extractUsernameFromEmail = (
  emailOrUsername: string
): string => {
  const clean = normalizeUsername(emailOrUsername);
  if (clean.includes('@')) {
    return clean.split('@')[0] || clean;
  }
  return clean;
};

export const getFirebaseEmailFromUsername = (
  usernameOrEmail: string
): string => {
  const clean = normalizeUsername(usernameOrEmail);
  if (clean.includes('@')) {
    return clean;
  }
  return `${clean}@theway.local`;
};

export const getCandidateFirebaseEmails = (
  identifier: string,
  knownUserEmail?: string
): string[] => {
  const clean = normalizeUsername(identifier);
  const candidates: string[] = [];

  const addCandidate = (email?: string) => {
    if (!email) return;
    const trimmed = email.trim().toLowerCase();
    if (trimmed && trimmed.includes('@') && !candidates.includes(trimmed)) {
      candidates.push(trimmed);
    }
  };

  if (clean.includes('@')) {
    addCandidate(clean);
    const localPart = clean.split('@')[0];
    if (localPart) {
      addCandidate(`${localPart}@theway.local`);
    }
    addCandidate(knownUserEmail);
  } else {
    addCandidate(`${clean}@theway.local`);
    addCandidate(knownUserEmail);
    addCandidate(`${clean}@theway-center.ae`);
    addCandidate(`${clean}@theway.com`);
  }

  return candidates;
};

/*
 * ============================================================
 * SECONDARY FIREBASE APP
 * ============================================================
 *
 * لإنشاء حسابات الموظفين بدون تسجيل خروج الأدمن الحالي.
 */

const secondaryApp =
  getApps().find(
    existingApp =>
      existingApp.name ===
      'TheWayUserCreation'
  ) ??
  initializeApp(
    firebaseConfig,
    'TheWayUserCreation'
  );

const secondaryAuth =
  getAuth(secondaryApp);

void setPersistence(
  secondaryAuth,
  inMemoryPersistence
);

/*
 * ============================================================
 * LOGIN
 * ============================================================
 */

export const firebaseLogin = async (
  identifier: string,
  password: string,
  knownUserEmail?: string
): Promise<FirebaseUser> => {
  const candidates = getCandidateFirebaseEmails(
    identifier,
    knownUserEmail
  );

  let lastError: unknown = null;

  for (const emailCandidate of candidates) {
    try {
      const credential =
        await signInWithEmailAndPassword(
          auth,
          emailCandidate,
          password
        );

      return credential.user;
    } catch (err: any) {
      lastError = err;
      const code = err?.code || '';
      // If account is disabled or rate-limited or network failed, stop immediately
      if (
        code === 'auth/user-disabled' ||
        code === 'auth/too-many-requests' ||
        code === 'auth/network-request-failed'
      ) {
        throw err;
      }
      // Otherwise (auth/invalid-credential, auth/user-not-found, auth/invalid-email), try next candidate
    }
  }

  throw lastError || new Error('auth/invalid-credential');
};

/*
 * ============================================================
 * CREATE USER
 * ============================================================
 */

export const firebaseCreateUser = async (
  username: string,
  password: string
): Promise<FirebaseUser> => {
  const firebaseEmail =
    getFirebaseEmailFromUsername(
      username
    );

  const credential =
    await createUserWithEmailAndPassword(
      secondaryAuth,
      firebaseEmail,
      password
    );

  await signOut(
    secondaryAuth
  );

  return credential.user;
};

/*
 * ============================================================
 * LOGOUT
 * ============================================================
 */

export const firebaseLogout =
  async (): Promise<void> => {
    await signOut(auth);
  };

/*
 * ============================================================
 * AUTH STATE
 * ============================================================
 */

export const subscribeToFirebaseAuth = (
  callback: (
    user: FirebaseUser | null
  ) => void
) => {
  return onAuthStateChanged(
    auth,
    callback
  );
};