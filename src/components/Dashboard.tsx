import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Scale,
  Wallet,
  TrendingUp,
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useBankSampahData } from "@/hooks/useBankSampahData";

export const Dashboard = () => {
  const { rtList, transactions, getTodayStats, getRecentTransactions } =
    useBankSampahData();

  // Calculate real-time statistics
  const todayStats = getTodayStats();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const monthlyTransactions = transactions.filter((t) =>
    t.date.startsWith(currentMonth)
  );
  const totalSavings = rtList.reduce((sum, rt) => sum + rt.saldo, 0);

  // Dynamic stats with real data
  const stats = [
    {
      title: "Total RT",
      value: rtList.length.toString(),
      description: "RT terdaftar",
      icon: Users,
      trend: rtList.length > 0 ? "Aktif" : "Belum ada data",
    },
    {
      title: "Setoran Hari Ini",
      value: todayStats.totalWeight.toString(),
      description: "kg sampah",
      icon: Scale,
      trend:
        todayStats.totalTransactions > 0
          ? `${todayStats.totalTransactions} transaksi`
          : "Belum ada data",
    },
    {
      title: "Total Tabungan",
      value: `Rp ${totalSavings.toLocaleString("id-ID")}`,
      description: "saldo keseluruhan",
      icon: Wallet,
      trend: totalSavings > 0 ? "Tersimpan" : "Belum ada data",
    },
    {
      title: "Transaksi Bulan Ini",
      value: monthlyTransactions.length.toString(),
      description: "setoran & penarikan",
      icon: TrendingUp,
      trend:
        monthlyTransactions.length > 0
          ? `Rp ${monthlyTransactions
              .reduce((sum, t) => sum + t.totalValue, 0)
              .toLocaleString("id-ID")}`
          : "Belum ada data",
    },
  ];

  // Get recent transactions (limit 5 for dashboard)
  const recentTransactions = getRecentTransactions(5).map((transaction) => ({
    id: transaction.id,
    rt: transaction.rt,
    type: "setoran", // All current transactions are deposits
    amount: `${transaction.weight} kg`,
    value: `+Rp ${transaction.totalValue.toLocaleString("id-ID")}`,
    date: new Date(transaction.date).toLocaleDateString("id-ID"),
    wasteTypeName: transaction.wasteTypeName,
  }));

  // RT Savings overview (top 5 by balance)
  const rtSavings = rtList
    .map((rt) => ({
      rt: rt.nomor,
      balance: rt.saldo,
      transactions: rt.totalTransaksi,
    }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {stat.trend}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
            <CardDescription>Operasi yang sering digunakan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Input Setoran Sampah
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              size="lg"
            >
              <Users className="mr-2 h-4 w-4" />
              Kelola Data RT
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Unduh Laporan
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
            <CardDescription>Aktivitas terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Belum ada transaksi</p>
                  <p className="text-sm">
                    Transaksi akan muncul di sini setelah ada setoran atau
                    penarikan
                  </p>
                </div>
              ) : (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1 rounded-full bg-success/10">
                        <ArrowUpRight className="h-3 w-3 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.rt}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.wasteTypeName} - {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {transaction.amount}
                      </p>
                      <p className="text-xs text-success">
                        {transaction.value}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* RT Savings Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tabungan RT</CardTitle>
            <CardDescription>Saldo per RT</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rtSavings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Belum ada data RT</p>
                  <p className="text-sm">
                    Tambahkan RT baru untuk melihat tabungan
                  </p>
                </div>
              ) : (
                rtSavings.map((rt) => (
                  <div
                    key={rt.rt}
                    className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{rt.rt}</p>
                      <p className="text-xs text-muted-foreground">
                        {rt.transactions} transaksi
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        Rp {rt.balance.toLocaleString("id-ID")}
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
