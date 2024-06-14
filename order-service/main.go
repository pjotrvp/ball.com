package main

import (
	"database/sql"
	"fmt"
	"log"
	"order-service/order-service/controller"
	"order-service/order-service/event"
	"order-service/order-service/repository"
	"order-service/order-service/services"

	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

var (
    productService services.ProductService = services.New()
    productController controller.ProductController = controller.New(productService)
)

func main() {
    mysqlUser := os.Getenv("MYSQL_USER")
    mysqlPassword := os.Getenv("MYSQL_PASSWORD")
    mysqlHost := os.Getenv("MYSQL_HOST")
    mysqlPort := os.Getenv("MYSQL_PORT")
    mysqlDB := os.Getenv("MYSQL_DB")

    dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", mysqlUser, mysqlPassword, mysqlHost, mysqlPort, mysqlDB)

    db, err := sql.Open("mysql", dsn)
    if err != nil {
        log.Fatalf(("Error, could not connect to MySQL: %v"), err)
    }
    defer db.Close()

	eventStore := event.NewSQLEventStore(db)

    eventBus, err := event.NewRabbitMQEventBus()
	if err != nil {
		log.Fatalf("failed to initialize event bus: %v", err)
	}
	defer eventBus.Close()

	orderRepo := repository.NewOrderRepository(db)

	orderService := services.OrderService{
		OrderRepo:  orderRepo,
		EventStore: eventStore,
		EventBus:   eventBus,
	}

	
	router := gin.Default()
	orderController := controller.OrderController{OrderService: orderService}

	router.POST("/orders", orderController.CreateOrder)
	router.GET("/orders/:id", orderController.GetOrder)
	router.GET("/orders", orderController.GetOrders)
	router.PUT("/orders/:id", orderController.UpdateOrder)
	router.DELETE("/orders/:id", orderController.DeleteOrder)

    router.Run("0.0.0.0:8080")
}

