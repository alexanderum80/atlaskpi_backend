"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var WorkLogSchema = new Schema({
    externalId: String,
    date: Date,
    workTime: Number
});
function getWorkLogModel(m) {
    return m.model('WorkLog', WorkLogSchema, 'workLogs');
}
exports.getWorkLogModel = getWorkLogModel;
//# sourceMappingURL=WorkLog.js.map