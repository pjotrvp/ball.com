const OrderController = require("../controllers/order_controller");

async function handleEvent(command) {
    try {
        switch (command.type) {
            case "ProductsInStock":
                await OrderController.setOrderState(command.payload.id, "CONFIRMED");
            case "ProductsOutOfStock":
                await OrderController.setOrderState(command.payload.id, "REJECTED");
            case "OrderPaid":
                await OrderController.setOrderState(command.payload.id, "PAID");
                break;
            default:
                throw new Error(`Unknown command type: ${command.type}`);
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    handleEvent
};