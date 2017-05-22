"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var SurveySchema = new Schema({
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
    rate: Number
});
function getSurveyModel(m) {
    return m.model('Survey', SurveySchema, 'surveys');
}
exports.getSurveyModel = getSurveyModel;
//# sourceMappingURL=Survey.js.map