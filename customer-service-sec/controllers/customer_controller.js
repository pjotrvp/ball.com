const Customer = require("../models/customer");
const rabbitMQManager = require("./rabbitMQ_publisher");
const path = require("path");
const request = require("request");
const csv = require("csvtojson");
const fs = require("fs");

module.exports = {
  index(req, res, next) {
    Customer.findAll()
      .then((customers) => {
        res.send(customers);
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  indexOne(req, res, next) {
    const customerId = req.params.customerId; // Assuming customerId is provided in the request parameters

    Customer.findOne({
      where: { customerId: customerId },
      raw: true,
    })
      .then((customer) => {
        if (customer) {
          res.send(customer);
        } else {
          // Handle case when customer is not found
          res.status(404).json({ error: "Customer not found" });
        }
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  async createFromCSV(req, res) {
    console.log("Processing CSV file...");
    const link =
      "https://marcavans.blob.core.windows.net/solarch/fake_customer_data_export.csv?sv=2023-01-03&st=2024-06-14T10%3A31%3A07Z&se=2032-06-15T10%3A31%3A00Z&sr=b&sp=r&sig=q4Ie3kKpguMakW6sbcKl0KAWutzpMi747O4yIr8lQLI%3D";

    try {
      const csvFilePath = path.join(__dirname, "fake_customer_data_export.csv");
      console.log("CSV file path:", csvFilePath);
      // Download the CSV file
      await new Promise((resolve, reject) => {
        request(link)
          .pipe(fs.createWriteStream(csvFilePath))
          .on("close", resolve)
          .on("error", reject);
      });

      const customers = await csv().fromFile(csvFilePath);

      fs.unlinkSync(csvFilePath);

      for (const customer of customers) {
        const {
          "Company Name": companyName,
          "First Name": firstName,
          "Last Name": lastName,
          "Phone Number": phoneNumber,
          Address: address,
        } = customer;

        const query = `INSERT INTO customers (companyName, firstName, lastName, phoneNumber, address) VALUES ('${companyName}', '${firstName}', '${lastName}', '${phoneNumber}', '${address}')`;

        rabbitMQManager.addMessage(query);
      }

      // Return a success response
      return res
        .status(201)
        .json({ message: "Customers created successfully" });
    } catch (error) {
      console.error("Error processing CSV:", error);
      res.status(500).json({ message: "Failed to process CSV file" });
    }
  },

  createSingleFakeCustomer(req, res) {
    const customer = {
      companyName: "Fake Company",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "1234567890",
      address: "1234 Elm Street",
    };

    const query = `INSERT INTO customers (companyName, firstName, lastName, phoneNumber, address) VALUES ('${customer.companyName}', '${customer.firstName}', '${customer.lastName}', '${customer.phoneNumber}', '${customer.address}')`;

    rabbitMQManager.addMessage(query);

    return res.status(201).json({ message: "Customer created successfully" });
  },
};
