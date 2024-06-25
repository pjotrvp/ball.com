const { Sequelize, DataTypes } = require("sequelize");
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE, 
  process.env.MYSQL_USER, 
  process.env.MYSQL_PASSWORD, 
  {
    host: "mysql-read",
    dialect: "mysql",
    logging: false,
  }
);

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orderDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    products: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    state: {
      type: DataTypes.STRING,
      defaultValue: "PENDING",
    }
  },
  {
    timestamps: false,
  }
);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Order table created successfully!");
    
    sequelize
      .query("SHOW TABLES")
      .then((result) => {
        console.log(result[0]);
      })
      
      .then(() => {
        pool.query(
          "CREATE TABLE IF NOT EXISTS Orders (id INT NOT NULL AUTO_INCREMENT, orderId VARCHAR(255) NOT NULL, customerId VARCHAR(255) NOT NULL, orderDate VARCHAR(255) NOT NULL, products JSON NOT NULL, state VARCHAR(255) DEFAULT 'PENDING' , PRIMARY KEY (id))"
        );
      });
  })
  .catch((err) => {
    console.log(err);
  });

//use the read database to find all orders
Order.findAll = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM Orders;", (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results);
    });
  });
}

Order.findOne = (orderId) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM Orders WHERE orderId = '${orderId}';`, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results);
    });
  });
};

module.exports = Order;
