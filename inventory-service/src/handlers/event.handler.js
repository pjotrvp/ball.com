const readService = require('../services/databases/read.service');

async function handleEvent(command) {
    try {
        switch (command.type) {
            case "CreateProduct":
                await readService.createProduct(command.payload);
                break;
            case "UpdateProduct":
                await readService.updateProduct(command.payload.id, command.payload);
                break;
            case "DeleteProduct":
                await readService.deleteProduct(command.payload.id);
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
