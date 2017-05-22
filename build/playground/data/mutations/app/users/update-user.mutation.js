"use strict";
var UpdateUserMutation = (function () {
    function UpdateUserMutation(identity, _UserModel) {
        this.identity = identity;
        this._UserModel = _UserModel;
    }
    // log = true;
    // audit = true;
    UpdateUserMutation.prototype.run = function (data) {
        return this._UserModel.updateUser(data.id, data.data);
    };
    return UpdateUserMutation;
}());
exports.UpdateUserMutation = UpdateUserMutation;
//# sourceMappingURL=update-user.mutation.js.map