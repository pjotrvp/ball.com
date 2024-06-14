package repository

import (
	"database/sql"
	"encoding/json"
	"time"

	"order-service/order-service/entities"
)

type OrderRepositoryImpl struct {
	DB *sql.DB
}

func NewOrderRepository(db *sql.DB) *OrderRepositoryImpl {
	return &OrderRepositoryImpl{DB: db}
}

func (r *OrderRepositoryImpl) CreateOrder(order entities.Order) (int64, error) {
	// Serialize the OrderItems field to JSON
	orderItemsJSON, err := json.Marshal(order.OrderItems)
	if err != nil {
		return 0, err
	}

	// Insert the new order into the database
	result, err := r.DB.Exec(
		"INSERT INTO orders (order_items, total_price, customer_id, is_paid, created_at, last_updated) VALUES (?, ?, ?, ?, ?, ?)",
		orderItemsJSON, order.TotalPrice, order.CustomerID, order.IsPaid, time.Now(), time.Now(),
	)
	if err != nil {
		return 0, err
	}

	orderID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return orderID, nil
}

func (r *OrderRepositoryImpl) UpdateOrder(order entities.Order) error {
	// Serialize the OrderItems field to JSON
	orderItemsJSON, err := json.Marshal(order.OrderItems)
	if err != nil {
		return err
	}

	// Update the order in the database
	_, err = r.DB.Exec(
		"UPDATE orders SET order_items = ?, total_price = ?, customer_id = ?, is_paid = ?, last_updated = ? WHERE id = ?",
		orderItemsJSON, order.TotalPrice, order.CustomerID, order.IsPaid, time.Now(), order.ID,
	)
	if err != nil {
		return err
	}
	return nil
}

func (r *OrderRepositoryImpl) GetOrderById(id int64) (entities.Order, error) {
	var order entities.Order
	var orderItemsJSON []byte

	// Query the order from the database
	err := r.DB.QueryRow(
		"SELECT id, order_items, total_price, customer_id, is_paid, created_at, last_updated FROM orders WHERE id = ?",
		id,
	).Scan(&order.ID, &orderItemsJSON, &order.TotalPrice, &order.CustomerID, &order.IsPaid, &order.CreatedAt, &order.LastUpdated)
	if err != nil {
		return order, err
	}

	// Deserialize the OrderItems field from JSON
	err = json.Unmarshal(orderItemsJSON, &order.OrderItems)
	if err != nil {
		return order, err
	}

	return order, nil
}

func (r *OrderRepositoryImpl) GetOrders() ([]entities.Order, error) {
	rows, err := r.DB.Query("SELECT id, order_items, total_price, customer_id, is_paid, created_at, last_updated FROM orders")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []entities.Order
	for rows.Next() {
		var order entities.Order
		var orderItemsJSON []byte

		// Scan the order row
		err := rows.Scan(&order.ID, &orderItemsJSON, &order.TotalPrice, &order.CustomerID, &order.IsPaid, &order.CreatedAt, &order.LastUpdated)
		if err != nil {
			return nil, err
		}

		// Deserialize the OrderItems field from JSON
		err = json.Unmarshal(orderItemsJSON, &order.OrderItems)
		if err != nil {
			return nil, err
		}

		orders = append(orders, order)
	}
	return orders, nil
}

func (r *OrderRepositoryImpl) DeleteOrder(id int64) error {
	_, err := r.DB.Exec("DELETE FROM orders WHERE id = ?", id)
	if err != nil {
		return err
	}
	return nil
}
