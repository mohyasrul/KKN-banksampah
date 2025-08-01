import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Upload, X, CheckCircle, AlertTriangle } from "lucide-react";
import {
  migrateLocalStorageToSupabase,
  needsMigration,
} from "@/utils/migrateToSupabase";

export const MigrationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    migrated?: {
      rtCount: number;
      transactionCount: number;
      wasteTypeCount: number;
    };
  } | null>(null);

  // Check if migration is needed on component mount
  useEffect(() => {
    const checkMigration = () => {
      if (needsMigration()) {
        setShowPrompt(true);
      }
    };

    // Check after a short delay to ensure app is loaded
    const timer = setTimeout(checkMigration, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleMigrate = async () => {
    setIsLoading(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const migrationResult = await migrateLocalStorageToSupabase();

      clearInterval(progressInterval);
      setProgress(100);
      setResult(migrationResult);

      if (migrationResult.success) {
        // Auto close after successful migration
        setTimeout(() => {
          setShowPrompt(false);
        }, 3000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Migration failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Mark as skipped by clearing localStorage
    localStorage.removeItem("bankSampahData");
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Migrasi Database</CardTitle>
            </div>
            {!isLoading && !result && (
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            Kami telah menemukan data lokal yang dapat dipindahkan ke cloud
            database untuk sinkronisasi multi-device.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!result && !isLoading && (
            <>
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Upload className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  Data Anda akan dipindahkan ke Supabase untuk pengalaman yang
                  lebih baik dan sinkronisasi antar device.
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleMigrate} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Migrasi Sekarang
                </Button>
                <Button variant="outline" onClick={handleSkip}>
                  Lewati
                </Button>
              </div>
            </>
          )}

          {isLoading && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Memindahkan data...</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                {progress < 30 && "Menyiapkan database..."}
                {progress >= 30 && progress < 60 && "Memindahkan data RT..."}
                {progress >= 60 && progress < 90 && "Memindahkan transaksi..."}
                {progress >= 90 && "Menyelesaikan migrasi..."}
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div
                className={`flex items-center gap-2 p-3 rounded-lg border ${
                  result.success
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <p
                  className={`text-sm ${
                    result.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {result.message}
                </p>
              </div>

              {result.success && result.migrated && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    Data yang berhasil dipindahkan:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• {result.migrated.rtCount} Data RT</li>
                    <li>• {result.migrated.transactionCount} Transaksi</li>
                    <li>• {result.migrated.wasteTypeCount} Jenis Sampah</li>
                  </ul>
                </div>
              )}

              {result.success ? (
                <p className="text-xs text-gray-500 text-center">
                  Aplikasi akan menutup dialog ini dalam beberapa detik...
                </p>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleMigrate} variant="outline" size="sm">
                    Coba Lagi
                  </Button>
                  <Button onClick={handleDismiss} size="sm" className="flex-1">
                    Tutup
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
