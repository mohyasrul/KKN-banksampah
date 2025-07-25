import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { RTManagement } from "@/components/RTManagement";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "rt-management":
        return <RTManagement />;
      case "waste-deposit":
        return <div className="text-center py-12 text-muted-foreground">Fitur Input Setoran akan segera hadir</div>;
      case "savings":
        return <div className="text-center py-12 text-muted-foreground">Fitur Tabungan akan segera hadir</div>;
      case "reports":
        return <div className="text-center py-12 text-muted-foreground">Fitur Laporan akan segera hadir</div>;
      case "settings":
        return <div className="text-center py-12 text-muted-foreground">Fitur Pengaturan akan segera hadir</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </Layout>
  );
};

export default Index;
