/**
 * Waits until window.initSendOTP is available (loaded via async script),
 * then calls it with the provided config.
 * Calls onTimeout after ~10 seconds if the script never loads.
 */
export function triggerOtpWidget(config: object, onTimeout?: () => void): void {
  if (typeof window.initSendOTP === "function") {
    window.initSendOTP(config);
    return;
  }

  // Script not ready yet — poll until available
  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed += 200;
    if (typeof window.initSendOTP === "function") {
      clearInterval(interval);
      window.initSendOTP(config);
    } else if (elapsed >= 10000) {
      clearInterval(interval);
      onTimeout?.();
    }
  }, 200);
}

declare global {
  interface Window {
    initSendOTP?: (config: object) => void;
  }
}
