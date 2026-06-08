import { useState, useEffect } from "preact/hooks";
import { setSetting, getSetting, db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, Moon, Sun, Globe, User, Bell, Shield, Settings2, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLiveQuery } from "dexie-react-hooks";

export default function SettingsPage({ path }: { path?: string }) {
  const [settings, setSettings] = useState<Record<string, any>>({
    darkMode: true,
    autoplay: true,
    playbackSpeed: "1.0",
    quality: "auto",
    language: "日本語",
    location: "日本",
    restrictedMode: false,
    watchHistory: true,
    searchHistory: true,
    notifications: true,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Use live query for some settings to keep UI in sync if changed elsewhere
  const dbSettings = useLiveQuery(() => db.settings.toArray());

  useEffect(() => {
    async function loadSettings() {
      const loaded: Record<string, any> = { ...settings };
      if (dbSettings) {
        dbSettings.forEach(s => {
          loaded[s.key] = s.value;
        });
      } else {
        for (const key of Object.keys(settings)) {
          loaded[key] = await getSetting(key, settings[key]);
        }
      }
      setSettings(loaded);
      
      const loginStatus = await getSetting("isLoggedIn", false);
      setIsLoggedIn(loginStatus);
    }
    loadSettings();
  }, [dbSettings]);

  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await setSetting(key, value);
  };

  const clearHistory = async () => {
    if (confirm("視聴履歴をすべてのデバイスから削除しますか？")) {
      await db.history.clear();
      alert("視聴履歴を削除しました");
    }
  };

  const handleLogin = async () => {
    setIsLoggedIn(true);
    await setSetting("isLoggedIn", true);
    alert("Googleアカウントと連携しました");
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    await setSetting("isLoggedIn", false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">設定</h1>
        <p className="text-muted-foreground">NyanTubeの表示や動作をカスタマイズします。</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle>アカウント</CardTitle>
            </div>
            <CardDescription>Googleアカウントと連携して、登録チャンネルやプレイリストを同期します。</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoggedIn ? (
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">N</div>
                  <div>
                    <p className="font-bold">NyanTube User</p>
                    <p className="text-sm text-muted-foreground">nyantube@example.com</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleLogout}>ログアウト</Button>
              </div>
            ) : (
              <Button className="w-full flex gap-2" onClick={handleLogin}>
                <LogIn className="w-4 h-4" />
                Googleでログイン
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              <CardTitle>外観と動作</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">ダークモード</p>
                <p className="text-sm text-muted-foreground">目に優しい暗い色調のテーマを使用します。</p>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => updateSetting("darkMode", !settings.darkMode)}
                className="w-12 h-12 rounded-full"
              >
                {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">自動再生</p>
                <p className="text-sm text-muted-foreground">動画が終わると次の動画を自動的に再生します。</p>
              </div>
              <Button 
                variant={settings.autoplay ? "default" : "outline"}
                onClick={() => updateSetting("autoplay", !settings.autoplay)}
              >
                {settings.autoplay ? "オン" : "オフ"}
              </Button>
            </div>

            <div className="grid gap-2">
              <p className="font-medium">再生速度</p>
              <div className="flex gap-2">
                {["0.5", "1.0", "1.5", "2.0"].map((speed) => (
                  <Button
                    key={speed}
                    variant={settings.playbackSpeed === speed ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => updateSetting("playbackSpeed", speed)}
                  >
                    {speed}x
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <CardTitle>地域と言語</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <p className="font-medium text-sm">言語</p>
              <Input 
                value={settings.language} 
                onInput={(e: any) => updateSetting("language", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <p className="font-medium text-sm">地域</p>
              <Input 
                value={settings.location} 
                onInput={(e: any) => updateSetting("location", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>プライバシー</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">視聴履歴を一時停止</p>
                <p className="text-sm text-muted-foreground">再生した動画が履歴に保存されなくなります。</p>
              </div>
              <Button 
                variant={!settings.watchHistory ? "destructive" : "outline"}
                onClick={() => updateSetting("watchHistory", !settings.watchHistory)}
              >
                {!settings.watchHistory ? "一時停止中" : "一時停止する"}
              </Button>
            </div>

            <div className="flex items-center justify-between border-t pt-6">
              <div className="space-y-0.5">
                <p className="font-medium">制限付きモード</p>
                <p className="text-sm text-muted-foreground">成人向けコンテンツを含む可能性のある動画を非表示にします。</p>
              </div>
              <Button 
                variant={settings.restrictedMode ? "default" : "outline"}
                onClick={() => updateSetting("restrictedMode", !settings.restrictedMode)}
              >
                {settings.restrictedMode ? "オン" : "オフ"}
              </Button>
            </div>

            <div className="pt-4">
              <Button variant="destructive" className="w-full flex gap-2" onClick={clearHistory}>
                <Trash2 className="w-4 h-4" />
                視聴履歴をすべて削除
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <CardTitle>通知</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">デスクトップ通知</p>
                <p className="text-sm text-muted-foreground">新しい動画や返信があったときに通知を受け取ります。</p>
              </div>
              <Button 
                variant={settings.notifications ? "default" : "outline"}
                onClick={() => updateSetting("notifications", !settings.notifications)}
              >
                {settings.notifications ? "オン" : "オフ"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
