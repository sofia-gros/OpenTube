import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { VideoCard } from "@/components/video/VideoCard";
import { DownloadCloud } from "lucide-react";

export default function DownloadsPage({ path }: { path?: string }) {
  const downloads = useLiveQuery(() => db.downloads.orderBy("downloadedAt").reverse().toArray());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <DownloadCloud className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">オフライン</h1>
      </div>
      
      {!downloads ? (
        <div className="text-center py-20 text-muted-foreground">読み込み中...</div>
      ) : downloads.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4">
          <DownloadCloud className="w-12 h-12 opacity-20" />
          <p>ダウンロード済みの動画はありません</p>
          <p className="text-sm">動画のメニューから「オフライン保存」を選択して、インターネット接続なしで視聴できます。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {downloads.map((item) => (
            <VideoCard
              key={item.id}
              video={item.video}
              showRemove
              onRemove={() => db.downloads.delete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
