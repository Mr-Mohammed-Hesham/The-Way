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
 * USERNAME → INTERNAL FIREBASE EMAIL
 * ============================================================
 *
 * المستخدم في التطبيق يتعامل مع Username فقط.
 *
 * Firebase Authentication يحتاج Email + Password،
 * لذلك نولّد Email داخلي ثابت من الـ Username.
 *
 * مثال:
 *
 * hesham
 * ↓
 * hesham@theway.local
 *
 * المستخدم لن يرى هذا البريد.
 */

export const normalizeUsername = (
  username: string
): string => {
  return username
    .trim()
    .toLowerCase();
};

export const getFirebaseEmailFromUsername = (
  username: string
): string => {
  return `${normalizeUsername(username)}@theway.local`;
};

/*
 * ============================================================
 * SECONDARY FIREBASE APP
 * ============================================================
 *
 * لإنشاء حسابات الموظفين بدون تسجيل خروج الأدمن.
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

/*
 * لا نحتفظ بجلسة الموظف الجديد.
 */
void setPersistence(
  secondaryAuth,
  inMemoryPersistence
);

/*
 * ============================================================
 * LOGIN
 * ============================================================
 *
 * الدخول يتم باستخدام:
 *
 * Username + Password
 *
 * وليس Email + Password.
 */

export const firebaseLogin = async (
  username: string,
  password: string
): Promise<FirebaseUser> => {
  const firebaseEmail =
    getFirebaseEmailFromUsername(
      username
    );

  const credential =
    await signInWithEmailAndPassword(
      auth,
      firebaseEmail,
      password
    );

  return credential.user;
};

/*
 * ============================================================
 * CREATE USER
 * ============================================================
 *
 * إنشاء الموظف باستخدام:
 *
 * Username + Password
 *
 * ويتم تحويل Username إلى Email داخلي لـ Firebase.
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

  /*
   * إغلاق جلسة الـ secondary auth فورًا.
   */
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