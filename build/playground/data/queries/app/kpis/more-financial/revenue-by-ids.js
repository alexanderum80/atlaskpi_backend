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
        $project: { _id: 0, product: 1 }
    },
    {
        frequency: true,
        $group: { revenue: { $sum: '$product.price' } }
    },
    {
        $sort: {
            '_id.frequency': 1
        }
    }
];
var RevenueByIds = (function (_super) {
    __extends(RevenueByIds, _super);
    function RevenueByIds(sales) {
        return _super.call(this, sales, aggregate) || this;
    }
    RevenueByIds.prototype.setExternalids = function (ids) {
        this.externalIds = ids;
    };
    RevenueByIds.prototype.getData = function (dateRange, frequency) {
        // inject a criteria to the $match stage
        if (this.externalIds) {
            var query = this.findStage('dateRange', '$match').$match;
            query['employee.externalId'] = { '$in': this.externalIds };
        }
        ;
        return this.executeQuery('product.from', dateRange, frequency);
    };
    return RevenueByIds;
}(kpi_base_1.KpiBase));
exports.RevenueByIds = RevenueByIds;
//# sourceMappingURL=revenue-by-ids.js.map