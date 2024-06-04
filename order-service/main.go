package main

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

type product struct {
    ID     string  `json:"id"`
    Name  string  `json:"name"`
    Price  float64 `json:"price"`
	Description string `json:"description"`
}

func main() {
    router := gin.Default()
    router.GET("/products", getProducts)
    router.GET("/products/:id", getProductByID)
    router.POST("/products", postProduct)
    router.Run("localhost:8080")
}

var products = []product{
	{ID: "1", Name: "Laptop", Price: 1000, Description: "A laptop"},
	{ID: "2", Name: "Mouse", Price: 10, Description: "A mouse"},
	{ID: "3", Name: "Keyboard", Price: 20, Description: "A keyboard"},
	{ID: "4", Name: "Monitor", Price: 200, Description: "A monitor"},
}

func getProducts(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, products)
}

func getProductByID(c *gin.Context) {
    id := c.Param("id")
    for _, a := range products {
        if a.ID == id {
            c.IndentedJSON(http.StatusOK, a)
            return
        }
    }
    c.IndentedJSON(http.StatusNotFound, gin.H{"message": "product not found"})
}

func postProduct(c *gin.Context) {
    var newProduct product
    if err := c.BindJSON(&newProduct); err != nil {
        return
    }
    products = append(products, newProduct)
    c.IndentedJSON(http.StatusCreated, newProduct)
}