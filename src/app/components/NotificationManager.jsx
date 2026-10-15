import { useState, useEffect } from 'react';
import { getToken } from 'firebase/messaging';
// import {messa}
import { messaging } from '@/lib/firebase'; // তোমার ফায়ারবেস কনফিগারেশন পাথ অনুযায়ী পরিবর্তন করে নিও
import { Bell } from 'lucide-react';

export default function NotificationButton({ userGroup }) {
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        // Firebase Cloud Messaging থেকে টোকেন নেওয়া
        const currentToken = await getToken(messaging, {
          vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' // ফায়ারবেস কনসোলের Web Push certificates থেকে VAPID key দিতে হবে
        });

        if (currentToken) {
          // তোমার ব্যাকএন্ড রাউট `/notifications/subscribe`-এ পাঠানো
          const response = await fetch('https://csthub-backend-dw3l.onrender.com/notifications/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: currentToken,
              group: userGroup || 'All',
            }),
          });

          const data = await response.json();
          if (data.success) {
            console.log("Device subscribed successfully!");
          }
        }
      } else {
        alert('Notification permission denied.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
  type="button"
  aria-label="Notifications"
  title="Notifications"
  onClick={handleNotificationClick}
  className={[
    "relative flex h-10 w-10 shrink-0 items-center justify-center",
    "rounded-xl border border-purple-200 bg-white text-violet-700",
    "transition-colors duration-200 hover:bg-purple-50",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-violet-500",
  ].join(" ")}
>
  <Bell className="h-5 w-5" />
</button>
  );
}