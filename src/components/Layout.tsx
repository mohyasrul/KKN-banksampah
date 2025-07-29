import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-accent/30">
      <header className="bg-primary shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-foreground p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-foreground">
                  Bank Sampah RW
                </h1>
                <p className="text-sm text-primary-foreground/80">
                  Sistem Tabungan Sampah
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-primary-foreground/10 text-primary-foreground"
            >
              v0.1 beta
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
