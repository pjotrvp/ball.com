package event

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/streadway/amqp"
)

type EventBus interface {
	PublishOrderCreated(orderID int64)
	PublishOrderUpdated(orderID int64)
	PublishOrderDeleted(orderID int64)
}

type RabbitMQEventBus struct {
	conn    *amqp.Connection
	channel *amqp.Channel

}

func NewRabbitMQEventBus() (*RabbitMQEventBus, error) {
	rabbitHost := os.Getenv("RABBITMQ_HOST")
	rabbitPort := os.Getenv("RABBITMQ_PORT")
	rabbitUser := os.Getenv("RABBITMQ_USER")
	rabbitPassword := os.Getenv("RABBITMQ_PASSWORD")

	connStr := fmt.Sprintf("amqp://%s:%s@%s:%s/", rabbitUser, rabbitPassword, rabbitHost, rabbitPort)
	conn, err := amqp.Dial(connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %v", err)
	}

	channel, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("failed to open a channel: %v", err)
	}

	eventBus := &RabbitMQEventBus{
		conn:    conn,
		channel: channel,
	}

	return eventBus, nil
}


func (bus *RabbitMQEventBus) PublishOrderCreated(orderID int64) {
	event := map[string]interface{}{
		"eventType": "OrderCreated",
		"orderID":   orderID,
	}
	bus.publishEvent(event)
}

func (bus *RabbitMQEventBus) PublishOrderUpdated(orderID int64) {
	event := map[string]interface{}{
		"eventType": "OrderUpdated",
		"orderID":   orderID,
	}
	bus.publishEvent(event)
}

func (bus *RabbitMQEventBus) PublishOrderDeleted(orderID int64) {
	event := map[string]interface{}{
		"eventType": "OrderDeleted",
		"orderID":   orderID,
	}
	bus.publishEvent(event)
}

func (bus *RabbitMQEventBus) publishEvent(event map[string]interface{}) {
	body, err := json.Marshal(event)
	if err != nil {
		log.Printf("failed to marshal event: %v", err)
		return
	}

	err = bus.channel.Publish(
		"events",       // exchange
		"order.events", // routing key
		false,          // mandatory
		false,          // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	if err != nil {
		log.Printf("failed to publish event: %v", err)
	}
}

func (bus *RabbitMQEventBus) Close() {
	bus.channel.Close()
	bus.conn.Close()
}