package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"order-service/order-service/controller"
	"order-service/order-service/entities"
	"order-service/order-service/event"
	"order-service/order-service/repository"
	"order-service/order-service/services"
	"time"

	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/streadway/amqp"
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

    rabbitHost := os.Getenv("RABBITMQ_HOST")
    rabbitPort := os.Getenv("RABBITMQ_PORT")
    rabbitUser := os.Getenv("RABBITMQ_USER")
    rabbitPassword := os.Getenv("RABBITMQ_PASSWORD")

    rabbitCon := fmt.Sprintf("amqp://%s:%s@%s:%s/", rabbitUser, rabbitPassword, rabbitHost, rabbitPort)

    // Retry connecting to RabbitMQ
	var conn *amqp.Connection
	for i := 0; i < 10; i++ {
		conn, err = amqp.Dial(rabbitCon)
		if err == nil {
			break
		}
		log.Printf("Could not connect to RabbitMQ (attempt %d/10): %v", i+1, err)
		time.Sleep(5 * time.Second)
	}
	if err != nil {
		log.Fatalf("Could not connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Could not open a channel: %v", err)
	}
	defer ch.Close()

	err = ch.ExchangeDeclare(
		"events",  // name
		"fanout",  // type
		true,      // durable
		false,     // auto-deleted
		false,     // internal
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		log.Fatalf("Could not declare exchange: %v", err)
	}

	orderRepo := repository.OrderRepository{DB: db}

	orderService := services.OrderService{OrderRepo: orderRepo}

	orderController := controller.OrderController{OrderService: orderService}

	router := gin.Default()

    router.GET("/products", func(ctx *gin.Context) {
        ctx.JSON(200, productController.FindAll())
    })

    router.GET("/products/:id", func(ctx *gin.Context) {
        ctx.JSON(200, productController.FindByID(ctx.Param("id")))
    })

	router.POST("/orders", orderController.CreateOrder)

    router.POST("/events", func(c *gin.Context) {
		var ev entities.Event
		if err := c.ShouldBindJSON(&ev); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Insert event into MySQL
		_, err := db.Exec("INSERT INTO events (event_type, payload) VALUES (?, ?)", ev.EventType, ev.Payload)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert event"})
			return
		}

		// Publish event to RabbitMQ
		err = event.PublishEvent(ch, ev)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to publish event"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"status": "event created"})
	})

    router.Run("0.0.0.0:8080")
}

