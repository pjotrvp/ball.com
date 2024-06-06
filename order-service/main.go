package main

import (
	"order-service/order-service/controller"
	"order-service/order-service/services"

	"github.com/gin-gonic/gin"
)

var (
    productService services.ProductService = services.New()
    productController controller.ProductController = controller.New(productService)
)

func main() {
    router := gin.Default()
    router.GET("/products", func(ctx *gin.Context) {
        ctx.JSON(200, productController.FindAll())
    })
    router.GET("/products/:id", func(ctx *gin.Context) {
        ctx.JSON(200, productController.FindByID(ctx.Param("id")))
    })
    router.Run("0.0.0.0:8080")
}

