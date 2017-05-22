"use strict";
var google = require("googleapis");
var kpibi_importer_1 = require("./kpibi-importer");
var SPREADSHEET_ID = '1-4c7x1AxUHrzubZ9fnAGaitvkO63gRyIwpJUP-Qe5J0';
var dataSources = [{
        range: 'Locations!A2:F',
        schema: { name: 'location', fields: ['id', 'name', 'address', 'city', 'state', 'zip'] }
    }, {
        range: 'Categories!A2:B',
        schema: { name: 'category', fields: ['id', 'name'] }
    }, {
        range: 'Products!A2:D',
        schema: { name: 'product', fields: ['id', 'name', 'type', 'category'] }
    }, {
        range: 'Employees!A2:D',
        schema: { name: 'employee', fields: ['id', 'name', 'role', 'fte'] }
    }, {
        range: 'Customer!A2:E',
        schema: { name: 'customer', fields: ['id', 'name', 'state', 'city', 'zip'] }
    }, {
        range: 'Expense Category!A2:B',
        schema: { name: 'expense-category', fields: ['id', 'name'] }
    }, {
        range: 'Sales!A2:G',
        schema: { name: 'sales', fields: ['date', 'location', 'employee', 'category', 'product', 'customer', 'price'] }
    }, {
        range: 'Expenses!A2:D',
        schema: { name: 'expense', fields: ['date', 'location', 'category', 'amount', 'employee'] }
    }, {
        range: 'Worklog!A2:D',
        schema: { name: 'worklog', fields: ['date', 'hours', 'employee', 'seconds'] }
    }];
/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function importData(auth) {
    return new Promise(function (resolve, reject) {
        var promises = dataSources.map(function (source) {
            return processData(auth, SPREADSHEET_ID, source.range, source);
        });
        Promise.all(promises).then(function (results) {
            // convert array to object where keys are the table names
            var dataObject = {};
            results.forEach(function (result) {
                dataObject[result.name] = result.data;
            });
            kpibi_importer_1["default"](dataObject).then(function (res) {
                resolve(res);
            }, function (err) {
                reject(err);
            });
        });
    });
}
exports.importData = importData;
/**
 * Convert a spreadsheet's range into an array of json objects
 *
 * @param {String} range A valid google spreadsheet range
 * @param {Array<string>} mapping the list of data fields in order. Ex: [id, name, address]
 */
function processData(auth, spreadsheetId, range, dataSource) {
    var dataTable = { name: dataSource.schema.name, data: [] };
    var sheets = google.sheets('v4');
    return new Promise(function (resolve, reject) {
        sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: range
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            var rows = response.values;
            if (rows.length === 0) {
                console.log('No data found.');
            }
            else {
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    dataTable.data.push(rowToObject(row, dataSource.schema));
                }
            }
            resolve(dataTable);
        });
    });
}
/**
 * Converts a row (array of columns) into a json object
 *
 * @param {Array} row data columns
 * @param {Array<string>} mapping the list of data fields in order. Ex: [id, name, address]
 */
function rowToObject(row, mapping) {
    var output = {};
    for (var i = 0; i < row.length; i++) {
        output[mapping.fields[i]] = row[i];
    }
    return output;
}
//# sourceMappingURL=google-sheet.processor.js.map