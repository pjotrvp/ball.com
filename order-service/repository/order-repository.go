package repository

import (
	"database/sql"

	"order-service/order-service/entities"
)

type OrderRepository struct {
	DB *sql.DB
}

func (r *OrderRepository) CreateOrder(order entities.Order) (int64, error) {
	result, err := r.DB.Exec("INSERT INTO orders (product_ids, total) VALUES (?, ?)", order.ProductIDs, order.TotalPrice)
	if err != nil {
		return 0, err
	}
	orderID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return orderID, nil
}

func (r *OrderRepository) GetOrderById(id int) (entities.Order, error) {
	var order entities.Order
	err := r.DB.QueryRow("SELECT id, product_ids, total FROM orders WHERE id = ?", id).Scan(&order.ID, &order.ProductIDs, &order.TotalPrice)
	if err != nil {
		return order, err
	}
	return order, nil
}

func (r *OrderRepository) GetOrders() ([]entities.Order, error) {
	rows, err := r.DB.Query("SELECT id, product_ids, total FROM orders")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []entities.Order
	for rows.Next() {
		var order entities.Order
		err := rows.Scan(&order.ID, &order.ProductIDs, &order.TotalPrice)
		if err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}
	return orders, nil
}
