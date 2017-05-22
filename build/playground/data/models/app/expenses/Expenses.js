"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ExpenseSchema = new Schema({
    location: {
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
    expense: {
        concept: String,
        amount: Number
    }
});
function getExpenseModel(m) {
    return m.model('Expense', ExpenseSchema, 'expenses');
}
exports.getExpenseModel = getExpenseModel;
//# sourceMappingURL=Expenses.js.map