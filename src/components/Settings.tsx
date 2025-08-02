import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Database,
  DollarSign,
  Bell,
  Shield,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";

export const Settings = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [systemStats, setSystemStats] = useState({
    totalRTs: 0,
    totalTransactions: 0,
    databaseSize: "0 KB",
    version: "1.0.0",
    status: "Loading...",
  });
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const {
    wastePrices,
    appSettings,
    isLoading,
    error,
    updateWastePrice,
    updateAppSettings,
    saveSettings,
    backupData,
    restoreData,
    resetData,
    getSystemStats,
    syncData,
  } = useSettings();

  // Load system stats on component mount
  useEffect(() => {
    getSystemStats().then(setSystemStats);
  }, [getSystemStats]);

  const handleSaveSettings = async () => {
    const result = await saveSettings();
    if (result.success) {
      toast({
        title: "Pengaturan Disimpan",
        description: "Semua perubahan telah berhasil disimpan",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Gagal menyimpan pengaturan",
        variant: "destructive",
      });
    }
  };

  const handleBackupData = async () => {
    const result = await backupData();
    if (result.success) {
      toast({
        title: "Backup Berhasil",
        description: "Data telah di-backup ke file lokal",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Gagal membuat backup",
        variant: "destructive",
      });
    }
  };

  const handleRestoreData = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await restoreData(file);
    if (result.success) {
      toast({
        title: "Data Dipulihkan",
        description: "Data berhasil dipulihkan dari backup",
      });
      // Refresh system stats
      getSystemStats().then(setSystemStats);
    } else {
      toast({
        title: "Error",
        description: result.error || "Gagal memulihkan data",
        variant: "destructive",
      });
    }
  };

  const handleSyncData = async () => {
    const result = await syncData();
    if (result.success) {
      toast({
        title: "Sinkronisasi Berhasil",
        description: "Data telah disinkronkan dengan database",
      });
      // Refresh system stats
      getSystemStats().then(setSystemStats);
    } else {
      toast({
        title: "Error",
        description: result.error || "Gagal sinkronisasi data",
        variant: "destructive",
      });
    }
  };

  const handleResetData = async () => {
    const result = await resetData();
    if (result.success) {
      toast({
        title: "Data Direset",
        description: "Semua data telah dikembalikan ke pengaturan awal",
        variant: "destructive",
      });
      // Refresh system stats
      getSystemStats().then(setSystemStats);
      setIsResetDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Gagal mereset data",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat pengaturan...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Settings</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pengaturan Sistem</h2>
        <p className="text-muted-foreground">
          Konfigurasi aplikasi dan pengaturan operasional
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Prices Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Harga Sampah</span>
            </CardTitle>
            <CardDescription>
              Atur harga per kilogram untuk setiap jenis sampah
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wastePrices.map((waste) => (
              <div
                key={waste.id}
                className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
              >
                <div>
                  <p className="font-medium">{waste.name}</p>
                  <p className="text-sm text-muted-foreground">
                    per {waste.unit}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Rp</span>
                  <Input
                    type="number"
                    value={waste.price}
                    onChange={(e) =>
                      updateWastePrice(waste.id, parseInt(e.target.value) || 0)
                    }
                    className="w-24 text-right"
                  />
                </div>
              </div>
            ))}
            <Button onClick={handleSaveSettings} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Simpan Harga
            </Button>
          </CardContent>
        </Card>

        {/* App Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>Konfigurasi Aplikasi</span>
            </CardTitle>
            <CardDescription>Pengaturan umum aplikasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rw-name">Nama RW</Label>
              <Input
                id="rw-name"
                value={appSettings.rwName}
                onChange={(e) => updateAppSettings({ rwName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-person">Penanggung Jawab</Label>
              <Input
                id="contact-person"
                value={appSettings.contactPerson}
                onChange={(e) =>
                  updateAppSettings({ contactPerson: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-phone">No. Telepon</Label>
              <Input
                id="contact-phone"
                value={appSettings.contactPhone}
                onChange={(e) =>
                  updateAppSettings({ contactPhone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                value={appSettings.address}
                onChange={(e) => updateAppSettings({ address: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Pengaturan Notifikasi</span>
          </CardTitle>
          <CardDescription>Kelola notifikasi dan pemberitahuan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifikasi Push</p>
                  <p className="text-sm text-muted-foreground">
                    Pemberitahuan dalam aplikasi
                  </p>
                </div>
                <Switch
                  checked={appSettings.notifications}
                  onCheckedChange={(checked) =>
                    updateAppSettings({ notifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Laporan Email</p>
                  <p className="text-sm text-muted-foreground">
                    Kirim laporan bulanan via email
                  </p>
                </div>
                <Switch
                  checked={appSettings.emailReports}
                  onCheckedChange={(checked) =>
                    updateAppSettings({ emailReports: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">WhatsApp Notifikasi</p>
                  <p className="text-sm text-muted-foreground">
                    Pemberitahuan via WhatsApp
                  </p>
                </div>
                <Switch
                  checked={appSettings.whatsappNotifications}
                  onCheckedChange={(checked) =>
                    updateAppSettings({ whatsappNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Backup</p>
                  <p className="text-sm text-muted-foreground">
                    Backup otomatis harian
                  </p>
                </div>
                <Switch
                  checked={appSettings.autoBackup}
                  onCheckedChange={(checked) =>
                    updateAppSettings({ autoBackup: checked })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Manajemen Data</span>
          </CardTitle>
          <CardDescription>
            Backup, restore, dan pengelolaan data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={handleBackupData}
              className="flex flex-col h-20 space-y-2"
            >
              <Download className="h-5 w-5" />
              <span className="text-sm">Backup Data</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleRestoreData}
              className="flex flex-col h-20 space-y-2"
            >
              <Upload className="h-5 w-5" />
              <span className="text-sm">Restore Data</span>
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              variant="outline"
              onClick={handleSyncData}
              className="flex flex-col h-20 space-y-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span className="text-sm">Sinkronisasi</span>
            </Button>

            <Dialog
              open={isResetDialogOpen}
              onOpenChange={setIsResetDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex flex-col h-20 space-y-2"
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="text-sm">Reset Data</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span>Konfirmasi Reset Data</span>
                  </DialogTitle>
                  <DialogDescription>
                    Apakah Anda yakin ingin mereset semua data? Tindakan ini
                    akan:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Menghapus semua pengaturan kustom</li>
                      <li>Mengembalikan harga sampah ke default</li>
                      <li>Menghapus preferensi yang tersimpan</li>
                    </ul>
                    <p className="mt-2 font-medium text-destructive">
                      Tindakan ini tidak dapat dibatalkan!
                    </p>
                  </DialogDescription>
                </DialogHeader>
                <div className="flex space-x-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsResetDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button variant="destructive" onClick={handleResetData}>
                    Ya, Reset Data
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Retensi Data</p>
                <p className="text-sm text-muted-foreground">
                  Data akan dihapus otomatis setelah periode ini
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={appSettings.dataRetentionDays}
                  onChange={(e) =>
                    updateAppSettings({
                      dataRetentionDays: parseInt(e.target.value) || 365,
                    })
                  }
                  className="w-20"
                />
                <span className="text-sm">hari</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Informasi Sistem</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Versi Aplikasi</p>
              <Badge variant="secondary">{systemStats.version}</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Database</p>
              <Badge variant="outline">Supabase</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Badge
                className={
                  systemStats.status === "Online"
                    ? "bg-success text-success-foreground"
                    : "bg-destructive"
                }
              >
                {systemStats.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Total RT</p>
              <p className="text-2xl font-bold">{systemStats.totalRTs}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Total Transaksi</p>
              <p className="text-2xl font-bold">
                {systemStats.totalTransactions}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Ukuran Database</p>
              <p className="text-2xl font-bold">{systemStats.databaseSize}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save All Settings */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset ke Default
        </Button>
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Simpan Semua Pengaturan
        </Button>
      </div>
    </div>
  );
};
