import type { Video } from "@/types/video";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "preact-router";
import { MoreVertical, Clock, Download, Ban, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "preact/hooks";
import { addToWatchlist, addToDownloads, removeFromWatchlist, removeFromDownloads, db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

interface VideoCardProps {
  video: Video;
  onRemove?: () => void;
  showRemove?: boolean;
}

export const VideoCard = ({ video, onRemove, showRemove }: VideoCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Safety check: ensure video and video.id exist before querying DB
  const isInWatchlist = useLiveQuery(
    () => (video?.id ? db.watchlist.get(video.id) : undefined),
    [video?.id]
  );
  const isDownloaded = useLiveQuery(
    () => (video?.id ? db.downloads.get(video.id) : undefined),
    [video?.id]
  );

  const isDownloading = isDownloaded && !isDownloaded.data;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWatchLater = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!video?.id) return;
    
    if (isInWatchlist) {
      await removeFromWatchlist(video.id);
    } else {
      await addToWatchlist(video);
    }
    setShowMenu(false);
  };

  const handleDownload = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!video?.id) return;

    if (isDownloaded) {
      await removeFromDownloads(video.id);
    } else {
      await addToDownloads(video);
    }
    setShowMenu(false);
  };

  const handleNotInterested = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // In a real app, this would hide the video
    alert("興味なしとしてマークしました");
    setShowMenu(false);
  };

  const handleDelete = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
    setShowMenu(false);
  };

  if (!video?.id) return null;

  return (
    <div className="group relative">
      <Link
        {...({
          href: `/watch/${video.id}`,
          className: "block space-y-3 animate-fade-in transition-all duration-300 hover:opacity-90"
        } as any)}
      >
        <Card className="overflow-hidden border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {isDownloaded && (
                <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm p-1 rounded-full shadow-lg">
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2 px-1">
          <div className="flex-1 space-y-1 pr-6">
            <h3 className="font-semibold leading-tight line-clamp-2 transition-colors group-hover:text-primary">
              {video.title}
            </h3>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p className="hover:text-foreground transition-colors">{video.author}</p>
              <p>
                {video.views} • {video.published}
              </p>
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute top-[calc(100%-64px)] right-0" ref={menuRef}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-2 hover:bg-muted rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <div className="absolute right-0 bottom-full mb-2 w-48 bg-popover border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="py-1">
              <button
                onClick={handleWatchLater}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                <Clock className="w-4 h-4 mr-3" />
                {isInWatchlist ? "「後で見る」から削除" : "後で見る"}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-3" />
                )}
                {isDownloading ? "保存中..." : isDownloaded ? "ダウンロード済み" : "オフライン保存"}
              </button>
              <button
                onClick={handleNotInterested}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                <Ban className="w-4 h-4 mr-3" />
                興味なし
              </button>
              {showRemove && (
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors border-t mt-1"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  削除
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
