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
  Wifi,
  WifiOff,
} from "lucide-react";
import { useOfflineSupabaseData } from "@/hooks/useOfflineSupabaseData";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export const Dashboard = () => {
  const { rtList, transactions, stats, isLoading, error } = useOfflineSupabaseData();
  const { isOnline, pendingCount } = useOfflineSync();

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Database Error</CardTitle>
            <CardDescription className="text-red-600">
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard stats
  const dashboardStats = [
    {
      title: "Total RT",
      value: stats.totalRT,
      description: "Rukun Tetangga terdaftar",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Saldo",
      value: `Rp ${stats.totalSaldo.toLocaleString("id-ID")}`,
      description: "Saldo keseluruhan",
      icon: Wallet, 
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Transaksi",
      value: stats.totalTransaksi,
      description: "Transaksi sampah",
      icon: Scale,
      color: "text-orange-600", 
      bgColor: "bg-orange-50",
    },
    {
      title: "Total Setoran",  
      value: `Rp ${stats.totalSetoran.toLocaleString("id-ID")}`,
      description: "Nilai setoran sampah",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  // Recent transactions (limit 5)
  const recentTransactions = transactions.slice(0, 5).map((transaction) => ({
    id: transaction.id,
    rt: transaction.rt?.nomor || "N/A", 
    amount: `${transaction.weight} kg`,
    value: `+Rp ${transaction.total_value.toLocaleString("id-ID")}`,
    date: new Date(transaction.date).toLocaleDateString("id-ID"),
    wasteTypeName: transaction.waste_type?.name || "N/A",
  }));

  // RT Savings overview (top 5 by balance)
  const rtSavings = rtList
    .map((rt) => ({
      rt: rt.nomor,
      balance: rt.saldo,
      transactions: rt.total_transaksi,
    }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Connection Status Info */}
      <Card className={`${isOnline ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <>
                  <Wifi className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Online Mode</p>
                    <p className="text-sm text-green-600">Data tersinkron dengan server</p>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">Offline Mode</p>
                    <p className="text-sm text-orange-600">Data tersimpan lokal</p>
                  </div>
                </>
              )}
            </div>
            {pendingCount > 0 && (
              <Badge variant="secondary" className="text-blue-600">
                {pendingCount} data pending sync
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.description && (
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & RT Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scale className="h-5 w-5" />
              <span>Transaksi Terbaru</span>
            </CardTitle>
            <CardDescription>5 transaksi sampah terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Scale className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">RT {transaction.rt}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.wasteTypeName} • {transaction.amount}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {transaction.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada transaksi</p>
                <p className="text-sm">Mulai input setoran sampah untuk melihat data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RT Savings Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>Saldo RT Tertinggi</span>
            </CardTitle>
            <CardDescription>5 RT dengan saldo terbesar</CardDescription>
          </CardHeader>
          <CardContent>
            {rtSavings.length > 0 ? (
              <div className="space-y-4">
                {rtSavings.map((rt, index) => (
                  <div
                    key={rt.rt}
                    className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">RT {rt.rt}</p>
                        <p className="text-sm text-muted-foreground">
                          {rt.transactions} transaksi
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        Rp {rt.balance.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada data RT</p>
                <p className="text-sm">Tambahkan RT untuk melihat saldo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>
            Akses fitur utama aplikasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Kelola RT</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col space-y-2">
              <Scale className="h-6 w-6" />
              <span className="text-sm">Input Setoran</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col space-y-2">
              <Wallet className="h-6 w-6" />
              <span className="text-sm">Tabungan</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Laporan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
