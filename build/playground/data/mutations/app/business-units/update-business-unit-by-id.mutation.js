"use strict";
var UpdateBusinessUnitByIdMutation = (function () {
    function UpdateBusinessUnitByIdMutation(identity, _IBusinessUnitModel) {
        this.identity = identity;
        this._IBusinessUnitModel = _IBusinessUnitModel;
    }
    // log = true;
    // audit = true;
    UpdateBusinessUnitByIdMutation.prototype.run = function (data) {
        return this._IBusinessUnitModel.updateBusinessUnit(data.id, data.details);
    };
    return UpdateBusinessUnitByIdMutation;
}());
exports.UpdateBusinessUnitByIdMutation = UpdateBusinessUnitByIdMutation;
//# sourceMappingURL=update-business-unit-by-id.mutation.js.map