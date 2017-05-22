"use strict";
var FindUserByIdQuery = (function () {
    function FindUserByIdQuery(identity, _UserModel) {
        this.identity = identity;
        this._UserModel = _UserModel;
    }
    // log = true;
    // audit = true;
    FindUserByIdQuery.prototype.run = function (data) {
        return this._UserModel.findUserById(data.id);
    };
    return FindUserByIdQuery;
}());
exports.FindUserByIdQuery = FindUserByIdQuery;
//# sourceMappingURL=find-user-by-id.query.js.map