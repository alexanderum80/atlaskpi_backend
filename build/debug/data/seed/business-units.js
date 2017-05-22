"use strict";
var models_1 = require("../models");
var winston = require("winston");
var newBusinessUnits = [
    {
        'name': 'B-Unit1',
        'industry': {
            'id': 1,
            'name': 'Food'
        },
        'subIndustry': {
            'id': 1,
            'name': 'FastFood'
        },
        'active': true
    },
    {
        'name': 'B-Unit2',
        'industry': {
            'id': 1,
            'name': 'Food'
        },
        'subIndustry': {
            'id': 2,
            'name': 'SeaFood'
        },
        'active': false
    },
    {
        'name': 'B-Unit3',
        'industry': {
            'id': 1,
            'name': 'Food'
        },
        'subIndustry': {
            'id': 3,
            'name': 'Chinese'
        },
        'active': false
    },
    {
        'name': 'B-Unit4',
        'industry': {
            'id': 2,
            'name': 'Wine'
        },
        'subIndustry': {
            'id': 1,
            'name': 'GrapeVine'
        },
        'active': true
    },
    {
        'name': 'B-Unit5',
        'industry': {
            'id': 2,
            'name': 'Wine'
        },
        'subIndustry': {
            'id': 2,
            'name': 'Store'
        },
        'active': true
    },
    {
        'name': 'B-Unit6',
        'industry': {
            'id': 2,
            'name': 'Wine'
        },
        'subIndustry': {
            'id': 3,
            'name': 'Restorant'
        },
        'active': true
    },
    {
        'name': 'B-Unit7',
        'industry': {
            'id': 2,
            'name': 'Wine'
        },
        'subIndustry': {
            'id': 4,
            'name': 'Liquor'
        },
        'active': false
    },
    {
        'name': 'B-Unit8',
        'industry': {
            'id': 3,
            'name': 'Retail'
        },
        'subIndustry': {
            'id': 1,
            'name': 'Kiosk'
        },
        'active': false
    },
    {
        'name': 'B-Unit9',
        'industry': {
            'id': 3,
            'name': 'Retail'
        },
        'subIndustry': {
            'id': 2,
            'name': 'Distribiutor'
        },
        'active': true
    },
    {
        'name': 'B-Unit10',
        'industry': {
            'id': 3,
            'name': 'Retail'
        },
        'subIndustry': {
            'id': 3,
            'name': 'Pawnshop'
        },
        'active': true
    },
    {
        'name': 'B-Unit11',
        'industry': {
            'id': 3,
            'name': 'Retail'
        },
        'subIndustry': {
            'id': 4,
            'name': 'Dolar'
        },
        'active': true
    },
    {
        'name': 'B-Unit12',
        'industry': {
            'id': 3,
            'name': 'Retail'
        },
        'subIndustry': {
            'id': 5,
            'name': 'WallGreen'
        },
        'active': false
    }
];
function seedBusinessUnits() {
    models_1.getContext('mongodb://localhost/customer2').then(function (ctx) {
        ctx.BusinessUnit.find({}).then(function (bUnits) {
            if (bUnits.length > 0) {
                return;
            }
            winston.debug('Seeding business units for customer2');
            newBusinessUnits.forEach(function (businessUnit) {
                ctx.BusinessUnit.createBusinessUnit(businessUnit).then(function (response) {
                    winston.info("seeded businessUnit: " + response.entity.name);
                }, function (err) {
                    winston.error('Error creating Business Unit: ', err);
                });
            });
        });
    });
}
exports.__esModule = true;
exports["default"] = seedBusinessUnits;
;
//# sourceMappingURL=business-units.js.map