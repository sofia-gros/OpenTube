'use client';

import { useState, useRef } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { createPlayer } from '@videojs/react';
import { VideoSkin, Video, videoFeatures } from '@videojs/react/video';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Settings, Camera, Repeat, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import '@videojs/react/video/skin.css';

const Player = createPlayer({ features: videoFeatures });

interface VideoPlayerProps {
  id: string;
  src: string;
  poster?: string;
  qualities?: string[];
}

export function VideoPlayer({ id, src, poster, qualities = [] }: VideoPlayerProps) {
  const [currentQuality, setCurrentQuality] = useState("best");
  const [isCinematic, setIsCinematic] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const autoplay = useLiveQuery(
    async () => {
      const setting = await db.settings.get("autoplay");
      return setting ? setting.value : true;
    },
    []
  );

  const playbackSpeed = useLiveQuery(
    async () => {
      const setting = await db.settings.get("playbackSpeed");
      return setting ? parseFloat(setting.value) : 1.0;
    },
    []
  );

  const videoSrc = currentQuality === "best" ? src : `${src}?quality=${currentQuality}`;

  const handleScreenshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `screenshot-${id}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <>
      {/* Full-screen Dark Overlay */}
      {isCinematic && createPortal(
        <div className="fixed inset-0 bg-black/80 z-40 pointer-events-none" />,
        document.body
      )}

      <div className={`relative ${isCinematic ? 'z-50' : 'z-10'} rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group`}>
        <Player.Provider>
          <VideoSkin poster={poster}>
            <Video 
              ref={videoRef}
              src={videoSrc} 
              playsInline 
              autoPlay={autoplay}
              playbackRate={playbackSpeed}
              loop={isLooping}
            />
          </VideoSkin>
        </Player.Provider>

        {/* Custom Overlay Controls (Enhancer Features) */}
        <div className="absolute bottom-16 right-4 flex items-center gap-2 z-20 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="secondary" 
            size="icon" 
            className={`rounded-full h-8 w-8 ${isLooping ? "bg-primary text-primary-foreground" : "bg-black/50 text-white"}`}
            onClick={() => setIsLooping(!isLooping)}
            title="ループ再生"
          >
            <Repeat className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full h-8 w-8 bg-black/50 text-white"
            onClick={handleScreenshot}
            title="スクリーンショット"
          >
            <Camera className="h-4 w-4" />
          </Button>

          <Button 
            variant="secondary" 
            size="icon" 
            className={`rounded-full h-8 w-8 ${isCinematic ? "bg-primary text-primary-foreground" : "bg-black/50 text-white"}`}
            onClick={() => setIsCinematic(!isCinematic)}
            title="シネマティックモード"
          >
            <Sun className="h-4 w-4" />
          </Button>

          {qualities.length > 0 && (
            <div className="relative group/quality">
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-8 rounded-full bg-black/50 text-white flex gap-1 px-3"
              >
                <Settings className="h-3 w-3" />
                <span className="text-[10px] font-bold">{currentQuality === "best" ? "Auto" : currentQuality}</span>
              </Button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover/quality:block bg-black/80 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden min-w-[100px]">
                {["best", ...qualities].map((q) => (
                  <button
                    key={q}
                    onClick={() => setCurrentQuality(q)}
                    className={`w-full px-4 py-2 text-[10px] font-bold text-left hover:bg-white/20 transition-colors ${currentQuality === q ? "text-primary" : "text-white"}`}
                  >
                    {q === "best" ? "自動 (最高)" : q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default VideoPlayer;
