"use strict";
var UpdateKPIMutation = (function () {
    function UpdateKPIMutation(identity, _KPIModel) {
        this.identity = identity;
        this._KPIModel = _KPIModel;
    }
    // log = true;
    // audit = true;
    UpdateKPIMutation.prototype.run = function (data) {
        return this._KPIModel.updateKPI(data.id, data.data);
    };
    return UpdateKPIMutation;
}());
exports.UpdateKPIMutation = UpdateKPIMutation;
//# sourceMappingURL=update-kpi.mutation.js.map