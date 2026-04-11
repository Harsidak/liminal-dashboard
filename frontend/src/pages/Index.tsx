import AppShell from "@/components/AppShell";
import PageTransition from "@/components/PageTransition";
import DashboardHeader from "@/components/DashboardHeader";
import BalanceCard from "@/components/BalanceCard";
import AssetList from "@/components/AssetList";
import StressTestBanner from "@/components/StressTestBanner";

const Index = () => (
  <PageTransition>
    <AppShell>
      <DashboardHeader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <BalanceCard />
          <StressTestBanner />
        </div>
        <div className="lg:col-span-1">
          <AssetList />
        </div>
      </div>
    </AppShell>
  </PageTransition>
);

export default Index;
