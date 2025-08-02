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
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  TrendingUp,
  DollarSign,
  History,
  Target,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOfflineSupabaseData } from "@/hooks/useOfflineSupabaseData";
import { offlineDataManager } from "@/utils/offlineDataManager";

export const Savings = () => {
  const { toast } = useToast();
  const { rtList, transactions } = useOfflineSupabaseData();

  const [selectedRT, setSelectedRT] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  // Helper function to get transactions by RT
  const getTransactionsByRT = (rtNomor: string) => {
    return transactions.filter(t => t.rt?.nomor === rtNomor);
  };

  // Calculate RT savings data from actual transactions
  const rtSavings = rtList.map((rt) => {
    const rtTransactions = getTransactionsByRT(rt.nomor);
    const totalDeposits = rtTransactions.reduce(
      (sum, t) => sum + t.total_value,
      0
    );

    return {
      id: rt.id,
      rt: rt.nomor,
      balance: rt.saldo,
      totalDeposits: totalDeposits,
      totalWithdrawals: 0, // To be implemented later
      transactionCount: rt.total_transaksi,
      lastTransaction: rtTransactions[0]?.created_at || rt.created_at,
    };
  });

  // Calculate totals
  const totalSavings = rtSavings.reduce((sum, rt) => sum + rt.balance, 0);
  const totalDeposits = rtSavings.reduce(
    (sum, rt) => sum + rt.totalDeposits,
    0
  );
  const totalWithdrawals = rtSavings.reduce(
    (sum, rt) => sum + rt.totalWithdrawals,
    0
  );

  const selectedRTData = rtSavings.find((rt) => rt.rt === selectedRT);

    const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount);

    if (!selectedRT || !amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Pilih RT dan masukkan jumlah penarikan yang valid",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRTData || selectedRTData.balance < amount) {
      toast({
        title: "Error",
        description: "Saldo tidak mencukupi untuk penarikan ini",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update RT balance
      const targetRT = rtList.find((rt) => rt.nomor === selectedRT);
      if (targetRT) {
        await offlineDataManager.updateRT(targetRT.id, {
          saldo: targetRT.saldo - amount,
        });

        toast({
          title: "Penarikan Berhasil!",
          description: `Berhasil menarik Rp ${amount.toLocaleString(
            "id-ID"
          )} dari ${selectedRT}`,
        });

        setWithdrawalAmount("");
        setSelectedRT("");
        setIsWithdrawDialogOpen(false);
      }
    } catch (error) {
      console.error('Error during withdrawal:', error);
      toast({
        title: "Error",
        description: "Gagal melakukan penarikan. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manajemen Tabungan</h2>
          <p className="text-muted-foreground">
            Kelola tabungan RT dan riwayat transaksi
          </p>
        </div>

        <Dialog
          open={isWithdrawDialogOpen}
          onOpenChange={setIsWithdrawDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <ArrowDownRight className="mr-2 h-4 w-4" />
              Penarikan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Penarikan Tabungan</DialogTitle>
              <DialogDescription>
                Proses penarikan tabungan RT
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rt-select">Pilih RT</Label>
                <select
                  id="rt-select"
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={selectedRT}
                  onChange={(e) => setSelectedRT(e.target.value)}
                >
                  <option value="">Pilih RT</option>
                  {rtSavings.map((rt) => (
                    <option key={rt.id} value={rt.rt}>
                      {rt.rt} - Saldo: Rp {rt.balance.toLocaleString("id-ID")}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRTData && (
                <div className="bg-accent/30 p-3 rounded-lg">
                  <p className="text-sm font-medium">Saldo Tersedia</p>
                  <p className="text-lg font-bold text-success">
                    Rp {selectedRTData.balance.toLocaleString("id-ID")}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="withdrawal-amount">Jumlah Penarikan</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="withdrawal-amount"
                    type="number"
                    placeholder="0"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleWithdrawal} className="flex-1">
                  Proses Penarikan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsWithdrawDialogOpen(false);
                    setSelectedRT("");
                    setWithdrawalAmount("");
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tabungan
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              Rp {totalSavings.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo keseluruhan RW
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Setoran</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalDeposits.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              Akumulasi setoran sampah
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Penarikan
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalWithdrawals.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              Total yang sudah ditarik
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RT Savings List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Tabungan per RT</span>
            </CardTitle>
            <CardDescription>Saldo dan aktivitas setiap RT</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rtSavings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4" />
                  <p>Belum ada data tabungan</p>
                  <p className="text-sm">
                    Tambahkan RT dan mulai setoran untuk melihat tabungan
                  </p>
                </div>
              ) : (
                rtSavings.map((rt) => (
                  <div
                    key={rt.id}
                    className="flex items-center justify-between p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{rt.rt}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span>{rt.transactionCount} transaksi</span>
                        <span>
                          Terakhir:{" "}
                          {new Date(rt.lastTransaction).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">
                        Rp {rt.balance.toLocaleString("id-ID")}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center">
                          <ArrowUpRight className="h-3 w-3 mr-1 text-success" />
                          {rt.totalDeposits.toLocaleString("id-ID")}
                        </span>
                        <span className="flex items-center">
                          <ArrowDownRight className="h-3 w-3 mr-1 text-warning" />
                          {rt.totalWithdrawals.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Riwayat Transaksi</span>
            </CardTitle>
            <CardDescription>Aktivitas terbaru tabungan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4" />
                  <p>Belum ada transaksi</p>
                  <p className="text-sm">
                    Riwayat setoran dan penarikan akan muncul di sini
                  </p>
                </div>
              ) : (
                transactions.slice(0, 8).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border-l-4 border-l-primary/20 bg-accent/20 rounded-r-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-success/10">
                        <ArrowUpRight className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          RT {transaction.rt?.nomor}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Setoran {transaction.waste_type?.name} -{" "}
                          {transaction.weight} kg
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-success">
                        +Rp {transaction.total_value.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @Rp {transaction.price_per_kg.toLocaleString("id-ID")}
                        /kg
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
  );
};
