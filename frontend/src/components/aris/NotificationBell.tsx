import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

interface NotificationBellProps {
  alertCount?: number;
}

export function NotificationBell({ alertCount = 0 }: NotificationBellProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    setErrorMessage(null);

    if (!("Notification" in window)) {
      setErrorMessage("Desktop notifications are not supported in this browser.");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        new Notification("ARIS System Alert", {
          body: "System active: Real-time telemetry monitoring is enabled.",
        });
      } else if (result === "denied") {
        setErrorMessage("Notifications blocked. Please enable them in your browser settings.");
      }
    } catch (error) {
      setErrorMessage("Failed to request permission.");
      console.error(error);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleRequestPermission}
        title={
          permission === "granted"
            ? "Notifications enabled"
            : permission === "denied"
            ? "Notifications blocked"
            : "Click to enable notifications"
        }
        className={`relative h-9 w-9 grid place-items-center rounded-sm border transition ${
          permission === "granted"
            ? "border-cyan/50 hover:border-cyan text-cyan bg-cyan/5"
            : permission === "denied"
            ? "border-danger/30 hover:border-danger text-danger bg-danger/5"
            : "border-border hover:border-cyan/50 text-muted-foreground"
        }`}
      >
        <Bell className={`w-4 h-4 ${permission === "granted" ? "animate-pulse" : ""}`} />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-danger text-[10px] font-mono-tech text-white pulse-dot">
            {alertCount}
          </span>
        )}
      </button>

      {errorMessage && (
        <div className="absolute right-0 top-11 z-50 w-64 p-3 rounded-sm border border-danger/45 bg-[#0a0d18]/95 backdrop-blur-md text-[10px] font-mono-tech text-danger shadow-[0_0_12px_rgba(255,45,45,0.15)] animate-fadeIn">
          <p className="font-bold uppercase tracking-wider mb-1">Notification Blocked</p>
          <p className="text-muted-foreground/90">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="mt-2 text-[9px] text-cyan hover:underline uppercase font-bold block"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
