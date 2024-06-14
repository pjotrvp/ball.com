package event

import (
	"database/sql"

	_ "github.com/go-sql-driver/mysql"
)

type SQLEventStore struct {
	DB *sql.DB
}

func NewSQLEventStore(db *sql.DB) *SQLEventStore {
	return &SQLEventStore{DB: db}
}

func (store *SQLEventStore) SaveEvent(event Event) error {
	query := "INSERT INTO events (event_id, order_id, event_type, payload, created_at) VALUES (?, ?, ?, ?, ?)"
	_, err := store.DB.Exec(query, event.EventID, event.OrderID, event.EventType, event.Payload, event.CreatedAt)
	return err
}

func (store *SQLEventStore) GetEventsByOrderID(orderID int64) ([]Event, error) {
	query := "SELECT event_id, order_id, event_type, payload, created_at FROM events WHERE order_id = ?"
	rows, err := store.DB.Query(query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		var event Event
		err := rows.Scan(&event.EventID, &event.OrderID, &event.EventType, &event.Payload, &event.CreatedAt)
		if err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, nil
}