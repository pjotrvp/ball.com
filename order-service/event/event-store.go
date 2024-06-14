package event

import "time"

type EventStore interface {
	SaveEvent(event Event) error
	GetEventsByOrderID(orderID int64) ([]Event, error)
}

type Event struct {
	EventID   string
	OrderID   int64
	EventType string
	Payload   []byte
	CreatedAt time.Time
}