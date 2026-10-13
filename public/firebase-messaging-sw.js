importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "cst-hub-29587.firebaseapp.com",
  projectId: "cst-hub-29587",
  storageBucket: "cst-hub-29587.firebasestorage.app",
  messagingSenderId: "34807714008",
  appId: "1:34807714008:web:c92545f2a44b19533087ad",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};

  return self.registration.showNotification(
    data.title || "CST Hub",
    {
      body: data.body || "নতুন আপডেট এসেছে।",
      data: { url: data.url || "/" },
    }
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = new URL(
    event.notification.data?.url || "/",
    self.location.origin
  ).href;

  event.waitUntil(clients.openWindow(url));
});