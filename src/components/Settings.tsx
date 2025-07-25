import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WastePrice {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export const Settings = () => {
  const { toast } = useToast();
  
  // Waste prices settings
  const [wastePrices, setWastePrices] = useState<WastePrice[]>([
    { id: "plastik", name: "Plastik", price: 5000, unit: "kg" },
    { id: "kertas", name: "Kertas", price: 3000, unit: "kg" },
    { id: "logam", name: "Logam", price: 8000, unit: "kg" },
    { id: "kaca", name: "Kaca", price: 2000, unit: "kg" },
    { id: "kardus", name: "Kardus", price: 2500, unit: "kg" }
  ]);

  // App settings
  const [appSettings, setAppSettings] = useState({
    autoBackup: true,
    notifications: true,
    emailReports: false,
    whatsappNotifications: true,
    dataRetentionDays: 365,
    rwName: "RW 05 Kelurahan Mawar",
    contactPerson: "Budi Santoso",
    contactPhone: "081234567890",
    address: "Jl. Mawar Raya No. 123, Jakarta"
  });

  const handlePriceUpdate = (id: string, newPrice: number) => {
    setWastePrices(wastePrices.map(item => 
      item.id === id ? { ...item, price: newPrice } : item
    ));
  };

  const handleSaveSettings = () => {
    // In real app, this would save to database/localStorage
    toast({
      title: "Pengaturan Disimpan",
      description: "Semua perubahan telah berhasil disimpan",
    });
  };

  const handleBackupData = () => {
    // Mock backup functionality
    toast({
      title: "Backup Berhasil",
      description: "Data telah di-backup ke file lokal",
    });
  };

  const handleRestoreData = () => {
    // Mock restore functionality
    toast({
      title: "Data Dipulihkan",
      description: "Data berhasil dipulihkan dari backup",
    });
  };

  const handleResetData = () => {
    // Mock reset functionality - would need confirmation dialog in real app
    toast({
      title: "Data Direset",
      description: "Semua data telah dikembalikan ke pengaturan awal",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pengaturan Sistem</h2>
        <p className="text-muted-foreground">Konfigurasi aplikasi dan pengaturan operasional</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Prices Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Harga Sampah</span>
            </CardTitle>
            <CardDescription>Atur harga per kilogram untuk setiap jenis sampah</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wastePrices.map((waste) => (
              <div key={waste.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                <div>
                  <p className="font-medium">{waste.name}</p>
                  <p className="text-sm text-muted-foreground">per {waste.unit}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Rp</span>
                  <Input
                    type="number"
                    value={waste.price}
                    onChange={(e) => handlePriceUpdate(waste.id, parseInt(e.target.value))}
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
                onChange={(e) => setAppSettings({ ...appSettings, rwName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-person">Penanggung Jawab</Label>
              <Input
                id="contact-person"
                value={appSettings.contactPerson}
                onChange={(e) => setAppSettings({ ...appSettings, contactPerson: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-phone">No. Telepon</Label>
              <Input
                id="contact-phone"
                value={appSettings.contactPhone}
                onChange={(e) => setAppSettings({ ...appSettings, contactPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                value={appSettings.address}
                onChange={(e) => setAppSettings({ ...appSettings, address: e.target.value })}
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
                  <p className="text-sm text-muted-foreground">Pemberitahuan dalam aplikasi</p>
                </div>
                <Switch
                  checked={appSettings.notifications}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, notifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Laporan Email</p>
                  <p className="text-sm text-muted-foreground">Kirim laporan bulanan via email</p>
                </div>
                <Switch
                  checked={appSettings.emailReports}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, emailReports: checked })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">WhatsApp Notifikasi</p>
                  <p className="text-sm text-muted-foreground">Pemberitahuan via WhatsApp</p>
                </div>
                <Switch
                  checked={appSettings.whatsappNotifications}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, whatsappNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Backup</p>
                  <p className="text-sm text-muted-foreground">Backup otomatis harian</p>
                </div>
                <Switch
                  checked={appSettings.autoBackup}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, autoBackup: checked })}
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
          <CardDescription>Backup, restore, dan pengelolaan data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" onClick={handleBackupData} className="flex flex-col h-20 space-y-2">
              <Download className="h-5 w-5" />
              <span className="text-sm">Backup Data</span>
            </Button>

            <Button variant="outline" onClick={handleRestoreData} className="flex flex-col h-20 space-y-2">
              <Upload className="h-5 w-5" />
              <span className="text-sm">Restore Data</span>
            </Button>

            <Button variant="outline" className="flex flex-col h-20 space-y-2">
              <RefreshCw className="h-5 w-5" />
              <span className="text-sm">Sinkronisasi</span>
            </Button>

            <Button variant="destructive" onClick={handleResetData} className="flex flex-col h-20 space-y-2">
              <Trash2 className="h-5 w-5" />
              <span className="text-sm">Reset Data</span>
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Retensi Data</p>
                <p className="text-sm text-muted-foreground">Data akan dihapus otomatis setelah periode ini</p>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={appSettings.dataRetentionDays}
                  onChange={(e) => setAppSettings({ ...appSettings, dataRetentionDays: parseInt(e.target.value) })}
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
              <Badge variant="secondary">v1.0.0</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Database</p>
              <Badge variant="outline">IndexedDB</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Badge className="bg-success text-success-foreground">Online</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Total RT</p>
              <p className="text-2xl font-bold">12</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Total Transaksi</p>
              <p className="text-2xl font-bold">247</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Ukuran Database</p>
              <p className="text-2xl font-bold">2.4 MB</p>
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