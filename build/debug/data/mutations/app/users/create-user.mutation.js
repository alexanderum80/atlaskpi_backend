"use strict";
var CreateUserMutation = (function () {
    function CreateUserMutation(identity, _notifier, _UserModel) {
        this.identity = identity;
        this._notifier = _notifier;
        this._UserModel = _UserModel;
        this.audit = true;
    }
    CreateUserMutation.prototype.run = function (data) {
        return this._UserModel.createUser(data, this._notifier);
    };
    return CreateUserMutation;
}());
exports.CreateUserMutation = CreateUserMutation;
//# sourceMappingURL=create-user.mutation.js.map