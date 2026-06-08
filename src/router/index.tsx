import { Router } from "preact-router";
import { Layout } from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import WatchPage from "@/pages/WatchPage";
import ChannelPage from "@/pages/ChannelPage";
import SettingsPage from "@/pages/SettingsPage";
import HistoryPage from "@/pages/HistoryPage";
import WatchLaterPage from "@/pages/WatchLaterPage";
import DownloadsPage from "@/pages/DownloadsPage";
import SubscriptionsPage from "@/pages/SubscriptionsPage";

export default function AppRouter() {
  return (
    <Layout>
      <Router>
        <HomePage path="/" />
        <WatchPage path="/watch/:id" />
        <ChannelPage path="/channel/:id" />
        <SettingsPage path="/settings" />
        <HistoryPage path="/history" />
        <WatchLaterPage path="/watch-later" />
        <DownloadsPage path="/downloads" />
        <SubscriptionsPage path="/subscriptions" />
      </Router>
    </Layout>
  );
}
