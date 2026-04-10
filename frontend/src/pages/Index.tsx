import AppShell from "@/components/AppShell";
import DashboardHeader from "@/components/DashboardHeader";
import BalanceCard from "@/components/BalanceCard";
import AssetList from "@/components/AssetList";
import StressTestBanner from "@/components/StressTestBanner";

const Index = () => (
  <AppShell>
    <DashboardHeader />
    <BalanceCard />
    <AssetList />
    <StressTestBanner />
  </AppShell>
);

export default Index;
