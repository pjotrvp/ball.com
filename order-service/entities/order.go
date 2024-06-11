package entities

type Order struct {
	ID       string  `json:"id"`
	//list of products
	ProductIDs []string `json:"productIDs"`
	TotalPrice float64 `json:"totalPrice"`
	CustomerID string `json:"customerID"`
}