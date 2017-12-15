import * as fs from 'fs';
import * as path from 'path';
import * as Promise from 'bluebird';
import * as console from 'console';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';


import { AppConnection } from '../domain/app/app.connection';
import { Charts } from '../domain/app/charts/chart.model';
import { Dashboards } from '../domain/app/dashboards/dashboard.model';
import { Expenses } from '../domain/app/expenses/expense.model';
import { KPIs } from '../domain/app/kpis/kpi.model';
import { Sales } from '../domain/app/sales/sale.model';
import { Worklogs } from '../domain/app/work-log/work-log.model';


interface ISeedModels {
    expenses: Expenses;
    sales: Sales;
    worklogs: Worklogs;
    kpis: KPIs;
    charts: Charts;
    dashboards: Dashboards;
}

@injectable()
export class SeedService {
    private _models: ISeedModels;

    constructor(@inject('AppConnection') appConnection: AppConnection) {
        this._models = {
            expenses: new Expenses(appConnection),
            sales: new Sales(appConnection),
            worklogs: new Worklogs(appConnection),
            kpis: new KPIs(appConnection),
            charts: new Charts(appConnection),
            dashboards: new Dashboards(appConnection)
        };
    }

    seedApp() {
        let dataFiles = [{
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
        let items = model.find({}).count((err, count) => {
            console.log('Count for ' + data.model + ' = ' + count);

            if (!count || count === 0) {
                console.log(`seeding ${data.model}`);
                let file = fs.readFile(path.join(__dirname, data.filename), {
                    encoding: 'utf-8'
                }, (err, data) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }

                    let dataArray = JSON.parse(data);

                    ( < mongoose.Model < any >> model).insertMany(dataArray, (err, doc) => {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }

                        return resolve(true);
                    });
                });
            }

            resolve(true);
        });
    });
}