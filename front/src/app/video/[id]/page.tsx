"use client";
import React, { useState, useEffect } from "react";
import HLSPlayer from "@/app/components/HLSPlayer";
import Link from "next/link";

// 動画情報を定義するインターフェース
interface Video {
  ID: string;
  Title: string;
  VideoURL: string;
  ThumbnailURL: string;
}

export default function VideoPage({ params }: { params: { id: string } }) {
  const [video, setVideo] = useState<Video | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/video/${params.id}`
        );
        if (response.ok) {
          const data: Video = await response.json();
          setVideo(data);
        } else {
          console.error("Failed to fetch video data");
        }
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };

    fetchVideo();
  }, [params.id]);

  if (!video) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="p-4">
        <Link href="/" className="text-blue-500 ">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            ホームに戻る
          </button>
        </Link>
      </div>
      <HLSPlayer src={video.VideoURL} />
      <h1 className="text-2xl font-bold mb-4 text-center">{video.Title}</h1>
    </div>
  );
}
