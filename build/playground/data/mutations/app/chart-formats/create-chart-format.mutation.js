"use strict";
var CreateChartFormatMutation = (function () {
    function CreateChartFormatMutation(identity, _ChartFormatModel) {
        this.identity = identity;
        this._ChartFormatModel = _ChartFormatModel;
        this.audit = true;
    }
    CreateChartFormatMutation.prototype.run = function (data) {
        return this._ChartFormatModel.createChartFormat(data);
    };
    return CreateChartFormatMutation;
}());
exports.CreateChartFormatMutation = CreateChartFormatMutation;
//# sourceMappingURL=create-chart-format.mutation.js.map