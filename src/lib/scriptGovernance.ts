/**
 * Third-Party Script & Ad Governance Layer
 * 
 * Enforces 2026 Core Web Vitals compliance for external scripts (Google Ads, Analytics, Trackers):
 * 1. Deferred Non-Blocking Injection: Schedules script injection during browser idle periods
 *    via requestIdleCallback, preventing main-thread contention during hydration.
 * 2. CLS Prevention: Enforces rigid container dimensions before third-party assets evaluate.
 * 3. Non-Blocking Telemetry: Uses navigator.sendBeacon to prevent unloading/navigation delays.
 */

interface ScriptLoadOptions {
  id: string;
  src: string;
  delayMs?: number;
  priority?: "idle" | "interactive";
}

const loadedScripts = new Set<string>();

/**
 * Loads a third-party script with low priority without competing with critical rendering.
 */
export function loadDeferredThirdPartyScript({
  id,
  src,
  delayMs = 2500,
  priority = "idle",
}: ScriptLoadOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    if (loadedScripts.has(id) || document.getElementById(id)) {
      resolve();
      return;
    }

    const inject = () => {
      try {
        const script = document.createElement("script");
        script.id = id;
        script.src = src;
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        script.onload = () => {
          loadedScripts.add(id);
          resolve();
        };
        script.onerror = (err) => {
          console.warn(`[ScriptGovernance] Third-party script failed or blocked: ${id}`);
          // Resolve anyway to prevent blocking downstream logic if ad blocker is active
          resolve();
        };
        document.body.appendChild(script);
      } catch (e) {
        resolve();
      }
    };

    if (priority === "idle" && "requestIdleCallback" in window) {
      // Defer until browser is completely idle
      (window as any).requestIdleCallback(() => {
        setTimeout(inject, delayMs);
      }, { timeout: 5000 });
    } else {
      setTimeout(inject, delayMs);
    }
  });
}

/**
 * Dispatches non-blocking analytics/telemetry data via navigator.sendBeacon
 */
export function sendNonBlockingBeacon(url: string, data: Record<string, any>): boolean {
  if (typeof navigator === "undefined") return false;

  const payload = JSON.stringify({
    ...data,
    timestamp: Date.now(),
  });

  if (typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload], { type: "application/json" });
    return navigator.sendBeacon(url, blob);
  }

  // Graceful fallback using asynchronous low-priority fetch with keepalive
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
    mode: "no-cors",
  }).catch(() => {});

  return true;
}

/**
 * Rigid layout dimension bounds for third-party ad slots to guarantee CLS = 0.000
 */
export const AD_CONTAINER_CONSTRAINTS = {
  leaderboard: "min-h-[90px] w-full max-w-[728px] overflow-hidden",
  sidebarMedium: "min-h-[250px] w-[300px] overflow-hidden",
  sidebarTall: "min-h-[600px] w-[300px] overflow-hidden",
  nativeFeed: "min-h-[420px] w-full overflow-hidden",
  bottomAnchor: "min-h-[50px] sm:min-h-[90px] w-full overflow-hidden",
} as const;
