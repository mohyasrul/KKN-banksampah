import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { RTManagement } from "@/components/RTManagement";
import { WasteDeposit } from "@/components/WasteDeposit";
import { Savings } from "@/components/Savings";
import { Reports } from "@/components/Reports";
import { Settings } from "@/components/Settings";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "rt-management":
        return <RTManagement />;
      case "waste-deposit":
        return <WasteDeposit />;
      case "savings":
        return <Savings />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings />;
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
