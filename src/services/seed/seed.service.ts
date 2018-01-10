import * as Promise from 'bluebird';
import * as console from 'console';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as path from 'path';

import { Dashboard } from '../../app_modules/dashboards/dashboards.types';
import { KPI } from '../../app_modules/kpis/kpis.types';
import { AppConnection } from '../../domain/app/app.connection';
import { Charts } from '../../domain/app/charts/chart.model';
import { Dashboards } from '../../domain/app/dashboards/dashboard.model';
import { Expenses } from '../../domain/app/expenses/expense.model';
import { KPIs } from '../../domain/app/kpis/kpi.model';
import { Sales } from '../../domain/app/sales/sale.model';
import { WorkLog } from '../../domain/app/work-log/work-log';
import { Worklogs } from '../../domain/app/work-log/work-log.model';




interface ISeedModels {
    Expense: Expenses;
    Sale: Sales;
    WorkLog: Worklogs;
    KPI: KPIs;
    Chart: Charts;
    Dashboard: Dashboards;
}

@injectable()
export class SeedService {
    private _models: ISeedModels;

    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        this._models = {
            Expense: new Expenses(appConnection),
            Sale: new Sales(appConnection),
            WorkLog: new Worklogs(appConnection),
            KPI: new KPIs(appConnection),
            Chart: new Charts(appConnection),
            Dashboard: new Dashboards(appConnection)
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