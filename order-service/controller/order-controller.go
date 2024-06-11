package controller

import (
	"order-service/order-service/entities"
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

func (ctrl *OrderController) GetOrder(c *gin.Context){
	orderID := c.Param("id")

	order, err := ctrl.OrderService.GetOrder(orderID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, order)
}

func (ctrl *OrderController) GetOrders(c *gin.Context){
	orders, err := ctrl.OrderService.GetOrders()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, orders)
}

func (ctrl *OrderController) UpdateOrder(c *gin.Context){
	var req struct {
		ID string `json:"id"`
		ProductIDs []string `json:"productIDs"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	order := entities.Order{
		ID: req.ID,
		ProductIDs: req.ProductIDs,
	}

	err := ctrl.OrderService.UpdateOrder(order)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Order updated successfully"})
}

func (ctrl *OrderController) DeleteOrder(c *gin.Context){
	orderID := c.Param("id")

	err := ctrl.OrderService.DeleteOrder(orderID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Order deleted successfully"})
}