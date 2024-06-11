package services

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"

	"order-service/order-service/entities"
	"order-service/order-service/repository"
)

type OrderService struct {
	OrderRepo repository.OrderRepository
}

func (s *OrderService) CreateOrder(productIDs []string) (int64, error) {
	// Placeholder for fetching product details from another microservice
	products, err := s.fetchProductDetails(productIDs)
	if err != nil {
		return 0, err
	}

	// Calculate the total (placeholder logic)
	totalPrice := 0.0
	for _, product := range products {
		totalPrice += product.Price
	}

	order := entities.Order{
		ProductIDs: productIDs,
		TotalPrice: totalPrice,
	}
	return s.OrderRepo.CreateOrder(order)
}

func (s *OrderService) fetchProductDetails(productIDs []string) ([]entities.Product, error) {
	// Placeholder URL of the products microservice
	url := "http://products-microservice/api/products"

	// This is a placeholder logic assuming the external service is not operational yet
	// In a real scenario, you would make an HTTP call to the external service
	resp, err := http.Get(url)
	if err != nil {
		return nil, errors.New("failed to fetch product details")
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
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
