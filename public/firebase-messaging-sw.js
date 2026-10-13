
/* public/firebase-messaging-sw.js */

/* Firebase compat SDK */
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "cst-hub-29587.firebaseapp.com",
  projectId: "cst-hub-29587",
  storageBucket: "cst-hub-29587.firebasestorage.app",
  messagingSenderId: "34807714008",
  appId: "YOUR_FULL_FIREBASE_APP_ID",
});

const messaging = firebase.messaging();

/*
  IMPORTANT:
  Backend notification payload পাঠাচ্ছে।
  তাই এখানে showNotification() দিয়ে আবার notification
  দেখাবে না; এতে duplicate notification হতে পারে।
*/

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification?.data?.FCM_MSG?.data?.url ||
    event.notification?.data?.url ||
    "https://cst-hub.vercel.app";

  event.waitUntil(
    (async () => {
      const targetUrl = new URL(
        url,
        self.location.origin
      ).href;

      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windows) {
        if ("focus" in client) {
          await client.navigate(targetUrl);
          return client.focus();
        }
      }

      return self.clients.openWindow(targetUrl);
    })()
  );
});
