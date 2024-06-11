package controller

import (
	"order-service/order-service/services"

	"github.com/gin-gonic/gin"
)

type OrderController struct {
	OrderService services.OrderService
}

func (ctrl *OrderController) CreateOrder(c *gin.Context){
	var req struct {
		ProductIDs []string `json:"productIDs"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	orderID, err := ctrl.OrderService.CreateOrder(req.ProductIDs)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"orderID": orderID})
}