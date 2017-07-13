import { IAppModels } from '../../models/app/app-models';
import * as mongoose from  'mongoose';
import { getContext } from '../../models';
import * as fs from 'fs';
import * as path from 'path';

export function seedApp(connectionString) {
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

    getContext('mongodb://localhost/test-company-chris').then((ctx) => {
        // test
        let count = ctx.Sale.find({}).count((err, count) => {
            console.log('Number of records in sales collection: ' + count);
        });

        for (let i = 0; i < dataFiles.length; i++) {
            // make sure the collection is empty
            let data = dataFiles[i];
            let model = ctx[data.model];
            let items = model.find({}).count((err, count) => {
                console.log('Count for ' + data.model + ' = ' + count);

                if (!count || count === 0) {
                    console.log(`seeding ${data.model}`);
                    let file = fs.readFile(path.join(__dirname, data.filename), { encoding: 'utf-8' }, (err, data) => {
                        if (err)
                            console.log(err);

                        let dataArray = JSON.parse(data);

                        (<mongoose.Model<any>>model).insertMany(dataArray, (err, doc) => {
                            if (err)
                                console.log(err);
                        });
                    });
                }
            });
        };
    });
};

