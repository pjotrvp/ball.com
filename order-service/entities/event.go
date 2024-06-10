package entities

type Event struct {
	ID        int    `json:"id"`
	EventType string `json:"event_type"`
	Payload   string `json:"payload"`
}