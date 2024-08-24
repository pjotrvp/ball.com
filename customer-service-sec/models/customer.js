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

const sequelize = new Sequelize("ballcom", "administrator", "password420", {
  host: "mysql-read",
  dialect: "mysql",
  logging: false,
});

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: { msg: "Address is required" },
        notEmpty: { msg: "Address is required" },
      },
    },
    shoppingCart: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    timestamps: false,
  }
);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Customer table created");
    //print all tables in the database
    sequelize
      .query("SHOW TABLES")
      .then((result) => {
        console.log(result[0]);
      })
      .then(() => {
        pool.query(
          "CREATE TABLE IF NOT EXISTS customers (id INT AUTO_INCREMENT PRIMARY KEY, companyName VARCHAR(255), firstName VARCHAR(255), lastName VARCHAR(255), phoneNumber VARCHAR(255), email VARCHAR(255), address VARCHAR(255), shoppingCart JSON)"
        );
      });
  })
  .catch((err) => console.log(err));

Customer.findAll = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM customers;", (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results);
    });
  });
};

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Customer table created");
    //print all tables in the database
    sequelize.query("SHOW TABLES").then((result) => {
      console.log(result[0]);
    });
  })
  .catch((err) => console.log(err));

module.exports = Customer;
