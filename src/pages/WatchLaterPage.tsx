import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { VideoCard } from "@/components/video/VideoCard";

export default function WatchLaterPage({ path }: { path?: string }) {
  const watchlist = useLiveQuery(() => db.watchlist.orderBy("addedAt").reverse().toArray());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">後で見る</h1>
      {!watchlist ? (
        <div className="text-center py-20 text-muted-foreground">読み込み中...</div>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">「後で見る」動画はありません</div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {watchlist.map((item) => (
            <VideoCard
              key={item.id}
              video={item.video}
              showRemove
              onRemove={() => db.watchlist.delete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
