"use strict";
var FrequencyEnum;
(function (FrequencyEnum) {
    FrequencyEnum[FrequencyEnum["Daily"] = 0] = "Daily";
    FrequencyEnum[FrequencyEnum["Weekly"] = 1] = "Weekly";
    FrequencyEnum[FrequencyEnum["Monthly"] = 2] = "Monthly";
    FrequencyEnum[FrequencyEnum["Quartely"] = 3] = "Quartely";
    FrequencyEnum[FrequencyEnum["Yearly"] = 4] = "Yearly";
})(FrequencyEnum = exports.FrequencyEnum || (exports.FrequencyEnum = {}));
exports.FrequencyTable = {
    daily: FrequencyEnum.Daily,
    weekly: FrequencyEnum.Weekly,
    monthly: FrequencyEnum.Monthly,
    quartely: FrequencyEnum.Quartely,
    yearly: FrequencyEnum.Yearly
};
//# sourceMappingURL=frequency-enum.js.map