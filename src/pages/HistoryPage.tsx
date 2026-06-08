import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { VideoCard } from "@/components/video/VideoCard";

export default function HistoryPage({ path }: { path?: string }) {
  const history = useLiveQuery(() => db.history.orderBy("viewedAt").reverse().toArray());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">視聴履歴</h1>
      {!history ? (
        <div className="text-center py-20 text-muted-foreground">読み込み中...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">視聴履歴がありません</div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {history.map((item) => (
            <VideoCard
              key={item.id}
              video={item.video}
              showRemove
              onRemove={() => db.history.delete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
