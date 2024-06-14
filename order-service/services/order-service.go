package services

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"

	"order-service/order-service/entities"
	"order-service/order-service/event"
	"order-service/order-service/repository"
)

type OrderService struct {
	OrderRepo  repository.OrderRepository
	EventStore event.EventStore
	EventBus   event.EventBus
}

func (s *OrderService) CreateOrder(orderItems []entities.OrderItem, customerID int64) (int64, error) {
	// Fetch product details from another microservice
	productIDs := make([]string, len(orderItems))
	for i, item := range orderItems {
		productIDs[i] = item.ProductID
	}

	products, err := s.fetchProductDetails(productIDs)
	if err != nil {
		return 0, err
	}

	// Calculate the total price
	totalPrice := 0.0
	productMap := make(map[string]float64)
	for _, product := range products {
		productMap[product.ID] = product.Price
	}

	for _, item := range orderItems {
		price, exists := productMap[item.ProductID]
		if !exists {
			return 0, errors.New("product not found")
		}
		totalPrice += price * float64(item.Quantity)
	}

	// Create order entity
	order := entities.Order{
		OrderItems:  orderItems,
		TotalPrice:  totalPrice,
		CustomerID:  customerID,
		IsPaid:      false,
		CreatedAt:   time.Now(),
		LastUpdated: time.Now(),
	}

	// Save order using repository
	orderID, err := s.OrderRepo.CreateOrder(order)
	if err != nil {
		return 0, err
	}

	payload, err := json.Marshal(order)
	if err != nil {
		log.Fatalf("Error serializing order to JSON: %v", err)
	}

	event := event.Event{
		EventID:   uuid.NewString(),
		OrderID:   orderID,
		EventType: "OrderCreated",
		Payload:   payload,
		CreatedAt: time.Now(),
	}
	err = s.EventStore.SaveEvent(event)
	if err != nil {
		return 0, err
	}

	s.EventBus.PublishOrderCreated(orderID)

	return orderID, nil
}

func (s *OrderService) GetOrder(id int64) (entities.Order, error) {
	// Fetch order by ID using repository
	order, err := s.OrderRepo.GetOrderById(id)
	if err != nil {
		return entities.Order{}, err
	}
	return order, nil
}

func (s *OrderService) GetOrders() ([]entities.Order, error) {
	// Fetch all orders using repository
	orders, err := s.OrderRepo.GetOrders()
	if err != nil {
		return nil, err
	}
	return orders, nil
}

func (s *OrderService) UpdateOrder(order entities.Order) error {
	// Update order using repository
	err := s.OrderRepo.UpdateOrder(order)
	if err != nil {
		return err
	}

	payload, err := json.Marshal(order)
	if err != nil {
		log.Fatalf("Error serializing order to JSON: %v", err)
	}

	event := event.Event{
		EventID:   uuid.NewString(),
		OrderID:   order.ID,
		EventType: "OrderUpdated",
		Payload:   payload,
		CreatedAt: time.Now(),
	}

	err = s.EventStore.SaveEvent(event)
	if err != nil {
		return err
	}

	s.EventBus.PublishOrderUpdated(order.ID)

	return nil
}

func (s *OrderService) DeleteOrder(id int64) error {
	// Delete order using repository
	err := s.OrderRepo.DeleteOrder(id)
	if err != nil {
		return err
	}

	event := event.Event{
		EventID:   uuid.NewString(),
		OrderID:   id,
		EventType: "OrderDeleted",
		Payload:   nil,
		CreatedAt: time.Now(),
	}

	err = s.EventStore.SaveEvent(event)
	if err != nil {
		return err
	}
	return nil
}

func (s *OrderService) fetchProductDetails(productIDs []string) ([]entities.Product, error) {
	// Placeholder URL of the products microservice
	url := "http://localhost:9090/api/products"

	// This is a placeholder logic assuming the external service is not operational yet
	// In a real scenario, you would make an HTTP call to the external service
	resp, err := http.Get(url)
	if err != nil {
		return nil, errors.New("failed to fetch product details")
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var products []entities.Product
	err = json.Unmarshal(body, &products)
	if err != nil {
		return nil, err
	}

	return products, nil
}
