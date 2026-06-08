import { useEffect, useState, useRef } from "preact/hooks";
import type { Video } from "@/types/video";
import { getHomeVideos, searchVideos } from "@/services/api";
import { VideoCard } from "@/components/video/VideoCard";
import { Loader2 } from "lucide-react";

export default function HomePage({ q }: { q?: string }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Use refs for state to avoid recreating the observer
  const stateRef = useRef({ hasMore, loading, loadingMore, token, q });
  useEffect(() => {
    stateRef.current = { hasMore, loading, loadingMore, token, q };
  }, [hasMore, loading, loadingMore, token, q]);

  const fetchInitialVideos = async () => {
    console.log(`[Client] Initial fetch. Query: ${q}`);
    setLoading(true);
    setError(null);
    setVideos([]);
    try {
      let data;
      if (q) {
        data = await searchVideos(q);
        setToken(data.continuationToken);
        setHasMore(!!data.continuationToken);
      } else {
        data = await getHomeVideos();
        setToken(data.continuation);
        setHasMore(data.hasContinuation);
      }
      
      console.log(`[Client] Received ${data.videos.length} videos.`);
      setVideos(data.videos);
    } catch (err) {
      console.error("[Client] Initial fetch error:", err);
      setError("動画の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreVideos = async () => {
    const { loadingMore, token, hasMore, q } = stateRef.current;
    if (loadingMore || !token || !hasMore) {
      console.log("[Client] Skip fetchMore:", { loadingMore, hasToken: !!token, hasMore });
      return;
    }
    
    console.log("[Client] Loading more...");
    setLoadingMore(true);
    try {
      let data;
      if (q) {
        data = await searchVideos(q, token);
        setToken(data.continuationToken);
        setHasMore(!!data.continuationToken);
      } else {
        data = await getHomeVideos(token);
        setToken(data.continuation);
        setHasMore(data.hasContinuation);
      }
      
      if (data.videos.length > 0) {
        setVideos(prev => {
          const existingIds = new Set(prev.map(v => v.id));
          const newVideos = data.videos.filter(v => !existingIds.has(v.id));
          console.log(`[Client] Added ${newVideos.length} videos.`);
          return [...prev, ...newVideos];
        });
      } else {
        console.log("[Client] No new videos in continuation.");
      }
    } catch (err) {
      console.error("[Client] Fetch more error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchInitialVideos();
  }, [q]); // Re-fetch when query changes

  useEffect(() => {
    console.log("[Client] Setting up IntersectionObserver...");
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        const { hasMore, loading, loadingMore, token } = stateRef.current;
        console.log(`[Client] Observer entry: intersecting=${entry.isIntersecting}, ratio=${entry.intersectionRatio}`);
        if (entry.isIntersecting && hasMore && !loading && !loadingMore && token) {
          fetchMoreVideos();
        }
      },
      { 
        threshold: 0,
        rootMargin: "400px" 
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, []); // Only run once


  if (loading && videos.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {videos.map((video, index) => (
          <VideoCard key={`${video.id}-${index}`} video={video} />
        ))}
      </div>

      <div ref={observerTarget} className="h-20 flex items-center justify-center bg-transparent">
        {loadingMore && (
          <div className="flex items-center gap-2 text-muted-foreground animate-in fade-in">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>さらに読み込み中...</span>
          </div>
        )}
        {!hasMore && videos.length > 0 && (
          <p className="text-sm text-muted-foreground">すべての動画を読み込みました</p>
        )}
      </div>
    </div>
  );
}
