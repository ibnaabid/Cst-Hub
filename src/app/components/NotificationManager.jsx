
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getToken, onMessage } from "firebase/messaging";
import { getFCMMessaging } from "../lib/firebase";
import { Bell, BellRing } from "lucide-react";

export default function NotificationSetup({ user }) {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const inFlightRef = useRef(false);
  const unsubscribeRef = useRef(null);
  const setupUserRef = useRef("");

  const userEmail = user?.email || "";
  const userGroup = user?.group || "All";
  const userId = user?._id || user?.name || "user";
  const userKey = user
    ? `${userEmail || userId}-${userGroup}`
    : "";

  const enableNotifications = useCallback(
    async ({ requestPermission = true } = {}) => {
      if (inFlightRef.current) return;

      if (
        typeof window === "undefined" ||
        !("Notification" in window) ||
        !("serviceWorker" in navigator)
      ) {
        toast.error("এই browser-এ notification support নেই।");
        return;
      }

      if (!userKey) {
        toast.error("প্রথমে CST Hub-এ login করো।");
        return;
      }

      inFlightRef.current = true;
      setLoading(true);

      try {
        const baseUrl = (
          process.env.NEXT_PUBLIC_BASE_URL || ""
        )
          .trim()
          .replace(/\/+$/, "");

        const vapidKey = (
          process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ""
        ).trim();

        if (!baseUrl) {
          throw new Error("NEXT_PUBLIC_BASE_URL সেট করা নেই।");
        }

        if (!vapidKey) {
          throw new Error(
            "NEXT_PUBLIC_FIREBASE_VAPID_KEY সেট করা নেই।"
          );
        }

        let permission = Notification.permission;

        if (permission === "default" && requestPermission) {
          permission = await Notification.requestPermission();
        }

        if (permission !== "granted") {
          if (permission === "denied") {
            throw new Error(
              "Browser settings থেকে notification Allow করো।"
            );
          }

          if (requestPermission) {
            throw new Error("Notification permission দেওয়া হয়নি।");
          }

          return;
        }

        const registration =
          await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
          );

        await navigator.serviceWorker.ready;

        const messaging = await getFCMMessaging();

        if (!messaging) {
          throw new Error(
            "Firebase Messaging চালু হয়নি। Firebase config পরীক্ষা করো।"
          );
        }

        const token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (!token) {
          throw new Error("Firebase FCM token তৈরি হয়নি।");
        }

        const apiUrl = `${baseUrl}/notifications/subscribe`;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token,
            group: userGroup,
            email: userEmail,
          }),
        });

        const responseText = await response.text();

        console.log("Notification API:", apiUrl);
        console.log("HTTP status:", response.status);
        console.log(
          "Content-Type:",
          response.headers.get("content-type")
        );

        let result;

        try {
          result = JSON.parse(responseText);
        } catch {
          console.error("Invalid notification API response:", {
            url: apiUrl,
            status: response.status,
            response: responseText.slice(0, 500),
          });

          throw new Error(
            `Backend valid JSON দেয়নি (HTTP ${response.status})। F12 Console দেখো।`
          );
        }

        if (!response.ok || result.success !== true) {
          throw new Error(
            result.message ||
              result.error ||
              `Subscribe failed (HTTP ${response.status})`
          );
        }

        if (!unsubscribeRef.current) {
          unsubscribeRef.current = onMessage(
            messaging,
            (payload) => {
              const title =
                payload.notification?.title ||
                payload.data?.title ||
                "CST Hub";

              const body =
                payload.notification?.body ||
                payload.data?.body ||
                "নতুন আপডেট এসেছে।";

              toast(`${title}: ${body}`);
            }
          );
        }

        setupUserRef.current = userKey;
        setEnabled(true);

        if (requestPermission) {
          toast.success("CST Hub notification চালু হয়েছে!");
        }
      } catch (error) {
        console.error("Notification setup failed:", error);
        setEnabled(false);
        setupUserRef.current = "";

        toast.error(
          error instanceof Error
            ? error.message
            : "Notification setup ব্যর্থ হয়েছে।"
        );
      } finally {
        inFlightRef.current = false;
        setLoading(false);
      }
    },
    [userKey, userEmail, userGroup]
  );

  useEffect(() => {
    if (!userKey || typeof window === "undefined") {
      setEnabled(false);
      setupUserRef.current = "";
      return;
    }

    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") {
      setEnabled(false);
      return;
    }

    if (setupUserRef.current === userKey) {
      setEnabled(true);
      return;
    }

    void enableNotifications({ requestPermission: false });
  }, [userKey, enableNotifications]);

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() =>
        void enableNotifications({ requestPermission: true })
      }
      disabled={loading}
      aria-label="Enable CST Hub notifications"
      title={enabled ? "Notifications enabled" : "Enable notifications"}
      className={`relative ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
        enabled
          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-400"
          : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-white"
      } disabled:cursor-wait disabled:opacity-60`}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : enabled ? (
        <BellRing className="h-5 w-5" />
      ) : (
        <Bell className="h-5 w-5" />
      )}

      {enabled && (
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
      )}
    </button>
  );
}
