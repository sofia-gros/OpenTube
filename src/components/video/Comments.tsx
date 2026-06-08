import { useState, useEffect } from "preact/hooks";
import { getComments, addComment } from "@/services/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, ChevronDown, ThumbsUp, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Comment {
  text: string;
  author: {
    name: string;
    thumbnail: {
      url: string;
      width: number;
      height: number;
    }[];
    channel_id: string;
  };
  metadata: {
    published: string;
    is_liked: boolean;
    is_disliked: boolean;
    is_pinned: boolean;
    is_channel_owner: boolean;
    like_count: number;
    reply_count: number;
    id: string;
  };
}

export default function Comments({ videoId }: { videoId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [continuationToken, setContinuationToken] = useState<string | null>(null);

  const fetchComments = async (token?: string) => {
    try {
      if (token) setLoadingMore(true);
      else setLoading(true);

      const data = await getComments(videoId, token);
      
      if (token) {
        setComments([...comments, ...data.comments]);
      } else {
        setComments(data.comments);
        setCommentCount(data.comment_count);
      }
      setContinuationToken(data.continuationToken);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await addComment(videoId, newComment);
      setNewComment("");
      // Refresh only the first page to see the new comment
      await fetchComments();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "コメントの投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (continuationToken && !loadingMore) {
      fetchComments(continuationToken);
    }
  };

  return (
    <div className="space-y-6 pt-8">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-lg font-bold">{commentCount} 件のコメント</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="コメントを追加..."
            value={newComment}
            onInput={(e) => setNewComment((e.target as HTMLInputElement).value)}
            className="flex-1"
          />
          <Button type="submit" disabled={submitting || !newComment.trim()}>
            {submitting ? "送信中..." : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>

      {loading && comments.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-6">
            {comments.map((comment, i) => (
              <div key={comment.metadata.id || i} className="flex gap-4 group animate-fade-in">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.author.thumbnail[0]?.url} />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  {comment.metadata.is_pinned && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Pin className="h-3 w-3" />
                      <span>固定済み</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${comment.metadata.is_channel_owner ? "bg-muted px-1.5 py-0.5 rounded text-xs" : ""}`}>
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{comment.metadata.published}</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span className="text-xs text-muted-foreground">{comment.metadata.like_count}</span>
                    </div>
                    {comment.metadata.reply_count > 0 && (
                      <button className="text-xs text-primary hover:underline font-medium">
                        返信 {comment.metadata.reply_count} 件
                      </button>
                    )}
                    <button className="text-xs hover:text-primary transition-colors">返信</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {continuationToken && (
            <div className="flex justify-center pt-4">
              <Button 
                variant="ghost" 
                onClick={handleLoadMore} 
                disabled={loadingMore}
                className="w-full max-w-xs flex gap-2"
              >
                {loadingMore ? (
                  "読み込み中..."
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    もっと読み込む
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
