// server.ts

import { Innertube, Platform } from "youtubei.js";

// Provide a custom JavaScript interpreter for deciphering signatures in Bun environment
Platform.shim.eval = async (data, env) => {
  const code = `${data.output}\nreturn { ...env }`;
  return new Function("env", code)(env);
};

const yt = await Innertube.create();

// 管理用のメモリ
const homeFeeds = new Map<string, any>();

Bun.serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);
    console.log(`${req.method} ${url.pathname}${url.search}`);

    // --- CORS preflight ---
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    // --- Home Feed ---
    if (url.pathname === "/api/home") {
      try {
        const feed = await yt.getHomeFeed();
        console.log("[Server] Feed structure keys:", Object.keys(feed));
        console.log("[Server] Feed contents type:", typeof feed.contents);
        
        // Let's inspect the first few items of contents if it's an array,
        // or the structure if it's an object.
        if (feed.contents) {
            console.log("[Server] Feed contents:", JSON.stringify(feed.contents, null, 2).substring(0, 1000));
        }
        
        console.log("[Server] Feed videos count:", feed.videos?.length);
        
        const continuationId = crypto.randomUUID();
        homeFeeds.set(continuationId, feed);

        const videos = (feed.videos || [])
          .filter((v: any) => v.type === 'Video')
          .map((v: any) => ({
            id: v.id,
            title: v.title.text,
            author: v.author.name,
            thumbnail: v.thumbnails[0].url,
            duration: v.duration?.text,
            views: v.view_count?.text,
          }));

        return Response.json({
          videos,
          continuation: continuationId,
          hasContinuation: true // 初回は基本的にある前提
        });
      } catch (e: any) {
        console.error("[Server] HomeFeed error:", e);
        return Response.json({ videos: [], continuation: null, hasContinuation: false }, { status: 500 });
      }
    }

    if (url.pathname === "/api/home/continue") {
      const continuationId = url.searchParams.get("token");
      if (!continuationId || !homeFeeds.has(continuationId)) {
        return Response.json({ error: "Invalid continuation token" }, { status: 400 });
      }

      try {
        const feed = homeFeeds.get(continuationId);
        
        if (!feed.has_continuation) {
          console.log("[Server] No more continuations for token:", continuationId);
          return Response.json({
            videos: [],
            continuation: continuationId,
            hasContinuation: false
          });
        }

        const continuation = await feed.getContinuation();
        
        homeFeeds.set(continuationId, continuation);

        const videos = continuation.videos
          .filter((v: any) => v.type === 'Video')
          .map((v: any) => ({
            id: v.id,
            title: v.title.text,
            author: v.author.name,
            thumbnail: v.thumbnails[0].url,
            duration: v.duration?.text,
            views: v.view_count?.text,
          }));

        return Response.json({
          videos,
          continuation: continuationId,
          hasContinuation: !!continuation.has_continuation
        });
      } catch (e: any) {
        console.error("[Server] HomeFeed continuation error:", e);
        return Response.json({ videos: [], continuation: null, hasContinuation: false }, { status: 500 });
      }
    }

    // --- Search ---
    if (url.pathname === "/api/search") {
      const q = url.searchParams.get("q") ?? "";
      const token = url.searchParams.get("token");
      
      try {
        let result: any;
        if (token && token !== "null" && token !== "undefined") {
          console.log(`[Server] Fetching continuation. Token: ${token.substring(0, 20)}...`);
          result = await yt.getContinuation(token as any);
        } else {
          console.log(`[Server] New search: ${q}`);
          result = await yt.search(q);
        }

        // Try to find ANY property that might be the token
        let nextToken = result.continuation || null;
        
        if (!nextToken && result.has_continuation) {
          if (result.results) {
            const last = result.results[result.results.length - 1];
            if (last?.type === 'ContinuationItem') {
              nextToken = last.token;
            }
          }
        }

        // Extract videos
        const videoList = result.videos || [];
        const videos = videoList
          .filter((v: any) => v.type === "Video" || (v.id && v.title))
          .map((video: any) => ({
            id: video.id,
            title: video.title?.text ?? video.title ?? "Untitled",
            author: video.author?.name ?? video.author ?? "Unknown",
            views: video.short_view_count?.text ?? video.view_count ?? "",
            published: video.published?.text ?? video.published ?? "",
            thumbnail: video.thumbnails?.[0]?.url ?? "",
          }));

        return Response.json({
          videos,
          continuationToken: nextToken
        });
      } catch (e: any) {
        console.error("[Server] Search/Continuation error:", e);
        return Response.json({ videos: [], continuationToken: null }, { status: 500 });
      }
    }

    // --- Channel info ---
    if (url.pathname.startsWith("/api/channel/")) {
      const id = url.pathname.split("/").pop() ?? "";
      try {
        const result = await yt.getChannel(id);
        const channel = {
          id: result.header?.as(Innertube.C.Header.C.ChannelHeader).author.id,
          name: result.header?.as(Innertube.C.Header.C.ChannelHeader).author.name,
          subscriberCount: result.header?.as(Innertube.C.Header.C.ChannelHeader).subscribers?.text ?? "",
          banner: result.header?.as(Innertube.C.Header.C.ChannelHeader).banner?.[0]?.url ?? "",
          avatar: result.header?.as(Innertube.C.Header.C.ChannelHeader).author.thumbnails?.[0]?.url ?? "",
        };
        return Response.json(channel);
      } catch {
        return new Response("Channel not found", { status: 404 });
      }
    }

    // --- Comments ---
    if (url.pathname.includes("/comments")) {
      const parts = url.pathname.split("/");
      const id = parts[3]; 
      const token = url.searchParams.get("token");

      if (req.method === "POST") {
        try {
          const body = await req.json();
          const { text } = body;
          if (!text) return new Response("Missing comment text", { status: 400 });
          
          const result = await yt.interact.comment(id, text);
          return Response.json(result);
        } catch (e: any) {
          console.error("Post comment error:", e);
          return new Response(e.message || "Failed to post comment", { status: 500 });
        }
      }

      try {
        let response: any;
        if (token && token !== "null") {
          response = await yt.getContinuation(token as any);
        } else {
          response = await yt.getComments(id);
        }

        const commentItems = response.contents || [];
        const comments = commentItems.map((item: any) => {
          const c = item.comment || item; // Fallback if it's already a comment
          return {
            text: c.content?.toString() || "",
            author: {
              name: c.author?.name?.toString() || "Unknown",
              thumbnail: c.author?.thumbnails || [],
              channel_id: c.author?.id || ""
            },
            metadata: {
              published: c.published_time?.toString() || "",
              is_liked: c.is_liked || false,
              is_disliked: c.is_disliked || false,
              is_pinned: c.is_pinned || false,
              is_channel_owner: c.author_is_channel_owner || false,
              like_count: parseInt(c.like_count) || 0,
              reply_count: c.reply_count || 0,
              id: c.comment_id || c.id
            }
          };
        });

        return Response.json({
          comments,
          comment_count: response.header?.comments_count?.toString() || response.comment_count?.toString() || "0",
          continuationToken: response.continuation || null
        });
      } catch (e) {
        console.error("Comments error:", e);
        return Response.json({ comments: [], continuationToken: null });
      }
    }

    // --- Video metadata ---
    if (url.pathname.startsWith("/api/video/")) {
      const id = url.pathname.split("/")[3] ?? "";
      try {
        const info = await yt.getInfo(id, { client: "ANDROID" });
        

        const formats = info.streaming_data?.formats || [];
        const adaptiveFormats = info.streaming_data?.adaptive_formats || [];
        const allFormats = [...formats, ...adaptiveFormats];
        
        const qualities = Array.from(new Set(
          allFormats
            .filter(f => f.quality_label)
            .map(f => f.quality_label)
        )).sort((a, b) => parseInt(b) - parseInt(a));

        const video = {
          id: info.basic_info.id,
          title: info.basic_info.title,
          description: info.basic_info.short_description,
          author: info.basic_info.author,
          views: info.basic_info.view_count,
          published: info.basic_info.is_live ? "LIVE" : "",
          thumbnail: info.basic_info.thumbnail?.[0]?.url,
          authorId: info.basic_info.channel_id,
          streamingUrl: `/api/stream/${info.basic_info.id}`,
          qualities: qualities,
        };
        return Response.json(video);
      } catch (e) {
        console.error("Metadata error:", e);
        return new Response("Video not found", { status: 404 });
      }
    }

    // --- Server-side stream relay ---
    if (url.pathname.startsWith("/api/stream/")) {
      const id = url.pathname.split("/")[3] ?? "";
      if (!id) return new Response("Missing video id", { status: 400 });

      const quality = url.searchParams.get("quality") || "best";

      try {
        const info = await yt.getInfo(id, { client: "ANDROID" });
        
        let stream: any;
        try {
          // Try requested quality
          stream = await info.download({
            type: "videoandaudio",
            quality: quality as any,
            format: "mp4",
          });
        } catch (downloadError) {
          console.warn(`[Server] Quality ${quality} failed, falling back to best. Error:`, (downloadError as any).message);
          // Fallback to best if specific quality fails (common for 1080p+ muxed requests)
          stream = await info.download({
            type: "videoandaudio",
            quality: "best",
            format: "mp4",
          });
        }

        return new Response(stream as ReadableStream, {
          headers: {
            "Content-Type": "video/mp4",
            "Accept-Ranges": "bytes",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (e) {
        console.error("Stream error:", e);
        return new Response("Stream error", { status: 500 });
      }
    }

    return new Response("404", { status: 404 });
  },
});
