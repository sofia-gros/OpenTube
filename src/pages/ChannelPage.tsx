import { useEffect, useState } from "preact/hooks";
import { getChannel } from "@/services/api";

interface ChannelPageProps {
  id?: string;
  path?: string;
}

export default function ChannelPage({ id }: ChannelPageProps) {
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchChannel() {
      try {
        const data = await getChannel(id);
        setChannel(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchChannel();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-48 w-full rounded-xl bg-muted animate-pulse md:h-64" />
        <div className="container px-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <div className="h-32 w-32 shrink-0 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {channel.banner && (
        <div className="h-48 w-full overflow-hidden rounded-xl bg-muted md:h-64">
          <img src={channel.banner} className="w-full h-full object-cover" alt="Banner" />
        </div>
      )}
      <div className="container px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-background bg-secondary">
            <img src={channel.avatar} className="w-full h-full object-cover" alt="Avatar" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{channel.name}</h1>
            <p className="text-muted-foreground">{channel.subscriberCount} の登録者</p>
          </div>
        </div>
      </div>
      <div className="border-b">
        <div className="flex gap-8 px-4 text-sm font-medium">
          <div className="border-b-2 border-primary pb-4 cursor-pointer">ホーム</div>
          <div className="text-muted-foreground pb-4 cursor-pointer">動画</div>
          <div className="text-muted-foreground pb-4 cursor-pointer">ショート</div>
          <div className="text-muted-foreground pb-4 cursor-pointer">コミュニティ</div>
        </div>
      </div>
    </div>
  );
}
