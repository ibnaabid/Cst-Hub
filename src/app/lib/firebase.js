// ```js
import {
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";

import {
  getMessaging,
  isSupported,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredConfig = [
  "apiKey",
  "authDomain",
  "projectId",
  "messagingSenderId",
  "appId",
];

const missingConfig = requiredConfig.filter(
  (key) => !firebaseConfig[key]
);

if (missingConfig.length > 0) {
  console.error(
    "Firebase config missing:",
    missingConfig.join(", ")
  );
}

export const firebaseApp =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

export async function getFCMMessaging() {
  if (typeof window === "undefined") {
    return null;
  }

  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator)
  ) {
    return null;
  }

  try {
    const supported = await isSupported();

    if (!supported) {
      console.warn(
        "Firebase Messaging is not supported in this browser."
      );
      return null;
    }

    return getMessaging(firebaseApp);
  } catch (error) {
    console.error(
      "Firebase Messaging initialization failed:",
      error
    );

    return null;
  }
}
