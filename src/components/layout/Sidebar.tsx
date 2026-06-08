import { Home, PlaySquare, History, Clock, Download, Settings } from "lucide-react";
import { Link } from "preact-router/match";

const items = [
  { icon: Home, label: "ホーム", href: "/" },
  { icon: PlaySquare, label: "登録チャンネル", href: "/subscriptions" },
  { icon: History, label: "履歴", href: "/history" },
  { icon: Clock, label: "後で見る", href: "/watch-later" },
  { icon: Download, label: "ダウンロード", href: "/downloads" },
  { icon: Settings, label: "設定", href: "/settings" },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-60 border-r bg-background md:block">
      <nav className="flex flex-col gap-1 p-2">
        {items.map((item) => (
          <Link
            key={item.label}
            {...({
              href: item.href,
              className: "flex items-center gap-4 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:translate-x-1 active:scale-95",
              activeClassName: "bg-accent text-accent-foreground"
            } as any)}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
