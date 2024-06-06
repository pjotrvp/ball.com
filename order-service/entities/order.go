package entities

type Order struct {
	ID       string  `json:"id"`
	//list of products
	products []Product `json:"products"`
	totalPrice float64 `json:"totalPrice"`
	customerID string `json:"customerID"`
}