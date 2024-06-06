package entities

type Payment struct {
	ID       string  `json:"id"`
	OrderID  string  `json:"orderID"`
	Amount   float64 `json:"amount"`
	PaymentMethod string `json:"paymentMethod"`
	Status   string  `json:"status"`
}