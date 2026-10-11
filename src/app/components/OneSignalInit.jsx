
"use client";

import { useEffect } from "react";

export default function OneSignalInit() {
  useEffect(() => {
    let cancelled = false;

    window.OneSignalDeferred = window.OneSignalDeferred || [];

    const scriptId = "onesignal-sdk";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");

      script.id = scriptId;
      script.src =
        "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      script.defer = true;

      document.head.appendChild(script);
    }

    window.OneSignalDeferred.push(async (OneSignal) => {
      if (cancelled) return;

      try {
        await OneSignal.init({
          appId: "fb2eaebf-15e8-4fda-91e2-cf6262cc033d",
        });

        console.log("OneSignal initialized successfully");

        await OneSignal.Slidedown.promptPush();
      } catch (error) {
        console.error("OneSignal error:", error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
