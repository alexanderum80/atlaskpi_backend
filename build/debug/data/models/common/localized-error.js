"use strict";
var LocalizedError = (function () {
    function LocalizedError(code, message) {
        this.code = code;
        this.message = message;
    }
    LocalizedError.fromCode = function (req, errorData) {
        errorData.args = errorData.args || [];
        return new LocalizedError(errorData.code, req.__.apply(req, [errorData.code].concat(errorData.args)));
    };
    LocalizedError.fromValidationResult = function (req, validationResult) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var errors = validationResult.errors.map(function (error) { return req.__(error.code); });
        return new LocalizedError('MULTIPLE', errors.toString());
    };
    return LocalizedError;
}());
exports.LocalizedError = LocalizedError;
//# sourceMappingURL=localized-error.js.map