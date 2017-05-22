"use strict";
var FindBusinessUnitByIdQuery = (function () {
    function FindBusinessUnitByIdQuery(identity, _BusinessUnitModel) {
        this.identity = identity;
        this._BusinessUnitModel = _BusinessUnitModel;
    }
    // log = true;
    // audit = true;
    FindBusinessUnitByIdQuery.prototype.run = function (data) {
        return this._BusinessUnitModel.findBusinessUnitById(data.id);
    };
    return FindBusinessUnitByIdQuery;
}());
exports.FindBusinessUnitByIdQuery = FindBusinessUnitByIdQuery;
//# sourceMappingURL=find-business-unit-by-id.query.js.map