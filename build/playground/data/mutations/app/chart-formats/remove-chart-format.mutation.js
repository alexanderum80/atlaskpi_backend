"use strict";
var RemoveChartFormatMutation = (function () {
    function RemoveChartFormatMutation(identity, _ChartFormatModel) {
        this.identity = identity;
        this._ChartFormatModel = _ChartFormatModel;
        this.audit = true;
    }
    RemoveChartFormatMutation.prototype.run = function (data) {
        return this._ChartFormatModel.removeChartFormat(data.id);
    };
    return RemoveChartFormatMutation;
}());
exports.RemoveChartFormatMutation = RemoveChartFormatMutation;
//# sourceMappingURL=remove-chart-format.mutation.js.map