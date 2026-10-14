"use client";

import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getToken, onMessage } from "firebase/messaging";
import { getFCMMessaging } from "../lib/firebase";
import { Bell, BellRing } from "lucide-react";

export default function NotificationSetup({ user }) {
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const messageUnsubscribeRef = useRef(null);
  const notificationInFlightRef = useRef(false);
  const notificationSetupRef = useRef(false);
  const autoSetupAttemptRef = useRef("");
  const currentUserKeyRef = useRef("");

  const userKey = user
    ? `${user.email || user._id || user.name || "user"}-${user.group || "All"}`
    : "";

  // useCallback বাদ দিয়ে সাধারণ async ফাংশন করা হলো, কারণ React Compiler নিজে অপ্টিমাইজ করে নেবে
  const enableNotifications = async ({ requestPermission = true } = {}) => {
    if (notificationInFlightRef.current) return;

    if (
      notificationSetupRef.current &&
      notificationEnabled &&
      Notification.permission === "granted"
    ) {
      return;
    }

    notificationInFlightRef.current = true;
    setNotificationLoading(true);

    try {
      if (
        typeof window === "undefined" ||
        !("Notification" in window) ||
        !("serviceWorker" in navigator)
      ) {
        throw new Error(
          "এই browser-এ notification support নেই। Android Chrome দিয়ে চেষ্টা করো।"
        );
      }

      const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim();

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_BASE_URL configure করা নেই।");
      }

      if (!vapidKey) {
        throw new Error("Firebase VAPID key পাওয়া যায়নি।");
      }

      let permission = Notification.permission;

      if (permission === "default" && requestPermission) {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        if (permission === "denied") {
          throw new Error(
            "Browser settings থেকে CST Hub notification Allow করো।"
          );
        }

        if (requestPermission) {
          throw new Error("Notification permission দেওয়া হয়নি।");
        }

        return;
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      await navigator.serviceWorker.ready;

      const messaging = await getFCMMessaging();

      if (!messaging) {
        throw new Error(
          "Firebase Messaging supported নয়। Firebase configuration পরীক্ষা করো।"
        );
      }

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        throw new Error(
          "FCM token তৈরি হয়নি। VAPID public key পরীক্ষা করো।"
        );
      }

      const response = await fetch(
        `${apiUrl.replace(/\/+$/, "")}/notifications/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            group: user?.group || "All",
            email: user?.email || "",
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
            result.error ||
            `Token save failed: HTTP ${response.status}`
        );
      }

      if (!messageUnsubscribeRef.current) {
        messageUnsubscribeRef.current = onMessage(messaging, (payload) => {
          const title =
            payload.notification?.title ||
            payload.data?.title ||
            "CST Hub";

          const body =
            payload.notification?.body ||
            payload.data?.body ||
            "নতুন আপডেট এসেছে।";

          toast(`${title}: ${body}`);
        });
      }

      notificationSetupRef.current = true;
      setNotificationEnabled(true);

      if (requestPermission) {
        toast.success("CST Hub notification চালু হয়েছে!");
      }
    } catch (error) {
      console.error("Notification setup failed:", error);
      setNotificationEnabled(false);

      toast.error(
        error instanceof Error
          ? error.message
          : "Notification setup ব্যর্থ হয়েছে।"
      );
    } finally {
      notificationInFlightRef.current = false;
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") {
      setNotificationEnabled(false);
      return;
    }

    if (
      notificationSetupRef.current &&
      currentUserKeyRef.current === userKey
    ) {
      setNotificationEnabled(true);
      return;
    }

    if (autoSetupAttemptRef.current === userKey) return;

    autoSetupAttemptRef.current = userKey;
    currentUserKeyRef.current = userKey;

    void enableNotifications({ requestPermission: false });
  }, [user, userKey]);

  useEffect(() => {
    return () => {
      if (messageUnsubscribeRef.current) {
        messageUnsubscribeRef.current();
        messageUnsubscribeRef.current = null;
      }
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => void enableNotifications({ requestPermission: true })}
      disabled={notificationLoading}
      aria-label="Enable CST Hub notifications"
      title={
        notificationEnabled ? "Notifications enabled" : "Enable notifications"
      }
      className={`relative ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
        notificationEnabled
          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-400"
          : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-white"
      } disabled:cursor-wait disabled:opacity-60`}
    >
      {notificationLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : notificationEnabled ? (
        <BellRing className="h-5 w-5" />
      ) : (
        <Bell className="h-5 w-5" />
      )}

      {notificationEnabled && (
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
      )}
    </button>
  );
}