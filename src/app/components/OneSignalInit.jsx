
"use client";

import { useEffect } from "react";

export default function OneSignalInit() {
  useEffect(() => {
    if (window.__oneSignalInitialized) return;
    window.__oneSignalInitialized = true;

    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async (OneSignal) => {
      await OneSignal.init({
        appId: "fb2eaebf-15e8-4fda-91e2-cf6262cc033d",
      });
    });

    const script = document.createElement("script");
    script.src =
      "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return null;
}
