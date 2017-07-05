import { getContext } from '../../data/models/app/app-context';
import * as util from 'util';
import { DataContext, DataTable } from './google-sheet.processor';
import * as async from 'async';
import * as Promise from 'bluebird';
import { my_guid } from '../extentions';

export default function importSpreadSheetData(data: any, dbUri = 'mongodb://localhost/customer2'): Promise<any> {

    return new Promise<any>((resolve, reject) => {
        async.parallel([
            async.apply(importSales, data, dbUri),
            async.apply(importWorklog, data, dbUri),
            async.apply(importExpenses, data, dbUri)
        ], function(err, results) {
            if (err) {
                console.log('There was an error: ' + err.toString());
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

function importSales(data: DataContext, dbUri: string, cb) {
    getContext(dbUri).then(ctx => {
        const sales = data.sales;
        // map the data
        const mappedSales = sales.map(s => {
            return {
                externalId: my_guid(),
                location: getLocation(data.location, s.location),
                customer: getCustomer(data.customer, s.customer),
                employee: getEmployee(data.employee, s.employee),
                product: getProduct(data.product, s.product, +s.price, new Date(s.date)),
                category: getCategory(data.category, s.category),
                timestamp: new Date(s.date)
            };
        });

        ctx.Sale.remove({}).then(res => {
            ctx.Sale.insertMany(mappedSales, (err, result) => {
                if (err) {
                    console.error('Error inserting sales', err);
                    cb(err, null);
                } else {
                    console.info(`${result.length} sales inserted`);
                    cb(null, { name: 'sales', total: result.length });
                }
            });
        });
    });
}

function importWorklog(data: DataContext, dbUri: string,  cb) {
    getContext(dbUri).then(ctx => {
        const worklog = data.worklog;

        const mappedWorklog = worklog.map(w => {
            return {
                externalId: getEmployee(data.employee, w.employee).externalId.toString(),
                date: w.date,
                workTime: w.seconds
            };
        });

        ctx.WorkLog.remove({}).then(res => {
            ctx.WorkLog.insertMany(mappedWorklog, (err, result) => {
                if (err) {
                    console.error('Error inserting worklog', err);
                    cb(err, null);
                } else {
                    console.info(`${result.length} workklog inserted`);
                    cb(null, { name: 'worklogs', total: result.length });
                }
            });
        });
    });
}

function importExpenses(data: DataContext, dbUri: string, cb) {
    getContext(dbUri).then(ctx => {
        const expenses = data.expense;

        const mappedExpenses = expenses.map(e => {
            return {
                externalId: my_guid(),
                location: getLocation(data.location, e.location),
                exployee: getEmployee(data.employee, e.employee),
                expense: {
                    concept: e.category,
                    amount: +e.amount
                },
                timestamp: new Date(e.date)
            };
        });

        ctx.Expense.remove({}).then(res => {
            ctx.Expense.insertMany(mappedExpenses, (err, result) => {
                if (err) {
                    console.error('Error inserting expenses', err);
                    cb(err, null);
                } else {
                    console.info(`${result.length} expenses inserted`);
                    cb(null, { name: 'expenses', total: result.length });
                }
            });
        });
    });
}


// utility methods

function getLocation(locations, name) {
    const l = locations.find(loc => loc.name === name);
    return {
        identifier: l.id,
        name: l.name,
        city: l.city,
        state: l.state,
        zip: l.zip
    };
}

function getCustomer(customers, name) {
    const c = customers.find(cus => cus.name === name);

    return {
        externalId: c.id,
        name: c.name,
        city: c.city,
        state: c.state,
        zip: c.zip,
        gender: c.gender
    };
}

function getEmployee(employees, name) {
    const e = employees.find(emp => emp.name === name);

    if (!e) {
        return {
            externalId: 0,
            fullName: ''
        };
    }

    return {
        externalId: e.id,
        fullName: e.name,
        role: e.role,
        type: e.fte === 'Yes' ? 'f' : 'p'
    };
}

function getProduct(products, name, price, date) {
    const p = products.find(prod => prod.name === name);

    return {
        externalId: p.id + my_guid(),
        itemCode: p.id,
        itemDescription: p.name,
        unitPrice: price,
        quantity: 1,
        amount: price,
        tax: 0.7,
        tax2: 0,
        type: p.type.toLowerCase(),
        from: date,
        to: date
    };
}

function getCategory(categories, name) {
    const c = categories.find(cat => cat.name === name);

    return {
        externalId: c.id,
        name: c.name,
        service: c.service
    };
}

