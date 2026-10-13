"use client";

import { useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
// import { getFCMMessaging } from "@/lib/firebase";
import { getFCMMessaging } from "../lib/firebase"; // Adjust the import path as needed 

export default function NotificationSetup() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function enableNotifications() {
    setLoading(true);

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus("Browser settings থেকে Allow করো।");
        return;
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      const messaging = await getFCMMessaging();

      if (!messaging) {
        throw new Error("এই browser-এ FCM support নেই।");
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!token) throw new Error("FCM token তৈরি হয়নি।");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, group: "All" }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Token save হয়নি।");
      }

      onMessage(messaging, (payload) => {
        const title = payload.data?.title || "CST Hub";
        const body = payload.data?.body || "নতুন আপডেট এসেছে।";

        setStatus(`${title}: ${body}`);

        if (Notification.permission === "granted") {
          new Notification(title, { body });
        }
      });

      setStatus("Notification চালু হয়েছে!");
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Setup ব্যর্থ হয়েছে..");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={enableNotifications} disabled={loading}>
        {loading ? "চালু হচ্ছে..." : "🔔 Notification চালু করো"}
      </button>

      <p role="status">{status}</p>
    </div>
  );
}