"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var InventorySchema = new Schema({
    location: {
        id: String,
        name: String
    },
    customer: {
        id: String,
        name: String
    },
    employee: {
        id: String,
        name: String
    },
    product: {
        id: String,
        name: String
    },
    quantity: {
        ordered: Number,
        delivered: Number,
        sold: Number
    }
});
function getInventoryModel(m) {
    return m.model('Inventory', InventorySchema, 'inventory');
}
exports.getInventoryModel = getInventoryModel;
//# sourceMappingURL=Inventory.js.map