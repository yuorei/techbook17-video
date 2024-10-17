package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/yuorei/techbook-video/handler"
	"github.com/yuorei/techbook-video/infrastructure"
)

func main() {
	infra := infrastructure.NewInfra()
	handlers := handler.NewHandler(infra)

	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "OK")
	})

	mux.HandleFunc("GET /video/{id}", handlers.GetVideo)
	mux.HandleFunc("GET /video", handlers.GetVideos)
	mux.HandleFunc("POST /upload", handlers.UploadVideo)

	corsHandler := withCORS(mux)
	log.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", corsHandler))
}

// CORSヘッダーを全てのリクエストに追加するためのミドルウェア
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
