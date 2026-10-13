// ```jsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Bell,
  BookOpen,
  Home,
  LogIn,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";

import { getToken, onMessage } from "firebase/messaging";
import { getFCMMessaging } from "../lib/firebase";

const API_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://csthub-backend-dw3l.onrender.com"
).replace(/\/$/, "");

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const notificationSetupRef = useRef(false);
  const foregroundListenerRef = useRef(false);

  // --------------------------------------------------
  // LOAD CURRENT USER
  // --------------------------------------------------
  const loadUser = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const savedUser =
        localStorage.getItem("currentUser") ||
        sessionStorage.getItem("currentUser");

      if (!savedUser) {
        setUser(null);
        return;
      }

      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Unable to read current user:", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadUser();

    const handleStorage = () => loadUser();
    const handleUserLogin = () => loadUser();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("user-login", handleUserLogin);
    window.addEventListener("user-updated", handleUserLogin);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("user-login", handleUserLogin);
      window.removeEventListener("user-updated", handleUserLogin);
    };
  }, [loadUser]);

  // --------------------------------------------------
  // HIDE NAVBAR ON DASHBOARD PAGES
  // --------------------------------------------------
  const hiddenRoutes = [
    "/Student-dashboard",
    "/cr-dashboard",
  ];

  const hideNavbar = hiddenRoutes.some((route) =>
    pathname?.toLowerCase().startsWith(route.toLowerCase())
  );

  // --------------------------------------------------
  // FIREBASE PUSH NOTIFICATIONS
  // --------------------------------------------------
  const enableNotifications = useCallback(
    async ({ requestPermission = true } = {}) => {
      if (!user) {
        toast.error("Notification চালু করতে আগে Login করো।");
        return;
      }

      if (typeof window === "undefined") return;

      if (!("Notification" in window)) {
        toast.error(
          "এই browser notification support করছে না। Chrome browser ব্যবহার করো।"
        );
        return;
      }

      if (!("serviceWorker" in navigator)) {
        toast.error("এই browser Service Worker support করছে না।");
        return;
      }

      if (notificationLoading) return;

      setNotificationLoading(true);

      try {
        let permission = Notification.permission;

        if (permission !== "granted" && requestPermission) {
          permission = await Notification.requestPermission();
        }

        if (permission !== "granted") {
          setNotificationEnabled(false);

          if (permission === "denied") {
            toast.error(
              "Browser settings থেকে CST Hub-এর notification Allow করো।"
            );
          } else {
            toast("Notification permission দেওয়া হয়নি।");
          }

          return;
        }

        const messaging = await getFCMMessaging();

        if (!messaging) {
          throw new Error(
            "Firebase Messaging পাওয়া যায়নি। Firebase configuration check করো।"
          );
        }

        const vapidKey =
          process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

        if (!vapidKey) {
          throw new Error(
            "NEXT_PUBLIC_FIREBASE_VAPID_KEY environment variable পাওয়া যায়নি।"
          );
        }

        // Register the notification service worker.
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        await navigator.serviceWorker.ready;

        // Obtain the browser/device FCM token.
        const token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (!token) {
          throw new Error(
            "Firebase token তৈরি হয়নি। VAPID key এবং Firebase config check করো।"
          );
        }

        // Match the backend's expected group value.
        const group =
          typeof user.group === "string" && user.group.trim()
            ? user.group.trim()
            : "All";

        // Save token on backend.
        const response = await fetch(
          `${API_URL}/notifications/subscribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
              group,
            }),
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message ||
              result.error ||
              `Subscription failed (${response.status})`
          );
        }

        setNotificationEnabled(true);
        notificationSetupRef.current = true;

        // Register foreground listener only once per mounted Navbar.
        if (!foregroundListenerRef.current) {
          foregroundListenerRef.current = true;

          onMessage(messaging, (payload) => {
            const title =
              payload.notification?.title ||
              payload.data?.title ||
              "CST Hub";

            const message =
              payload.notification?.body ||
              payload.data?.body ||
              payload.data?.message ||
              "তোমার জন্য নতুন আপডেট আছে।";

            toast(
              `${title}: ${message}`,
              { duration: 6000 }
            );

            // Display a system notification when the page is visible.
            // Background notifications are handled by Firebase/browser.
            if (
              document.visibilityState === "visible" &&
              Notification.permission === "granted"
            ) {
              try {
                new Notification(title, {
                  body: message,
                  icon: "/favicon.ico",
                  tag: payload.data?.noticeId || "cst-hub-update",
                });
              } catch (error) {
                // Toast still informs the user if system notification fails.
                console.warn(
                  "Foreground system notification could not be shown:",
                  error
                );
              }
            }
          });
        }

        toast.success("CST Hub notification চালু হয়েছে!");
      } catch (error) {
        console.error("Notification setup error:", error);

        setNotificationEnabled(false);
        notificationSetupRef.current = false;

        toast.error(
          error.message || "Notification চালু করা যায়নি।"
        );
      } finally {
        setNotificationLoading(false);
      }
    },
    [user, notificationLoading]
  );

  // --------------------------------------------------
  // AUTO-REGISTER IF PERMISSION IS ALREADY GRANTED
  // --------------------------------------------------
  useEffect(() => {
    if (!mounted || !user) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") {
      setNotificationEnabled(false);
      return;
    }

    if (notificationSetupRef.current) {
      setNotificationEnabled(true);
      return;
    }

    // Do not request permission automatically.
    // Permission has already been granted by the user.
    enableNotifications({ requestPermission: false });
  }, [mounted, user, enableNotifications]);

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");

    setUser(null);
    setMobileMenuOpen(false);
    setNotificationEnabled(false);
    notificationSetupRef.current = false;

    toast.success("Logout successful!");
    router.push("/login");
    router.refresh();
  };

  // --------------------------------------------------
  // NAVIGATION LINKS
  // --------------------------------------------------
  const links = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Study Materials",
      href: "/notes",
      icon: BookOpen,
    },
  ];

  if (!mounted || hideNavbar) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/90 text-white shadow-lg backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* LOGO */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-lg font-black text-slate-950">
            C
          </span>

          <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
            CST <span className="text-emerald-400">Hub</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={17} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* GROUP LABEL */}
              {user.group && (
                <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 sm:inline-flex">
                  Group {user.group}
                </span>
              )}

              {/* NOTIFICATION BUTTON */}
              <button
                type="button"
                onClick={() => enableNotifications()}
                disabled={notificationLoading}
                aria-label="Enable notifications"
                title={
                  notificationEnabled
                    ? "Notifications enabled"
                    : "Enable notifications"
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Bell
                  size={19}
                  className={
                    notificationEnabled
                      ? "text-emerald-400"
                      : "text-slate-200"
                  }
                />

                {notificationLoading && (
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-ping rounded-full bg-amber-400" />
                )}

                {!notificationLoading && notificationEnabled && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                )}
              </button>

              {/* USER */}
              <div className="hidden items-center gap-2 rounded-xl px-2 py-1.5 lg:flex">
                <UserRound
                  size={18}
                  className="text-emerald-400"
                />

                <div className="max-w-32">
                  <p className="truncate text-sm font-semibold">
                    {user.name || user.fullName || "Student"}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {user.role || "Student"}
                  </p>
                </div>
              </div>

              {/* LOGOUT */}
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 sm:flex"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 sm:flex"
            >
              <LogIn size={17} />
              Login
            </Link>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={
              mobileMenuOpen ? "Close menu" : "Open menu"
            }
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10 md:hidden"
          >
            {mobileMenuOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-slate-950 px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <div className="my-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-sm font-bold">
                    {user.name || user.fullName || "Student"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {user.email || ""}
                  </p>

                  {user.group && (
                    <p className="mt-1 text-xs text-emerald-300">
                      Group {user.group}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    enableNotifications();
                  }}
                  disabled={notificationLoading}
                  className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-left text-sm font-semibold text-emerald-300 disabled:opacity-60"
                >
                  <Bell size={18} />
                  {notificationLoading
                    ? "Enabling notifications..."
                    : notificationEnabled
                    ? "Notifications enabled"
                    : "Enable notifications"}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-left text-sm font-semibold text-red-300"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950"
              >
                <LogIn size={18} />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
