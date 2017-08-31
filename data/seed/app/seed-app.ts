import { IAppModels } from '../../models/app/app-models';
import * as mongoose from  'mongoose';
import { getContext } from '../../models';
import * as fs from 'fs';
import * as path from 'path';
import * as Promise from 'bluebird';

function resolveContext(obj: string | IAppModels): Promise<IAppModels> {
    return new Promise<IAppModels>((resolve, reject) => {
        if (!obj || obj === undefined) {
            return reject('no valid parameter passed to seedApp function');
        }

        if (typeof obj === 'string') {
            return getContext(obj);
        }

        resolve(obj);
    });
}

export function seedApp(obj: string | IAppModels): Promise<any> {
    let dataFiles = [
        // { model: 'Customer', filename: 'customers.json' },
        // { model: 'Employee', filename: 'employees.json' },
        // { model: 'Expense', filename: 'expenses.json' },
        // { model: 'Inventory', filename: 'inventory.json' },
        // { model: 'Location', filename: 'locations.json' },
        // { model: 'Product', filename: 'products.json' },
        // { model: 'Revenue', filename: 'revenues.json' },
        // { model: 'Survey', filename: 'surveys.json' },
        { model: 'KPI', filename: 'kpis.json' },
        { model: 'Chart', filename: 'charts.json' },
        { model: 'Dashboard', filename: 'dashboards.json' }
    ];

    return new Promise<any>((resolve, reject) => {

        resolveContext(obj || 'mongodb://localhost/company-test-3002')
        .then(ctx => {
            // test
            let count = ctx.Sale.find({}).count((err, count) => {
                console.log('Number of records in sales collection: ' + count);
            });

            // seed promises
            let promises = [];

            for (let i = 0; i < dataFiles.length; i++) {
                // make sure the collection is empty
                let data = dataFiles[i];
                let model = ctx[data.model];

                promises.push(seedDataFile(data, model));

                Promise.all(promises)
                .then(() => resolve())
                .catch(err => reject(err));
            }
        });
    });
}

function seedDataFile(data, model): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        let items = model.find({}).count((err, count) => {
            console.log('Count for ' + data.model + ' = ' + count);

            if (!count || count === 0) {
                console.log(`seeding ${data.model}`);
                let file = fs.readFile(path.join(__dirname, data.filename), { encoding: 'utf-8' }, (err, data) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }

                    let dataArray = JSON.parse(data);

                    (<mongoose.Model<any>>model).insertMany(dataArray, (err, doc) => {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }

                        return resolve();
                    });
                });
            }

            resolve();
        });
    });
}

