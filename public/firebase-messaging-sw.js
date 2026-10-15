/* public/firebase-messaging-sw.js */


// firebase.initializeApp({
//   apiKey: "AIzaSyCnfZsifD-8BxuFaDIzoeLJuYzTtFrJ4fA",
//   authDomain: "cst-hub-29587.firebaseapp.com",
//   projectId: "cst-hub-29587",
//   storageBucket: "cst-hub-29587.firebasestorage.app",
//   messagingSenderId: "34807714008",
//   appId: "1:34807714008:web:c92545f2a44b19533087ad",
// });


/* public/firebase-messaging-sw.js */

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.firebase.initializeApp({
//   apiKey: "AIzaSyCnfZsifD-8BxuFaDIzoeLJuYzTtFrJ4fA",
//   authDomain: "cst-hub-29587.firebaseapp.com",
//   projectId: "cst-hub-29587",
//   storageBucket: "cst-hub-29587.firebasestorage.app",
//   messagingSenderId: "34807714008",
//   appId: "1:34807714008:web:c92545f2a44b19533087ad",
// 
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title =
    payload.notification?.title ||
    payload.data?.title ||
    "CST HUB";

  const options = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "নতুন আপডেট এসেছে।",
    icon: "/icon.png",
    data: {
      url: payload.data?.url || "/",
    },
  };

  return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/",
    self.location.origin
  ).href;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl);
    })
  );
});
