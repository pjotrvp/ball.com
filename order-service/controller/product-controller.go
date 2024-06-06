package controller

import (
	"order-service/order-service/entities"
	"order-service/order-service/services"

	"github.com/gin-gonic/gin"
)

type ProductController interface {
	FindAll() []entities.Product
	FindByID(id string) entities.Product
	Save(ctx *gin.Context) entities.Product
}

type controller struct {
	service services.ProductService
}

func New(service services.ProductService) ProductController {
	return &controller{
		service: service,
	}
}

func (c *controller)FindAll() []entities.Product {
	return c.service.FindAll()
}

func (c *controller)FindByID(id string) entities.Product {
	return c.service.FindByID(id)
}

func(c *controller)Save(ctx *gin.Context) entities.Product{
	var product entities.Product
	ctx.BindJSON(&product)
	c.service.Save(product)
	return product
}