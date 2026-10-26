import { useState, useEffect, useRef } from 'react';

export function useDeviceHardware() {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);
  const [isWakeLocked, setIsWakeLocked] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const torchStreamRef = useRef<MediaStream | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Monitor Network
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor Battery
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        const updateLevel = () => setBatteryLevel(Math.round(battery.level * 100));
        const updateCharging = () => setIsCharging(battery.charging);

        battery.addEventListener('levelchange', updateLevel);
        battery.addEventListener('chargingchange', updateCharging);

        return () => {
          battery.removeEventListener('levelchange', updateLevel);
          battery.removeEventListener('chargingchange', updateCharging);
        };
      }).catch(() => {
        // Battery API not supported or restricted
      });
    }
  }, []);

  // Toggle Torch / Flashlight
  const toggleTorch = async () => {
    try {
      if (isTorchOn) {
        if (torchStreamRef.current) {
          torchStreamRef.current.getTracks().forEach((track) => track.stop());
          torchStreamRef.current = null;
        }
        setIsTorchOn(false);
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      const track = stream.getVideoTracks()[0];
      const capabilities: any = track.getCapabilities?.() || {};

      if (capabilities.torch) {
        await (track as any).applyConstraints({
          advanced: [{ torch: true }],
        });
        torchStreamRef.current = stream;
        setIsTorchOn(true);
        setHasTorchSupport(true);
        return true;
      } else {
        // Fallback simulation for devices without hardware torch via web
        setHasTorchSupport(false);
        setIsTorchOn(true);
        torchStreamRef.current = stream;
        return true;
      }
    } catch (err) {
      console.warn('Torch control not available:', err);
      setIsTorchOn(false);
      return false;
    }
  };

  // Trigger Haptic Vibration
  const vibrate = (pattern: number | number[] = 50) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignored
      }
    }
  };

  // Toggle Wake Lock
  const toggleWakeLock = async () => {
    try {
      if (isWakeLocked) {
        if (wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
        setIsWakeLocked(false);
        return false;
      }

      if ('wakeLock' in navigator) {
        const lock = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current = lock;
        setIsWakeLocked(true);
        lock.addEventListener('release', () => {
          setIsWakeLocked(false);
          wakeLockRef.current = null;
        });
        return true;
      }
      return false;
    } catch (err) {
      console.warn('WakeLock error:', err);
      return false;
    }
  };

  // Emergency Stop: kills torch, releases wakelock, vibrates warning
  const emergencyStop = () => {
    vibrate([200, 100, 200]);
    if (torchStreamRef.current) {
      torchStreamRef.current.getTracks().forEach((t) => t.stop());
      torchStreamRef.current = null;
    }
    setIsTorchOn(false);
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
    setIsWakeLocked(false);
  };

  return {
    batteryLevel,
    isCharging,
    isTorchOn,
    hasTorchSupport,
    isWakeLocked,
    isOnline,
    toggleTorch,
    vibrate,
    toggleWakeLock,
    emergencyStop,
  };
}
