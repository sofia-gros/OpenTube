import { useState, useEffect, useMemo } from "preact/hooks";
import { Clock, ThumbsUp, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToHistory, addToWatchlist, subscribeToChannel, unsubscribeFromChannel, db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { getVideoInfo } from "@/services/api";
import VideoPlayer from "@/components/video/VideoPlayer";
import Comments from "@/components/video/Comments";

interface WatchPageProps {
  id?: string;
  path?: string;
}

export default function WatchPage({ id }: WatchPageProps) {
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const videoId = id || "";

  const isSubscribed = useLiveQuery(
    () => (video ? db.subscriptions.get(video.authorId) : undefined),
    [video]
  );

  const downloadedVideo = useLiveQuery(
    () => (videoId ? db.downloads.get(videoId) : undefined),
    [videoId]
  );

  const videoSource = useMemo(() => {
    if (downloadedVideo?.data) {
      return URL.createObjectURL(downloadedVideo.data);
    }
    return video?.streamingUrl;
  }, [downloadedVideo, video]);

  useEffect(() => {
    return () => {
      if (videoSource && videoSource.startsWith("blob:")) {
        URL.revokeObjectURL(videoSource);
      }
    };
  }, [videoSource]);

  useEffect(() => {
    if (!videoId) return;
    async function fetchVideo() {
      setLoading(true);
      try {
        const data = await getVideoInfo(videoId);
        setVideo(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    if (video) {
      addToHistory(video);
    }
  }, [video]);

  const handleWatchLater = async () => {
    if (video) {
      await addToWatchlist(video);
      alert("「後で見る」に追加しました");
    }
  };

  const handleSubscribe = async () => {
    if (!video) return;
    if (isSubscribed) {
      await unsubscribeFromChannel(video.authorId);
    } else {
      await subscribeToChannel({
        id: video.authorId,
        name: video.author,
        thumbnail: `https://api.dicebear.com/7.x/initials/svg?seed=${video.author}`, // Mock thumbnail
      });
    }
  };

  if (loading && !downloadedVideo) {
    return (
      <div className="max-w-6xl mx-auto animate-pulse px-4">
        <div className="aspect-video w-full rounded-xl bg-muted" />
        <div className="mt-6 space-y-4">
          <div className="h-6 w-3/4 bg-muted rounded" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayVideo = video || downloadedVideo?.video;
  if (!displayVideo && !loading) return <div>動画が見つかりませんでした。</div>;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in px-4 pb-12">
      <div className="w-full rounded-xl bg-black shadow-lg ring-1 ring-white/10 transition-all hover:ring-primary/50">
        <VideoPlayer 
          id={videoId}
          src={videoSource}
          poster={displayVideo?.thumbnail}
          qualities={video?.qualities}
        />
      </div>
      
      <div className="mt-6 space-y-4">
        <h5 className="text-xl font-bold line-clamp-2">{displayVideo?.title}</h5>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <a href={`/channel/${displayVideo?.authorId}`} className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden transition-transform hover:scale-105 active:scale-95">
              <span className="text-xs font-bold">{displayVideo?.author?.[0]}</span>
            </a>
            <div>
              <a href={`/channel/${displayVideo?.authorId}`} className="font-semibold hover:text-primary transition-colors">{displayVideo?.author}</a>
              <p className="text-sm text-muted-foreground">チャンネル情報</p>
            </div>
            <Button 
              className={`ml-4 rounded-full transition-all active:scale-95 group ${
                isSubscribed ? "bg-muted text-foreground hover:bg-muted/80" : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
              onClick={handleSubscribe}
            >
              {isSubscribed && <CheckCircle2 className="w-4 h-4 mr-2" />}
              {isSubscribed ? "登録済み" : "チャンネル登録"}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-secondary rounded-full overflow-hidden">
              <Button variant="ghost" size="sm" className="rounded-none px-4 border-r hover:bg-muted transition-colors">
                <ThumbsUp className="mr-2 h-4 w-4" />
                高評価
              </Button>
              <Button variant="ghost" size="sm" className="rounded-none px-4 hover:bg-muted transition-colors">
                低評価
              </Button>
            </div>
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full transition-all hover:bg-muted active:scale-90" 
              title="後で見る"
              onClick={handleWatchLater}
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div 
          className={`rounded-xl bg-muted/50 p-4 text-sm leading-relaxed transition-all duration-300 overflow-hidden relative ${
            showFullDescription ? "max-h-[2000px]" : "max-h-24"
          }`}
        >
          <p className="font-bold mb-2">{displayVideo?.views} 回視聴</p>
          <div className="whitespace-pre-wrap">{displayVideo?.description}</div>
          
          {!showFullDescription && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-muted/80 to-transparent flex items-end justify-center pb-1">
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs h-6"
                onClick={() => setShowFullDescription(true)}
              >
                もっと見る
              </Button>
            </div>
          )}
          {showFullDescription && (
            <Button 
              variant="link" 
              size="sm" 
              className="mt-4 text-xs h-6 p-0"
              onClick={() => setShowFullDescription(false)}
            >
              一部表示
            </Button>
          )}
        </div>

        <Comments videoId={videoId} />
      </div>
    </div>
  );
}
