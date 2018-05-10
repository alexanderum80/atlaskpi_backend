import * as google from 'googleapis';
import * as logger from 'winston';
import importSpreadSheetData from './kpibi-importer';
import * as Promise from 'bluebird';


const SPREADSHEET_ID = '1-4c7x1AxUHrzubZ9fnAGaitvkO63gRyIwpJUP-Qe5J0';

export interface DataSchema {
    name: string;
    fields: string[];
}

export interface DataTable {
    name: string;
    data: any[];
}

export interface DataSource {
    range: string;
    schema: DataSchema;
}

const dataSources: DataSource[] = [{
    range: 'Locations!A2:F',
    schema: { name: 'location', fields: ['id', 'name', 'address', 'city', 'state', 'zip'] }
},  {
    range: 'Business Units!A2:C',
    schema: { name: 'businessUnit', fields: ['id', 'name', 'locationId'] }
}, {
    range: 'Categories!A2:C',
    schema: { name: 'category', fields: ['id', 'name', 'service'] }
}, {
    range: 'Products!A2:D',
    schema: { name: 'product', fields: ['id', 'name', 'type', 'category', 'quantity', 'cost', 'markup'] }
}, {
    range: 'Employees!A2:D',
    schema: { name: 'employee', fields: ['id', 'name', 'role', 'fte'] }
}, {
    range: 'Customer!A2:E',
    schema: { name: 'customer', fields: ['id', 'name', 'gender', 'zip', 'state'] }
}, {
    range: 'Expense Category!A2:B',
    schema: { name: 'expense-category', fields: ['id', 'name'] }
}, {
    range: 'Sales!A2:I',
    schema: { name: 'sales', fields: ['date', 'location', 'employee', 'category', 'product', 'quantity', 'customer', 'price', 'businessUnit'] }
}, {
    range: 'Expenses!A2:F',
    schema: { name: 'expense', fields: ['date', 'location', 'category', 'amount', 'employee', 'businessUnit'] }
}, {
    range: 'Worklog!A2:D',
    schema: { name: 'worklog', fields: ['date', 'hours', 'employee', 'seconds'] }
}, {
    range: 'Appointments!A2:E',
    schema: { name: 'appointment', fields: ['customerId', 'reason', 'from', 'to', 'employeeId'] }
}, {
    range: 'Inventory!A2:E',
    schema: { name: 'inventory', fields: ['location', 'product', 'cost', 'onHand', 'onOrder'] }
}];

export interface DataContext {
    location: any[];
    businessUnit: any[];
    category: any[];
    product: any[];
    employee: any[];
    customer: any[];
    sales: any[];
    expense: any[];
    worklog: any[];
    appointment: any[];
    inventory: any[];
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
export function importData(auth, ctx: any): Promise<any> {

    return new Promise<any>((resolve, reject) => {
        let promises = dataSources.map(source => {
            return convertSheetsToObjects(auth, SPREADSHEET_ID, source);
        });

        Promise.all(promises).then(results => {
            // convert array to object where keys are the table names
            let dataObject: DataContext = <any>{};
            results.forEach(result => {
                dataObject[result.name] = result.data;
            });

            importSpreadSheetData(dataObject, ctx).then(res => {
                resolve(res);
                return;
            }, err => {
                reject(err);
                return;
            });
        })
        .catch(err => {
            logger.error(err);
        });
    });
}

/**
 * Convert a spreadsheet's range into an array of json objects
 *
 * @param {String} range A valid google spreadsheet range
 * @param {Array<string>} mapping the list of data fields in order. Ex: [id, name, address]
 */
function convertSheetsToObjects(auth, spreadsheetId: string, source: DataSource): Promise<DataTable> {
    let dataTable: DataTable = { name: source.schema.name, data: [] };
    let sheets = google.sheets('v4');

    return new Promise<DataTable>((resolve, reject) => {
        sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: source.range,
        }, function(err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }

            let rows = response.values;

            if (rows.length === 0) {
                return;
            }

            dataTable.data = rows.map(r => rowToObject(r, source.schema));
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
function rowToObject(row, mapping: DataSchema) {
    let output = {};

    for (let i = 0; i < row.length; i++) {
        output[mapping.fields[i]] = row[i];
    }

    return output;
}

