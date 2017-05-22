"use strict";
var UpdateChartFormatMutation = (function () {
    function UpdateChartFormatMutation(identity, _ChartFormatModel) {
        this.identity = identity;
        this._ChartFormatModel = _ChartFormatModel;
        this.audit = true;
    }
    UpdateChartFormatMutation.prototype.run = function (data) {
        return this._ChartFormatModel.updateChartFormat(data.id, data.data);
    };
    return UpdateChartFormatMutation;
}());
exports.UpdateChartFormatMutation = UpdateChartFormatMutation;
//# sourceMappingURL=update-chart-format.mutation.js.map