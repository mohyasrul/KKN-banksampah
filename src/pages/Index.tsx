import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { RTManagement } from "@/components/RTManagement";
import { WasteDepositClean } from "@/components/WasteDepositClean";
import { Savings } from "@/components/Savings";
import { Reports } from "@/components/Reports";
import { Settings } from "@/components/Settings";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    try {
      switch (activeTab) {
        case "dashboard":
          return <Dashboard />;
        case "rt-management":
          return <RTManagement />;
        case "waste-deposit":
          return <WasteDepositClean />;
        case "savings":
          return <Savings />;
        case "reports":
          return <Reports />;
        case "settings":
          return <Settings />;
        default:
          return <Dashboard />;
      }
    } catch (error) {
      console.error("Error rendering content:", error);
      return <div>Error loading component</div>;
    }
  };

  return (
    <Layout>
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      {renderContent()}
    </Layout>
  );
};

export default Index;
