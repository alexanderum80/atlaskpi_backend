"use strict";
var google_spreadsheet_1 = require("../../google-spreadsheet/google-spreadsheet");
exports.spreadsheetGpl = {
    name: 'google-spreadsheet',
    schema: {
        types: "\n            type ImportResult {\n                name: String\n                total: Int\n            }\n        ",
        queries: "\n\n        ",
        mutations: "\n            refreshDataFromSpreadSheet(customer: String) : [ImportResult]\n        "
    },
    resolvers: {
        Query: {},
        Mutation: {
            refreshDataFromSpreadSheet: function (root, args, ctx) {
                return google_spreadsheet_1.importSpreadSheet();
            }
        }
    }
};
//# sourceMappingURL=import-from-spreadsheet.js.map