package infrastructure

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func connectingDB() *sql.DB {
	// SQLiteデータベースに接続
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		log.Fatal(err)
		return nil
	}

	// テーブルを作成
	createTableSQL := `CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT NOT NULL
    );`
	_, err = db.Exec(createTableSQL)
	if err != nil {
		log.Fatal(err)
		return nil
	}

	return db
}

type Video struct {
	ID           string
	Title        string
	VideoURL     string
	ThumbnailURL string
}

func (i *Infrastructure) RegisterVideo(id, title, videoURL, thumbnailURL string) error {
	insertSQL := `INSERT INTO videos (id, title, video_url, thumbnail_url) VALUES (?, ?, ?, ?);`
	_, err := i.db.Exec(insertSQL, id, title, videoURL, thumbnailURL)
	if err != nil {
		return err
	}

	return nil
}

func (i *Infrastructure) GetVideos() ([]Video, error) {
	rows, err := i.db.Query("SELECT * FROM videos")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var videos []Video
	for rows.Next() {
		var video Video
		err := rows.Scan(&video.ID, &video.Title, &video.VideoURL, &video.ThumbnailURL)
		if err != nil {
			return nil, err
		}
		videos = append(videos, video)
	}

	return videos, nil
}

func (i *Infrastructure) GetVideo(id string) (Video, error) {
	row := i.db.QueryRow("SELECT * FROM videos WHERE id = ?", id)

	var video Video
	err := row.Scan(&video.ID, &video.Title, &video.VideoURL, &video.ThumbnailURL)
	if err != nil {
		return Video{}, err
	}

	return video, nil
}
