const CustomerController = require("../controllers/customer_controller");

module.exports = (app) => {
  app.get("/customers", CustomerController.index);
  app.get("/customers/:customerId", CustomerController.indexOne);
  app.post("/customers/upload", CustomerController.createFromCSV);
  app.post("/customers", CustomerController.createSingleFakeCustomer);
};
