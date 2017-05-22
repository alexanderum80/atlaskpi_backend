"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var DashboardSchema = new Schema({
    name: String,
    group: String,
    charts: [{ type: Schema.Types.String, ref: 'Chart' }]
});
// DashboardSchema.methods.
// DashboardSchema.statics.
function getDashboardModel(m) {
    return m.model('Dashboard', DashboardSchema, 'dashboards');
}
exports.getDashboardModel = getDashboardModel;
//# sourceMappingURL=Dashboard.js.map