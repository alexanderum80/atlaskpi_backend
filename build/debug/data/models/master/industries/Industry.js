"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
// define mongo schema
var Schema = mongoose.Schema;
var SubIndustrySchema = new Schema({
    name: String
});
var IndustrySchema = new mongoose.Schema({
    name: { type: String, index: true, required: true },
    subIndustries: [SubIndustrySchema]
});
// static methods
IndustrySchema.statics.findAll = function () {
    var that = this;
    return new Promise(function (resolve, reject) {
        that.find({}).then(function (industries) {
            if (industries) {
                resolve(industries);
            }
            else {
                throw { code: 404, message: 'Industries not found' };
            }
        });
    });
};
function getIndustryModel() {
    return mongoose.model('Industry', IndustrySchema, 'industries');
}
exports.getIndustryModel = getIndustryModel;
;
//# sourceMappingURL=Industry.js.map