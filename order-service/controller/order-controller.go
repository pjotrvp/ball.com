package controller

import (
	"order-service/order-service/entities"
	"order-service/order-service/services"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type OrderController struct {
	OrderService services.OrderService
}

func (ctrl *OrderController) CreateOrder(c *gin.Context) {
	var req struct {
		OrderItems []entities.OrderItem `json:"orderItems"`
		CustomerID int64                `json:"customerID"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	orderID, err := ctrl.OrderService.CreateOrder(req.OrderItems, req.CustomerID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"orderID": orderID})
}

func (ctrl *OrderController) GetOrder(c *gin.Context) {
	orderID := c.Param("id")
	
	orderIDInt64, err := strconv.ParseInt(orderID, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid order ID"})
		return
	}

	order, err := ctrl.OrderService.GetOrder(orderIDInt64)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, order)
}

func (ctrl *OrderController) GetOrders(c *gin.Context) {
	orders, err := ctrl.OrderService.GetOrders()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, orders)
}

func (ctrl *OrderController) UpdateOrder(c *gin.Context) {
	var req struct {
		ID         int64                `json:"id"`
		OrderItems []entities.OrderItem `json:"orderItems"`
		TotalPrice float64              `json:"totalPrice"`
		CustomerID int64               `json:"customerID"`
		IsPaid     bool                 `json:"isPaid"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	order := entities.Order{
		ID:         req.ID,
		OrderItems: req.OrderItems,
		TotalPrice: req.TotalPrice,
		CustomerID: req.CustomerID,
		IsPaid:     req.IsPaid,
		LastUpdated: time.Now(), // Make sure to update the LastUpdated field
	}

	err := ctrl.OrderService.UpdateOrder(order)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Order updated successfully"})
}

func (ctrl *OrderController) DeleteOrder(c *gin.Context) {
	orderID := c.Param("id")

	orderIDInt64, err := strconv.ParseInt(orderID, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid order ID"})
		return
	}

	err = ctrl.OrderService.DeleteOrder(orderIDInt64)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Order deleted successfully"})
}
