"use strict";
var validate = require("validate.js");
function addDuplicateValidator() {
    validate.validators.checkDuplicateAsync = function (value, options, key, attributes) {
        if (!options.model) {
            throw { message: 'Cannot use duplicate validator without a model' };
        }
        if (!options.condition) {
            throw { message: 'Cannot use duplicate validator without a condition' };
        }
        return new validate.Promise(function (resolve, reject) {
            options.model.findOne(options.condition).then(function (res) {
                if (res) {
                    var message = options.message || 'is duplicated';
                    resolve(message);
                }
                else {
                    resolve();
                }
                ;
            });
        });
    };
}
exports.addDuplicateValidator = addDuplicateValidator;
//# sourceMappingURL=duplicate-validator.js.map