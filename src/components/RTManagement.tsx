import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Phone,
  MapPin,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";

export const RTManagement = () => {
  const { toast } = useToast();
  const { rtList, addRT, updateRT, deleteRT, isLoading } = useSupabaseData();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRT, setEditingRT] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    nomor: "",
    ketuaRT: "",
    jumlahKK: "",
    alamat: "",
    kontak: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.nomor ||
      !formData.ketuaRT ||
      !formData.jumlahKK ||
      !formData.alamat
    ) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    // Create RT data
    const rtData = {
      nomor: formData.nomor,
      ketua_rt: formData.ketuaRT,
      jumlah_kk: parseInt(formData.jumlahKK),
      alamat: formData.alamat,
      kontak: formData.kontak || undefined,
    };

    if (editingRT) {
      updateRT(editingRT.id, rtData);
      toast({
        title: "Berhasil",
        description: "Data RT berhasil diperbarui",
      });
      setEditingRT(null);
    } else {
      addRT(rtData);
      toast({
        title: "Berhasil",
        description: "RT baru berhasil ditambahkan",
      });
    }

    setFormData({
      nomor: "",
      ketuaRT: "",
      jumlahKK: "",
      alamat: "",
      kontak: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (rt: any) => {
    setEditingRT(rt);
    setFormData({
      nomor: rt.nomor,
      ketuaRT: rt.ketuaRT,
      jumlahKK: rt.jumlahKK.toString(),
      alamat: rt.alamat,
      kontak: rt.kontak || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteRT(id);
    toast({
      title: "Berhasil",
      description: "Data RT berhasil dihapus",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data RT...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manajemen RT</h2>
          <p className="text-muted-foreground">
            Kelola data Rukun Tetangga dalam RW
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah RT
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingRT ? "Edit Data RT" : "Tambah RT Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingRT
                  ? "Perbarui informasi RT"
                  : "Masukkan data RT yang akan didaftarkan"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomor">Nomor RT *</Label>
                <Input
                  id="nomor"
                  placeholder="RT 01"
                  value={formData.nomor}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ketuaRT">Ketua RT *</Label>
                <Input
                  id="ketuaRT"
                  placeholder="Nama Ketua RT"
                  value={formData.ketuaRT}
                  onChange={(e) =>
                    setFormData({ ...formData, ketuaRT: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jumlahKK">Jumlah KK *</Label>
                <Input
                  id="jumlahKK"
                  type="number"
                  placeholder="45"
                  value={formData.jumlahKK}
                  onChange={(e) =>
                    setFormData({ ...formData, jumlahKK: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat *</Label>
                <Input
                  id="alamat"
                  placeholder="Jl. Contoh No. 1-15"
                  value={formData.alamat}
                  onChange={(e) =>
                    setFormData({ ...formData, alamat: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kontak">Kontak (Opsional)</Label>
                <Input
                  id="kontak"
                  placeholder="081234567890"
                  value={formData.kontak}
                  onChange={(e) =>
                    setFormData({ ...formData, kontak: e.target.value })
                  }
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {editingRT ? "Perbarui" : "Tambah"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingRT(null);
                    setFormData({
                      nomor: "",
                      ketuaRT: "",
                      jumlahKK: "",
                      alamat: "",
                      kontak: "",
                    });
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rtList.length === 0 ? (
          <div className="col-span-full">
            <Card className="py-12">
              <CardContent className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Belum ada RT terdaftar
                </h3>
                <p className="text-muted-foreground mb-4">
                  Mulai dengan menambahkan data RT pertama untuk Bank Sampah RW
                  10
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah RT Pertama
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          rtList.map((rt) => (
            <Card key={rt.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{rt.nomor}</CardTitle>
                    <CardDescription>{rt.ketua_rt}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {rt.total_transaksi} transaksi
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{rt.jumlah_kk} KK</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{rt.alamat}</span>
                </div>

                {rt.kontak && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{rt.kontak}</span>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">
                    Saldo Tabungan:{" "}
                    <span className="text-success">
                      Rp {rt.saldo.toLocaleString("id-ID")}
                    </span>
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(rt)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(rt.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
