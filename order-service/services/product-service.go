package services

import "order-service/order-service/entities"

type ProductService interface {
	Save(entities.Product) entities.Product
	FindAll() []entities.Product
	FindByID(string) entities.Product
}

type productService struct {
	products []entities.Product
}

var initialProducts = []entities.Product{
	{ID: "1", Name: "Laptop", Price: 1000, Description: "A laptop"},
	{ID: "2", Name: "Mouse", Price: 10, Description: "A mouse"},
	{ID: "3", Name: "Keyboard", Price: 20, Description: "A keyboard"},
	{ID: "4", Name: "Monitor", Price: 200, Description: "A monitor"},
}

// FindAll implements ProductService.
func (p *productService) FindAll() []entities.Product {
	return p.products
}

func (p *productService) FindByID(id string) entities.Product {
	for _, product := range p.products {
		if product.ID == id {
			return product
		}
	}
	return entities.Product{}
}

// Save implements ProductService.
func (p *productService) Save(product entities.Product) entities.Product {
	p.products = append(p.products, product)
	return product
}

func New() ProductService {
	return &productService{
		products: initialProducts,
	}
}
