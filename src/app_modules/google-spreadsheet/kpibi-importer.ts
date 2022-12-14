import { DataContext } from './google-sheet.processor';
import { parallel, apply } from 'async';
import * as Promise from 'bluebird';
import * as logger from 'winston';
import { Error } from 'mongoose';
import { my_guid } from '../../helpers/string.helpers';

export default function importSpreadSheetData(data: any, ctx: any): Promise<any> {

    return new Promise<any>((resolve, reject) => {
        parallel([
            apply(importSales, data, ctx),
            apply(importWorklog, data, ctx),
            apply(importExpenses, data, ctx),
            apply(importAppointments, data, ctx),
            apply(importInventory, data, ctx),
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

function importSales(data: DataContext, ctx: any, cb) {
    const sales = data.sales;
    // map the data
    const mappedSales = sales.map(s => {
        return {
            source: 'demo - google spreadsheet',
            concept: 'Test Revenue',
            externalId: my_guid(),
            location: getLocation(data.location, s.location),
            customer: getCustomer(data.customer, s.customer),
            employee: getEmployee(data.employee, s.employee),
            product: getProduct(data.product, s.product, s.quantity, s.price, new Date(s.date)),
            category: getCategory(data.category, s.category),
            timestamp: new Date(s.date),
            serviceType: s.category.name,
            businessUnit: getBusinessUnit(data.businessUnit, s.businessUnit)
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
}

function importWorklog(data: DataContext, ctx: any,  cb) {
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
                console.info(`${result.length} worklog inserted`);
                cb(null, { name: 'worklogs', total: result.length });
            }
        });
    });
}

function importExpenses(data: DataContext, ctx: any, cb) {
        const expenses = data.expense;

        const mappedExpenses = expenses.map(e => {
            return {
                externalId: my_guid(),
                location: getLocation(data.location, e.location),
                exployee: getEmployee(data.employee, e.employee),
                expense: {
                    concept: e.category,
                    amount: +((<string>e.amount).replace(/[$,]/g, ''))
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
}

function importAppointments(data: DataContext, ctx: any, cb) {
    const appointments = data.appointment;

    const mappedAppointments = appointments.map(a => {
        return {
            externalId: my_guid(),
            source: 'google sheet',
            fullName: getCustomer(data.customer, a.customerId).name,
            reason: a.reason,
            from: a.from,
            to: a.to,
            provider: getEmployee(data.employee, a.employeeId).fullName,
        };
    });

    ctx.AppointmentModel.remove({}).then(res => {
        ctx.AppointmentModel.insertMany(mappedAppointments, (err, result) => {
            if (err) {
                console.error('Error inserting appointments', err);
                cb(err, null);
            } else {
                console.info(`${result.length} appointments inserted`);
                cb(null, { name: 'appointments', total: result.length });
            }
        });
    });
}

function importInventory(data: DataContext, ctx: any, cb) {
    const inventory = data.inventory;

    const mappedInventory = inventory.map(i => {
        const location = getLocation(data.location, i.location);
        const product = getProduct(data.product, i.product, 0, '0', new Date());

        return {
            externalId: my_guid(),
            source: 'google sheet',
            location: {
                externalId: (<any>location).identifier,
                name: (<any>location).name
            },
            product: {
                externalId: (<any>product).externalId,
                itemCode: (<any>product).itemCode,
                itemDescription: (<any>product).itemDescription
            },
            updatedAt: new Date(),
            onHand: +i.onHand,
            onOrder: +i.onOrder,
            cost: +i.cost.replace(/[\$,]/, '')
        };
    });

    ctx.Inventory.remove({}).then(res => {
        ctx.Inventory.insertMany(mappedInventory, (err, result) => {
            if (err) {
                console.error('Error inserting inventory', err);
                cb(err, null);
            } else {
                console.info(`${result.length} inventory items inserted`);
                cb(null, { name: 'inventory items', total: result.length });
            }
        });
    });
}


// helper methods

function getLocation(locations, name) {
    const l = locations.find(loc => loc.name === name);

    if (!l) {
        logger.error(`Location "${name}" not found`);
        return {};
    }

    return {
        identifier: l.id,
        name: l.name,
        city: l.city,
        state: l.state,
        zip: l.zip
    };
}

function getCustomer(customers, id) {
    const c = customers.find(cus => cus.id === id);
    if (!c) {
        logger.error(`Customer "${id}" not found`);
        return {
            externalId: '',
            name: '',
            state: '',
            zip: '',
            gender: ''
        };
    }

    return {
        externalId: c.id,
        name: c.name,
        state: c.state,
        zip: c.zip,
        gender: c.gender
    };
}

function getEmployee(employees, name) {
    const e = employees.find(emp => emp.name === name);

    if (!e) {
        logger.error(`Employee "${name}" not found`);
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

function getProduct(products, name, quantity, price, date) {
    const p = products.find(prod => prod.name === name);
    if (!p) return logger.error(`Product "${name}" not found`);

    price = +((<string>price).replace(/[$,]/g, ''));

    return {
        externalId: p.id + my_guid(),
        itemCode: p.id,
        itemDescription: p.name,
        unitPrice: price,
        quantity: +quantity,
        amount: price,
        paid: price,
        tax: 0.7,
        tax2: 0,
        type: p.type.toLowerCase(),
        from: date,
        to: date
    };
}

function getCategory(categories, name) {
    const c = categories.find(cat => cat.name === name);
    if (!c) return logger.error(`Category "${name}" not found`);

    return {
        externalId: c.id,
        name: c.name,
        service: c.service
    };
}

function getBusinessUnit(businessUnits, name) {
    const bu = businessUnits.find(bu => bu.name === name);
    if (!bu) return logger.error(`Business Unit "${name}" not found`);

    return { name: bu.name };
}
