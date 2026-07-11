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
let recaptchaWidgetId: string | null = null;

export const resetFirebaseRecaptchaVerifier = () => {
  try {
    recaptchaVerifier?.clear();
  } catch {
    // ignore clear errors on an already-detached verifier
  }
  recaptchaVerifier = null;
  if (recaptchaWidgetId) {
    const widget = document.getElementById(recaptchaWidgetId);
    widget?.remove();
  }
  recaptchaWidgetId = null;
};

export const sendFirebasePhoneOtp = async (phoneNumber: string, containerId: string): Promise<ConfirmationResult> => {
  resetFirebaseRecaptchaVerifier();

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`reCAPTCHA container "${containerId}" không tồn tại.`);
  }
  container.innerHTML = '';

  const widget = document.createElement('div');
  recaptchaWidgetId = `${containerId}-widget-${Date.now()}`;
  widget.id = recaptchaWidgetId;
  container.appendChild(widget);

  recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, widget, {
    size: 'invisible',
    callback: () => undefined,
    'expired-callback': () => {
      resetFirebaseRecaptchaVerifier();
    }
  });

  try {
    return await signInWithPhoneNumber(firebaseAuth, phoneNumber, recaptchaVerifier);
  } catch (error) {
    resetFirebaseRecaptchaVerifier();
    throw error;
  }
};
