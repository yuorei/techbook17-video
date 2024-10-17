"use client";
import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  PictureInPicture,
  Maximize,
  Camera,
} from "lucide-react";

interface HLSPlayerProps {
  src: string;
}

const HLSPlayer: React.FC<HLSPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const hideControls = () => {
      timer = setTimeout(() => {
        setShowControls(false);
      }, 3000); // 3秒後にコントロールを非表示
    };

    const showControlsOnMove = () => {
      setShowControls(true);
      clearTimeout(timer);
      hideControls();
    };

    if (containerRef.current) {
      containerRef.current.addEventListener("mousemove", showControlsOnMove);
      containerRef.current.addEventListener("touchstart", showControlsOnMove);
    }

    hideControls();

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener(
          "mousemove",
          showControlsOnMove
        );
        containerRef.current.removeEventListener(
          "touchstart",
          showControlsOnMove
        );
      }
      clearTimeout(timer);
    };
  }, []);

  // クエリパラメーターから再生時間指定
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("t");
    if (t) {
      if (videoRef.current) {
        try {
          videoRef.current.currentTime = parseFloat(t);
        } catch (e) {
          console.log(e);
        }
      }
    }
  }, [src]);

  // HLSのセットアップ
  useEffect(() => {
    let hls: Hls;

    if (videoRef.current) {
      const video = videoRef.current;
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // HLS support for platforms
        video.src = src;
      }

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    }
  }, [src]);

  // 再生時間の取得
  useEffect(() => {
    const handleTimeUpdate = () => {
      setCurrentTime(videoRef.current?.currentTime as number);
    };

    const videoElement = videoRef.current;
    videoElement?.addEventListener("timeupdate", handleTimeUpdate);

    // クリーンアップ関数
    return () => {
      videoElement?.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [src]);

  // PiP
  useEffect(() => {
    const video = videoRef.current;

    if (video && "pictureInPictureEnabled" in document) {
      setIsPiPSupported(true);
    } else {
      setIsPiPSupported(false);
    }
  }, [src]);

  // 再生ボタンのクリックハンドラ
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // スクリーンショット
  const captureScreenshot = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas
        .getContext("2d")
        ?.drawImage(video, 0, 0, canvas.width, canvas.height);

      const screenshot = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = screenshot;
      link.download = "screenshot.png";
      link.click();
    }
  };

  return (
    <div
      ref={containerRef}
      className="max-w-4xl mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-xl relative"
    >
      <div className="relative">
        <video
          className="w-full aspect-video cursor-pointer"
          ref={videoRef}
          autoPlay
          onClick={handlePlayPause}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        />
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="range"
                className="w-full h-1 accent-blue-500 appearance-none bg-gray-300 rounded-full overflow-hidden"
                min="0"
                max={duration}
                value={currentTime}
                onChange={(e) => {
                  const newTime = parseFloat(e.target.value);
                  setCurrentTime(newTime);
                  if (videoRef.current) videoRef.current.currentTime = newTime;
                }}
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                    (currentTime / duration) * 100
                  }%, #D1D5DB ${
                    (currentTime / duration) * 100
                  }%, #D1D5DB 100%)`,
                }}
              />
              <div className="text-white text-sm font-mono whitespace-nowrap">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  className="text-white hover:text-blue-400 transition-colors"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <Volume2 size={20} className="text-white" />
                <input
                  type="range"
                  className="w-24 accent-blue-500"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    if (videoRef.current) videoRef.current.volume = newVolume;
                  }}
                />
              </div>
              <div className="flex items-center space-x-4">
                <select
                  className="bg-transparent text-white text-sm border border-white rounded px-2 py-1"
                  value={playbackRate}
                  onChange={(e) => {
                    const newRate = parseFloat(e.target.value);
                    setPlaybackRate(newRate);
                    if (videoRef.current)
                      videoRef.current.playbackRate = newRate;
                  }}
                >
                  {[0.25, 0.5, 1, 1.5, 2, 2.5, 3].map((rate) => (
                    <option key={rate} value={rate} className="text-black">
                      {rate}x
                    </option>
                  ))}
                </select>
                <button
                  className="text-white hover:text-blue-400 transition-colors"
                  onClick={captureScreenshot}
                  title="スクリーンショットを撮る"
                >
                  <Camera size={20} />
                </button>

                {isPiPSupported && (
                  <button
                    className="text-white hover:text-blue-400 transition-colors"
                    onClick={() => videoRef.current?.requestPictureInPicture()}
                    title="ピクチャーインピクチャー"
                  >
                    <PictureInPicture size={20} />
                  </button>
                )}
                <button
                  className="text-white hover:text-blue-400 transition-colors"
                  onClick={toggleFullscreen}
                  title="全画面表示"
                >
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HLSPlayer;
