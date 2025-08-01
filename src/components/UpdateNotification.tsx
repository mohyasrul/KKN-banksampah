import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const UpdateNotification = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // New service worker has taken control
        if (updateAvailable) {
          toast({
            title: "✅ Update Berhasil!",
            description: "Aplikasi telah diperbarui ke versi terbaru",
          });
          setUpdateAvailable(false);
          setShowUpdatePrompt(false);
        }
      });

      // Listen for waiting service worker
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                setUpdateAvailable(true);
                setShowUpdatePrompt(true);
              }
            });
          }
        });

        // Check if there's already a waiting worker
        if (registration.waiting) {
          setUpdateAvailable(true);
          setShowUpdatePrompt(true);
        }
      });
    }
  }, [updateAvailable, toast]);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          // Tell the waiting service worker to activate
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          setUpdateAvailable(true);
          // Reload the page to get the new version
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      });
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    // Show again later if still available
    setTimeout(() => {
      if (updateAvailable) {
        setShowUpdatePrompt(true);
      }
    }, 300000); // 5 minutes later
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="shadow-lg border-blue-200 bg-blue-50 animate-in slide-in-from-top">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-blue-800">
              Update Tersedia! 🚀
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs text-blue-700">
            Versi terbaru aplikasi Bank Sampah telah tersedia dengan fitur dan perbaikan baru
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            onClick={handleUpdate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Sekarang
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
