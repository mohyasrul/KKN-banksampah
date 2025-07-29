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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Scale,
  DollarSign,
  FileText,
  Mail,
  Smartphone,
  Target,
  Award,
} from "lucide-react";

export const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: "2024-01-01",
    endDate: "2024-01-31",
  });

  const [reportType, setReportType] = useState("monthly");

  // Initialize empty data - to be populated from IndexedDB
  const monthlyStats = {
    totalDeposits: 0,
    totalValue: 0,
    activeRTs: 0,
    transactions: 0,
    averagePerRT: 0,
    growth: 0,
  };

  const wasteTypeData: Array<{
    type: string;
    weight: number;
    value: number;
    percentage: number;
  }> = [];

  const rtRanking: Array<{
    rt: string;
    deposits: number;
    value: number;
    transactions: number;
    rank: number;
  }> = [];

  const dailyTrend: Array<{
    date: string;
    deposits: number;
    value: number;
  }> = [];

  const handleExport = (format: string) => {
    // Export functionality - to be implemented with real data
    console.log(`Exporting report in ${format} format`);
    // In real implementation, this would generate and download the file
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Laporan & Analitik</h2>
          <p className="text-muted-foreground">
            Analisis kinerja dan tren tabungan sampah
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Jenis Laporan</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Selesai</Label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
              />
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Setoran</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.totalDeposits} kg
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">+{monthlyStats.growth}%</span>
              <span className="text-muted-foreground">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {monthlyStats.totalValue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              Rata-rata Rp{" "}
              {Math.round(
                monthlyStats.totalValue / monthlyStats.transactions
              ).toLocaleString("id-ID")}
              /transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RT Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.activeRTs}</div>
            <p className="text-xs text-muted-foreground">
              dari 12 RT terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transaksi
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.transactions}
            </div>
            <p className="text-xs text-muted-foreground">
              Rata-rata {Math.round(monthlyStats.averagePerRT)} kg/RT
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Distribusi Jenis Sampah</span>
            </CardTitle>
            <CardDescription>
              Breakdown setoran berdasarkan jenis sampah
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wasteTypeData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4" />
                  <p>Belum ada data jenis sampah</p>
                  <p className="text-sm">
                    Data akan muncul setelah ada setoran sampah
                  </p>
                </div>
              ) : (
                wasteTypeData.map((item, index) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.type}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{item.weight} kg</p>
                        <p className="text-xs text-muted-foreground">
                          Rp {item.value.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.percentage}% dari total
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* RT Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Ranking RT</span>
            </CardTitle>
            <CardDescription>Performa setoran per RT bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rtRanking.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4" />
                  <p>Belum ada data ranking</p>
                  <p className="text-sm">
                    Ranking akan muncul setelah ada setoran dari RT
                  </p>
                </div>
              ) : (
                rtRanking.map((rt) => (
                  <div
                    key={rt.rt}
                    className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={rt.rank <= 3 ? "default" : "secondary"}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        {rt.rank}
                      </Badge>
                      <div>
                        <p className="font-medium">{rt.rt}</p>
                        <p className="text-xs text-muted-foreground">
                          {rt.transactions} transaksi
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{rt.deposits} kg</p>
                      <p className="text-xs text-success">
                        Rp {rt.value.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Tren Setoran Harian</span>
          </CardTitle>
          <CardDescription>
            Grafik setoran sampah 7 hari terakhir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple bar chart representation */}
            <div className="grid grid-cols-7 gap-2">
              {dailyTrend.map((day, index) => {
                const maxValue = Math.max(...dailyTrend.map((d) => d.deposits));
                const height = (day.deposits / maxValue) * 100;

                return (
                  <div key={day.date} className="text-center">
                    <div className="bg-muted rounded-lg p-2 mb-2 h-32 flex items-end justify-center">
                      <div
                        className="bg-primary rounded-sm w-full transition-all"
                        style={{ height: `${height}%` }}
                        title={`${
                          day.deposits
                        } kg - Rp ${day.value.toLocaleString("id-ID")}`}
                      />
                    </div>
                    <p className="text-xs font-medium">{day.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {day.deposits} kg
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Options */}
      <Card>
        <CardHeader>
          <CardTitle>Bagikan Laporan</CardTitle>
          <CardDescription>
            Kirim laporan melalui berbagai platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Button variant="outline" size="sm">
              <Smartphone className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
