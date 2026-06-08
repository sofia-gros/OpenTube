import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "preact-router";
import { Users, Bell, BellOff } from "lucide-react";
import { useState } from "preact/hooks";

export default function SubscriptionsPage({ path }: { path?: string }) {
  const subscriptions = useLiveQuery(() => db.subscriptions.orderBy("subscribedAt").reverse().toArray());
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});

  const toggleNotifications = (id: string) => {
    setNotifications(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">登録チャンネル</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">管理</Button>
          <Button variant="ghost" size="sm">最新の投稿</Button>
        </div>
      </div>

      {!subscriptions ? (
        <div className="text-center py-20 text-muted-foreground">読み込み中...</div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4 max-w-md mx-auto">
          <Users className="w-16 h-16 opacity-10" />
          <p className="text-lg font-medium">お気に入りのチャンネルを登録しましょう</p>
          <p className="text-sm">チャンネルを登録すると、新しい動画が投稿されたときにこちらに表示されます。設定からGoogleアカウントと連携することもできます。</p>
          <Link href="/">
            <Button className="mt-4">動画を探す</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex flex-col items-center p-6 bg-card rounded-xl border border-border/50 hover:border-primary/50 transition-all group">
              <Link href={`/channel/${sub.id}`} className="flex flex-col items-center gap-4 text-center">
                <Avatar className="w-24 h-24 border-2 border-background group-hover:scale-105 transition-transform duration-300">
                  <AvatarImage src={sub.thumbnail} alt={sub.name} />
                  <AvatarFallback>{sub.name[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg line-clamp-1">{sub.name}</h3>
                  <p className="text-xs text-muted-foreground">登録済み</p>
                </div>
              </Link>
              
              <div className="flex gap-2 mt-4 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    if(confirm(`${sub.name}の登録を解除しますか？`)) {
                      db.subscriptions.delete(sub.id);
                    }
                  }}
                >
                  解除
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => toggleNotifications(sub.id)}
                >
                  {notifications[sub.id] ? <Bell className="w-4 h-4 text-primary fill-primary" /> : <BellOff className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
