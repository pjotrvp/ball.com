const config = require("../config.json");
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");

module.exports = {
  authenticate,
  customerExists,
};

async function customerExists(customerData) {
  if (!customerData) {
    return false;
  }
  const customer = await Customer.findOne({
    where: { email: customerData },
  });
  if (customer == null) {
    return false;
  }
  return true;
}
