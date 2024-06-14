package entities

type OrderItem struct {
	ProductID string `json:"productID"`
	Quantity  int    `json:"quantity"`
}

