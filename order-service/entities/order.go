package entities

import "time"

type Order struct {
	ID          int64       `json:"id"`
	OrderItems  []OrderItem `json:"orderItems"` 
	TotalPrice  float64     `json:"totalPrice"`
	CustomerID  int64       `json:"customerID"`
	IsPaid      bool        `json:"isPaid"`      
	CreatedAt   time.Time   `json:"createdAt"`   
	LastUpdated time.Time   `json:"lastUpdated"` 
}