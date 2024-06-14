package repository

import (
	"order-service/order-service/entities"
)

type OrderRepository interface {
	CreateOrder(order entities.Order) (int64, error)
	UpdateOrder(order entities.Order) error
	GetOrderById(id int64) (entities.Order, error)
	GetOrders() ([]entities.Order, error)
	DeleteOrder(id int64) error
}
