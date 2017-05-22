"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ProductSchema = new Schema({
    extenalIdentifier: String,
    name: { type: String },
    description: { type: String },
    category: { type: String },
    sku: { type: String },
    barcode: { type: String },
    cost: { type: Number },
    price: { type: Number },
    tax: { type: Number },
    vendor: { type: String },
    unitOfMeasure: { type: String },
    condition: { type: String },
    brand: { type: String },
    height: { type: Number },
    width: { type: Number },
    length: { type: Number },
    make: { type: String },
    mod: { type: String },
    materials: { type: String }
});
// ProductSchema.methods.
// ProductSchema.statics.
function getProductModel(m) {
    return m.model('Product', ProductSchema, 'products');
}
exports.getProductModel = getProductModel;
//# sourceMappingURL=Product.js.map