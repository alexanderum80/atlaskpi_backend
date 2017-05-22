"use strict";
var winston = require("winston");
function seedIndustries(industryModel) {
    industryModel.find({}).then(function (industries) {
        if (industries.length !== 0) {
            return;
        }
        winston.debug('Seeding Industries');
        industryModel.create({
            name: 'Medical',
            subIndustries: [
                {
                    name: 'Plastic Surgery'
                },
                {
                    name: 'Farmaceutical'
                }
            ]
        });
        industryModel.create({
            name: 'Retail',
            subIndustries: [
                {
                    name: 'Distribuitor'
                },
                {
                    name: 'Furniture'
                }
            ]
        });
    });
}
exports.__esModule = true;
exports["default"] = seedIndustries;
;
//# sourceMappingURL=industries.js.map