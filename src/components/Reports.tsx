import { useState, useEffect } from "react";
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
  Activity,
} from "lucide-react";
import { useOfflineSupabaseData } from "@/hooks/useOfflineSupabaseData";

export const Reports = () => {
  const {
    rtList,
    transactions,
    wasteTypes,
    isLoading,
    error,
  } = useOfflineSupabaseData();

  // Helper functions to replace the ones from useSupabaseData
  const getTransactionsByRT = (rtNomor: string) => {
    return transactions.filter(t => t.rt?.nomor === rtNomor);
  };

  const getTransactionsByDate = (startDate: string, endDate: string) => {
    return transactions.filter(t => {
      const transactionDate = t.date;
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const [reportType, setReportType] = useState("monthly");
  const [filteredData, setFilteredData] = useState({
    transactions: [],
    dateRange: null,
    reportType: "monthly",
  });

  // Function to filter transactions based on selected criteria
  const filterTransactions = () => {
    console.log("📊 Filtering transactions with:", { dateRange, reportType });

    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    let filtered = [];

    switch (reportType) {
      case "daily":
        // For daily, use end date as the target date
        filtered = getTransactionsByDate(dateRange.endDate, dateRange.endDate);
        break;
      case "weekly":
        // For weekly, get last 7 days from end date
        const weekStart = new Date(dateRange.endDate);
        weekStart.setDate(weekStart.getDate() - 6);
        filtered = safeTransactions.filter((t) => {
          const transactionDate = new Date(t.date);
          const startDate = new Date(weekStart);
          const endDate = new Date(dateRange.endDate);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
        break;
      case "monthly":
        // For monthly, use the month of end date
        const targetMonth = dateRange.endDate.slice(0, 7); // YYYY-MM
        filtered = safeTransactions.filter(
          (t) => t && t.date && t.date.startsWith(targetMonth)
        );
        break;
      case "yearly":
        // For yearly, use the year of end date
        const targetYear = dateRange.endDate.slice(0, 4); // YYYY
        filtered = safeTransactions.filter(
          (t) => t && t.date && t.date.startsWith(targetYear)
        );
        break;
      default:
        // Custom date range
        filtered = safeTransactions.filter((t) => {
          if (!t || !t.date) return false;
          const transactionDate = t.date.split("T")[0];
          return (
            transactionDate >= dateRange.startDate &&
            transactionDate <= dateRange.endDate
          );
        });
    }

    console.log("📊 Filtered transactions:", filtered.length);

    setFilteredData({
      transactions: filtered,
      dateRange: { ...dateRange },
      reportType,
    });
  };

  // Initialize with current month data on first load
  useEffect(() => {
    if (transactions.length > 0) {
      filterTransactions();
    }
  }, [transactions]);

  // Show loading state while data is being loaded
  if (isLoading) {
    console.log("📊 Reports showing loading state");
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span>Memuat data laporan...</span>
        </div>
      </div>
    );
  }

  console.log("📊 Reports data loaded, calculating stats...");

  // Use filtered transactions or fallback to current month
  const displayTransactions =
    filteredData.transactions.length > 0
      ? filteredData.transactions
      : Array.isArray(transactions)
      ? transactions.filter((t) => {
          const currentMonth = new Date().toISOString().slice(0, 7);
          return t && t.date && t.date.startsWith(currentMonth);
        })
      : [];

  console.log("📊 Display transactions count:", displayTransactions.length);

  const reportStats = {
    totalDeposits: displayTransactions.reduce(
      (sum, t) => sum + (t.weight || 0),
      0
    ),
    totalValue: displayTransactions.reduce(
      (sum, t) => sum + (t.total_value || 0),
      0
    ),
    transactions: displayTransactions.length,
    activeRTs: new Set(displayTransactions.map((t) => t.rt_id)).size,
    growth: 12.5, // Mock growth percentage - could be calculated based on previous period
    averagePerRT: rtList.length
      ? displayTransactions.reduce((sum, t) => sum + (t.weight || 0), 0) /
        rtList.length
      : 0,
  };

  console.log("📊 Calculated report stats:", reportStats);

  const rtData = rtList.map((rt) => {
    if (!rt || typeof rt !== "object") {
      console.warn("📊 Invalid RT object:", rt);
      return null;
    }

    const rtTransactions = displayTransactions.filter(
      (t) => t && t.rt_id === rt.id
    );
    const rtStats = {
      id: rt.id || "unknown",
      rt_number: rt.nomor || "RT ?",
      total_weight: rtTransactions.reduce((sum, t) => sum + (t.weight || 0), 0),
      total_value: rtTransactions.reduce(
        (sum, t) => sum + (t.total_value || 0),
        0
      ),
      transaction_count: rtTransactions.length,
    };

    console.log(`📊 RT ${rt.nomor} stats:`, rtStats);
    return rtStats;
  });

  console.log("📊 RT data processed:", rtData.length);

  const validRTData = rtData.filter(Boolean);

  const wasteTypeData = wasteTypes.map((type) => {
    if (!type || typeof type !== "object") {
      console.warn("📊 Invalid waste type object:", type);
      return null;
    }

    const typeTransactions = displayTransactions.filter(
      (t) => t && t.waste_type_id === type.id
    );
    return {
      type: type.name || "Unknown",
      weight: typeTransactions.reduce((sum, t) => sum + (t.weight || 0), 0),
      value: typeTransactions.reduce((sum, t) => sum + (t.total_value || 0), 0),
      percentage: reportStats.totalDeposits
        ? (
            (typeTransactions.reduce((sum, t) => sum + (t.weight || 0), 0) /
              reportStats.totalDeposits) *
            100
          ).toFixed(1)
        : "0.0",
    };
  });

  const validWasteTypeData = wasteTypeData.filter(Boolean);

  // Sort RT by total weight for ranking
  const rtRanking = validRTData
    .sort((a, b) => (b?.total_weight || 0) - (a?.total_weight || 0))
    .slice(0, 5);

  console.log("📊 RT ranking:", rtRanking);

  // Calculate daily trend based on the filtered period
  const calculateDailyTrend = () => {
    let days = [];

    if (reportType === "weekly") {
      // Last 7 days from end date
      const endDate = new Date(dateRange.endDate);
      days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(endDate);
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });
    } else {
      // Default to last 7 days for other report types
      const today = new Date();
      days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });
    }

    const dailyStats = new Map();
    displayTransactions.forEach((t) => {
      if (t && t.date) {
        const date = t.date.split("T")[0];
        if (days.includes(date)) {
          const current = dailyStats.get(date) || { deposits: 0, value: 0 };
          dailyStats.set(date, {
            deposits: current.deposits + (t.weight || 0),
            value: current.value + (t.total_value || 0),
          });
        }
      }
    });

    return days.map((date) => ({
      date: new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
      }),
      deposits: dailyStats.get(date)?.deposits || 0,
      value: dailyStats.get(date)?.value || 0,
    }));
  };

  const dailyTrend = calculateDailyTrend();

  // Helper function to get period description
  const getPeriodDescription = () => {
    const startDate = new Date(dateRange.startDate).toLocaleDateString("id-ID");
    const endDate = new Date(dateRange.endDate).toLocaleDateString("id-ID");

    switch (reportType) {
      case "daily":
        return `Harian - ${endDate}`;
      case "weekly":
        const weekStart = new Date(dateRange.endDate);
        weekStart.setDate(weekStart.getDate() - 6);
        return `Mingguan - ${weekStart.toLocaleDateString(
          "id-ID"
        )} s/d ${endDate}`;
      case "monthly":
        const month = new Date(dateRange.endDate).toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });
        return `Bulanan - ${month}`;
      case "yearly":
        const year = new Date(dateRange.endDate).getFullYear();
        return `Tahunan - ${year}`;
      default:
        return `${startDate} s/d ${endDate}`;
    }
  };

  const handleExport = (format: string) => {
    // Export functionality - to be implemented with real data
    console.log(
      `Exporting report in ${format} format for period: ${getPeriodDescription()}`
    );
    // In real implementation, this would generate and download the file
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Laporan & Analitik</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Analisis kinerja dan tren tabungan sampah
          </p>
          <div className="mt-1">
            <Badge variant="outline" className="text-xs">
              <Calendar className="mr-1 h-3 w-3" />
              {getPeriodDescription()}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            size="sm"
            className="w-full sm:w-auto"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("excel")}
            size="sm"
            className="w-full sm:w-auto"
          >
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Jenis Laporan</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full">
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
              <Label className="text-sm">Tanggal Mulai</Label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Tanggal Selesai</Label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div className="flex items-end">
              <Button className="w-full" size="sm" onClick={filterTransactions}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {displayTransactions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Tidak ada data untuk periode ini
              </h3>
              <p className="text-muted-foreground mb-4">
                Tidak ditemukan transaksi untuk{" "}
                {getPeriodDescription().toLowerCase()}. Coba ubah periode atau
                jenis laporan.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setReportType("monthly");
                  setDateRange({
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0],
                    endDate: new Date().toISOString().split("T")[0],
                  });
                  setTimeout(filterTransactions, 100);
                }}
              >
                Reset ke Bulan Ini
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="min-h-[120px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Setoran
                </CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {reportStats.totalDeposits} kg
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-success">+{reportStats.growth}%</span>
                  <span className="text-muted-foreground">
                    vs periode sebelumnya
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="min-h-[120px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Nilai
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  Rp {reportStats.totalValue.toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Rata-rata Rp{" "}
                  {reportStats.transactions > 0
                    ? Math.round(
                        reportStats.totalValue / reportStats.transactions
                      ).toLocaleString("id-ID")
                    : "0"}
                  /transaksi
                </p>
              </CardContent>
            </Card>

            <Card className="min-h-[120px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RT Aktif</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {reportStats.activeRTs}
                </div>
                <p className="text-xs text-muted-foreground">
                  dari {rtList.length} RT terdaftar
                </p>
              </CardContent>
            </Card>

            <Card className="min-h-[120px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transaksi
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {reportStats.transactions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Rata-rata {Math.round(reportStats.averagePerRT)} kg/RT
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                  {validWasteTypeData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4" />
                      <p>Belum ada data jenis sampah</p>
                      <p className="text-sm">
                        Data akan muncul setelah ada setoran sampah
                      </p>
                    </div>
                  ) : (
                    validWasteTypeData.map((item, index) => (
                      <div key={item.type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {item.type}
                          </span>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {item.weight} kg
                            </p>
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
                          {item.percentage}% dari total setoran
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* RT Performance Ranking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Ranking Kinerja RT</span>
                </CardTitle>
                <CardDescription>
                  5 RT dengan setoran terbanyak bulan ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rtRanking.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-12 w-12 mx-auto mb-4" />
                      <p>Belum ada data setoran RT</p>
                      <p className="text-sm">
                        Ranking akan muncul setelah ada setoran dari RT
                      </p>
                    </div>
                  ) : (
                    rtRanking.map((rt, index) => (
                      <div
                        key={rt.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                              index === 0
                                ? "bg-yellow-500 text-white"
                                : index === 1
                                ? "bg-gray-400 text-white"
                                : index === 2
                                ? "bg-orange-600 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{rt.rt_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {rt.transaction_count} transaksi
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{rt.total_weight} kg</p>
                          <p className="text-sm text-muted-foreground">
                            Rp {rt.total_value.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Hubungi Administrator</CardTitle>
          <CardDescription>
            Untuk bantuan atau pertanyaan tentang laporan ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Email Admin
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
