"use strict";
var RemoveBusinessUnitByIdMutation = (function () {
    function RemoveBusinessUnitByIdMutation(identity, _IBusinessUnitModel) {
        this.identity = identity;
        this._IBusinessUnitModel = _IBusinessUnitModel;
    }
    // log = true;
    // audit = true;
    RemoveBusinessUnitByIdMutation.prototype.run = function (data) {
        return this._IBusinessUnitModel.removeBusinessUnitById(data.id);
    };
    return RemoveBusinessUnitByIdMutation;
}());
exports.RemoveBusinessUnitByIdMutation = RemoveBusinessUnitByIdMutation;
//# sourceMappingURL=remove-business-unit-by-id.mutation.js.map