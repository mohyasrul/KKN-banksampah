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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Scale,
  DollarSign,
  Calculator,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";

export const WasteDepositClean = () => {
  const { toast } = useToast();

  // Use persisted data hooks
  const {
    rtList,
    wasteTypes,
    addTransaction,
    getTodayStats,
    getRecentTransactions,
    isLoading,
  } = useSupabaseData();

  const [formData, setFormData] = useState({
    rt: "",
    wasteType: "",
    weight: "",
    customPrice: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current stats and recent transactions
  const todayStats = getTodayStats();
  const recentTransactions = getRecentTransactions(5);

  const selectedWasteType = wasteTypes.find(
    (type) => type.id === formData.wasteType
  );
  const currentPrice = formData.customPrice
    ? parseFloat(formData.customPrice)
    : selectedWasteType?.price_per_kg || 0;
  const weight = parseFloat(formData.weight) || 0;
  const totalValue = weight * currentPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formData.rt ||
      !formData.wasteType ||
      !formData.weight ||
      weight <= 0
    ) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field dengan benar",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Save to localStorage using the hook
      addTransaction({
        date: formData.date,
        rt: formData.rt,
        wasteType: formData.wasteType,
        wasteTypeName: selectedWasteType?.name || "",
        weight: weight,
        pricePerKg: currentPrice,
        totalValue: totalValue,
      });

      toast({
        title: "Setoran Berhasil!",
        description: `${formData.rt} berhasil menyetor ${weight} kg ${
          selectedWasteType?.name
        }. Tabungan bertambah Rp ${totalValue.toLocaleString("id-ID")}`,
      });

      // Reset form
      setFormData({
        rt: "",
        wasteType: "",
        weight: "",
        customPrice: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan setoran. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while data is being loaded
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Input Setoran Sampah</h2>
        <p className="text-muted-foreground">
          Catat setoran sampah dari RT dan kelola tabungan otomatis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-5 w-5" />
                <span>Form Setoran Sampah</span>
              </CardTitle>
              <CardDescription>
                Masukkan detail setoran sampah dari RT
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal Setoran</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rt">Pilih RT</Label>
                    <Select
                      value={formData.rt}
                      onValueChange={(value) =>
                        setFormData({ ...formData, rt: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih RT yang menyetor" />
                      </SelectTrigger>
                      <SelectContent>
                        {rtList.map((rt) => (
                          <SelectItem key={rt.id} value={rt.nomor}>
                            {rt.nomor} - {rt.ketua_rt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wasteType">Jenis Sampah</Label>
                    <Select
                      value={formData.wasteType}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          wasteType: value,
                          customPrice: "",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis sampah" />
                      </SelectTrigger>
                      <SelectContent>
                        {wasteTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{type.name}</span>
                              <Badge variant="secondary" className="ml-2">
                                Rp {type.price_per_kg.toLocaleString("id-ID")}
                                /kg
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Berat Sampah (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customPrice">Harga per kg (Opsional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customPrice"
                      type="number"
                      placeholder={
                        selectedWasteType
                          ? `Default: Rp ${selectedWasteType.price_per_kg.toLocaleString(
                              "id-ID"
                            )}`
                          : "Masukkan harga custom"
                      }
                      value={formData.customPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customPrice: e.target.value,
                        })
                      }
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Kosongkan untuk menggunakan harga default
                  </p>
                </div>

                {/* Calculation Preview */}
                {selectedWasteType && weight > 0 && (
                  <div className="bg-accent/30 p-4 rounded-lg space-y-2">
                    <div className="flex items-center space-x-2 text-sm font-medium">
                      <Calculator className="h-4 w-4" />
                      <span>Perhitungan Otomatis</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Berat</p>
                        <p className="font-medium">{weight} kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Harga/kg</p>
                        <p className="font-medium">
                          Rp {currentPrice.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Nilai</p>
                        <p className="font-bold text-green-600">
                          Rp {totalValue.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Catat Setoran
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Recent Deposits */}
        <div className="space-y-6">
          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ringkasan Hari Ini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Setoran
                </span>
                <span className="font-medium">
                  {todayStats.totalWeight.toFixed(1)} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Jumlah RT</span>
                <span className="font-medium">{todayStats.totalRTs} RT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Nilai
                </span>
                <span className="font-bold text-green-600">
                  Rp {todayStats.totalValue.toLocaleString("id-ID")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Deposits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Setoran Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Belum ada setoran</p>
                    <p className="text-sm">
                      Setoran pertama akan muncul di sini
                    </p>
                  </div>
                ) : (
                  recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-start p-3 bg-accent/30 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          RT {transaction.rt?.nomor}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.weight} kg {transaction.waste_type?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm text-green-600">
                          +Rp {transaction.total_value.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
