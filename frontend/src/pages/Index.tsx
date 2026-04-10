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
      <BalanceCard />
      <AssetList />
      <StressTestBanner />
    </AppShell>
  </PageTransition>
);

export default Index;
