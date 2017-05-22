"use strict";
var GetChartFormatByIdQuery = (function () {
    function GetChartFormatByIdQuery(identity, _ChartFormatModel) {
        this.identity = identity;
        this._ChartFormatModel = _ChartFormatModel;
    }
    // log = true;
    // audit = true;
    GetChartFormatByIdQuery.prototype.run = function (data) {
        return this._ChartFormatModel.getChartFormatById(data);
    };
    return GetChartFormatByIdQuery;
}());
exports.GetChartFormatByIdQuery = GetChartFormatByIdQuery;
//# sourceMappingURL=get-chart-format-by-id.query.js.map