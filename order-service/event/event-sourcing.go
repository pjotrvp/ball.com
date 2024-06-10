package event

import (
	"encoding/json"

	"github.com/streadway/amqp"
	"order-service/order-service/entities"
)

func PublishEvent(ch *amqp.Channel, event entities.Event) error {
	body, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return ch.Publish(
		"events", // exchange
		"",       // routing key
		false,    // mandatory
		false,    // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
}

func ConsumeEvents(ch *amqp.Channel) (<-chan amqp.Delivery, error) {
	q, err := ch.QueueDeclare(
		"event_queue", // name
		true,          // durable
		false,         // delete when unused
		false,         // exclusive
		false,         // no-wait
		nil,           // arguments
	)
	if err != nil {
		return nil, err
	}

	err = ch.QueueBind(
		q.Name,    // queue name
		"",        // routing key
		"events",  // exchange
		false,
		nil,
	)
	if err != nil {
		return nil, err
	}

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		return nil, err
	}

	return msgs, nil
}

