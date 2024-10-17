package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/gofrs/uuid/v5"
	"github.com/yuorei/techbook-video/infrastructure"
)

type Handler struct {
	infra *infrastructure.Infrastructure
}

func NewHandler(infra *infrastructure.Infrastructure) *Handler {
	return &Handler{
		infra: infra,
	}
}

func (h *Handler) GetVideo(w http.ResponseWriter, r *http.Request) {
	videoID := r.PathValue("id")
	video, err := h.infra.GetVideo(videoID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(video)
}

func (h *Handler) UploadVideo(w http.ResponseWriter, r *http.Request) {
	videoUUID, _ := uuid.NewV4()
	videoID := videoUUID.String()

	// multipart/form-dataであることを確認
	err := r.ParseMultipartForm(100 << 20) // 最大100MBのメモリを使用（必要に応じて調整）
	if err != nil {
		http.Error(w, "Failed to parse form data", http.StatusBadRequest)
		return
	}

	// 動画ファイルを取得
	videoFile, videoHeader, err := r.FormFile("video")
	if err != nil {
		http.Error(w, "Failed to get video file", http.StatusBadRequest)
		return
	}
	defer videoFile.Close()

	// サムネイル画像を取得
	thumbnailFile, thumbnailHeader, err := r.FormFile("thumbnail")
	if err != nil {
		http.Error(w, "Failed to get thumbnail file", http.StatusBadRequest)
		return
	}
	defer thumbnailFile.Close()

	err = os.MkdirAll("temp", 0755)
	if err != nil {
		http.Error(w, "Failed to create temp directory", http.StatusInternalServerError)
		return
	}

	// 動画ファイルをtempに保存
	videoName := strings.Split(videoHeader.Filename, ".")
	videoExtension := videoName[len(videoName)-1]
	videoDst, err := os.Create("./temp/" + videoID + "." + videoExtension)
	if err != nil {
		http.Error(w, "Failed to save video file "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer videoDst.Close()

	_, err = io.Copy(videoDst, videoFile)
	if err != nil {
		http.Error(w, "Failed to copy video file "+err.Error(), http.StatusInternalServerError)
		return
	}

	// サムネイル画像をtempに保存
	thumbnailName := strings.Split(thumbnailHeader.Filename, ".")
	thumbnailExtension := thumbnailName[len(thumbnailName)-1]
	thumbnailDst, err := os.Create("./temp/" + videoID + "." + thumbnailExtension)
	if err != nil {
		http.Error(w, "Failed to save thumbnail file "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer thumbnailDst.Close()

	_, err = io.Copy(thumbnailDst, thumbnailFile)
	if err != nil {
		http.Error(w, "Failed to copy thumbnail file "+err.Error(), http.StatusInternalServerError)
		return
	}

	// タイトルの取得
	title := r.FormValue("title")
	if title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}

	err = h.infra.ConvertVideoHLS(r.Context(), videoID, videoExtension)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	videoURL, err := h.infra.UploadVideoForStorage(r.Context(), videoID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	thumbnailURL, err := h.infra.UploadThumbnailForStorage(r.Context(), videoID, thumbnailExtension)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = h.infra.RegisterVideo(videoID, title, videoURL, thumbnailURL)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"id": "` + videoID + `"}`))

}

func (h *Handler) GetVideos(w http.ResponseWriter, r *http.Request) {
	videos, err := h.infra.GetVideos()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(videos)
}
