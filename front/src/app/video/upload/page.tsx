"use client";
import React, { useState } from "react";

const UploadPage: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!title || !video || !thumbnail) {
      alert("全てのフィールドを埋めてください。");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("video", video);
    formData.append("thumbnail", thumbnail);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        window.location.href = `/video/${data.id}`;
      } else {
        console.error("アップロードに失敗しました。");
      }
    } catch (error) {
      console.error("アップロードエラー:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto bg-white rounded shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-4 text-black">動画アップロード</h1>

      <label className="w-full mb-2 text-black">
        <span className="text-black">タイトル</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="動画のタイトルを入力してください"
        />
      </label>

      <label className="w-full mb-2 text-black">
        <span className="text-black">動画ファイル</span>
        <input
          type="file"
          accept="video/mp4"
          onChange={handleVideoChange}
          className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      </label>

      {videoPreview && (
        <video
          src={videoPreview}
          controls
          className="w-full mt-2 mb-4 rounded-md"
          style={{ maxHeight: "300px" }}
        />
      )}

      <label className="w-full mb-2 text-black">
        <span className="text-black">サムネイル画像</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
          className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      </label>

      {thumbnailPreview && (
        <img
          src={thumbnailPreview}
          alt="Thumbnail Preview"
          className="w-full mt-2 mb-4 rounded-md"
          style={{ maxHeight: "200px" }}
        />
      )}

      <button
        onClick={handleUpload}
        className={`bg-blue-500 text-white px-4 py-2 rounded-md mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
        }`}
        disabled={loading}
      >
        {loading ? "しばらくお待ちください..." : "アップロード"}
      </button>
    </div>
  );
};

export default UploadPage;
