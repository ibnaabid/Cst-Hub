
"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  GraduationCap,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Home,
  BookOpen,
  Info,
  CalendarDays,
  Users,
  Bell,
  BellRing,
} from "lucide-react";

import toast from "react-hot-toast";
import { getToken, onMessage } from "firebase/messaging";
import { getFCMMessaging } from "../lib/firebase";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const messageUnsubscribeRef = useRef(null);
  const notificationInFlightRef = useRef(false);
  const notificationSetupRef = useRef(false);
  const autoSetupAttemptRef = useRef("");
  const currentUserKeyRef = useRef("");

  // ==========================================
  // USER SESSION
  // ==========================================

  useEffect(() => {
    const checkUser = () => {
      const storedUser =
        localStorage.getItem("currentUser") ||
        sessionStorage.getItem("currentUser");

      if (!storedUser) {
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse currentUser:", error);
        setUser(null);
      }
    };

    checkUser();

    window.addEventListener("userLogin", checkUser);
    window.addEventListener("userLogout", checkUser);
    window.addEventListener("storage", checkUser);

    return () => {
      window.removeEventListener("userLogin", checkUser);
      window.removeEventListener("userLogout", checkUser);
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  // ==========================================
  // USER KEY
  // ==========================================

  const userKey = user
    ? `${user.email || user._id || user.name || "user"}-${user.group || "All"}`
    : "";

  // ==========================================
  // ENABLE FIREBASE NOTIFICATIONS
  // ==========================================

  const enableNotifications = useCallback(
    async ({ requestPermission = true } = {}) => {
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

        const vapidKey =
          process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim();

        if (!apiUrl) {
          throw new Error(
            "NEXT_PUBLIC_BASE_URL configure করা নেই।"
          );
        }

        if (!vapidKey) {
          throw new Error(
            "Firebase VAPID key পাওয়া যায়নি।"
          );
        }

        let permission = Notification.permission;

        if (
          permission === "default" &&
          requestPermission
        ) {
          permission = await Notification.requestPermission();
        }

        if (permission !== "granted") {
          if (permission === "denied") {
            throw new Error(
              "Browser settings থেকে CST Hub notification Allow করো।"
            );
          }

          if (requestPermission) {
            throw new Error(
              "Notification permission দেওয়া হয়নি।"
            );
          }

          return;
        }

        // Register service worker.
        const registration =
          await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
          );

        await navigator.serviceWorker.ready;

        // Initialize Firebase Messaging.
        const messaging = await getFCMMessaging();

        if (!messaging) {
          throw new Error(
            "Firebase Messaging supported নয়। Firebase configuration পরীক্ষা করো।"
          );
        }

        // Generate FCM token.
        const token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (!token) {
          throw new Error(
            "FCM token তৈরি হয়নি। VAPID public key পরীক্ষা করো।"
          );
        }

        // Subscribe token on backend.
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

        // Foreground listener: register only once.
        if (!messageUnsubscribeRef.current) {
          messageUnsubscribeRef.current = onMessage(
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

        notificationSetupRef.current = true;
        setNotificationEnabled(true);

        if (requestPermission) {
          toast.success("CST Hub notification চালু হয়েছে!");
        }

        console.log("FCM subscription successful.");
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
    },
    [user?.group, user?.email, notificationEnabled]
  );
  // ==========================================
  // AUTOMATIC SETUP
  // ==========================================

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

    // Don't repeatedly retry the same failed setup.
    if (autoSetupAttemptRef.current === userKey) return;

    autoSetupAttemptRef.current = userKey;
    currentUserKeyRef.current = userKey;

    void enableNotifications({
      requestPermission: false,
    });
  }, [user, userKey, enableNotifications]);

  // ==========================================
  // CLEANUP
  // ==========================================

  useEffect(() => {
    return () => {
      if (messageUnsubscribeRef.current) {
        messageUnsubscribeRef.current();
        messageUnsubscribeRef.current = null;
      }
    };
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");

    notificationSetupRef.current = false;
    autoSetupAttemptRef.current = "";
    currentUserKeyRef.current = "";

    setNotificationEnabled(false);
    setUser(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);

    window.dispatchEvent(new Event("userLogout"));

    toast.success("Logged out successfully!");
    router.push("/Login");
  };

  // ==========================================
  // DASHBOARD LINK
  // ==========================================

  const dashboardLink =
    user?.role === "cr"
      ? "/cr-dashboard"
      : "/Student-dashboard";

  // ==========================================
  // HIDE NAVBAR ON DASHBOARDS
  // ==========================================

  if (
    pathname?.includes("Student-dashboard") ||
    pathname?.includes("cr-dashboard")
  ) {
    return null;
  }

  // ==========================================
  // NAVIGATION LINKS
  // ==========================================

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Study Room", href: "/study-room", icon: Users },
    { name: "About", href: "/About", icon: Info },
    { name: "Routine", href: "/routine", icon: CalendarDays },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  const getNavLinkClass = (href) => {
    if (isActive(href)) {
      return "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-500/15 border border-indigo-400/40 shadow-[0_0_18px_rgba(99,102,241,0.12)] transition-all duration-300";
    }

    return "relative flex items-center gap-4 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 border border-transparent hover:text-white hover:bg-indigo-500/10 hover:border-indigo-400/40 hover:shadow-[0_0_18px_rgba(99,102,241,0.12)] transition-all duration-300";
  };

  // ==========================================
  // LOGO + NOTIFICATION BUTTON
  // ==========================================

  const LogoWithNotification = () => (
    <div className="flex items-center gap-2 min-w-0">
      <Link href="/" className="inline-flex items-center gap-3 group min-w-0">
        <div className="relative w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/30 group-hover:scale-105 transition-all duration-300">
          <GraduationCap className="w-5 h-5" />
          <span className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="min-w-0">
          <span className="block font-bold text-base text-white tracking-tight">
            CST HUB
          </span>

          <span className="block text-[9px] text-indigo-400 font-semibold -mt-1 tracking-[0.18em] uppercase whitespace-nowrap">
            Dinajpur Polytechnic
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={() =>
          void enableNotifications({ requestPermission: true })
        }
        disabled={notificationLoading}
        aria-label="Enable CST Hub notifications"
        title={
          notificationEnabled
            ? "Notifications enabled"
            : "Enable notifications"
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
    </div>
  );

  // ==========================================
  // NAVBAR
  // ==========================================

  return (
    <nav className="fixed top-3 left-3 right-3 z-50 bg-slate-950/75 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.35)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px] gap-2">
          <LogoWithNotification />

          {/* DESKTOP NAV */}

          <div className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={getNavLinkClass(link.href)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>

                  {isActive(link.href) && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-indigo-400" />
                  )}
                </Link>
              );
            })}

            {user && (
              <Link
                href={dashboardLink}
                className={getNavLinkClass(dashboardLink)}
              >
                {user.role === "cr" ? (
                  <Users className="w-3.5 h-3.5" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5" />
                )}

                <span>
                  {user.role === "cr" ? "CR Panel" : "Dashboard"}
                </span>
              </Link>
            )}
          </div>

          {/* DESKTOP USER */}

          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl bg-slate-900/80 border border-slate-700/70 hover:border-indigo-400/40 hover:bg-indigo-500/10 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <User className="w-4 h-4" />
                  </div>

                  <div className="text-left min-w-0">
                    <span className="text-xs font-semibold max-w-[120px] truncate block text-white">
                      {user.name || "Student"}
                    </span>

                    {user.role === "cr" && (
                      <span className="text-[9px] text-indigo-400 font-medium">
                        Class Representative
                      </span>
                    )}
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${
                      dropdownOpen ? "rotate-180 text-indigo-400" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-slate-950/95 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.5)] overflow-hidden py-1.5">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-[10px] text-slate-500">
                        Signed in as
                      </p>

                      <p className="text-sm font-bold text-white truncate mt-0.5">
                        {user.name}
                      </p>

                      {user.role === "cr" && (
                        <p className="text-[10px] text-indigo-400 font-medium mt-1">
                          Class Representative
                        </p>
                      )}
                    </div>

                    <Link
                      href={dashboardLink}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-indigo-500/10 transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {user.role === "cr" ? "CR Dashboard" : "Dashboard"}
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/Login"
                  className="text-xs font-semibold px-4 py-2.5 rounded-xl text-slate-300 border border-slate-700/70 hover:text-white hover:border-indigo-400/40 hover:bg-indigo-500/10 transition-all duration-300"
                >
                  Log In
                </Link>

                <Link
                  href="/Signup"
                  className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border border-indigo-400/30 shadow-lg shadow-indigo-600/20 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}

          <div className="md:hidden flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="p-2.5 rounded-xl bg-slate-900/80 text-slate-300 border border-slate-700/70 hover:border-indigo-400/40 hover:text-white transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl rounded-b-2xl px-4 pt-4 pb-5">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={
                    isActive(link.href)
                      ? "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-white bg-indigo-500/10 border border-indigo-400/30"
                      : "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-slate-300 border border-transparent hover:text-white hover:bg-indigo-500/10"
                  }
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}

            {user && (
              <Link
                href={dashboardLink}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-indigo-500/10"
              >
                {user.role === "cr" ? (
                  <Users className="w-4 h-4" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}

                {user.role === "cr" ? "CR Panel" : "Dashboard"}
              </Link>
            )}
          </div>

          {/* MOBILE USER */}

          <div className="pt-4 mt-3 border-t border-slate-800">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-indigo-600/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <User className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {user.name || "Student"}
                    </p>

                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {user.role === "cr"
                        ? `${user.group || "Group"} · CR`
                        : user.email || user.roll || "Student"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/Login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 bg-slate-900/70 hover:text-white transition-all"
                >
                  Log In
                </Link>

                <Link
                  href="/Signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white border border-indigo-400/30 shadow-lg shadow-indigo-600/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
