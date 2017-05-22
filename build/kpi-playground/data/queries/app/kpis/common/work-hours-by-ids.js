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
        frequency: true,
        $project: { _id: 0, date: 1, hours: { $divide: ['$workTime', 3600] } }
    },
    {
        frequency: true,
        $group: { _id: null, hours: { $sum: '$hours' } }
    },
    {
        $sort: {
            '_id.frequency': 1
        }
    }
];
var WorkHoursByIds = (function (_super) {
    __extends(WorkHoursByIds, _super);
    function WorkHoursByIds(logs) {
        return _super.call(this, logs, aggregate) || this;
    }
    WorkHoursByIds.prototype.setExternalids = function (ids) {
        this.externalIds = ids;
    };
    WorkHoursByIds.prototype.getData = function (dateRange, frequency) {
        // inject a criteria to the $match stage
        if (this.externalIds) {
            var query = this.findStage('dateRange', '$match').$match;
            query['externalId'] = { '$in': this.externalIds };
        }
        ;
        return this.executeQuery('date', dateRange, frequency);
    };
    return WorkHoursByIds;
}(kpi_base_1.KpiBase));
exports.WorkHoursByIds = WorkHoursByIds;
//# sourceMappingURL=work-hours-by-ids.js.map