"use strict";
var GetAllChartFormatsQuery = (function () {
    function GetAllChartFormatsQuery(identity, _ChartFormatModel) {
        this.identity = identity;
        this._ChartFormatModel = _ChartFormatModel;
    }
    // log = true;
    // audit = true;
    GetAllChartFormatsQuery.prototype.run = function (data) {
        return this._ChartFormatModel.getAllChartFormats(data);
    };
    return GetAllChartFormatsQuery;
}());
exports.GetAllChartFormatsQuery = GetAllChartFormatsQuery;
//# sourceMappingURL=get-all-chart-formats.query.js.map