import type { Video } from "../types/video";

export interface HomeResponse {
  videos: Video[];
  continuation: string | null;
  hasContinuation: boolean;
}

export interface SearchResponse {
  videos: Video[];
  continuationToken: string | null;
}

export interface CommentResponse {
  comments: any[];
  comment_count: string;
  continuationToken: string | null;
}

export const getHomeVideos = async (token?: string): Promise<HomeResponse> => {
  let url = "/api/home";
  if (token) {
    url = `/api/home/continue?token=${encodeURIComponent(token)}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch home videos");
  }
  return response.json();
};

export const searchVideos = async (query: string, token?: string): Promise<SearchResponse> => {
  let url = `/api/search?q=${encodeURIComponent(query)}`;
  if (token) {
    url += `&token=${encodeURIComponent(token)}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }
  return response.json();
};

export const getChannel = async (id: string): Promise<any> => {
  const response = await fetch(`/api/channel/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch channel");
  }
  return response.json();
};

export const getVideoInfo = async (id: string): Promise<any> => {
  const response = await fetch(`/api/video/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch video details");
  }
  return response.json();
};

export const getComments = async (id: string, token?: string): Promise<CommentResponse> => {
  let url = `/api/video/${id}/comments`;
  if (token) {
    url += `?token=${encodeURIComponent(token)}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }
  return response.json();
};

export const addComment = async (id: string, text: string): Promise<any> => {
  const response = await fetch(`/api/video/${id}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to post comment");
  }
  return response.json();
};
