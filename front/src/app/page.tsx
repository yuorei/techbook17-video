"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type VideoData = {
  ID: string;
  Title: string;
  VideoURL: string;
  ThumbnailURL: string;
};

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/video`
        );
        if (!response.ok) {
          throw new Error("動画情報の取得に失敗しました");
        }
        const data: VideoData[] = await response.json();
        setVideos(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">エラー: {error}</div>
    );
  }

  if (!videos) {
    return (
      <div className="text-center mt-10">
        <Link
          href="/video/upload"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          動画をアップロードしよう
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center">動画一覧</h1>
        <Link
          href="/video/upload"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          動画をアップロード
        </Link>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Link
            key={video.ID}
            href={`/video/${video.ID}`}
            className="text-blue-500 "
          >
            <div className="bg-white rounded-lg shadow-md p-4">
              <img
                src={video.ThumbnailURL}
                alt={video.Title}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              <h2 className="text-xl font-semibold mb-2 text-black">
                {video.Title}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VideoList;
