import * as Promise from 'bluebird';
import * as console from 'console';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as moment from 'moment';

import { Dashboard } from '../../app_modules/dashboards/dashboards.types';
import { KPI } from '../../app_modules/kpis/kpis.types';
import { AppConnection } from '../../domain/app/app.connection';
import { Charts } from '../../domain/app/charts/chart.model';
import { Dashboards } from '../../domain/app/dashboards/dashboard.model';
import { Appointments } from '../../domain/app/appointments/appointment-model';
import { Expenses } from '../../domain/app/expenses/expense.model';
import { KPIs } from '../../domain/app/kpis/kpi.model';
import { Sales } from '../../domain/app/sales/sale.model';
import { Inventory } from '../../domain/app/inventory/inventory.model';
import { WorkLog } from '../../domain/app/work-log/work-log';
import { Worklogs } from '../../domain/app/work-log/work-log.model';
import { VirtualSources } from '../../domain/app/virtual-sources/virtual-source.model';
import {Widgets} from '../../domain/app/widgets/widget.model';


interface ISeedModels {
    Appointment: Appointments;
    Expense: Expenses;
    Sale: Sales;
    Inventory: Inventory;
    WorkLog: Worklogs;
    KPI: KPIs;
    Chart: Charts;
    Dashboard: Dashboards;
    Widget: Widgets;
    VirtualSource: VirtualSources;
}

@injectable()
export class SeedService {
    private _models: ISeedModels;

    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        this._models = {
            Appointment: new Appointments(appConnection),
            Expense: new Expenses(appConnection),
            Sale: new Sales(appConnection),
            WorkLog: new Worklogs(appConnection),
            Inventory: new Inventory(appConnection),
            KPI: new KPIs(appConnection),
            Chart: new Charts(appConnection),
            Dashboard: new Dashboards(appConnection),
            Widget: new Widgets(appConnection),
            VirtualSource: new VirtualSources(appConnection)
        };
    }

    seedApp() {
        let dataFiles = [{
                model: 'Appointment',
                filename: 'appointments.json'
            },
            {
                model: 'Expense',
                filename: 'expenses.json'
            },
            {
                model: 'Sale',
                filename: 'sales.json'
            },
            {
                model: 'WorkLog',
                filename: 'workLogs.json'
            },
            {
                model: 'Inventory',
                filename: 'inventory.json'
            },
            {
                model: 'KPI',
                filename: 'kpis.json'
            },
            {
                model: 'Chart',
                filename: 'charts.json'
            },
            {
                model: 'Dashboard',
                filename: 'dashboards.json'
            },
            {
                model: 'Widget',
                filename: 'widgets.json'
            },
            {
                model: 'VirtualSource',
                filename: 'virtualSources.json'
            }
        ];

        return new Promise < any > ((resolve, reject) => {
            // seed promises
            let promises = [];

            for (let i = 0; i < dataFiles.length; i++) {
                // make sure the collection is empty
                let data = dataFiles[i];
                let model = this._models[data.model];

                promises.push(seedDataFile(data, model));
            }

            Promise.all(promises)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }

}

function seedDataFile(data, model): Promise < boolean > {
    return new Promise < boolean > ((resolve, reject) => {
        let items = model.model.find({}).count((err, count) => {
            console.log('Count for ' + data.model + ' = ' + count);

            if (!count || count === 0) {
                console.log(`seeding ${data.model}`);

                let file = fs.readFile(path.join(__dirname, 'data', data.filename), {
                    encoding: 'utf-8'
                }, (err, data) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }

                    let dataArray = JSON.parse(data);
                    // change the dates for sales, inventory, expenses, and worklogs date to have current date
                    dataArray = modifySeedDatesData(dataArray, model);

                    ( < mongoose.Model < any >> model.model).insertMany(dataArray, (err, doc) => {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }

                        return resolve(true);
                    });
                });
            }
        });
    });
}

/**
 * @param data
 * @param model
 * modify the data only for expenses, sales, inventory, and worklogs
 */
function modifySeedDatesData(data: any[], model: any): any[] {
    if (!data || !data.length) { return []; }

    const blacklist: string[] = ['Expenses', 'Sales', 'Inventory', 'Worklogs'];
    if (blacklist.indexOf(model.constructor.name) !== -1) {
        data = modifyDate(data, model.constructor.name);
    }
    return data;
}


/**
 * @param data
 * @param model
 * modify the dates for each model
 */
function modifyDate(data: any[], model: string): any[] {
    if (!data || !data.length) { return []; }
    if (!model) { return; }

    // return the dates in an array
    // i.e. [Moment, Moment, Moment, ...]
    const moments: any = dataMapDates(data, model);
    // current date
    const now = moment();
    // recent date in seed file
    const recentDate: moment.Moment = moment.max(moments);
    // middle point: recent date minus 3 months
    const middlePointDate = recentDate.subtract(3, 'month');

    // difference between current date and middle point date based on collection
    const diffDays: number = now.diff(middlePointDate, 'days');

    for (let i = 0; i < data.length; i++) {
        // add the diff in days to all the dates
        const newDate: moment.Moment = updatedDate(data[i], diffDays, model);
        // assign the object key and values based on the model
        data[i] = updateModelObject(data[i], newDate, model);
    }
    return data;
}

/**
 * increase the dates in each model by days
 * @param obj
 * @param diff
 * @param model
 */
function updatedDate(obj: any, diff: number, model: string): moment.Moment {
    let collection;
    if (!collection) {
        collection = {
            'Expenses': obj.timestamp,
            'Sales': obj.timestamp,
            'Inventory': obj.updatedAt,
            'Worklogs': obj.date
        };
    }
    return moment(collection[model]).add(diff, 'day');
}

function updateModelObject(obj: any, newDate: moment.Moment, model: string): any {
    if (!model) { return; }
    switch (model) {
        case 'Expenses':
            return Object.assign(obj, {
                timestamp: newDate.toDate()
            });
        case 'Sales':
            Object.assign(obj.product, {
                from: newDate.toDate(),
                to: newDate.toDate()
            });
            obj.timestamp = newDate.toDate();
            return obj;
        case 'Inventory':
            return Object.assign(obj, {
                updatedAt: newDate.toDate()
            });
        case 'Worklogs':
            return Object.assign(obj, {
                date: newDate.toDate()
            });
    }
}

/**
 * @param data
 * @param model
 * return the array of dates based on field that is of type date
 * i.e. [Moment, Moment, Moment, ...]
 */
function dataMapDates(data: any[], model: string): moment.Moment[] {
    if (!data || !data.length) { return; }
    switch (model) {
        case 'Expenses':
            return data.map(d => moment(d.timestamp));
        case 'Sales':
            return data.map(d => moment(d.timestamp));
        case 'Inventory':
            return data.map(d => moment(d.updatedAt));
        case 'Worklogs':
            return data.map(d => moment(d.date));
    }
}