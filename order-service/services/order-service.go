package services

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"order-service/order-service/entities"
	"order-service/order-service/repository"
)

type OrderService struct {
	OrderRepo repository.OrderRepository
}

func (s *OrderService) CreateOrder(ProductIDs []string) (int64, error) {
	// Fetch product details from another microservice
	products, err := s.fetchProductDetails(ProductIDs)
	if err != nil {
		return 0, err
	}

	// Calculate the total price
	totalPrice := 0.0
	for _, product := range products {
		totalPrice += product.Price
	}

	// Create order entity
	order := entities.Order{
		ProductIDs: ProductIDs,
		TotalPrice: totalPrice,
	}

	// Save order using repository
	orderID, err := s.OrderRepo.CreateOrder(order)
	if err != nil {
		return 0, err
	}

	return orderID, nil
}

func (s *OrderService) GetOrder(id string) (entities.Order, error) {
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
	return nil
}

func (s *OrderService) DeleteOrder(id string) error {
	// Delete order using repository
	err := s.OrderRepo.DeleteOrder(id)
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
