"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var kpi_base_1 = require("../kpi-base");
var aggregate = [
    {
        dateRange: true,
        $match: {}
    },
    {
        $group: { _id: null, seconds: { $sum: '$workTime' } }
    },
    {
        $project: { _id: 0, hours: { $divide: ['$seconds', 3600] } }
    }
];
var WorkHours = (function (_super) {
    __extends(WorkHours, _super);
    function WorkHours(logs, _externalIds) {
        var _this = _super.call(this, logs, aggregate) || this;
        _this._externalIds = _externalIds;
        return _this;
    }
    WorkHours.prototype.getData = function (dateRange, frequency) {
        // inject a criteria to the $match stage
        if (this._externalIds) {
            var query = this.findStage('dateRange', '$match').$match;
            query['externalId'] = { '$in': this._externalIds };
        }
        ;
        return this.executeQuery('date', dateRange, frequency);
    };
    return WorkHours;
}(kpi_base_1.KpiBase));
exports.WorkHours = WorkHours;
//# sourceMappingURL=work-hours.js.map