/* public/firebase-messaging-sw.js */

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCnfZsifD-8BxuFaDIzoeLJuYzTtFrJ4fA",
  authDomain: "cst-hub-29587.firebaseapp.com",
  projectId: "cst-hub-29587",
  storageBucket: "cst-hub-29587.firebasestorage.app",
  messagingSenderId: "34807714008",
  appId: "1:34807714008:web:c92545f2a44b19533087ad",
});

const messaging = firebase.messaging();

// ==========================================
// BACKGROUND MESSAGE HANDLER (ওয়েবসাইট বন্ধ থাকলে নোটিফিকেশন দেখাবে)
// ==========================================
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message: ", payload);

  const title =
    payload.notification?.title ||
    payload.data?.title ||
    "CST Hub";

  const body =
    payload.notification?.body ||
    payload.data?.body ||
    "নতুন আপডেট এসেছে।";

  const url =
    payload.data?.url ||
    payload.notification?.click_action ||
    "/";

  const notificationOptions = {
    body: body,
    icon: "/favicon.ico", // প্রজেক্টের নোটিফিকেশন আইকন
    badge: "/favicon.ico",
    data: { url: url },
  };

  self.registration.showNotification(title, notificationOptions);
});

// ==========================================
// NOTIFICATION CLICK HANDLER (নোটিফিকেশনে ক্লিক করলে পেজ খুলবে)
// ==========================================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const rawUrl =
    event.notification?.data?.FCM_MSG?.data?.url ||
    event.notification?.data?.url ||
    "/";

  event.waitUntil(
    (async () => {
      let targetUrl;

      try {
        targetUrl = new URL(rawUrl, self.location.origin);

        // Do not navigate to an external website from a push notification.
        if (targetUrl.origin !== self.location.origin) {
          targetUrl = new URL("/", self.location.origin);
        }
      } catch {
        targetUrl = new URL("/", self.location.origin);
      }

      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windows) {
        if ("focus" in client) {
          await client.navigate(targetUrl.href);
          return client.focus();
        }
      }

      return self.clients.openWindow(targetUrl.href);
    })()
  );
});