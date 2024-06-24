const readService = require('../services/databases/read.service');
const writeService = require('../services/databases/write.service');

async function handleEvent(command) {
    try {
        switch (command.type) {
            case "ProductCreated":
                await readService.createProduct(command.payload);
                break;
            case "ProductUpdated":
                await readService.updateProduct(command.payload.id, command.payload);
                break;
            case "ProductDeleted":
                await readService.deleteProduct(command.payload.id);
                break;
            case "OrderCreated":
                await writeService.lowerStockOfProductsInOrder(command.payload);
                break;
            case "ProductStockLowered":
                await readService.lowerStockOfProduct(command.payload.id, command.payload.quantity);
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
