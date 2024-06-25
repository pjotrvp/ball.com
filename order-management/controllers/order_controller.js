const Order = require("../models/order");
const orderService = require("../services/order_service");
const uuid = require("uuid");
const rabbitMQManager = require("../rabbitmq/rabbitMQ_publisher");
const eventStoreManager = require("../eventstore/eventstore_manager");
const config = require("../config.json");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const mysql = require("mysql2");

module.exports = {
  indexOne(req, res, next) {
    const customerId = req.customerId;
    const orderId = req.params.id;

    Order.findOne({ where: { orderId: orderId, customerId: customerId } }).then(
      (order) => {
        if (!order) return res.status(404).json({ message: "Order not found" });
        return res.send(order);
      }
    );
  },

  index(req, res, next) {
    const customerId = req.customerId;
    Order
      .findAll
      // { where: { customerId: customerId } }
      ()
      .then((orders) => {
        // if no orders found, return message
        if (orders.length == 0)
          return res.status(404).json({ message: "No orders found" });
        return res.send(orders);
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  getAllOrders(req, res, next) {
    //get all orders from the read database
    Order.findAll()
      .then((orders) => {
        // if no orders found, return message
        if (orders.length == 0)
          return res.status(404).json({ message: "No orders found" });
        return res.send(orders);
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  validateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    } else {
      var token = req.headers.authorization; // Get the token from the request headers

      // remove bearer if it exists
      if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
      }

      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token" });
        } else {
          // check if token has customerId
          if (!decoded.sub)
            return res.status(401).json({ message: "Invalid token" });
          req.customerId = decoded.sub;
          next();
        }
      });
    }
  },

  async createMockOrderForTest(req, res, next) {
    const customerId = 1;
    let orderId = uuid.v4();
    let dateAndTimeISO = new Date().toISOString();
    const products = [
      {
        id: 1,
        quantity: 2,
      },
      {
        id: 2,
        quantity: 3,
      },
    ];
    
    eventStoreManager.appendToStream(`Order-${orderId}`, "OrderCreated", {
      orderId,
      customerId,
      orderDate: dateAndTimeISO,
      products,
    });

    const query = `INSERT INTO Orders (orderId, customerId, orderDate, products) VALUES ('${orderId}', '${customerId}', '${dateAndTimeISO}','${JSON.stringify(
      products
    )}');`;

    console.log(query);

    rabbitMQManager.addMessage(query);
    const command = {
      type: "OrderCreated",
      payload: {
        orderId,
        customerId,
        orderDate: dateAndTimeISO,
        products,
      },
    };
    rabbitMQManager.addRegularMessage(command);
    rabbitMQManager.addInventoryMessage(command);
    return res.status(201).json({
      message: "Successfully created order",
      products: products,
      orderId: orderId,
    });
  },

  async createOrder(req, res, next) {
    const customerId = req.customerId;
    let orderId = uuid.v4();

    await axios
      .get("http://customer-management:8080/api/shopping-cart", {
        headers: {
          Authorization: req.headers.authorization,
        },
      })
      .then((response) => {
        // if shopping cart is null, return message
        if (response.data.shoppingCart == null)
          return res.status(404).json({ message: "No products found" });
        // if no products found, return message
        if (response.data.shoppingCart.length == 0)
          return res.status(404).json({ message: "No products found" });
        const products = response.data.shoppingCart;
        // calculate total price
        products.forEach((product) => {
          totalPrice += product.productPrice * product.quantity;
        });

        let dateAndTimeISO = new Date().toISOString();
        eventStoreManager.appendToStream(`Order-${orderId}`, "OrderCreated", {
          orderId,
          customerId,
          orderDate: dateAndTimeISO,
          products,
        });

        const query = `INSERT INTO Orders (orderId, customerId, orderDate, products) VALUES ('${orderId}', '${customerId}', '${dateAndTimeISO}', '${JSON.stringify(
          products
        )}');`;

        rabbitMQManager.addMessage(query);

        const command = {
          type: "OrderCreated",
          payload: {
            orderId,
            customerId,
            orderDate: dateAndTimeISO,
            products,
          },
        };
        rabbitMQManager.addRegularMessage(command);
        rabbitMQManager.addInventoryMessage(command);
        return res.status(201).json({
          message: "Successfully created pending order",
          products: products,
          orderId: orderId,
        });
      })
      .catch((err) => {
        console.error(err);
        return res.status(404).json({ message: "No products found" });
      });
  },

  setOrderState(id, state) {
    eventStoreManager.appendToStream(`Order-${id}`, "OrderStateUpdated", {
      orderId: id,
      state: state,
    });
    const query = `UPDATE Orders SET state = '${state}' WHERE orderId = '${id}';`;
    rabbitMQManager.addMessage(query);
    const command = { type: "UpdateOrderState", payload: { id, state } };
    rabbitMQManager.addRegularMessage(command);
  },

  // updateOrder
  updateOrder(req, res, next) {
    const orderId = req.params.id;
    const orderProps = req.body;
    Order.findAll({ where: { orderId: orderId } })
      .then((orders) => {
        // if no orders found, return message
        if (orders.length == 0)
          return res.status(404).json({ message: "No orders found" });
        // check if customer is same as customer in token
        if (orders[0].customerId != req.customerId)
          return res.status(401).json({ message: "Unauthorized" });
        else {
          eventStoreManager.appendToStream(`Order-${orderId}`, "OrderUpdated", {
            orderId,
            products: orderProps.products,
            time: new Date.now(),
          });

          const query = `UPDATE Orders SET products = '${JSON.stringify(
            orderProps.products
          )}' WHERE orderId = '${orderId}';`;
          rabbitMQManager.addMessage(query);
          const command = {
            type: "UpdateOrder",
            payload: { orderId, products: orderProps.products },
          };
          rabbitMQManager.addRegularMessage(command);
        }
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  // deleteOrder
  deleteOrder(req, res, next) {
    const orderId = req.params.id;
    Order.findOne({ where: { orderId: orderId } })
      .then((order) => {
        // if no orders found, return message
        if (order == null)
          return res.status(404).json({ message: "No order found" });
        // check if customer is same as customer in token
        if (order.customerId != req.customerId)
          return res.status(401).json({ message: "Unauthorized" });
        else {
          eventStoreManager.appendToStream(`Order-${orderId}`, "OrderDeleted", {
            orderId,
          });
          const query = `DELETE FROM Orders WHERE orderId = '${orderId}'`;
          rabbitMQManager.addMessage(query);
          const command = { type: "DeleteOrder", payload: { orderId } };

          rabbitMQManager.addMessage(command);
          return res
            .status(200)
            .json({ message: "Successfully deleted order", order: order });
        }
      })
      .catch((err) => {
        console.error(err);
        eventStoreManager.appendToStream(`Order-${orderId}`, "OrderDeleted", {
          orderId,
        });
        const query = `DELETE FROM Orders WHERE orderId = '${orderId}';`;
        rabbitMQManager.addMessage(query);
        const command = { type: "DeleteOrder", payload: { orderId } };
        rabbitMQManager.addMessage(command);
        return res.status(200).json({ message: "Successfully deleted order" });
      });
  },

  greeting(req, res) {
    return res.send({ Hello: "World!" });
  },
};
