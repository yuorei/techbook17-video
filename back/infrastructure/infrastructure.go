package infrastructure

import (
	"database/sql"
)

type Infrastructure struct {
	db *sql.DB
}

func NewInfra() *Infrastructure {
	return &Infrastructure{
		db: connectingDB(),
	}
}
