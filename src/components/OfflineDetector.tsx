import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff } from "lucide-react";

interface OfflineDetectorProps {
  children: React.ReactNode;
}

export const OfflineDetector = ({ children }: OfflineDetectorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {showOfflineMessage && (
        <Alert className="mx-4 mt-4 border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Anda sedang offline. Aplikasi akan tetap berfungsi menggunakan data tersimpan.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Show online indicator when coming back online */}
      {isOnline && !showOfflineMessage && (
        <Alert className="mx-4 mt-4 border-green-200 bg-green-50 transition-all duration-500">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Koneksi internet tersambung kembali.
          </AlertDescription>
        </Alert>
      )}
      
      {children}
    </>
  );
};
