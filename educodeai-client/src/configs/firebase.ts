import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
firebaseAuth.languageCode = 'vi';

let recaptchaVerifier: RecaptchaVerifier | null = null;

export const getFirebaseRecaptchaVerifier = (containerId: string) => {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
      size: 'invisible',
      callback: () => undefined,
      'expired-callback': () => {
        recaptchaVerifier?.clear();
        recaptchaVerifier = null;
      }
    });
  }

  return recaptchaVerifier;
};

export const resetFirebaseRecaptchaVerifier = () => {
  recaptchaVerifier?.clear();
  recaptchaVerifier = null;
};

export const sendFirebasePhoneOtp = async (phoneNumber: string, recaptchaContainerId: string): Promise<ConfirmationResult> => {
  const verifier = getFirebaseRecaptchaVerifier(recaptchaContainerId);
  return signInWithPhoneNumber(firebaseAuth, phoneNumber, verifier);
};
